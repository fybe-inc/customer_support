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
以下の情報を参考に、複数の返信候補を生成してください。
回答は必ずJSON形式で返してください：

【マニュアル情報】
${manuals.map((m: { content: string }) => m.content).join('\n\n')}

【商品情報】
${products.map((p: { content: string }) => p.content).join('\n\n')}

【シナリオリスト】
${scenarios.map((s: { title: string, prompt: string }) => `【${s.title}】\n${s.prompt}`).join('\n\n')}

JSONレスポンスには以下のフィールドを含む配列を返してください：
{
  "scenarios": [
    {
      "reply": "返信メッセージ本文",
      "scenarioType": "シナリオのタイトル",
      "notes": "補足情報や選択理由など",
      "sentiment": "感情トーン(positive/negative/neutral)"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inquiry },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiMessage = response.choices[0]?.message?.content || '{"scenarios":[]}';
    const parsedResponse = JSON.parse(aiMessage);
    
    // Validate response format
    if (!Array.isArray(parsedResponse.scenarios)) {
      throw new Error('Invalid response format: scenarios must be an array');
    }
    
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'AIエラーが発生しました' },
      { status: 500 }
    );
  }
}
