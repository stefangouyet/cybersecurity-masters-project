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
    const ensured = ensureCustomFunctions(rules, useCustomFunctions);
    const rulesFinal = normalizeFunctionPlacement(ensured);

    return NextResponse.json({ rules: rulesFinal, explanation });

  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
function extractRulesAndExplanation(content: string): { rules: string; explanation: string } {
  if (!content) return { rules: '', explanation: '' };

  // Normalize newlines and strip CRs
  let src = content.replace(/\r/g, '');

  // Remove ALL markdown code fences but keep their contents
  // (works for ```lang ... ``` and plain ``` ... ```)
  src = src.replace(/```[a-zA-Z]*\s*\n?([\s\S]*?)```/g, (_, code) => code);

  // Trim once after fence removal
  src = src.trim();

  // Try the "rules_version first" path
  const rvIdx = src.indexOf("rules_version = '2';");

  // Always look for the service block (many completions omit rules_version)
  const svcIdx = src.search(/service\s+cloud\.firestore\b/);

  // If we have neither, just return everything as explanation
  if (svcIdx === -1 && rvIdx === -1) {
    return { rules: '', explanation: src };
  }

  // Explanation is everything before the first of (rules_version | service cloud.firestore)
  const firstIdx = [rvIdx, svcIdx].filter(i => i !== -1).sort((a, b) => a - b)[0];
  const explanation = src.slice(0, firstIdx).trim();

  // Find where the service block actually starts
  const serviceStart = svcIdx !== -1 ? svcIdx : src.indexOf('service cloud.firestore', rvIdx);
  if (serviceStart === -1) {
    // Fallback: if we had rules_version but no service block, return from rules_version onward
    if (rvIdx !== -1) {
      return { rules: src.slice(rvIdx).trim(), explanation };
    }
    return { rules: '', explanation: src.trim() };
  }

  // Find the opening brace for the service block
  const openIdx = src.indexOf('{', serviceStart);
  if (openIdx === -1) {
    // No brace — return from rules_version or service line onward
    const start = rvIdx !== -1 ? rvIdx : serviceStart;
    return { rules: src.slice(start).trim(), explanation };
  }

  // Walk braces to find the exact end of the service block
  let depth = 0;
  let endIdx = -1;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { endIdx = i + 1; break; }
    }
  }

  // Slice out the complete service block (include rules_version if present before it)
  let rulesSlice: string;
  if (endIdx !== -1) {
    // Include optional rules_version header if it appears before serviceStart
    const headerStart = (rvIdx !== -1 && rvIdx < serviceStart) ? rvIdx : serviceStart;
    rulesSlice = src.slice(headerStart, endIdx).trim();
  } else {
    // Unterminated braces — take everything from header/serviceStart onward
    const start = (rvIdx !== -1 && rvIdx < serviceStart) ? rvIdx : serviceStart;
    rulesSlice = src.slice(start).trim();
  }

  // Ensure rules_version exists; if missing, prepend it
  if (!/rules_version\s*=\s*'2';/.test(rulesSlice)) {
    rulesSlice = `rules_version = '2';\n${rulesSlice}`;
  }

  // Final tidy: collapse excessive blank lines and trim trailing space
  rulesSlice = rulesSlice
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { rules: rulesSlice, explanation };
}



function ensureCustomFunctions(rules: string, useCustomFunctions: boolean): string {
  if (!useCustomFunctions || !rules) return rules;

  const usesAuth = /\bisAuthenticated\s*\(/.test(rules);
  const usesOwner = /\bisDocOwner\s*\(/.test(rules);

  const hasAuthFn = /function\s+isAuthenticated\s*\(/.test(rules);
  const hasOwnerFn = /function\s+isDocOwner\s*\(/.test(rules);

  const fns: string[] = [];
  if (usesAuth && !hasAuthFn) {
    fns.push(`  function isAuthenticated() { return request.auth != null; }`);
  }
  if (usesOwner && !hasOwnerFn) {
    fns.push(`  function isDocOwner(userId) { return request.auth.uid == userId; }`);
  }

  if (!fns.length) return rules;

  // insert before the final closing brace of `service cloud.firestore { ... }`
  const lastBrace = rules.lastIndexOf('}');
  if (lastBrace === -1) {
    return rules + '\n' + fns.join('\n') + '\n';
  }
  return rules.slice(0, lastBrace) + '\n' + fns.join('\n') + '\n' + rules.slice(lastBrace);
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
