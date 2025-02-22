'use client';

import { FC } from 'react';
import { ScenarioManagement } from '@/components/ScenarioManagement';
import Navbar from '@/components/Navbar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Scenario } from '@/types/types';

const PromptsPage: FC = () => {
  const [scenarios, setScenarios] = useLocalStorage<Scenario[]>('scenarios', [
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
  ]);

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50">
        <main className="py-12">
          <div className="container mx-auto px-4">
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
        </main>
      </div>
    </div>
  );
};

export default PromptsPage;
