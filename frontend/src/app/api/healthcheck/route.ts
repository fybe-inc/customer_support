import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
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
        { error: "認証されていません" },
        { status: 401 },
      );
    }

    // レスポンスを返す
    return NextResponse.json({ user });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}
