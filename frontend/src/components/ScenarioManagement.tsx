'use client';

import type { FC, FormEvent as ReactFormEvent } from 'react';
import { useState } from 'react';
import type { Scenario } from '../types/types';

interface ScenarioManagementProps {
  onScenarioSelect: (scenario: Scenario | null) => void;
  selectedScenario: Scenario | null;
  scenarios: Scenario[];
  setScenarios: (scenarios: Scenario[] | ((prev: Scenario[]) => Scenario[])) => void;
}

export const ScenarioManagement: FC<ScenarioManagementProps> = ({
  onScenarioSelect,
  selectedScenario,
  scenarios,
  setScenarios
}) => {
  const addScenario = (newScenario: Omit<Scenario, 'id'>) => {
    const scenario: Scenario = {
      ...newScenario,
      id: `custom-${Date.now()}`
    };
    setScenarios(prev => [...prev, scenario]);
  };

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };

  const [newScenario, setNewScenario] = useState<Omit<Scenario, 'id'>>({
    prompt: '',
    title: ''
  });

  const handleSubmit = (e: ReactFormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newScenario.prompt && newScenario.title) {
      addScenario(newScenario);
      setNewScenario({
        prompt: '',
        title: ''
      });
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const id = e.currentTarget.dataset.scenarioId;
    if (id) {
      if (selectedScenario?.id === id) {
        onScenarioSelect(null);
      }
      deleteScenario(id);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">既存のプロンプト</h3>
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id} 
              className={`border p-4 rounded-lg cursor-pointer ${
                selectedScenario?.id === scenario.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onScenarioSelect(selectedScenario?.id === scenario.id ? null : scenario)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{scenario.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{scenario.prompt}</p>
                </div>
                <button
                  type="button"
                  data-scenario-id={scenario.id}
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">新規プロンプトの追加</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={newScenario.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewScenario({
                ...newScenario,
                title: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">
              プロンプト
            </label>
            <textarea
              id="prompt"
              value={newScenario.prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewScenario({
                ...newScenario,
                prompt: e.target.value
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            追加
          </button>
        </form>
      </div>
    </div>
  );
};
