"use client";

import React from "react";
import { AIScenario } from "../types/types";

interface AIScenarioSelectorProps {
  scenarios: AIScenario[];
  onSelect: (scenario: AIScenario) => void;
}

export const AIScenarioSelector: React.FC<AIScenarioSelectorProps> = ({
  scenarios,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">AIが提案するシナリオ</h3>
      {scenarios.map((scenario, index) => (
        <div
          key={index}
          className="border p-4 rounded-lg cursor-pointer hover:bg-blue-50"
          onClick={() => onSelect(scenario)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{scenario.scenarioType}</h4>
              <p className="text-sm text-gray-600 mt-2">{scenario.reply}</p>
              <p className="text-xs text-gray-500 mt-1">{scenario.notes}</p>
            </div>
            <span
              className={`text-sm ${
                scenario.sentiment === "positive"
                  ? "text-green-600"
                  : scenario.sentiment === "negative"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {scenario.sentiment}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
