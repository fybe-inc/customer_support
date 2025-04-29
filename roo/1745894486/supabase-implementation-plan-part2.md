# Supabase導入による認証とデータ管理の実装計画 (Part 2)

## 4. データベース設計

### 4.1 テーブル設計

1. マニュアルテーブル

```sql
CREATE TABLE manuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシー（Row Level Security）
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のマニュアルのみ閲覧可能
CREATE POLICY "Users can view their own manuals" ON manuals
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のマニュアルのみ作成可能
CREATE POLICY "Users can insert their own manuals" ON manuals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のマニュアルのみ更新可能
CREATE POLICY "Users can update their own manuals" ON manuals
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のマニュアルのみ削除可能
CREATE POLICY "Users can delete their own manuals" ON manuals
  FOR DELETE USING (auth.uid() = user_id);
```

2. 商品情報テーブル

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシー
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の商品情報のみ閲覧可能
CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の商品情報のみ作成可能
CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の商品情報のみ更新可能
CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分の商品情報のみ削除可能
CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);
```

3. シナリオテーブル

```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシー
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のシナリオのみ閲覧可能
CREATE POLICY "Users can view their own scenarios" ON scenarios
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のシナリオのみ作成可能
CREATE POLICY "Users can insert their own scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のシナリオのみ更新可能
CREATE POLICY "Users can update their own scenarios" ON scenarios
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のシナリオのみ削除可能
CREATE POLICY "Users can delete their own scenarios" ON scenarios
  FOR DELETE USING (auth.uid() = user_id);
```

### 4.2 インデックス設定

```sql
-- マニュアルテーブルのインデックス
CREATE INDEX idx_manuals_user_id ON manuals(user_id);

-- 商品情報テーブルのインデックス
CREATE INDEX idx_products_user_id ON products(user_id);

-- シナリオテーブルのインデックス
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
```

## 5. LocalStorageからSupabaseへのデータ移行

### 5.1 データ移行ユーティリティの作成

```typescript
// utils/migrateLocalStorageToSupabase.ts
import { supabase } from '@/lib/supabase';
import type { ManualEntry, ProductEntry, Scenario } from '@/types/types';

export async function migrateManuals() {
  try {
    // LocalStorageからマニュアルデータを取得
    const manualsJson = localStorage.getItem('manuals');
    if (!manualsJson) return;
    
    const manuals: ManualEntry[] = JSON.parse(manualsJson);
    
    // ユーザーIDを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ユーザーが認証されていません');
    
    // 各マニュアルをSupabaseに挿入
    for (const manual of manuals) {
      await supabase.from('manuals').insert({
        user_id: user.id,
        content: manual.content,
        created_at: new Date(manual.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    // 移行完了後、LocalStorageのデータを削除（オプション）
    // localStorage.removeItem('manuals');
    
    return true;
  } catch (error) {
    console.error('マニュアルの移行に失敗しました:', error);
    return false;
  }
}

export async function migrateProducts() {
  try {
    // LocalStorageから商品情報データを取得
    const productsJson = localStorage.getItem('products');
    if (!productsJson) return;
    
    const products: ProductEntry[] = JSON.parse(productsJson);
    
    // ユーザーIDを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ユーザーが認証されていません');
    
    // 各商品情報をSupabaseに挿入
    for (const product of products) {
      await supabase.from('products').insert({
        user_id: user.id,
        content: product.content,
        created_at: new Date(product.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    // 移行完了後、LocalStorageのデータを削除（オプション）
    // localStorage.removeItem('products');
    
    return true;
  } catch (error) {
    console.error('商品情報の移行に失敗しました:', error);
    return false;
  }
}

export async function migrateScenarios() {
  try {
    // LocalStorageからシナリオデータを取得
    const scenariosJson = localStorage.getItem('scenarios');
    if (!scenariosJson) return;
    
    const scenarios: Scenario[] = JSON.parse(scenariosJson);
    
    // ユーザーIDを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('ユーザーが認証されていません');
    
    // 各シナリオをSupabaseに挿入
    for (const scenario of scenarios) {
      await supabase.from('scenarios').insert({
        user_id: user.id,
        title: scenario.title,
        prompt: scenario.prompt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    // 移行完了後、LocalStorageのデータを削除（オプション）
    // localStorage.removeItem('scenarios');
    
    return true;
  } catch (error) {
    console.error('シナリオの移行に失敗しました:', error);
    return false;
  }
}

export async function migrateAllData() {
  const manualsResult = await migrateManuals();
  const productsResult = await migrateProducts();
  const scenariosResult = await migrateScenarios();
  
  return {
    manuals: manualsResult,
    products: productsResult,
    scenarios: scenariosResult,
  };
}
```

### 5.2 データ移行ページの作成

```typescript
// app/migrate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { migrateAllData } from '@/utils/migrateLocalStorageToSupabase';

export default function MigratePage() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  // 認証されていない場合は認証ページにリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const result = await migrateAllData();
      setResult(result);
    } catch (error) {
      console.error('データ移行に失敗しました:', error);
      setResult({ error: 'データ移行に失敗しました' });
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>データ移行</h1>
      <p>LocalStorageのデータをSupabaseに移行します。</p>
      <button
        onClick={handleMigrate}
        disabled={migrating}
      >
        {migrating ? '移行中...' : 'データを移行する'}
      </button>
      
      {result && (
        <div>
          <h2>移行結果</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          {!result.error && (
            <button onClick={() => router.push('/')}>
              ホームに戻る
            </button>
          )}
        </div>
      )}
    </div>
  );
}