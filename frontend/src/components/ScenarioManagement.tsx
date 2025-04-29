"use client";

import type { FC, FormEvent as ReactFormEvent } from "react";
import { useState } from "react";
import type { Scenario } from "../types/types";

interface ScenarioManagementProps {
  onScenarioSelect: (scenario: Scenario | null) => void;
  selectedScenario: Scenario | null;
  scenarios: Scenario[];
  setScenarios: (
    scenarios: Scenario[] | ((prev: Scenario[]) => Scenario[]),
  ) => void;
}

export const ScenarioManagement: FC<ScenarioManagementProps> = ({
  onScenarioSelect,
  selectedScenario,
  scenarios,
  setScenarios,
}) => {
  const addScenario = (newScenario: Omit<Scenario, "id">) => {
    const scenario: Scenario = {
      ...newScenario,
      id: `custom-${Date.now()}`,
    };
    setScenarios((prev) => [...prev, scenario]);
  };

  const deleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

  const [newScenario, setNewScenario] = useState<Omit<Scenario, "id">>({
    prompt: "",
    title: "",
  });

  const handleSubmit = (e: ReactFormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newScenario.prompt && newScenario.title) {
      addScenario(newScenario);
      setNewScenario({
        prompt: "",
        title: "",
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">事前シナリオ管理</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={newScenario.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewScenario({
                ...newScenario,
                title: e.target.value,
              })
            }
            className="w-full p-4 border rounded-lg"
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            プロンプト
          </label>
          <textarea
            id="prompt"
            value={newScenario.prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewScenario({
                ...newScenario,
                prompt: e.target.value,
              })
            }
            className="w-full h-32 p-4 border rounded-lg resize-none"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          追加
        </button>
      </form>
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`p-4 border rounded-lg bg-white cursor-pointer ${
              selectedScenario?.id === scenario.id
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
            onClick={() =>
              onScenarioSelect(
                selectedScenario?.id === scenario.id ? null : scenario,
              )
            }
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
};
