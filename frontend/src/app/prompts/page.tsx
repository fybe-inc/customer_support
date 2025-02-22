'use client';

import { FC, useEffect } from 'react';
import { ScenarioManagement } from '@/components/ScenarioManagement';
import Layout from '../../components/Layout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Scenario } from '@/types/types';

const defaultScenarios: Scenario[] = [
  {
    id: 'prompt-1',
    prompt: '以下の返信は肯定的で協力的な態度で作成してください。顧客の要望に対して可能な限り対応する姿勢を示し、前向きな表現を使用してください。',
    description: '肯定的な返信テンプレート'
  },
  {
    id: 'prompt-2',
    prompt: '以下の返信は申し訳ない気持ちを示しながら、要望にお応えできない理由を丁寧に説明してください。代替案がある場合は提案してください。',
    description: '否定的な返信テンプレート'
  },
  {
    id: 'prompt-3',
    prompt: '以下の返信は3営業日以内に対応させていただく旨を伝え、具体的な対応予定日を明記してください。',
    description: '日程調整テンプレート'
  }
];

const PromptsPage: FC = () => {
  const [scenarios, setScenarios] = useLocalStorage<Scenario[]>('scenarios', []);

  useEffect(() => {
    if (scenarios.length === 0) {
      setScenarios(defaultScenarios);
    }
  }, [scenarios.length, setScenarios]);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">プロンプト設定</h1>
        <div className="bg-white rounded-lg shadow">
          <ScenarioManagement 
            onScenarioSelect={() => {}} 
            selectedScenario={null}
            scenarios={scenarios}
            setScenarios={setScenarios}
          />
        </div>
      </div>
    </Layout>
  );
};

export default PromptsPage;
