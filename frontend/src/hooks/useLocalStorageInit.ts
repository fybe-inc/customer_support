"use client";

import { useEffect, useState } from "react";
import { defaultSettings, STORAGE_KEYS } from "@/config/defaultSettings";

/**
 * LocalStorageの初期化状態
 */
interface InitializationState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
}

/**
 * LocalStorageの初期化オプション
 */
interface InitOptions {
  force?: boolean; // trueの場合、既存のデータがあっても強制的に初期化
  keys?: string[]; // 初期化するキーの配列（指定しない場合はすべてのキー）
}

/**
 * LocalStorageの初期化を管理するフック
 */
export function useLocalStorageInit(): {
  initState: InitializationState;
  initializeStorage: (options?: InitOptions) => Promise<void>;
} {
  const [initState, setInitState] = useState<InitializationState>({
    isInitialized: false,
    isInitializing: true,
    error: null,
  });

  // 初期化状態の確認
  useEffect(() => {
    const checkInitialization = () => {
      try {
        // ブラウザ環境でない場合は何もしない
        if (typeof window === "undefined") {
          setInitState((prev) => ({ ...prev, isInitializing: false }));
          return;
        }

        // 初期化済みフラグの確認
        const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

        if (initialized === "true") {
          setInitState({
            isInitialized: true,
            isInitializing: false,
            error: null,
          });
        } else {
          setInitState({
            isInitialized: false,
            isInitializing: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("LocalStorage初期化状態の確認エラー:", error);
        setInitState({
          isInitialized: false,
          isInitializing: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    };

    checkInitialization();
  }, []);

  // LocalStorageを初期化する関数
  const initializeStorage = async (options: InitOptions = {}) => {
    const { force = false, keys } = options;

    try {
      setInitState((prev) => ({ ...prev, isInitializing: true, error: null }));

      // ブラウザ環境でない場合は何もしない
      if (typeof window === "undefined") {
        setInitState((prev) => ({ ...prev, isInitializing: false }));
        return;
      }

      // 初期化するキーの配列
      const keysToInitialize = keys || Object.values(STORAGE_KEYS);

      // 各キーに対して初期化処理を実行
      for (const key of keysToInitialize) {
        // 既存のデータを確認
        const existingData = localStorage.getItem(key);

        // 既存のデータがなく、または強制初期化の場合、デフォルト値を設定
        if (!existingData || force) {
          // キーに対応するデフォルト値を取得
          const defaultValue = getDefaultValueForKey(key);

          if (defaultValue !== undefined) {
            localStorage.setItem(key, JSON.stringify(defaultValue));
          }
        }
      }

      // 初期化済みフラグを設定
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");

      setInitState({
        isInitialized: true,
        isInitializing: false,
        error: null,
      });
    } catch (error) {
      console.error("LocalStorage初期化エラー:", error);
      setInitState({
        isInitialized: false,
        isInitializing: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  // キーに対応するデフォルト値を取得する関数
  const getDefaultValueForKey = (key: string): unknown => {
    switch (key) {
      case STORAGE_KEYS.MANUALS:
        return defaultSettings.manuals;
      case STORAGE_KEYS.PRODUCTS:
        return defaultSettings.products;
      case STORAGE_KEYS.SCENARIOS:
        return defaultSettings.scenarios;
      case STORAGE_KEYS.INITIALIZED:
        return true;
      default:
        return undefined;
    }
  };

  return {
    initState,
    initializeStorage,
  };
}
