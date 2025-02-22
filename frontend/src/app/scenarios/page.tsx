'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Scenario } from '../../types/types';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useLocalStorage<Scenario[]>('scenarios', []);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;

    const newScenario: Scenario = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      prompt: prompt.trim()
    };
    setScenarios([...scenarios, newScenario]);
    setTitle('');
    setPrompt('');
  };

  const handleDelete = (id: string) => {
    setScenarios(scenarios.filter(scenario => scenario.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">事前シナリオ管理</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border rounded-lg resize-none"
            placeholder="シナリオのタイトルを入力してください"
            required
          />
        </div>
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg resize-none"
            placeholder="シナリオの内容を入力してください"
            required
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || !prompt.trim()}
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          保存
        </button>
      </form>
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{scenario.title}</h4>
                <p className="text-sm text-gray-600 mt-2">{scenario.prompt}</p>
              </div>
              <button
                onClick={() => handleDelete(scenario.id)}
                className="text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}