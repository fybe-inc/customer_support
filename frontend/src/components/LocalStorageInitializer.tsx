"use client";

import { useEffect } from "react";
import { useLocalStorageInit } from "@/hooks/useLocalStorageInit";

/**
 * LocalStorageの初期化を行うコンポーネント
 * アプリケーションの起動時に一度だけ実行される
 */
export default function LocalStorageInitializer() {
  const { initState, initializeStorage } = useLocalStorageInit();

  useEffect(() => {
    // 初期化中または既に初期化済みの場合は何もしない
    if (initState.isInitializing || initState.isInitialized) {
      return;
    }

    // LocalStorageの初期化
    initializeStorage();
  }, [initState.isInitializing, initState.isInitialized, initializeStorage]);

  // このコンポーネントは何も表示しない
  return null;
}
