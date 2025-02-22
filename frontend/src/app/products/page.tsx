'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { ProductEntry } from '../../types/types';
import Layout from '../../components/Layout';

export default function ProductPage() {
  const [products, setProducts] = useLocalStorage<ProductEntry[]>('products', []);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newEntry: ProductEntry = {
      id: Date.now().toString(),
      content,
      timestamp: Date.now(),
    };
    setProducts([...products, newEntry]);
    setContent('');
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">商品情報管理</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg resize-none"
            placeholder="商品情報を入力してください（例：商品スペック、価格、在庫状況、FAQ等）"
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
          {products.map((product) => (
            <div key={product.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(product.timestamp).toLocaleString('ja-JP')}
                </span>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700">{product.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
