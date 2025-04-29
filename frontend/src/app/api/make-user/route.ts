import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

// ランダムなパスワードを生成する関数
function generateRandomPassword(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // メールアドレスが提供されていない場合はエラーを返す
    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスが必要です" },
        { status: 400 },
      );
    }

    // ランダムなパスワードを生成
    const password = generateRandomPassword();

    // Supabaseを使用してユーザーを作成
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認を自動的に完了
    });

    // エラーが発生した場合
    if (error) {
      console.error("ユーザー作成エラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 成功した場合、ユーザー情報とパスワードを返す
    return NextResponse.json({
      message: "ユーザーが正常に作成されました",
      user: {
        ...user,
        password, // パスワードを含める
      },
    });
  } catch (error) {
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}
