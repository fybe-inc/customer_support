import { AIResponse } from '../types/types';

interface AIResponseDisplayProps {
  response: AIResponse | null;
}

const AIResponseDisplay = ({ response }: AIResponseDisplayProps) => {
  if (!response || !response.scenarios.length) return null;

  return (
    <div className="w-full max-w-2xl border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-bold mb-4">AI回答案</h2>
      <div className="space-y-8">
        {response.scenarios.map((scenario, index) => (
          <div key={index} className="border-b pb-6 last:border-b-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                シナリオ {index + 1}
              </h3>
              <span className={`px-3 py-1 rounded text-sm ${
                scenario.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                scenario.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {scenario.sentiment === 'positive' ? '前向き' :
                 scenario.sentiment === 'negative' ? '否定的' : '中立的'}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">返信メッセージ:</h4>
                <div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">
                  {scenario.reply}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">シナリオタイプ:</h4>
                <div className="text-sm text-gray-600">
                  {scenario.scenarioType}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">補足情報:</h4>
                <div className="text-sm text-gray-600">
                  {scenario.notes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIResponseDisplay;
