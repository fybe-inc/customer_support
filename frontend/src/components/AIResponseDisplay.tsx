import { AIResponse } from "../types/types";
import { useState, useEffect } from "react";

interface AIResponseDisplayProps {
  response: AIResponse | null;
}

const AIResponseDisplay = ({ response }: AIResponseDisplayProps) => {
  const [copyStatuses, setCopyStatuses] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [editedReplies, setEditedReplies] = useState<{ [key: number]: string }>(
    {},
  );

  // 初期化: シナリオの返信を編集用のステートに設定
  useEffect(() => {
    if (response && response.scenarios.length) {
      const initialReplies = response.scenarios.reduce(
        (acc, scenario, index) => {
          return { ...acc, [index]: scenario.reply };
        },
        {},
      );
      setEditedReplies(initialReplies);
    }
  }, [response]);

  const handleCopy = async (index: number) => {
    if (!response) return;
    try {
      const textToCopy =
        editedReplies[index] || response.scenarios[index].reply;
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatuses((prev) => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopyStatuses((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      console.error("クリップボードへのコピーに失敗しました:", err);
    }
  };

  const handleTextChange = (index: number, value: string) => {
    setEditedReplies((prev) => ({ ...prev, [index]: value }));
  };

  if (!response || !response.scenarios.length) return null;

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">AI回答案</h2>
      <div className="space-y-6">
        {response.scenarios.map((scenario, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">シナリオ {index + 1}</h3>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  scenario.sentiment === "positive"
                    ? "bg-green-100 text-green-800"
                    : scenario.sentiment === "negative"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {scenario.sentiment === "positive"
                  ? "前向き"
                  : scenario.sentiment === "negative"
                    ? "否定的"
                    : "中立的"}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">返信メッセージ:</h4>
                <div className="relative">
                  <button
                    onClick={() => handleCopy(index)}
                    className="absolute top-2 right-2 z-10 px-3 py-1 text-sm bg-white hover:bg-gray-100 rounded border shadow-sm transition-colors"
                  >
                    {copyStatuses[index] ? "Copied" : "Copy"}
                  </button>
                  <textarea
                    value={editedReplies[index] || scenario.reply}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleTextChange(index, e.target.value)
                    }
                    className="w-full min-h-[200px] p-4 bg-gray-50 rounded resize-y font-normal text-base leading-relaxed border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="AI提案を編集できます..."
                  />
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
                <div className="text-sm text-gray-600">{scenario.notes}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIResponseDisplay;
