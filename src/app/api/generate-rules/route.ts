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
            content: 'You are a cybersecurity expert helping generate secure Firestore security rules.',
          },
          {
            role: 'user',
            content: `Here is some Firestore client-side code:\n\n${firestoreCode}\n\nPlease output only a Firestore security rules file that starts with \`rules_version = '2';\` and contains no explanation.`,
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

    // Return only the rules block
    let rules = fullContent.trim();

    // Remove any leading/trailing code block markers if present
    if (rules.startsWith('```')) rules = rules.replace(/^```(?:javascript)?\s*/, '').trim();
    if (rules.endsWith('```')) rules = rules.replace(/\s*```$/, '').trim();

    return NextResponse.json({ rules });
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}