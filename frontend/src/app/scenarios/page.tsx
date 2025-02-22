'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { ScenarioEntry } from '../../types/types';
import { DEFAULT_SCENARIOS } from '../../types/types';

export default function ScenarioPage() {
  const [scenarios, setScenarios] = useLocalStorage<ScenarioEntry[]>('scenarios', DEFAULT_SCENARIOS);
  const [formState, setFormState] = useState({
    selectedScenarioId: 'new',
    title: '',
    prompt: '',
    isNewScenario: true
  });

  useEffect(() => {
    const selected = scenarios.find(s => s.id === formState.selectedScenarioId);
    setFormState(prev => ({
      ...prev,
      title: selected?.title || '',
      prompt: selected?.prompt || '',
      isNewScenario: !selected
    }));
  }, [scenarios]);

  const handleScenarioSelect = (id: string) => {
    const selected = scenarios.find(s => s.id === id);
    setFormState({
      selectedScenarioId: id,
      title: selected?.title || '',
      prompt: selected?.prompt || '',
      isNewScenario: !selected
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.prompt.trim()) return;

    const timestamp = Math.floor(Date.now() / 1000) * 1000;
    const newEntry: ScenarioEntry = {
      id: formState.isNewScenario ? timestamp.toString() : formState.selectedScenarioId,
      title: formState.title.trim(),
      prompt: formState.prompt.trim(),
      timestamp,
    };

    if (formState.isNewScenario) {
      setScenarios([...scenarios, newEntry]);
    } else {
      setScenarios(scenarios.map(s => s.id === formState.selectedScenarioId ? newEntry : s));
    }

    // フォームをリセット
    setFormState({
      selectedScenarioId: 'new',
      title: '',
      prompt: '',
      isNewScenario: true
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('このシナリオを削除してもよろしいですか？')) {
      setScenarios(scenarios.filter(scenario => scenario.id !== id));
      setFormState({
        selectedScenarioId: 'new',
        title: '',
        prompt: '',
        isNewScenario: true
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">シナリオ管理</h1>
      
      <div className="mb-6">
        <select
          value={formState.selectedScenarioId}
          onChange={(e) => handleScenarioSelect(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
        >
          <option value="new">新規シナリオを追加</option>
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.title}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            シナリオタイトル
          </label>
          <input
            type="text"
            value={formState.title}
            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="シナリオのタイトルを入力"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            シナリオプロンプト
          </label>
          <textarea
            value={formState.prompt}
            onChange={(e) => setFormState(prev => ({ ...prev, prompt: e.target.value }))}
            className="w-full h-32 p-4 border rounded-lg resize-none"
            placeholder="AIへの指示内容を入力してください"
            required
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={!formState.title.trim() || !formState.prompt.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {formState.isNewScenario ? '新規保存' : '更新'}
          </button>
          {!formState.isNewScenario && (
            <button
              type="button"
              onClick={() => handleDelete(formState.selectedScenarioId)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              削除
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">登録済みシナリオ一覧</h2>
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{scenario.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(scenario.timestamp).toLocaleString('ja-JP')}
                </span>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-gray-700 mt-2">{scenario.prompt}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}