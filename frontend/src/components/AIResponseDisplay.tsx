import { AIResponse } from '../types/types';

interface AIResponseDisplayProps {
  response: AIResponse | null;
}

const AIResponseDisplay = ({ response }: AIResponseDisplayProps) => {
  if (!response) return null;

  return (
    <div className="w-full max-w-2xl border rounded-lg p-6 bg-white">
      <h2 className="text-xl font-bold mb-4">AI回答案</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">返信メッセージ:</h3>
          <div className="p-4 bg-gray-50 rounded">
            {response.reply}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">シナリオタイプ:</h3>
          <div className="text-sm text-gray-600">
            {response.scenarioType}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">補足情報:</h3>
          <div className="text-sm text-gray-600">
            {response.notes}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIResponseDisplay;
