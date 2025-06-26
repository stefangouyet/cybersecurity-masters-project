import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { firestoreCode } = await req.json();

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
            content: 'You are a cybersecurity expert helping generate secure Firestore security rules. Ensure rules include both "create" and "update" permissions for all collections and subcollections mentioned in the provided Firestore code.',
          },
          {
            role: 'user',
            content: `Here is some Firestore client-side code:\n\n${firestoreCode}\n\nPlease output:\n\n1. An explanation of the security concerns and protections.\n2. A complete Firestore security rules file that starts with \`rules_version = '2';\` and includes "create" and "update" rules for all collections and subcollections referenced in the code.`,
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error('[OpenAI API ERROR]', errorText);
      return NextResponse.json({ error: 'Failed to fetch from OpenAI' }, { status: 500 });
    }

    const data = await openaiRes.json();
    const fullContent = data.choices?.[0]?.message?.content || '';

    let rules = '';
    let explanation = fullContent;

    const ruleStart = fullContent.indexOf("rules_version = '2';");
    if (ruleStart !== -1) {
      rules = fullContent.slice(ruleStart).trim();
      explanation = fullContent.slice(0, ruleStart).trim();

      // Remove trailing code block markers
      if (rules.endsWith('```')) rules = rules.replace(/```$/, '').trim();
      if (rules.startsWith('```')) rules = rules.replace(/^```(?:javascript)?\s*/, '').trim();
    }

    return NextResponse.json({ rules, explanation });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}