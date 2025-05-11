"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type {
  ManualEntry,
  ProductEntry,
  Scenario,
  PrecedentEntry,
} from "@/types/types";

export function useSupabasePrecedents() {
  const [precedents, setPrecedents] = useState<PrecedentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrecedents = async () => {
      try {
        setLoading(true);

        // APIからデータを取得
        const response = await fetch("/api/precedents", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "マニュアルデータの取得に失敗しました",
          );
        }

        const data = await response.json();

        // ステートを更新
        setPrecedents(data);
      } catch (error: unknown) {
        console.error("マニュアルデータの取得エラー:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchPrecedents();
  }, []);

  const addPrecedent = async (content: string) => {
    try {
      // APIにPOSTリクエストを送信
      const response = await fetch("/api/precedents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "マニュアルの追加に失敗しました");
      }

      // 新しいマニュアルデータを取得
      const newManual = await response.json();

      // ステートを更新
      setPrecedents((prev) => [...prev, newManual]);

      return true;
    } catch (error: unknown) {
      console.error("マニュアル追加エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const deletePrecedent = async (id: string) => {
    try {
      // APIにDELETEリクエストを送信
      const response = await fetch(`/api/precedents?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "マニュアルの削除に失敗しました");
      }

      // ステートを更新
      setPrecedents((prev) => prev.filter((manual) => manual.id !== id));

      return true;
    } catch (error: unknown) {
      console.error("マニュアル削除エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  return { precedents, loading, error, addPrecedent, deletePrecedent };
}

// マニュアルデータを取得するフック
export function useSupabaseManuals() {
  const [manuals, setManuals] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManuals = async () => {
      try {
        setLoading(true);

        // クライアント作成
        const supabase = createClient();

        // ユーザーのセッションを取得
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // 認証されていない場合は空の配列を返す
          setManuals([]);
          return;
        }

        // Supabaseからデータを取得
        const { data, error } = await supabase
          .from("manuals")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // データをManualEntry形式に変換
        const formattedData: ManualEntry[] = data.map((item) => ({
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));

        // ステートを更新
        setManuals(formattedData);
      } catch (error: unknown) {
        console.error("マニュアルデータの取得エラー:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();
  }, []);

  // マニュアルを追加する関数
  const addManual = async (content: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseに保存
      const { data, error } = await supabase
        .from("manuals")
        .insert({
          user_id: user.id,
          content,
        })
        .select();

      if (error) throw error;

      // 新しいデータをManualEntry形式に変換
      const newEntry: ManualEntry = {
        id: data[0].id,
        content,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
      };

      // ステートを更新
      setManuals((prev) => [...prev, newEntry]);

      return true;
    } catch (error: unknown) {
      console.error("マニュアル追加エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // マニュアルを削除する関数
  const deleteManual = async (id: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseから削除
      const { error } = await supabase
        .from("manuals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // ステートを更新
      setManuals((prev) => prev.filter((manual) => manual.id !== id));

      return true;
    } catch (error: unknown) {
      console.error("マニュアル削除エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  return { manuals, loading, error, addManual, deleteManual };
}

// 商品データを取得するフック
export function useSupabaseProducts() {
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // クライアント作成
        const supabase = createClient();

        // ユーザー情報を取得
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // 認証されていない場合は空の配列を返す
          setProducts([]);
          return;
        }

        // Supabaseからデータを取得
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // データをProductEntry形式に変換
        const formattedData: ProductEntry[] = data.map((item) => ({
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));

        // ステートを更新
        setProducts(formattedData);
      } catch (error: unknown) {
        console.error("商品データの取得エラー:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 商品を追加する関数
  const addProduct = async (content: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseに保存
      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          content,
        })
        .select();

      if (error) throw error;

      // 新しいデータをProductEntry形式に変換
      const newEntry: ProductEntry = {
        id: data[0].id,
        content,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
      };

      // ステートを更新
      setProducts((prev) => [...prev, newEntry]);

      return true;
    } catch (error: unknown) {
      console.error("商品追加エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 商品を削除する関数
  const deleteProduct = async (id: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseから削除
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // ステートを更新
      setProducts((prev) => prev.filter((product) => product.id !== id));

      return true;
    } catch (error: unknown) {
      console.error("商品削除エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  return { products, loading, error, addProduct, deleteProduct };
}

// シナリオデータを取得するフック
export function useSupabaseScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);

        // クライアント作成
        const supabase = createClient();

        // ユーザー情報を取得
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // 認証されていない場合は空の配列を返す
          setScenarios([]);
          return;
        }

        // Supabaseからデータを取得
        const { data, error } = await supabase
          .from("scenarios")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // データをScenario形式に変換
        const formattedData: Scenario[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          prompt: item.prompt,
        }));

        // ステートを更新
        setScenarios(formattedData);
      } catch (error: unknown) {
        console.error("シナリオデータの取得エラー:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // シナリオを追加する関数
  const addScenario = async (title: string, prompt: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseに保存
      const { data, error } = await supabase
        .from("scenarios")
        .insert({
          user_id: user.id,
          title,
          prompt,
        })
        .select();

      if (error) throw error;

      // 新しいデータをScenario形式に変換
      const newScenario: Scenario = {
        id: data[0].id,
        title,
        prompt,
      };

      // ステートを更新
      setScenarios((prev) => [...prev, newScenario]);

      return true;
    } catch (error: unknown) {
      console.error("シナリオ追加エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // シナリオを削除する関数
  const deleteScenario = async (id: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseから削除
      const { error } = await supabase
        .from("scenarios")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // ステートを更新
      setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));

      return true;
    } catch (error: unknown) {
      console.error("シナリオ削除エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  return { scenarios, loading, error, addScenario, deleteScenario };
}
