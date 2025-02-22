'use client';

import { useState } from 'react';
import type { FC } from 'react';
import InquiryForm from '@/components/InquiryForm';
import AIResponseDisplay from '@/components/AIResponseDisplay';
import { AIResponse, ManualEntry, ProductEntry } from '@/types/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Layout from '@/components/Layout';

const Home: FC = () => {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const [manuals] = useLocalStorage<ManualEntry[]>('manuals', []);
  const [products] = useLocalStorage<ProductEntry[]>('products', []);


  const handleInquirySubmit = async (inquiry: string) => {
    try {
      const response = await fetch('/api/getResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inquiry, manuals, products }),
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
    <Layout>
      <div className="p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            AIカスタマーサポート支援システム
          </h1>
          <div className="flex flex-col items-center gap-8">
            <InquiryForm onSubmit={handleInquirySubmit} />
            <AIResponseDisplay response={aiResponse} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
