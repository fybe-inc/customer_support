'use client';

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/db/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ content: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { products: productsDb } = tables(supabase);
      const productsData = await productsDb.findByUserId(user.id);
      setProducts(productsData);
    } catch (error) {
      console.error('商品の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProducts();
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { products: productsDb } = tables(supabase);
      const searchResults = await productsDb.searchByContent(searchTerm, user.id);
      setProducts(searchResults);
    } catch (error) {
      console.error('商品の検索に失敗しました:', error);
    }
  };

  const handleAdd = async () => {
    if (!newProduct.content.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { products: productsDb } = tables(supabase);
      await productsDb.create({
        content: newProduct.content,
        user_id: user.id,
      });
      setNewProduct({ content: '' });
      setIsAdding(false);
      loadProducts();
    } catch (error) {
      console.error('商品の追加に失敗しました:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    try {
      const supabase = createClient();
      const { products: productsDb } = tables(supabase);
      await productsDb.update(editingProduct.id, {
        content: editingContent,
      });
      setEditingProduct(null);
      setEditingContent('');
      loadProducts();
    } catch (error) {
      console.error('商品の更新に失敗しました:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const supabase = createClient();
      const { products: productsDb } = tables(supabase);
      await productsDb.deleteById(id);
      loadProducts();
    } catch (error) {
      console.error('商品の削除に失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">商品一覧</h1>
          {/* 検索・追加 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="商品内容で検索..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); }}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              検索
            </button>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              新規追加
            </button>
          </div>
        </div>
        {/* 追加フォーム */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">商品 新規追加</h2>
            <input
              type="text"
              placeholder="商品名や説明を入力..."
              value={newProduct.content}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewProduct({ content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                登録
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        {/* 一覧 */}
        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">商品がありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6">
                {editingProduct?.id === product.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingContent(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="商品名や説明を入力..."
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap text-gray-800 mb-4">
                      {product.content}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        作成: {product.created_at ? new Date(product.created_at).toLocaleString('ja-JP') : '-'}
                        {product.updated_at && (
                          <span className="ml-4">
                            更新: {new Date(product.updated_at).toLocaleString('ja-JP')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditingContent(product.content);
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
