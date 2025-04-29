"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { ManualEntry, ProductEntry, Scenario } from "@/types/types";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "@/config/defaultSettings";

// マニュアルデータを取得するフック
export function useSupabaseManuals() {
  // LocalStorageからマニュアルデータを取得（デフォルト値を使用）
  const [manuals, setManualsInStorage] = useLocalStorage<ManualEntry[]>(
    STORAGE_KEYS.MANUALS,
    [],
    { useDefaultIfEmpty: true },
  );

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
          // 認証されていない場合は何もしない
          return;
        }

        // 将来的にSupabaseからデータを取得する場合は、ここに実装

        // 実際のSupabaseからのデータ取得は以下のようになります
        // const { data, error } = await supabase
        //   .from('manuals')
        //   .select('*')
        //   .eq('user_id', user.id);
        //
        // if (error) throw error;
        // setManuals(data || []);
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

      const newEntry: ManualEntry = {
        id: Date.now().toString(),
        content,
        timestamp: Date.now(),
      };

      // LocalStorageに保存
      const updatedManuals = [...manuals, newEntry];
      setManualsInStorage(updatedManuals);

      // 実際のSupabaseへの保存は以下のようになります
      // const { data, error } = await supabase
      //   .from('manuals')
      //   .insert({
      //     user_id: user.id,
      //     content,
      //     created_at: new Date().toISOString(),
      //   })
      //   .select();
      //
      // if (error) throw error;
      //
      // // 新しいデータを取得して状態を更新
      // const { data: newData, error: fetchError } = await supabase
      //   .from('manuals')
      //   .select('*')
      //   .eq('user_id', user.id);
      //
      // if (fetchError) throw fetchError;
      // setManuals(newData || []);

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

      // LocalStorageから削除
      const updatedManuals = manuals.filter((manual) => manual.id !== id);
      setManualsInStorage(updatedManuals);

      // 実際のSupabaseからの削除は以下のようになります
      // const { error } = await supabase
      //   .from('manuals')
      //   .delete()
      //   .eq('id', id)
      //   .eq('user_id', user.id);
      //
      // if (error) throw error;
      //
      // // 削除後のデータを取得して状態を更新
      // const { data: newData, error: fetchError } = await supabase
      //   .from('manuals')
      //   .select('*')
      //   .eq('user_id', user.id);
      //
      // if (fetchError) throw fetchError;
      // setManuals(newData || []);

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
  // LocalStorageから商品データを取得（デフォルト値を使用）
  const [products, setProductsInStorage] = useLocalStorage<ProductEntry[]>(
    STORAGE_KEYS.PRODUCTS,
    [],
    { useDefaultIfEmpty: true },
  );

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
          // 認証されていない場合は何もしない
          return;
        }

        // 将来的にSupabaseからデータを取得する場合は、ここに実装

        // 実際のSupabaseからのデータ取得は以下のようになります
        // const { data, error } = await supabase
        //   .from('products')
        //   .select('*')
        //   .eq('user_id', user.id);
        //
        // if (error) throw error;
        // setProducts(data || []);
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

      const newEntry: ProductEntry = {
        id: Date.now().toString(),
        content,
        timestamp: Date.now(),
      };

      // LocalStorageに保存
      const updatedProducts = [...products, newEntry];
      setProductsInStorage(updatedProducts);

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

      // LocalStorageから削除
      const updatedProducts = products.filter((product) => product.id !== id);
      setProductsInStorage(updatedProducts);

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
  // LocalStorageからシナリオデータを取得（デフォルト値を使用）
  const [scenarios, setScenariosInStorage] = useLocalStorage<Scenario[]>(
    STORAGE_KEYS.SCENARIOS,
    [],
    { useDefaultIfEmpty: true },
  );

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
          // 認証されていない場合は何もしない
          return;
        }

        // 将来的にSupabaseからデータを取得する場合は、ここに実装

        // 実際のSupabaseからのデータ取得は以下のようになります
        // const { data, error } = await supabase
        //   .from('scenarios')
        //   .select('*')
        //   .eq('user_id', user.id);
        //
        // if (error) throw error;
        // setScenarios(data || []);
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

      const newScenario: Scenario = {
        id: Date.now().toString(),
        title,
        prompt,
      };

      // LocalStorageに保存
      const updatedScenarios = [...scenarios, newScenario];
      setScenariosInStorage(updatedScenarios);

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

      // LocalStorageから削除
      const updatedScenarios = scenarios.filter(
        (scenario) => scenario.id !== id,
      );
      setScenariosInStorage(updatedScenarios);

      return true;
    } catch (error: unknown) {
      console.error("シナリオ削除エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  return { scenarios, loading, error, addScenario, deleteScenario };
}
