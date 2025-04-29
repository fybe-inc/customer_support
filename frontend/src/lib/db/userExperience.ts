import { createClient } from "@/utils/supabase/server";
import type { AIResponse } from "@/types/types";

/**
 * ユーザーの体験（入力と応答）をデータベースに記録する関数
 * @param user_id ユーザーID
 * @param manuals 使用されたマニュアル情報
 * @param products 使用された商品情報
 * @param scenarios 使用されたシナリオ
 * @param inquiry ユーザーの問い合わせ内容
 * @param response AIの応答
 * @returns 保存操作の結果
 */
export async function storeUserExperience(
  user_id: string | null,
  manuals: { content: string }[],
  products: { content: string }[],
  scenarios: { title: string; prompt: string }[],
  inquiry: string,
  response: AIResponse,
): Promise<{ success: boolean; error?: string }> {
  try {
    // user_idがnullの場合は匿名ユーザーとして記録
    if (!user_id) {
      console.warn("ユーザーIDがnullのため、匿名ユーザーとして記録します");
      return { success: false, error: "ユーザーIDが必要です" };
    }

    const supabase = await createClient();

    // データを保存
    const { error } = await supabase.from("user_experiences").insert({
      user_id,
      inquiry,
      response,
      manuals,
      products,
      scenarios,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("ユーザー体験の保存中にエラーが発生しました:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("ユーザー体験の保存中に例外が発生しました:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "不明なエラーが発生しました",
    };
  }
}

/**
 * 特定のユーザーの体験履歴を取得する関数
 * @param user_id ユーザーID
 * @param limit 取得する最大件数（デフォルト: 10）
 * @returns ユーザー体験の配列
 */
export async function getUserExperiences(
  user_id: string | null,
  limit: number = 10,
) {
  try {
    // user_idがnullの場合は空の配列を返す
    if (!user_id) {
      console.warn("ユーザーIDがnullのため、データを取得できません");
      return { success: false, error: "ユーザーIDが必要です", data: null };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_experiences")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("ユーザー体験の取得中にエラーが発生しました:", error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error("ユーザー体験の取得中に例外が発生しました:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      data: null,
    };
  }
}
