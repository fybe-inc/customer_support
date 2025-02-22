'use client';

import React, { useState, useEffect } from 'react';
import { Scenario } from '../types/types';

interface ScenarioManagementProps {
  onScenarioSelect: (scenario: Scenario | null) => void;
  selectedScenario: Scenario | null;
  scenarios: Scenario[];
  setScenarios: (scenarios: Scenario[] | ((prev: Scenario[]) => Scenario[])) => void;
}

export const ScenarioManagement: React.FC<ScenarioManagementProps> = ({
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
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScenario.prompt && newScenario.description) {
      addScenario(newScenario);
      setNewScenario({
        prompt: '',
        description: ''
      });
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
                  <h4 className="font-medium">{scenario.description}</h4>
                  <p className="text-sm text-gray-600 mt-2">{scenario.prompt}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedScenario?.id === scenario.id) {
                      onScenarioSelect(null);
                    }
                    deleteScenario(scenario.id);
                  }}
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
            <label className="block text-sm font-medium mb-1">
              説明
              <input
                type="text"
                value={newScenario.description}
                onChange={(e) => setNewScenario({
                  ...newScenario,
                  description: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              プロンプト
              <textarea
                value={newScenario.prompt}
                onChange={(e) => setNewScenario({
                  ...newScenario,
                  prompt: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={4}
                required
              />
            </label>
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
