import { createClient } from "@/utils/supabase/server";
import type { Scenario } from "@/types/types";

/**
 * ユーザーのシナリオデータを取得する
 * @param userId ユーザーID
 * @returns シナリオデータの配列
 */
export async function getScenarios(userId: string): Promise<{
  data: Scenario[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    // Supabaseからデータを取得
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("シナリオデータの取得エラー:", error);
      return { data: null, error };
    }

    // データをScenario形式に変換
    const formattedData: Scenario[] = data.map((item) => ({
      id: item.id,
      title: item.title,
      prompt: item.prompt,
    }));

    return { data: formattedData, error: null };
  } catch (error) {
    console.error("シナリオデータの取得エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * シナリオデータを追加する
 * @param userId ユーザーID
 * @param title シナリオのタイトル
 * @param prompt シナリオのプロンプト
 * @returns 追加されたシナリオデータ
 */
export async function addScenario(
  userId: string,
  title: string,
  prompt: string,
): Promise<{
  data: Scenario | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();

    // Supabaseに保存
    const { data, error } = await supabase
      .from("scenarios")
      .insert({
        user_id: userId,
        title,
        prompt,
      })
      .select();

    if (error) {
      console.error("シナリオ追加エラー:", error);
      return { data: null, error };
    }

    // 新しいデータをScenario形式に変換
    const newScenario: Scenario = {
      id: data[0].id,
      title: data[0].title,
      prompt: data[0].prompt,
    };

    return { data: newScenario, error: null };
  } catch (error) {
    console.error("シナリオ追加エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * シナリオデータを削除する
 * @param userId ユーザーID
 * @param id 削除するシナリオのID
 * @returns 成功したかどうか
 */
export async function deleteScenario(
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
      .from("scenarios")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("シナリオ削除エラー:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("シナリオ削除エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
