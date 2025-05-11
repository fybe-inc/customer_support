import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getOpenRouterResponse } from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    // サーバーサイド用のSupabaseクライアント作成
    const supabase = await createClient();

    // ユーザー情報を取得（トークンを再検証）
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // 認証されていない場合は401エラーを返す
    if (userError || !user) {
      return NextResponse.json(
        {
          scenarios: [
            {
              reply: "認証エラー: ログインが必要です。",
              scenarioType: "エラー",
              notes: "認証されていないユーザー",
              sentiment: "neutral",
            },
          ],
        },
        { status: 401 },
      );
    }

    const { inquiry, manuals, products, scenarios, precedents } =
      await request.json();

    try {
      // OpenRouterを使用してレスポンスを取得
      const aiResponse = await getOpenRouterResponse(
        user.id,
        manuals,
        products,
        scenarios,
        inquiry,
        precedents,
      );
      return NextResponse.json(aiResponse);
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      return NextResponse.json(
        {
          scenarios: [
            {
              reply:
                "申し訳ございません。AIサービスとの通信中にエラーが発生しました。",
              scenarioType: "エラー",
              notes: "API通信エラー",
              sentiment: "neutral",
            },
          ],
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        scenarios: [
          {
            reply: "申し訳ございません。サーバー側でエラーが発生しました。",
            scenarioType: "エラー",
            notes: "サーバーエラー",
            sentiment: "neutral",
          },
        ],
      },
      { status: 500 },
    );
  }
}
