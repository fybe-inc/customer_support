'use client';

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/db/database.types';

// マニュアル型
type Manual = Database['public']['Tables']['manuals']['Row'];

export default function ManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newManual, setNewManual] = useState({ content: '' });
  const [editingManual, setEditingManual] = useState<Manual | null>(null);

  useEffect(() => {
    loadManuals();
  }, []);

  const loadManuals = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { manuals: manualsDb } = tables(supabase);
      const manualsData = await manualsDb.findByUserId(user.id);
      setManuals(manualsData);
    } catch (error) {
      console.error('マニュアルの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadManuals();
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { manuals: manualsDb } = tables(supabase);
      const searchResults = await manualsDb.searchByContent(searchTerm, user.id);
      setManuals(searchResults);
    } catch (error) {
      console.error('マニュアルの検索に失敗しました:', error);
    }
  };

  const handleAdd = async () => {
    if (!newManual.content.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { manuals: manualsDb } = tables(supabase);
      await manualsDb.create({
        content: newManual.content,
        user_id: user.id,
      });
      setNewManual({ content: '' });
      setIsAdding(false);
      loadManuals();
    } catch (error) {
      console.error('マニュアルの追加に失敗しました:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingManual) return;
    try {
      const supabase = createClient();
      const { manuals: manualsDb } = tables(supabase);
      await manualsDb.update(editingManual.id, {
        content: editingManual.content,
      });
      setEditingManual(null);
      loadManuals();
    } catch (error) {
      console.error('マニュアルの更新に失敗しました:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const supabase = createClient();
      const { manuals: manualsDb } = tables(supabase);
      await manualsDb.deleteById(id);
      loadManuals();
    } catch (error) {
      console.error('マニュアルの削除に失敗しました:', error);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">マニュアル一覧</h1>
          {/* 検索・追加 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="マニュアル内容で検索..."
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
            <h2 className="text-lg font-semibold mb-4">マニュアル新規追加</h2>
            <textarea
              placeholder="マニュアル内容を入力..."
              value={newManual.content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewManual({ content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={4}
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

        {/* マニュアル一覧 */}
        {manuals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">マニュアルがありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {manuals.map((manual) => (
              <div key={manual.id} className="bg-white rounded-lg shadow p-6">
                {editingManual?.id === manual.id ? (
                  <div>
                    <textarea
                      value={editingManual.content}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditingManual({ ...editingManual, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingManual(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap text-gray-800 mb-4">
                      {manual.content}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        作成: {manual.created_at ? new Date(manual.created_at).toLocaleString('ja-JP') : '-'}
                        {manual.updated_at && (
                          <span className="ml-4">
                            更新: {new Date(manual.updated_at).toLocaleString('ja-JP')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingManual(manual)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(manual.id)}
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