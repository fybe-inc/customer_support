import { createClient } from "@/utils/supabase/server";
import type { PrecedentEntry } from "@/types/types";

export async function getPrecedents(userId: string): Promise<{
  data: PrecedentEntry[] | null;
  error: Error | null;
}> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("precedents")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Precedents取得エラー:", error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error("Precedents取得エラー:", error);
    return { data: null, error: error as Error };
  }
}

export async function addPrecedent(
  userId: string,
  content: string,
): Promise<{
  data: PrecedentEntry | null;
  error: Error | null;
}> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("precedents")
      .insert({ user_id: userId, content })
      .select();
    if (error) {
      console.error("Precedent追加エラー:", error);
      return { data: null, error };
    }

    const newPrecedent: PrecedentEntry = {
      id: data[0].id,
      content: data[0].content,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
    };

    return { data: newPrecedent, error: null };
  } catch (error) {
    console.error("Precedent追加エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function deletePrecedent(
  userId: string,
  id: string,
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from("precedents")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) {
      console.error("Precedent削除エラー:", error);
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (error) {
    console.error("Precedent削除エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
