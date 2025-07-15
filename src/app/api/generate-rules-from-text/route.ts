import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { description } = await req.json();

        if (!description || typeof description !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid description' }, { status: 400 });
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
                        content:
                            'You are a Firestore security rules expert. Based on the user’s app description or schema, generate secure Firestore rules using isAuthor, isAdmin, etc. Start with an explanation, then include the rules starting with rules_version = \'2\';.',
                    },
                    {
                        role: 'user',
                        content: description,
                    },
                ],
            }),
        });

        const data = await openaiRes.json();
        const full = data.choices?.[0]?.message?.content || '';
        const ruleStart = full.indexOf("rules_version = '2';");

        const explanation = ruleStart !== -1 ? full.slice(0, ruleStart).trim() : '';
        const rules = ruleStart !== -1 ? full.slice(ruleStart).replace(/```[a-z]*|```/g, '').trim() : '';

        return NextResponse.json({ rules, explanation });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
