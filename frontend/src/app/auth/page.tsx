"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/SignUp";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ユーザーが既にログインしている場合はホームページにリダイレクト
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
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
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        {authMode === "login" ? (
          <>
            <Login />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は
                <a
                  href="https://forms.gle/CdBaPcgjonBFxL4UA"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  こちら
                </a>
                {/* <button
                  onClick={() => setAuthMode("signup")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  こちら
                </button> */}
              </p>
            </div>
          </>
        ) : (
          <>
            <SignUp />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                既にアカウントをお持ちの方は
                <button
                  onClick={() => setAuthMode("login")}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  こちら
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
