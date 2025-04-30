import { createClient } from "@/utils/supabase/server";
import type { ManualEntry } from "@/types/types";

/**
 * ユーザーのマニュアルデータを取得する
 * @param userId ユーザーID
 * @returns マニュアルデータの配列
 */
export async function getManuals(userId: string): Promise<{
  data: ManualEntry[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    console.log({ userId });

    // Supabaseからデータを取得
    const { data, error } = await supabase.from("manuals").select("*");
    // .eq('user_id', userId);

    console.log({ data });

    if (error) {
      console.error("マニュアルデータの取得エラー:", error);
      return { data: null, error };
    }

    // データをManualEntry形式に変換
    const formattedData: ManualEntry[] = data.map((item) => ({
      id: item.id,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return { data: formattedData, error: null };
  } catch (error) {
    console.error("マニュアルデータの取得エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * マニュアルデータを追加する
 * @param userId ユーザーID
 * @param content マニュアルの内容
 * @returns 追加されたマニュアルデータ
 */
export async function addManual(
  userId: string,
  content: string,
): Promise<{
  data: ManualEntry | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    // Supabaseに保存
    const { data, error } = await supabase
      .from("manuals")
      .insert({
        user_id: userId,
        content,
      })
      .select();

    if (error) {
      console.error("マニュアル追加エラー:", error);
      return { data: null, error };
    }

    // 新しいデータをManualEntry形式に変換
    const newEntry: ManualEntry = {
      id: data[0].id,
      content: data[0].content,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
    };

    return { data: newEntry, error: null };
  } catch (error) {
    console.error("マニュアル追加エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * マニュアルデータを削除する
 * @param userId ユーザーID
 * @param id 削除するマニュアルのID
 * @returns 成功したかどうか
 */
export async function deleteManual(
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
      .from("manuals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("マニュアル削除エラー:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("マニュアル削除エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
