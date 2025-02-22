/** @jest-environment jsdom */
/** @jest-environment jsdom */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScenarioManagement } from '../ScenarioManagement';
import type { Scenario } from '../../types/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ScenarioManagement', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders default scenarios', () => {
    const scenarios: Scenario[] = [];
    render(
      <ScenarioManagement 
        onScenarioSelect={() => {}} 
        selectedScenario={null}
        scenarios={scenarios}
        setScenarios={() => {}}
      />
    );
    
    expect(screen.getByText('肯定的な返信テンプレート')).toBeInTheDocument();
    expect(screen.getByText('否定的な返信テンプレート')).toBeInTheDocument();
    expect(screen.getByText('日程調整テンプレート')).toBeInTheDocument();
  });

  it('allows adding new scenarios', async () => {
    const scenarios: Scenario[] = [];
    render(
      <ScenarioManagement 
        onScenarioSelect={() => {}} 
        selectedScenario={null}
        scenarios={scenarios}
        setScenarios={() => {}}
      />
    );
    
    const description = 'テストシナリオ';
    const prompt = 'テストプロンプト';

    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: description }
    });
    fireEvent.change(screen.getByLabelText('プロンプト'), {
      target: { value: prompt }
    });

    await act(async () => {
      fireEvent.click(screen.getByText('追加'));
    });

    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText(prompt)).toBeInTheDocument();
  });

  it('allows deleting custom scenarios but not default ones', () => {
    const scenarios: Scenario[] = [];
    render(
      <ScenarioManagement 
        onScenarioSelect={() => {}} 
        selectedScenario={null}
        scenarios={scenarios}
        setScenarios={() => {}}
      />
    );
    
    // Default scenarios should not have delete buttons
    const defaultScenarios = screen.getAllByText(/テンプレート$/);
    defaultScenarios.forEach((scenario: Element) => {
      const scenarioContainer = scenario.closest('div');
      expect(scenarioContainer).not.toHaveTextContent('削除');
    });
  });
});
