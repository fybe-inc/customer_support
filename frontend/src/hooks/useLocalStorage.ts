'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 初期値の取得関数
  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // 値を設定する関数
  const setValue = useCallback((value: T) => {
    try {
      // 新しい値を状態に保存
      setStoredValue(value);
      
      // localStorageに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key]);

  // 初回マウント時のみ実行
  useEffect(() => {
    const initialStoredValue = getStoredValue();
    if (JSON.stringify(initialStoredValue) !== JSON.stringify(storedValue)) {
      setStoredValue(initialStoredValue);
    }
  }, [getStoredValue]);

  return [storedValue, setValue];
}
