"use client";

import React, { useState } from "react";
import { useApiManuals } from "@/hooks/useApiData";

export default function ManualPage() {
  const { manuals, loading, error, addManual, deleteManual } = useApiManuals();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    const success = await addManual(content);
    if (success) {
      setContent("");
    } else {
      alert("マニュアルの保存に失敗しました。");
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteManual(id);
    if (!success) {
      alert("マニュアルの削除に失敗しました。");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">マニュアル管理</h1>
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
          placeholder="マニュアル内容を入力してください（例：返品ポリシー、保証内容、対応方針など）"
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
        {loading && manuals.length === 0 ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">読み込み中...</p>
          </div>
        ) : manuals.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            マニュアルがありません。新しいマニュアルを追加してください。
          </div>
        ) : (
          manuals.map((manual) => (
            <div key={manual.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {manual.created_at
                    ? new Date(manual.created_at).toLocaleString("ja-JP")
                    : "日時不明"}
                </span>
                <button
                  onClick={() => handleDelete(manual.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  削除
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700">
                {manual.content}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
