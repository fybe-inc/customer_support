import { createClient } from "@/utils/supabase/server";
import type { ProductEntry } from "@/types/types";

/**
 * ユーザーの商品データを取得する
 * @param userId ユーザーID
 * @returns 商品データの配列
 */
export async function getProducts(userId: string): Promise<{
  data: ProductEntry[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    // Supabaseからデータを取得
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("商品データの取得エラー:", error);
      return { data: null, error };
    }

    // データをProductEntry形式に変換
    const formattedData: ProductEntry[] = data.map((item) => ({
      id: item.id,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return { data: formattedData, error: null };
  } catch (error) {
    console.error("商品データの取得エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * 商品データを追加する
 * @param userId ユーザーID
 * @param content 商品の内容
 * @returns 追加された商品データ
 */
export async function addProduct(
  userId: string,
  content: string,
): Promise<{
  data: ProductEntry | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    // Supabaseに保存
    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: userId,
        content,
      })
      .select();

    if (error) {
      console.error("商品追加エラー:", error);
      return { data: null, error };
    }

    // 新しいデータをProductEntry形式に変換
    const newEntry: ProductEntry = {
      id: data[0].id,
      content: data[0].content,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
    };

    return { data: newEntry, error: null };
  } catch (error) {
    console.error("商品追加エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * 商品データを削除する
 * @param userId ユーザーID
 * @param id 削除する商品のID
 * @returns 成功したかどうか
 */
export async function deleteProduct(
  userId: string,
  id: string,
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    // Supabaseから削除
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("商品削除エラー:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("商品削除エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
