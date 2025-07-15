// /api/generate-rules.ts

import { apiReqString, granularPrompt, userPrompt } from '@/app/utils/strings';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { firestoreCode, granularOperations } = await req.json();

    if (!firestoreCode || typeof firestoreCode !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid Firestore code' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: apiReqString
          },
          {
            role: 'user',
            content: userPrompt(firestoreCode) + granularPrompt(granularOperations)
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error('OpenAI API ERROR: ', errorText);
      return NextResponse.json({ error: 'Failed to fetch from OpenAI' }, { status: 500 });
    }

    const data = await openaiRes.json();
    const fullContent = data.choices?.[0]?.message?.content || '';

    const { rules, explanation } = extractRulesAndExplanation(fullContent);

    return NextResponse.json({ rules, explanation });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractRulesAndExplanation(content: string): { rules: string; explanation: string } {
  const ruleStartIndex = content.indexOf("rules_version = '2';");

  if (ruleStartIndex === -1) {
    // fallback: return entire thing as explanation
    return { rules: '', explanation: content.trim() };
  }

  const explanation = content.slice(0, ruleStartIndex).trim();
  let rulesSection = content.slice(ruleStartIndex).trim();

  // Clean out accidental markdown
  rulesSection = rulesSection.replace(/^```[a-z]*\s*/i, '').replace(/```$/, '').trim();

  // Stop at next unindented line that isn't a rule or brace
  const endOfRules = rulesSection.search(/\n{2,}/);
  const rules = endOfRules !== -1 ? rulesSection.slice(0, endOfRules).trim() : rulesSection;

  return { rules, explanation };
}
