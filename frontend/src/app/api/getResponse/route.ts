import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { AIResponse } from '@/types/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { inquiry, manuals, products, scenarios } = await request.json();

    const systemPrompt = `
あなたは当社のカスタマーサポート担当AIです。
ユーザーからの問い合わせに対して、複数の対応シナリオを提案してください。

以下の情報を参考にしてください：

【マニュアル情報：ここについては厳守するようにしてください】
${manuals.map((m: { content: string }) => `【厳守するルールです．以下のルールを適応させた返信文を作成ください．】・${m.content}`).join('\n\n')}

【商品情報】
${products.map((p: { content: string }) => p.content).join('\n\n')}

【事前定義シナリオ】
${scenarios.map((s: { title: string, prompt: string }) => `【${s.title}】\n${s.prompt}`).join('\n\n')}

あなたの役割：
1. 事前定義シナリオについて，必ず一つずつの返信を用意するようにしてください．中でも，これら事前設定されているシナリオについては上位にするようにしてください．
2. 事前定義シナリオに加えて、顧客メッセージに応じた独自の対応シナリオを1-2個提案するようにしてください．
3. 各シナリオについて、以下の情報を提供：
   - 具体的な返信メッセージ
   - シナリオの種類（事前定義シナリオの場合はそのタイトル、独自提案の場合は'AI提案'）
   - なぜこのシナリオが適切か、または不適切かの説明
   - 返信の感情的なトーン（positive/negative/neutral）
4. マニュアル情報について与えられているルールについて厳守するようにしてください

これにより、サポート担当者が最適な対応を選択できるようにしてください。

重要な注意点：
- 必ず複数のシナリオを提案してください（最低3つ）
- 事前定義シナリオは可能な限り活用してください
- 各シナリオの特徴や使い分けを明確に説明してください
- 返信メッセージは具体的で実用的な内容にしてください
- scenarioTypeには、事前定義シナリオの場合は必ずそのタイトルを'title'として、AI提案の場合は'【AI提案】title'として考えを設定するようにしてください．`;
console.log(systemPrompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inquiry },
      ],
      functions: [
        {
          name: "generate_response",
          description: "Generate multiple customer support response scenarios",
          parameters: {
            type: "object",
            properties: {
              scenarios: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    reply: {
                      type: "string",
                      description: "具体的な返信メッセージ"
                    },
                    scenarioType: {
                      type: "string",
                      description: "シナリオの種類（事前定義シナリオのタイトル、または'AI提案'）"
                    },
                    notes: {
                      type: "string",
                      description: "シナリオの選択理由や補足情報"
                    },
                    sentiment: {
                      type: "string",
                      enum: ["positive", "negative", "neutral"],
                      description: "返信の感情的なトーン"
                    }
                  },
                  required: ["reply", "scenarioType", "notes", "sentiment"]
                }
              }
            },
            required: ["scenarios"]
          }
        }
      ],
      function_call: { name: "generate_response" }
    });

    // レスポンスの処理
    const message = response.choices[0]?.message;

    // モデルが応答を拒否した場合
    if (message?.refusal) {
      console.error('Model refused to respond:', message.refusal);
      return NextResponse.json({
        scenarios: [{
          reply: "申し訳ございません。適切な応答を生成できませんでした。",
          scenarioType: "エラー",
          notes: "応答拒否",
          sentiment: "neutral"
        }]
      }, { status: 422 });
    }

    // 応答が不完全な場合
    if (response.choices[0]?.finish_reason === "length") {
      return NextResponse.json({
        scenarios: [{
          reply: "申し訳ございません。応答が不完全です。",
          scenarioType: "エラー",
          notes: "応答不完全",
          sentiment: "neutral"
        }]
      }, { status: 500 });
    }

    // コンテンツフィルターによる制限
    if (response.choices[0]?.finish_reason === "content_filter") {
      return NextResponse.json({
        scenarios: [{
          reply: "申し訳ございません。不適切なコンテンツが検出されました。",
          scenarioType: "エラー",
          notes: "コンテンツフィルター",
          sentiment: "neutral"
        }]
      }, { status: 422 });
    }

    // function_callの結果を処理
    if (message?.function_call?.arguments) {
      const parsedResponse = JSON.parse(message.function_call.arguments) as AIResponse;
      return NextResponse.json(parsedResponse);
    }

    throw new Error('Unexpected response format');

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      scenarios: [{
        reply: "申し訳ございません。AIサービスとの通信中にエラーが発生しました。",
        scenarioType: "エラー",
        notes: "API通信エラー",
        sentiment: "neutral"
      }]
    }, { status: 500 });
  }
}
