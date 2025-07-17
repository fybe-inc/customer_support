'use client';

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/db/database.types';

type Precedent = Database['public']['Tables']['precedents']['Row'];
type PrecedentContent = { inquiry: string; response: string };

export default function PrecedentsPage() {
  const [precedents, setPrecedents] = useState<Precedent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newPrecedent, setNewPrecedent] = useState<PrecedentContent>({ inquiry: '', response: '' });
  const [editingPrecedent, setEditingPrecedent] = useState<Precedent | null>(null);
  const [editingContent, setEditingContent] = useState<PrecedentContent>({ inquiry: '', response: '' });

  useEffect(() => {
    loadPrecedents();
  }, []);

  const loadPrecedents = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { precedents: precedentsDb } = tables(supabase);
      const precedentsData = await precedentsDb.findByUserId(user.id);
      setPrecedents(precedentsData);
    } catch (error) {
      console.error('過去の例の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // 検索はフロント側でfilter
  const filteredPrecedents = precedents.filter((p) => {
    const content = p.content as PrecedentContent;
    return (
      content?.inquiry?.includes(searchTerm) || content?.response?.includes(searchTerm)
    );
  });

  const handleAdd = async () => {
    if (!newPrecedent.inquiry.trim() && !newPrecedent.response.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { precedents: precedentsDb } = tables(supabase);
      await precedentsDb.create({
        content: newPrecedent,
        user_id: user.id,
      });
      setNewPrecedent({ inquiry: '', response: '' });
      setIsAdding(false);
      loadPrecedents();
    } catch (error) {
      console.error('過去の例の追加に失敗しました:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingPrecedent) return;
    try {
      const supabase = createClient();
      const { precedents: precedentsDb } = tables(supabase);
      await precedentsDb.update(editingPrecedent.id, {
        content: editingContent,
      });
      setEditingPrecedent(null);
      setEditingContent({ inquiry: '', response: '' });
      loadPrecedents();
    } catch (error) {
      console.error('過去の例の更新に失敗しました:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const supabase = createClient();
      const { precedents: precedentsDb } = tables(supabase);
      await precedentsDb.deleteById(id);
      loadPrecedents();
    } catch (error) {
      console.error('過去の例の削除に失敗しました:', error);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">過去の例一覧</h1>
          {/* 検索・追加 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="質問や回答で検索..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') {/* no-op */} }}
            />
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
            <h2 className="text-lg font-semibold mb-4">過去の例 新規追加</h2>
            <input
              type="text"
              placeholder="質問を入力..."
              value={newPrecedent.inquiry}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPrecedent({ ...newPrecedent, inquiry: e.target.value })}
              className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="回答を入力..."
              value={newPrecedent.response}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewPrecedent({ ...newPrecedent, response: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
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
        {filteredPrecedents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">過去の例がありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrecedents.map((precedent) => {
              const content = precedent.content as PrecedentContent;
              return (
                <div key={precedent.id} className="bg-white rounded-lg shadow p-6">
                  {editingPrecedent?.id === precedent.id ? (
                    <div>
                      <input
                        type="text"
                        value={editingContent.inquiry}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingContent({ ...editingContent, inquiry: e.target.value })}
                        className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="質問を入力..."
                      />
                      <textarea
                        value={editingContent.response}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditingContent({ ...editingContent, response: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        rows={3}
                        placeholder="回答を入力..."
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleEdit}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingPrecedent(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2">
                        <span className="font-semibold">質問：</span>
                        <span>{content?.inquiry}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">回答：</span>
                        <span>{content?.response}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          作成: {precedent.created_at ? new Date(precedent.created_at).toLocaleString('ja-JP') : '-'}
                          {precedent.updated_at && (
                            <span className="ml-4">
                              更新: {new Date(precedent.updated_at).toLocaleString('ja-JP')}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPrecedent(precedent);
                              setEditingContent(content);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(precedent.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
