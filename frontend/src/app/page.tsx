'use client';

import { useState } from 'react';
import InquiryForm from '../components/InquiryForm';
import AIResponseDisplay from '../components/AIResponseDisplay';
import { AIResponse } from '../types/types';

export default function Home() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const handleInquirySubmit = async (inquiry: string) => {
    try {
      const response = await fetch('/api/getResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inquiry }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setAiResponse(data);
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          AIカスタマーサポート支援システム
        </h1>
        <div className="flex flex-col items-center gap-8">
          <InquiryForm onSubmit={handleInquirySubmit} />
          <AIResponseDisplay response={aiResponse} />
        </div>
      </div>
    </div>
  );
}
