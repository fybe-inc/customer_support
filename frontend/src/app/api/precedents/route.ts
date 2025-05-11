import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getPrecedents,
  addPrecedent,
  deletePrecedent,
} from "@/lib/db/precedents";

// マニュアルデータの取得
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

    // マニュアルデータを取得
    const { data, error } = await getPrecedents(user.id);

    if (error) {
      return NextResponse.json(
        { error: "マニュアルデータの取得に失敗しました" },
        { status: 500 },
      );
    }

    // レスポンスを返す
    return NextResponse.json(data);
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}

// マニュアルデータの追加
export async function POST(request: NextRequest) {
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

    // リクエストボディを取得
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "contentは必須です" }, { status: 400 });
    }

    // マニュアルデータを追加
    const { data, error } = await addPrecedent(user.id, content);

    if (error) {
      return NextResponse.json(
        { error: "マニュアルの追加に失敗しました" },
        { status: 500 },
      );
    }

    // レスポンスを返す
    return NextResponse.json({ data });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}

// マニュアルデータの削除
export async function DELETE(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "idは必須です" }, { status: 400 });
    }

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

    // マニュアルデータを削除
    const { success, error } = await deletePrecedent(user.id, id);

    if (error) {
      return NextResponse.json(
        { error: "マニュアルの削除に失敗しました" },
        { status: 500 },
      );
    }

    // 成功レスポンスを返す
    return NextResponse.json({ success });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 },
    );
  }
}
