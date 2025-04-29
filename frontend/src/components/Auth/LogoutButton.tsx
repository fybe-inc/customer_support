"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      // クライアント作成
      const supabase = createClient();

      await supabase.auth.signOut();
      router.push("/auth"); // ログアウト後は認証ページにリダイレクト
      router.refresh();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 ${className}`}
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
