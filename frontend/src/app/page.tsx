"use client";

import InquiryForm from "@/components/InquiryForm";
import AIResponseDisplay from "@/components/AIResponseDisplay";
// import {
//   useSupabaseManuals,
//   useSupabasePrecedents,
//   useSupabaseProducts,
//   useSupabaseScenarios,
// } from "@/hooks/useSupabaseData";
import { useApiInquiry } from "@/hooks/useApiData";

export default function Home() {

  // 問い合わせ処理用のフック
  const {
    aiResponse,
    loading: inquiryLoading,
    error: inquiryError,
    submitInquiry,
  } = useApiInquiry();

  const handleInquirySubmit = async (inquiry: string) => { 

    await submitInquiry(inquiry);

    // エラーがあれば表示
    if (inquiryError) {
      alert(inquiryError);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        AIカスタマーサポート支援システム
      </h1>
      <div className="flex flex-col items-center gap-8">
        <InquiryForm
          onSubmit={handleInquirySubmit}
          isLoading={inquiryLoading}
        />
        <AIResponseDisplay response={aiResponse} />
      </div>
    </div>
  );
}
