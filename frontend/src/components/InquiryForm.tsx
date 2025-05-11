"use client";

import { useState } from "react";

interface InquiryFormProps {
  onSubmit: (inquiry: string) => Promise<void>;
  isLoading?: boolean; // 外部からローディング状態を受け取れるようにする
}

export default function InquiryForm({
  onSubmit,
  isLoading: externalLoading,
}: InquiryFormProps) {
  const [inquiry, setInquiry] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);

  // 外部から渡されたローディング状態があればそれを優先、なければ内部の状態を使用
  const isLoading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!inquiry.trim()) return;

    // 外部でローディング状態が管理されていない場合のみ、内部で管理
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }

    try {
      await onSubmit(inquiry);
      setInquiry("");
    } finally {
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-4">
        <textarea
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value)}
          placeholder="ユーザーからの問い合わせ内容を入力してください"
          className="w-full h-32 p-4 border rounded-lg resize-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inquiry.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "送信中..." : "AI回答を取得"}
        </button>
      </div>
    </form>
  );
}
