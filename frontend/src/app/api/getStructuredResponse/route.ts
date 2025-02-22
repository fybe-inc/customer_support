import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { inquiry, manuals, products, scenarios } = await request.json();

    const systemPrompt = `
あなたは当社のカスタマーサポート担当AIです。
以下の情報を参考に回答を生成してください。
回答は必ずJSON形式で返してください：

【マニュアル情報】
${manuals.map((m: { content: string }) => m.content).join('\n\n')}

【商品情報】
${products.map((p: { content: string }) => p.content).join('\n\n')}

【シナリオリスト】
${scenarios.map((s: { title: string, prompt: string }) => `【${s.title}】\n${s.prompt}`).join('\n\n')}

JSONレスポンスには以下のフィールドを含めてください：
- reply: 最終的な返信メッセージ
- scenarioType: 使用したシナリオのタイトル
- notes: 補足情報や選択理由など
- sentiment: 返信の感情トーン（"positive", "negative", "neutral"のいずれか）`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inquiry },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiMessage = response.choices[0]?.message?.content || "{}";
    return NextResponse.json(JSON.parse(aiMessage));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'AIエラーが発生しました' },
      { status: 500 }
    );
  }
}
