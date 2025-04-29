"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseProducts } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

export default function ProductPage() {
  const { products, loading, error, addProduct, deleteProduct } =
    useSupabaseProducts();
  const [content, setContent] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // 認証状態を確認
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // 認証されていない場合は認証ページにリダイレクト
      if (!session) {
        router.push("/auth");
      }
    };

    checkAuth();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        router.push("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    const success = await addProduct(content);
    if (success) {
      setContent("");
    } else {
      alert("商品情報の保存に失敗しました。");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (!success) {
      alert("商品情報の削除に失敗しました。");
    }
  };

  // 認証状態の確認中はローディング表示
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">商品情報管理</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-4 border rounded-lg resize-none"
          placeholder="商品情報を入力してください（例：商品スペック、価格、在庫状況、FAQ等）"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </form>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">読み込み中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            商品情報がありません。新しい商品情報を追加してください。
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(product.timestamp).toLocaleString("ja-JP")}
                </span>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700">
                {product.content}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
