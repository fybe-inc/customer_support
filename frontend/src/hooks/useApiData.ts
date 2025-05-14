"use client";

import { useState, useEffect } from "react";
import type {
  ManualEntry,
  ProductEntry,
  Scenario,
  AIResponse,
} from "@/types/types";
import { useRouter } from "next/navigation";

// マニュアルデータを取得するフック（API経由）
export function useApiManuals() {
  const [manuals, setManuals] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManuals = async () => {
      try {
        setLoading(true);

        // APIからデータを取得
        const response = await fetch("/api/manuals", {
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
        setManuals(data);
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
      // APIにPOSTリクエストを送信
      const response = await fetch("/api/manuals", {
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
      setManuals((prev) => [...prev, newManual]);

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
      // APIにDELETEリクエストを送信
      const response = await fetch(`/api/manuals?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "マニュアルの削除に失敗しました");
      }

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

// 商品データを取得するフック（API経由）
export function useApiProducts() {
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // APIからデータを取得
        const response = await fetch("/api/products", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "商品データの取得に失敗しました");
        }

        const data = await response.json();

        // ステートを更新
        setProducts(data);
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
      // APIにPOSTリクエストを送信
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "商品の追加に失敗しました");
      }

      // 新しい商品データを取得
      const newProduct = await response.json();

      // ステートを更新
      setProducts((prev) => [...prev, newProduct]);

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
      // APIにDELETEリクエストを送信
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "商品の削除に失敗しました");
      }

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

// シナリオデータを取得するフック（API経由）
export function useApiScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);

        // APIからデータを取得
        const response = await fetch("/api/scenarios", {
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "シナリオデータの取得に失敗しました",
          );
        }

        const data = await response.json();

        // ステートを更新
        setScenarios(data);
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
      // APIにPOSTリクエストを送信
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, prompt }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "シナリオの追加に失敗しました");
      }

      // 新しいシナリオデータを取得
      const newScenario = await response.json();

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
      // APIにDELETEリクエストを送信
      const response = await fetch(`/api/scenarios?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "シナリオの削除に失敗しました");
      }

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

// 問い合わせ処理を行うフック（API経由）
export function useApiInquiry() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 問い合わせを送信する関数
  const submitInquiry = async (inquiry: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/getResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inquiry,
        }),
      });

      if (!response.ok) {
        // 認証エラーの場合は認証ページにリダイレクト
        if (response.status === 401) {
          setError("セッションが切れました。再度ログインしてください。");
          router.push("/auth");
          return null;
        }
        throw new Error("API request failed");
      }

      const data = await response.json();
      setAiResponse(data);
      return data;
    } catch (error: unknown) {
      console.error("問い合わせ送信エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // AIレスポンスをリセットする関数
  const resetResponse = () => {
    setAiResponse(null);
  };

  return { aiResponse, loading, error, submitInquiry, resetResponse };
}
