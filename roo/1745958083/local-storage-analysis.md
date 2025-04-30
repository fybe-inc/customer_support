# ローカルストレージ分析

## 概要

現在のアプリケーションでは、ローカルストレージを使用して以下のデータを管理しています：

1. **マニュアルデータ（manuals）**: カスタマーサポートの対応方針や署名などの情報
2. **商品データ（products）**: 商品の詳細情報（名前、価格、在庫状況、説明など）
3. **シナリオデータ（scenarios）**: 返信のテンプレートやシナリオ（肯定的な回答、否定的な回答など）

これらのデータは、ブラウザのローカルストレージに保存され、アプリケーション内で使用されています。

## ローカルストレージの実装

### 1. useLocalStorage.ts

このカスタムフックは、ローカルストレージからデータを読み取り、書き込むための機能を提供しています。

主な機能：
- ローカルストレージからデータの読み取り
- データのローカルストレージへの書き込み
- デフォルト値の管理（`STORAGE_KEYS`に基づく）

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {},
): [T, (value: T) => void] {
  // ...
}
```

### 2. useLocalStorageInit.ts

このフックは、ローカルストレージの初期化を管理します。

主な機能：
- ローカルストレージの初期化状態の確認
- 必要に応じてローカルストレージを初期化（デフォルト値を設定）
- 強制的に初期化するオプションの提供

```typescript
export function useLocalStorageInit(): {
  initState: InitializationState;
  initializeStorage: (options?: InitOptions) => Promise<void>;
} {
  // ...
}
```

### 3. LocalStorageInitializer.tsx

このコンポーネントは、アプリケーションの起動時にローカルストレージの初期化を行います。

```typescript
export default function LocalStorageInitializer() {
  const { initState, initializeStorage } = useLocalStorageInit();
  // ...
}
```

### 4. useSupabaseData.ts

このファイルには、Supabaseとの連携を想定したフックが定義されていますが、現在は主にローカルストレージからデータを取得・保存しています。

主なフック：
- `useSupabaseManuals` - マニュアルデータを管理
- `useSupabaseProducts` - 商品データを管理
- `useSupabaseScenarios` - シナリオデータを管理

これらのフックは、将来的にSupabaseへの移行を想定して準備されたコードですが、現在はローカルストレージを使用しています。

## データ構造

### 1. マニュアルデータ（ManualEntry）

```typescript
export interface ManualEntry {
  id: string;
  content: string;
  timestamp: number;
}
```

### 2. 商品データ（ProductEntry）

```typescript
export interface ProductEntry {
  id: string;
  content: string;
  timestamp: number;
}
```

### 3. シナリオデータ（Scenario）

```typescript
export interface Scenario {
  id: string;
  title: string;
  prompt: string;
}
```

## ローカルストレージのキー

ローカルストレージでは、以下のキーが使用されています：

```typescript
export const STORAGE_KEYS = {
  MANUALS: "manuals",
  PRODUCTS: "products",
  SCENARIOS: "scenarios",
  INITIALIZED: "initialized",
};
```

## デフォルト値

アプリケーションには、以下のデフォルト値が定義されています：

1. **マニュアルデータ**：
   - 署名情報
   - カジュアルな対応方針

2. **商品データ**：
   - Anker PowerCore Essential 20000
   - Anker 622 Magnetic Battery (MagGo)

3. **シナリオデータ**：
   - 肯定的な回答
   - 否定的な回答
   - 遅延を伝える

## ユーザーインターフェース

ローカルストレージのデータは、以下のコンポーネントで使用されています：

1. **InquiryForm.tsx** - 問い合わせ内容を入力するフォーム
2. **AIResponseDisplay.tsx** - AIの応答を表示するコンポーネント
3. **AIScenarioSelector.tsx** - AIが提案するシナリオを選択するコンポーネント
4. **ScenarioManagement.tsx** - シナリオを管理するコンポーネント

## Supabaseの実装状況

現在、Supabaseの基本的な設定は完了しており、以下のファイルが実装されています：

1. **supabase.ts** - Supabaseクライアントの作成
2. **client.ts** - ブラウザ側でのSupabaseクライアント作成
3. **server.ts** - サーバー側でのSupabaseクライアント作成
4. **admin.ts** - 管理者権限を持つSupabaseクライアント作成

また、マイグレーションファイルとして、`user_experiences`テーブルの作成が定義されています。このテーブルは、ユーザーの問い合わせ内容とAIの応答を記録するためのものです。

```sql
CREATE TABLE IF NOT EXISTS user_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  inquiry TEXT NOT NULL,
  response JSONB NOT NULL, -- AIの応答（AIResponseオブジェクト）
  manuals JSONB NOT NULL, -- 使用されたマニュアル情報
  products JSONB NOT NULL, -- 使用された商品情報
  scenarios JSONB NOT NULL, -- 使用されたシナリオ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- インデックス
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

また、`userExperience.ts`ファイルには、ユーザー体験データをSupabaseに保存・取得する機能が実装されています。

```typescript
export async function storeUserExperience(
  user_id: string | null,
  manuals: { content: string }[],
  products: { content: string }[],
  scenarios: { title: string; prompt: string }[],
  inquiry: string,
  response: AIResponse,
): Promise<{ success: boolean; error?: string }> {
  // ...
}

export async function getUserExperiences(
  user_id: string | null,
  limit: number = 10,
) {
  // ...
}
```

## まとめ

現在のアプリケーションでは、マニュアルデータ、商品データ、シナリオデータがローカルストレージに保存されています。一方、ユーザーの問い合わせ内容とAIの応答は、Supabaseの`user_experiences`テーブルに保存される仕組みが実装されています。

ローカルストレージからSupabaseへの移行を行うためには、以下のテーブルを新たに作成する必要があります：

1. `manuals` - マニュアルデータを保存するテーブル
2. `products` - 商品データを保存するテーブル
3. `scenarios` - シナリオデータを保存するテーブル

また、`useSupabaseData.ts`のコメントアウトされている部分を有効化し、実際にSupabaseからデータを取得・保存するように修正する必要があります。