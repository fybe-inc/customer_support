'use client';

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { tables } from '@/lib/db';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/db/database.types';

type Scenario = Database['public']['Tables']['scenarios']['Row'];

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newScenario, setNewScenario] = useState({ title: '', prompt: '' });
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [editingContent, setEditingContent] = useState({ title: '', prompt: '' });

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { scenarios: scenariosDb } = tables(supabase);
      const scenariosData = await scenariosDb.findByUserId(user.id);
      setScenarios(scenariosData);
    } catch (error) {
      console.error('シナリオの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadScenarios();
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { scenarios: scenariosDb } = tables(supabase);
      const searchResults = await scenariosDb.searchByTitle(searchTerm, user.id);
      setScenarios(searchResults);
    } catch (error) {
      console.error('シナリオの検索に失敗しました:', error);
    }
  };

  const handleAdd = async () => {
    if (!newScenario.title.trim() || !newScenario.prompt.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { scenarios: scenariosDb } = tables(supabase);
      await scenariosDb.create({
        title: newScenario.title,
        prompt: newScenario.prompt,
        user_id: user.id,
      });
      setNewScenario({ title: '', prompt: '' });
      setIsAdding(false);
      loadScenarios();
    } catch (error) {
      console.error('シナリオの追加に失敗しました:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingScenario) return;
    try {
      const supabase = createClient();
      const { scenarios: scenariosDb } = tables(supabase);
      await scenariosDb.update(editingScenario.id, {
        title: editingContent.title,
        prompt: editingContent.prompt,
      });
      setEditingScenario(null);
      setEditingContent({ title: '', prompt: '' });
      loadScenarios();
    } catch (error) {
      console.error('シナリオの更新に失敗しました:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const supabase = createClient();
      const { scenarios: scenariosDb } = tables(supabase);
      await scenariosDb.deleteById(id);
      loadScenarios();
    } catch (error) {
      console.error('シナリオの削除に失敗しました:', error);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">シナリオ一覧</h1>
          {/* 検索・追加 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="シナリオタイトルで検索..."
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
            <h2 className="text-lg font-semibold mb-4">シナリオ 新規追加</h2>
            <input
              type="text"
              placeholder="シナリオタイトルを入力..."
              value={newScenario.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewScenario({ ...newScenario, title: e.target.value })}
              className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="シナリオの詳細・プロンプトを入力..."
              value={newScenario.prompt}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewScenario({ ...newScenario, prompt: e.target.value })}
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
        {scenarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">シナリオがありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="bg-white rounded-lg shadow p-6">
                {editingScenario?.id === scenario.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingContent.title}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingContent({ ...editingContent, title: e.target.value })}
                      className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="シナリオタイトルを入力..."
                    />
                    <textarea
                      value={editingContent.prompt}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditingContent({ ...editingContent, prompt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      rows={3}
                      placeholder="シナリオの詳細・プロンプトを入力..."
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingScenario(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2">
                      <span className="font-semibold">タイトル：</span>
                      <span>{scenario.title}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">プロンプト：</span>
                      <span>{scenario.prompt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        作成: {scenario.created_at ? new Date(scenario.created_at).toLocaleString('ja-JP') : '-'}
                        {scenario.updated_at && (
                          <span className="ml-4">
                            更新: {new Date(scenario.updated_at).toLocaleString('ja-JP')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingScenario(scenario);
                            setEditingContent({ title: scenario.title, prompt: scenario.prompt });
                          }}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(scenario.id)}
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
