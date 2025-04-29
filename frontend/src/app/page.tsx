"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import { useRouter } from "next/navigation";
import InquiryForm from "@/components/InquiryForm";
import AIResponseDisplay from "@/components/AIResponseDisplay";
import { AIResponse } from "@/types/types";
import {
  useSupabaseManuals,
  useSupabaseProducts,
  useSupabaseScenarios,
} from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

const Home: FC = () => {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  // Supabaseからデータを取得
  const { manuals, loading: manualsLoading } = useSupabaseManuals();
  const { products, loading: productsLoading } = useSupabaseProducts();
  const { scenarios, loading: scenariosLoading } = useSupabaseScenarios();

  // 認証状態を確認
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // 認証されていない場合は認証ページにリダイレクト
      if (!session) {
        router.push("/auth");
      }
    };

    checkAuth();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        router.push("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleInquirySubmit = async (inquiry: string) => {
    try {
      // データの読み込みが完了していない場合は処理しない
      if (manualsLoading || productsLoading || scenariosLoading) {
        alert("データの読み込み中です。しばらくお待ちください。");
        return;
      }

      const response = await fetch("/api/getResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inquiry,
          manuals,
          products,
          scenarios: scenarios.map((s) => ({
            title: s.title,
            prompt: s.prompt,
          })),
        }),
      });

      if (!response.ok) {
        // 認証エラーの場合は認証ページにリダイレクト
        if (response.status === 401) {
          alert("セッションが切れました。再度ログインしてください。");
          router.push("/auth");
          return;
        }
        throw new Error("API request failed");
      }

      const data = await response.json();
      setAiResponse(data);
    } catch (error) {
      console.error("Error:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  // 認証状態の確認中はローディング表示
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        AIカスタマーサポート支援システム
      </h1>
      <div className="flex flex-col items-center gap-8">
        <InquiryForm onSubmit={handleInquirySubmit} />
        <AIResponseDisplay response={aiResponse} />
      </div>
    </div>
  );
};

export default Home;
