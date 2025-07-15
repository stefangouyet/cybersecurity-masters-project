import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { existingRules } = await req.json();

        if (!existingRules || typeof existingRules !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid rules input' }, { status: 400 });
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
                            'You are a security expert reviewing existing Firestore security rules. Analyze the rules, summarize their intent, and highlight any risks or improvements. Then return the rules cleaned of markdown, starting from rules_version = \'2\';',
                    },
                    {
                        role: 'user',
                        content: existingRules,
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
