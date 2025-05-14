import type { AIResponse } from "@/types/types";
import { storeUserExperience } from "@/lib/db/userExperience";
import { getManuals } from "./db/manuals";
import { getProducts } from "./db/products";
import { getScenarios } from "./db/scenarios";
import { getPrecedents } from "./db/precedents";
/**
 * OpenRouterを使用してカスタマーサポートの返信シナリオを取得する関数
 * @param user_id ユーザーID
 * @param manuals マニュアル情報
 * @param inquiry ユーザープロンプト
 * @returns AIResponse オブジェクト
 */
export async function getOpenRouterResponse(
  user_id: string,
  inquiry: string,
): Promise<AIResponse> {
  const {data:manuals}=await getManuals(user_id)
  const {data:products}=await getProducts(user_id)
  const {data:scenarios}=await getScenarios(user_id)
  const {data:precedents}=await getPrecedents(user_id)
  if(!manuals||!products||!scenarios||!precedents){
    throw new Error("データの取得に失敗しました");
  }
  const systemPrompt = `
  あなたは当社の「カスタマーサポート担当AI」です。以下の情報とルールに基づき、ユーザーのお問い合わせに対応する複数の返信シナリオを提案してください。ハルシネーションを避けるようにしてください。与えられた事前情報とユーザーからの問い合わせに対して適切な返信を提案してください。求められていないことは答えないようにしてください。このプロジェクトはコパイロット（AIとの協力）を前提としたプロジェクトです。あなたは、ユーザーが最終的に返信するための文章を考えるAIです。

  以下の情報を参考にしてください：

  【マニュアル情報：ここについては厳守するようにしてください】
  ${manuals.map((m: { content: string }) => `【厳守するルールです．以下のルールを適応させた返信文を作成ください．】・${m.content}`).join("\n\n")}

  【商品情報：ここには商品の説明がまとまっています．商品の説明を参考にしてください】
  ${products.map((p: { content: string }) => p.content).join("\n\n")}

  【事前定義シナリオ：ここには事前定義したシナリオがまとまっています．事前定義したシナリオを参考にしてください】
  ${scenarios.map((s: { title: string; prompt: string }) => `【${s.title}】\n${s.prompt}`).join("\n\n")}

  【前例情報：ここには顧客サポートの過去の対応事例がまとまっています．過去の対応事例を参考にしてください】
  ${precedents.map((p: { content: string }) => p.content).join("\n\n")}

  ---
  【あなたの役割・指示】
  1. **事前定義シナリオ**（上記で提供されたシナリオ）を必ず **一つずつ** 活用し、それぞれに対する返信文を提案してください。
     - 事前定義シナリオが3つあれば、少なくとも4つ以上シナリオ提案を行ってください（1シナリオにつき1返信文とAIが加えて考えた追加提案シナリオ）。
     - これらの事前定義シナリオは必ず**上位**に提示してください。
  2. **追加提案シナリオ（AI提案）**を、ユーザーの問い合わせ内容に合わせて**1〜2件**用意してください。
     - したがって、たとえば事前定義が3つあれば、合計4つか5つのシナリオが提案されることになります。
  3. **各シナリオ**について、以下の情報を**必ず**提供してください：
     - 具体的な返信メッセージ（reply）
     - シナリオの種類（scenarioType）：  
       ・事前定義シナリオの場合は **シナリオのタイトル**（例：「titleA」）  
       ・AI提案の場合は **「【AI提案】title」** の形式
     - なぜこのシナリオが適切か、または不適切かの説明（notes）
     - 返信の感情的なトーン（sentiment）：  
       ・「positive」「negative」「neutral」のいずれか
  4. **マニュアルルール**は必ず厳守してください。これらに抵触しないよう注意してください。
  5. 返信メッセージは具体的かつ実用的にし、常に丁寧な顧客対応を心がけてください。
  ---

  上記を踏まえて、**必ず複数のシナリオ**を提案してください。
  `;
  console.log(systemPrompt);
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: inquiry },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "customer_support_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                scenarios: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      reply: {
                        type: "string",
                        description: "具体的な返信メッセージ",
                      },
                      scenarioType: {
                        type: "string",
                        description:
                          "シナリオの種類（事前定義シナリオのタイトル、または「AI提案」）",
                      },
                      notes: {
                        type: "string",
                        description: "シナリオの選択理由や補足情報",
                      },
                      sentiment: {
                        type: "string",
                        enum: ["positive", "negative", "neutral"],
                        description: "返信の感情的なトーン",
                      },
                    },
                    required: ["reply", "scenarioType", "notes", "sentiment"],
                  },
                },
              },
              required: ["scenarios"],
              additionalProperties: false,
            },
          },
        },
      }),
    },
  );

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsedContent = JSON.parse(content);

  await storeUserExperience(
    user_id,
    manuals,
    products,
    scenarios,
    inquiry,
    parsedContent,
  );

  // OpenRouterからの応答はJSON文字列なので、パースしてオブジェクトに変換
  return parsedContent;
}
