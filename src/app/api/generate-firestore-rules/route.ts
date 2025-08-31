import {
  mainPrompt,
  customFunctionPrompt,
  granularPrompt,
  inputPromptForCode,
  inputPromptForRules,
  inputPromptForText
} from '@/app/utils/strings';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { input, mode, granularOperations = false, useCustomFunctions = true } = await req.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let systemPrompt = mainPrompt;

    systemPrompt += ' ' + + ' ' + granularPrompt(granularOperations) + ' ' + customFunctionPrompt(useCustomFunctions);
    if (mode === 'code') {
      systemPrompt += inputPromptForCode
    } else if (mode === 'text') {
      systemPrompt += inputPromptForText
    } else if (mode === 'rules') {
      systemPrompt += inputPromptForRules
    }


    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.00,
        seed: 7,
        top_p: 1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API ERROR:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from OpenAI' }, { status: 500 });
    }

    const data = await response.json();
    const fullContent = data.choices?.[0]?.message?.content || '';

    const { rules, explanation } = extractRulesAndExplanation(fullContent);
    const rulesFinal = normalizeFunctionPlacement(rules);

    return NextResponse.json({ rules: rulesFinal, explanation });

  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
function extractRulesAndExplanation(content: string): { rules: string; explanation: string } {
  if (!content) return { rules: '', explanation: '' };

  let src = content.replace(/\r/g, '');
  src = src.replace(/```[a-zA-Z]*\s*\n?([\s\S]*?)```/g, (_, code) => code).trim();

  // Find start of rules
  const rvIdx = src.indexOf("rules_version = '2';");
  const svcIdx = src.search(/service\s+cloud\.firestore\b/);
  const startIdx = rvIdx !== -1 ? rvIdx : svcIdx;

  if (startIdx === -1) {
    return { rules: '', explanation: src };
  }

  // Find end of the service block
  const openIdx = src.indexOf('{', startIdx);
  let depth = 0;
  let endIdx = -1;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  let rulesSlice: string;
  if (endIdx !== -1) {
    const headerStart = (rvIdx !== -1 && rvIdx < startIdx) ? rvIdx : startIdx;
    rulesSlice = src.slice(headerStart, endIdx).trim();
  } else {
    rulesSlice = src.slice(startIdx).trim();
  }

  if (!/rules_version\s*=\s*'2';/.test(rulesSlice)) {
    rulesSlice = `rules_version = '2';\n${rulesSlice}`;
  }

  rulesSlice = rulesSlice
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // ✅ everything AFTER the rules is explanation
  const explanation = endIdx !== -1 ? src.slice(endIdx).trim() : '';

  return { rules: rulesSlice, explanation };
}

function normalizeFunctionPlacement(rules: string): string {
  if (!rules) return rules;

  const svcIdx = rules.indexOf('service cloud.firestore');
  if (svcIdx === -1) return rules;

  const openIdx = rules.indexOf('{', svcIdx);
  if (openIdx === -1) return rules;

  // find matching close brace for service block
  let depth = 0, closeIdx = -1;
  for (let i = openIdx; i < rules.length; i++) {
    const ch = rules[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { closeIdx = i; break; }
    }
  }
  if (closeIdx === -1) return rules;

  const head = rules.slice(0, openIdx + 1);
  const body = rules.slice(openIdx + 1, closeIdx);
  const tail = rules.slice(closeIdx); // includes the closing brace

  // grab function blocks from body
  const fnRe = /^\s*function\s+(isAuthenticated|isDocOwner)\s*\([^)]*\)\s*\{[\s\S]*?\}\s*$/gm;
  const fns: string[] = [];
  const bodyWithoutFns = body.replace(fnRe, (m) => { fns.push(m.trim()); return ''; });

  const newBody =
    bodyWithoutFns.trimEnd() +
    (fns.length ? `\n\n${fns.join('\n')}\n` : '\n');

  return head + newBody + tail;
}
