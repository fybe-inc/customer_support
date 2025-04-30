import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getProducts, addProduct, deleteProduct } from "@/lib/db/products";

// 商品データの取得
export async function GET() {
  try {
    // Supabaseクライアントを作成（サーバーサイド）
    const supabase = await createClient();

    // ユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // 認証されていない場合はエラーを返す
    if (userError || !user) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 },
      );
    }

    // 商品データを取得
    const { data, error } = await getProducts(user.id);

    if (error) {
      return NextResponse.json(
        { error: "商品データの取得に失敗しました" },
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

// 商品データの追加
export async function POST(request: NextRequest) {
  try {
    // Supabaseクライアントを作成（サーバーサイド）
    const supabase = await createClient();

    // ユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // 認証されていない場合はエラーを返す
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

    // 商品データを追加
    const { data, error } = await addProduct(user.id, content);

    if (error) {
      return NextResponse.json(
        { error: "商品の追加に失敗しました" },
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

// 商品データの削除
export async function DELETE(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "idは必須です" }, { status: 400 });
    }

    // Supabaseクライアントを作成（サーバーサイド）
    const supabase = await createClient();

    // ユーザー情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // 認証されていない場合はエラーを返す
    if (userError || !user) {
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 },
      );
    }

    // 商品データを削除
    const { success, error } = await deleteProduct(user.id, id);

    if (error) {
      return NextResponse.json(
        { error: "商品の削除に失敗しました" },
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
