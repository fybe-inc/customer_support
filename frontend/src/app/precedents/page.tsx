"use client";

import React, { useState } from "react";
import { useSupabasePrecedents } from "@/hooks/useSupabaseData";

export default function PrecedentPage() {
  const { precedents, loading, error, addPrecedent, deletePrecedent } =
    useSupabasePrecedents();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    const success = await addPrecedent(content);
    if (success) {
      setContent("");
    } else {
      alert("前例情報の保存に失敗しました。");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deletePrecedent(id);
    if (!success) {
      alert("前例情報の削除に失敗しました。");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">前例情報管理</h1>
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
          placeholder="前例情報を入力してください（例：過去のカスタマーサポートとその対応内容など）"
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
        {loading && precedents.length === 0 ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">読み込み中...</p>
          </div>
        ) : precedents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            前例がありません。新しい前例を追加してください。
          </div>
        ) : (
          precedents.map((precedent) => (
            <div key={precedent.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {precedent.created_at
                    ? new Date(precedent.created_at).toLocaleString("ja-JP")
                    : "日時不明"}
                </span>
                <button
                  onClick={() => handleDelete(precedent.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  削除
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700">
                {precedent.content}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
