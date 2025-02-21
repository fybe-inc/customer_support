'use client';
import type { FormEvent } from 'react';

import { useState } from 'react';

interface InquiryFormProps {
  onSubmit: (inquiry: string) => Promise<void>;
}

export default function InquiryForm({ onSubmit }: InquiryFormProps) {
  const [inquiry, setInquiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inquiry.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(inquiry);
      setInquiry('');
    } finally {
      setIsLoading(false);
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
          {isLoading ? '送信中...' : 'AI回答を取得'}
        </button>
      </div>
    </form>
  );
}
