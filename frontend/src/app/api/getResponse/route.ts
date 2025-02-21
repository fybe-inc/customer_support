import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
あなたは当社のカスタマーサポート担当AIです。
以下のJSON形式で出力してください：
{
  "reply": "<最終的な返信メッセージ>",
  "scenarioType": "<シナリオの種類>",
  "notes": "<補足>"
}
`;

export async function POST(request: Request) {
  try {
    const { inquiry, manuals, products } = await request.json();

    const systemPrompt = `
あなたは当社のカスタマーサポート担当AIです。
以下の情報を参考に回答を生成してください：

【マニュアル情報】
${manuals.map((m: any) => m.content).join('\n\n')}

【商品情報】
${products.map((p: any) => p.content).join('\n\n')}

以下のJSON形式で出力してください：
{
  "reply": "<最終的な返信メッセージ>",
  "scenarioType": "<シナリオの種類>",
  "notes": "<補足>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inquiry },
      ],
      temperature: 0.7,
    });

    const aiMessage = response.choices[0]?.message?.content || "";
    const parsedResponse = JSON.parse(aiMessage);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'AIエラーが発生しました' },
      { status: 500 }
    );
  }
}
