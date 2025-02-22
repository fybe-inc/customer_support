'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { ManualEntry } from '../../types/types';
import Layout from '../../components/Layout';

export default function ManualPage() {
  const [manuals, setManuals] = useLocalStorage<ManualEntry[]>('manuals', []);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newEntry: ManualEntry = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
    };
    setManuals([...manuals, newEntry]);
    setContent('');
  };

  const handleDelete = (id: string) => {
    setManuals(manuals.filter(manual => manual.id !== id));
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">マニュアル管理</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg resize-none"
            placeholder="マニュアル内容を入力してください（例：返品ポリシー、保証内容、対応方針など）"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            保存
          </button>
        </form>
        <div className="space-y-4">
          {manuals.map((manual) => (
            <div key={manual.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(manual.timestamp).toLocaleString('ja-JP')}
                </span>
                <button
                  onClick={() => handleDelete(manual.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700">{manual.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
