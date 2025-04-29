"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, defaultSettings } from "@/config/defaultSettings";

interface UseLocalStorageOptions {
  useDefaultIfEmpty?: boolean; // デフォルト値を使用するかどうか
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {},
): [T, (value: T) => void] {
  const { useDefaultIfEmpty = false } = options;

  // 初期値の取得関数
  const getStoredValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);

      // アイテムが存在しない場合
      if (!item) {

        // デフォルト値を使用するオプションが有効で、キーに対応するデフォルト値がある場合
        if (useDefaultIfEmpty) {
          const defaultValue = getDefaultValueForKey(key);
          if (defaultValue !== undefined) {
            // デフォルト値をLocalStorageに保存
            localStorage.setItem(key, JSON.stringify(defaultValue));
            window.alert("登録ありがとうございます．事前設定されたテストデータがございますので，参考にしてください．削除してからご利用ください．")
            return defaultValue as unknown as T;
          }
        }
        return initialValue;
      }

      try {
        return JSON.parse(item);
      } catch {
        localStorage.removeItem(key);
        return initialValue;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  }, [key, initialValue, useDefaultIfEmpty]);

  // キーに対応するデフォルト値を取得する関数
  const getDefaultValueForKey = (key: string): unknown => {
    switch (key) {
      case STORAGE_KEYS.MANUALS:
        return defaultSettings.manuals;
      case STORAGE_KEYS.PRODUCTS:
        return defaultSettings.products;
      case STORAGE_KEYS.SCENARIOS:
        return defaultSettings.scenarios;
      default:
        return undefined;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // 値を設定する関数
  const setValue = useCallback(
    (value: T) => {
      try {
        // 新しい値を状態に保存
        setStoredValue(value);

        // localStorageに保存
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
    },
    [key],
  );

  // 初回マウント時のみ実行
  useEffect(() => {
    const initialStoredValue = getStoredValue();
    if (JSON.stringify(initialStoredValue) !== JSON.stringify(storedValue)) {
      setStoredValue(initialStoredValue);
    }
  }, [getStoredValue, storedValue]);

  return [storedValue, setValue];
}
