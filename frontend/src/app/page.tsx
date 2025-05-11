"use client";

import InquiryForm from "@/components/InquiryForm";
import AIResponseDisplay from "@/components/AIResponseDisplay";
import {
  useSupabaseManuals,
  useSupabasePrecedents,
  useSupabaseProducts,
  useSupabaseScenarios,
} from "@/hooks/useSupabaseData";
import { useApiInquiry } from "@/hooks/useApiData";

export default function Home() {
  // Supabaseからデータを取得
  const { manuals, loading: manualsLoading } = useSupabaseManuals();
  const { products, loading: productsLoading } = useSupabaseProducts();
  const { scenarios, loading: scenariosLoading } = useSupabaseScenarios();
  const { precedents, loading: precedentsLoading } = useSupabasePrecedents();

  // 問い合わせ処理用のフック
  const {
    aiResponse,
    loading: inquiryLoading,
    error: inquiryError,
    submitInquiry,
  } = useApiInquiry();

  const handleInquirySubmit = async (inquiry: string) => {
    // データの読み込みが完了していない場合は処理しない
    if (
      manualsLoading ||
      productsLoading ||
      scenariosLoading ||
      precedentsLoading
    ) {
      alert("データの読み込み中です。しばらくお待ちください。");
      return;
    }

    await submitInquiry(inquiry, manuals, products, scenarios, precedents);

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
