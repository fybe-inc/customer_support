"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseScenarios } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

export default function ScenariosPage() {
  const { scenarios, loading, error, addScenario, deleteScenario } =
    useSupabaseScenarios();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
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
    if (!title.trim() || !prompt.trim()) return;

    const success = await addScenario(title, prompt);
    if (success) {
      setTitle("");
      setPrompt("");
    } else {
      alert("シナリオの保存に失敗しました。");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteScenario(id);
    if (!success) {
      alert("シナリオの削除に失敗しました。");
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
      <h1 className="text-2xl font-bold mb-4">事前シナリオ管理</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            シナリオのタイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border rounded-lg"
            placeholder="シナリオのタイトルを入力してください"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            シナリオの内容
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg resize-none"
            placeholder="シナリオの内容を入力してください"
            disabled={loading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || !prompt.trim() || loading}
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
        ) : scenarios.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            シナリオがありません。新しいシナリオを追加してください。
          </div>
        ) : (
          scenarios.map((scenario) => (
            <div key={scenario.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{scenario.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {scenario.prompt}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(scenario.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
