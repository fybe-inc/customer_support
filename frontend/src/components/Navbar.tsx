"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import LogoutButton from "./Auth/LogoutButton";
import DebugFetch from "./debugFetch";
import { User } from "@supabase/supabase-js";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 初期ユーザー情報の取得
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="fixed left-0 w-64 h-screen bg-white border-r overflow-y-auto z-50 shadow-lg">
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <Link
            href="/"
            className="block text-2xl font-bold mb-6 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ホーム
          </Link>

          <h2 className="text-xl font-bold mb-4">設定</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/manual"
                className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                マニュアル管理
              </Link>
            </li>
            <li>
              <Link
                href="/scenarios"
                className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                事前シナリオ
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                商品情報管理
              </Link>
            </li>
            <li>
              <Link
                href="/precedents"
                className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                前例情報管理
              </Link>
            </li>
          </ul>
        </div>

        {/* 認証状態に応じた表示 */}
        <div className="mb-6">
          {loading ? (
            <div className="text-sm text-gray-500 mb-2">読み込み中...</div>
          ) : user ? (
            <div>
              <DebugFetch>
                <div className="text-sm text-gray-500 mb-2">
                  ログイン中: {user.email}
                </div>
              </DebugFetch>
              <LogoutButton className="w-full" />
            </div>
          ) : (
            <Link
              href="/auth"
              className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ログイン / 登録
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
