# Supabase移行計画

## 1. 概要

現在のアプリケーションでは、マニュアルデータ、商品データ、シナリオデータがローカルストレージに保存されています。この計画では、これらのデータをSupabaseに移行するための手順を詳細に説明します。

## 2. テーブル設計

### 2.1 manualsテーブル

```sql
CREATE TABLE IF NOT EXISTS manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- インデックス
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ユーザーIDでインデックスを作成
CREATE INDEX IF NOT EXISTS idx_manuals_user_id ON manuals(user_id);

-- RLSポリシーの設定
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "ユーザーは自分のマニュアルデータのみ閲覧可能" ON manuals
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ挿入可能
CREATE POLICY "ユーザーは自分のマニュアルデータのみ挿入可能" ON manuals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "ユーザーは自分のマニュアルデータのみ更新可能" ON manuals
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "ユーザーは自分のマニュアルデータのみ削除可能" ON manuals
  FOR DELETE USING (auth.uid() = user_id);

-- サービスロールは全てのデータにアクセス可能
CREATE POLICY "サービスロールは全てのデータにアクセス可能" ON manuals
  FOR ALL USING (auth.role() = 'service_role');
```

### 2.2 productsテーブル

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- インデックス
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ユーザーIDでインデックスを作成
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- RLSポリシーの設定
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "ユーザーは自分の商品データのみ閲覧可能" ON products
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ挿入可能
CREATE POLICY "ユーザーは自分の商品データのみ挿入可能" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "ユーザーは自分の商品データのみ更新可能" ON products
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "ユーザーは自分の商品データのみ削除可能" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- サービスロールは全てのデータにアクセス可能
CREATE POLICY "サービスロールは全てのデータにアクセス可能" ON products
  FOR ALL USING (auth.role() = 'service_role');
```

### 2.3 scenariosテーブル

```sql
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- インデックス
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ユーザーIDでインデックスを作成
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);

-- RLSポリシーの設定
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ閲覧可能" ON scenarios
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ挿入可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ挿入可能" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ更新可能" ON scenarios
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ削除可能" ON scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- サービスロールは全てのデータにアクセス可能
CREATE POLICY "サービスロールは全てのデータにアクセス可能" ON scenarios
  FOR ALL USING (auth.role() = 'service_role');
```

## 3. マイグレーション手順

### 3.1 マイグレーションファイルの作成

1. 上記のテーブル定義を使用して、以下のマイグレーションファイルを作成します：
   - `supabase/migrations/20250430000000_create_manuals.sql`
   - `supabase/migrations/20250430000001_create_products.sql`
   - `supabase/migrations/20250430000002_create_scenarios.sql`

### 3.2 デフォルトデータの挿入とユーザー作成時の自動挿入

デフォルトデータを管理するためのマイグレーションファイルを作成します：

```sql
-- supabase/migrations/20250430000003_default_data_management.sql

-- デフォルトデータを保存するテーブルの作成
CREATE TABLE IF NOT EXISTS default_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'manual', 'product', 'scenario'のいずれか
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- デフォルトマニュアルデータの挿入
INSERT INTO default_templates (id, type, content)
VALUES
  ('default-manual-1', 'manual', '{"content": "署名として,合同会社FYBE.jp カスタマーサポート担当：内藤剛汰をメッセージの末尾に追加してください。", "timestamp": 1714500000000}'::jsonb),
  ('default-manual-2', 'manual', '{"content": "ユーザーへカジュアルに答えてください。", "timestamp": 1714500100000}'::jsonb);

-- デフォルト商品データの挿入
INSERT INTO default_templates (id, type, content)
VALUES
  ('default-product-1', 'product', '{"content": {"商品名": "Anker PowerCore Essential 20000", "価格": "¥4,990（税込）", "在庫状況": "在庫あり", "商品説明": "20000mAhの超大容量で、iPhone 15を約3回以上、Galaxy S22を約3回、iPad mini 5を2回以上満充電可能。Anker独自技術PowerIQとVoltageBoostにより、最適なスピードで充電が可能です（低電流モード搭載で小型機器にも対応）。2つのUSB出力ポート搭載で2台同時に充電可能。USB-CとMicro USBの両入力ポートを備え、状況に応じて充電可能。多重保護システム採用で長期間安心して使用できます。", "主要な仕様・特徴": ["超大容量（20,000mAh）でスマホを約3回以上充電可能", "PowerIQ搭載で最適な高速充電（※Quick Charge非対応）", "USB出力ポート2つ搭載で2台同時充電対応（合計15W）", "USB-C/Micro USBの2入力方式に対応", "低電流モード搭載（小型電子機器に最適）"], "カテゴリー情報": "モバイルバッテリー", "ユーザーレビュー（概要）": "平均4.5／5 （18件のレビュー）", "商品ページURL": "https://www.ankerjapan.com/products/a1268"}, "timestamp": 1714500200000}'::jsonb),
  ('default-product-2', 'product', '{"content": {"商品名": "Anker 622 Magnetic Battery (MagGo)", "価格": "¥6,990（税込）", "在庫状況": "在庫なし", "商品説明": "MagSafe対応のワイヤレスバッテリー。5000mAhの容量でiPhoneへのワイヤレス充電に対応。折りたたみ式スタンド機能付きで動画視聴などに便利。マグネットでiPhone背面に吸着し、一体化して充電可能。安全性にも配慮した多重保護機能搭載。", "主要な仕様・特徴": ["MagSafe対応の5000mAhワイヤレスバッテリー", "折りたたみスタンド搭載でハンズフリー利用", "マグネットでiPhoneにしっかり吸着", "最大7.5Wのワイヤレス充電に対応", "多重保護機能搭載で安全に充電"], "カテゴリー情報": "モバイルバッテリー", "ユーザーレビュー（概要）": "平均4.3／5 （56件のレビュー）", "商品ページURL": "https://www.ankerjapan.com/products/a1611"}, "timestamp": 1714500300000}'::jsonb);

-- デフォルトシナリオデータの挿入
INSERT INTO default_templates (id, type, content)
VALUES
  ('default-scenario-1', 'scenario', '{"title": "肯定的な回答", "prompt": "返信は肯定的で協力的な態度で作成してください。顧客の要望に対して可能な限り対応する姿勢を示し、前向きな表現を使用してください。"}'::jsonb),
  ('default-scenario-2', 'scenario', '{"title": "否定的な回答", "prompt": "返信は申し訳ない気持ちを示しながら、要望にお応えできない理由を丁寧に説明してください。代替案がある場合は提案してください。"}'::jsonb),
  ('default-scenario-3', 'scenario', '{"title": "遅延を伝える", "prompt": "3営業日以内に返信することを適切に伝えてください。可能な限り対応する姿勢を示し、前向きな表現を使用してください。"}'::jsonb);

-- 新規ユーザー作成時にデフォルトデータを挿入する関数
CREATE OR REPLACE FUNCTION insert_default_data_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- デフォルトマニュアルデータの挿入
  INSERT INTO manuals (user_id, content, timestamp)
  SELECT
    NEW.id,
    (content->>'content')::TEXT,
    (content->>'timestamp')::BIGINT
  FROM
    default_templates
  WHERE
    type = 'manual';

  -- デフォルト商品データの挿入
  INSERT INTO products (user_id, content, timestamp)
  SELECT
    NEW.id,
    content->>'content',
    (content->>'timestamp')::BIGINT
  FROM
    default_templates
  WHERE
    type = 'product';

  -- デフォルトシナリオデータの挿入
  INSERT INTO scenarios (user_id, title, prompt)
  SELECT
    NEW.id,
    content->>'title',
    content->>'prompt'
  FROM
    default_templates
  WHERE
    type = 'scenario';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時のトリガー設定
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION insert_default_data_for_new_user();
```

### 3.3 マイグレーションの実行

```bash
supabase db reset
```

## 4. コード変更

### 4.1 useSupabaseData.tsの修正

`useSupabaseData.ts`ファイルを修正して、Supabaseからデータを取得・保存するように変更します。ローカルストレージは使用せず、すべてのデータ操作はSupabaseに対して行います。

```typescript
// マニュアルデータを取得するフック
export function useSupabaseManuals() {
  const [manuals, setManuals] = useState<ManualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManuals = async () => {
      try {
        setLoading(true);

        // クライアント作成
        const supabase = createClient();

        // ユーザーのセッションを取得
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // 認証されていない場合は空の配列を返す
          setManuals([]);
          return;
        }

        // Supabaseからデータを取得
        const { data, error } = await supabase
          .from('manuals')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // データをManualEntry形式に変換
        const formattedData: ManualEntry[] = data.map(item => ({
          id: item.id,
          content: item.content,
          timestamp: item.timestamp,
        }));

        // ステートを更新
        setManuals(formattedData);
      } catch (error: unknown) {
        console.error("マニュアルデータの取得エラー:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();
  }, []);

  // マニュアルを追加する関数
  const addManual = async (content: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      const timestamp = Date.now();

      // Supabaseに保存
      const { data, error } = await supabase
        .from('manuals')
        .insert({
          user_id: user.id,
          content,
          timestamp,
        })
        .select();

      if (error) throw error;

      // 新しいデータをManualEntry形式に変換
      const newEntry: ManualEntry = {
        id: data[0].id,
        content,
        timestamp,
      };

      // ステートを更新
      setManuals(prev => [...prev, newEntry]);

      return true;
    } catch (error: unknown) {
      console.error("マニュアル追加エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // マニュアルを削除する関数
  const deleteManual = async (id: string) => {
    try {
      // クライアント作成
      const supabase = createClient();

      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証されていません");
      }

      // Supabaseから削除
      const { error } = await supabase
        .from('manuals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // ステートを更新
      setManuals(prev => prev.filter(manual => manual.id !== id));

      return true;
    } catch (error: unknown) {
      console.error("マニュアル削除エラー:", error);
      setError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  return { manuals, loading, error, addManual, deleteManual };
}
```

同様に、`useSupabaseProducts`と`useSupabaseScenarios`フックも修正します。

### 4.2 ユーザー認証処理の実装

ユーザー登録とログイン時の処理を実装します。新規ユーザー登録時には、データベーストリガーによってデフォルトデータが自動的に挿入されます。

```typescript
// frontend/src/components/Auth/SignUp.tsx の実装

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ユーザー登録処理
const handleSignUp = async (email: string, password: string) => {
  try {
    const supabase = createClient();
    
    // ユーザー登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // 登録成功時の処理
    // 注: デフォルトデータはデータベーストリガーによって自動的に挿入されます
    
    // ログイン画面またはホーム画面にリダイレクト
    router.push("/auth");
    
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    // エラーメッセージを表示
  }
};

// frontend/src/components/Auth/Login.tsx の実装

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ログイン処理
const handleLogin = async (email: string, password: string) => {
  try {
    const supabase = createClient();
    
    // ログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // ログイン成功時の処理
    // ホーム画面にリダイレクト
    router.push("/");
    
  } catch (error) {
    console.error("ログインエラー:", error);
    // エラーメッセージを表示
  }
};
```

## 5. テスト計画

### 5.1 単体テスト

1. **Supabaseテーブルの作成テスト**
   - 各テーブルが正しく作成されていることを確認
   - RLSポリシーが正しく設定されていることを確認

2. **データ取得テスト**
   - `useSupabaseManuals`フックがSupabaseからデータを正しく取得できることを確認
   - `useSupabaseProducts`フックがSupabaseからデータを正しく取得できることを確認
   - `useSupabaseScenarios`フックがSupabaseからデータを正しく取得できることを確認

3. **データ追加テスト**
   - `addManual`関数がSupabaseにデータを正しく追加できることを確認
   - `addProduct`関数がSupabaseにデータを正しく追加できることを確認
   - `addScenario`関数がSupabaseにデータを正しく追加できることを確認

4. **データ削除テスト**
   - `deleteManual`関数がSupabaseからデータを正しく削除できることを確認
   - `deleteProduct`関数がSupabaseからデータを正しく削除できることを確認
   - `deleteScenario`関数がSupabaseからデータを正しく削除できることを確認

5. **自動データ初期化テスト**
   - 新規ユーザー登録時にデフォルトデータが自動的に挿入されることを確認

### 5.2 統合テスト

1. **ユーザー認証テスト**
   - ユーザー登録が正常に行われることを確認
   - ログインが正常に行われることを確認
   - ログアウトが正常に行われることを確認

2. **UIテスト**
   - マニュアル管理画面でSupabaseのデータが正しく表示されることを確認
   - 商品管理画面でSupabaseのデータが正しく表示されることを確認
   - シナリオ管理画面でSupabaseのデータが正しく表示されることを確認

3. **エラーハンドリングテスト**
   - Supabaseとの接続エラー時に適切なエラーメッセージが表示されることを確認
   - 認証エラー時に適切なエラーメッセージが表示されることを確認

## 6. リスクと対策

### 6.1 データ損失リスク

**リスク**: 移行中にデータが失われる可能性があります。

**対策**:
- 移行前にデータのバックアップを取得
- 移行処理をトランザクションで囲み、エラーが発生した場合はロールバックする
- 移行後にデータの整合性を確認

### 6.2 認証関連リスク

**リスク**: 認証システムの変更により、ユーザーがアクセスできなくなる可能性があります。

**対策**:
- 認証システムの変更は段階的に行う
- ユーザーへの事前通知を行う
- 移行期間中はサポート体制を強化する

### 6.3 パフォーマンスリスク

**リスク**: Supabaseからのデータ取得が遅くなり、ユーザー体験が低下する可能性があります。

**対策**:
- データをキャッシュする仕組みを実装
- 必要なデータのみを取得するクエリの最適化
- ページネーションの実装（大量のデータがある場合）

### 6.4 オフライン対応リスク

**リスク**: オフライン時にSupabaseにアクセスできず、データの取得・保存ができなくなる可能性があります。

**対策**:
- オフライン時は読み取り専用モードに切り替える
- オンラインに戻った際に、変更をSupabaseに同期する
- オフライン状態を検知し、ユーザーに通知する機能を実装

## 7. 移行スケジュール

### 7.1 フェーズ1: 準備（1週間）

1. Supabaseプロジェクトのセットアップ
2. マイグレーションファイルの作成
3. テスト環境の構築

### 7.2 フェーズ2: 実装（2週間）

1. `useSupabaseData.ts`の修正
2. ユーザー認証処理の実装
3. 自動データ初期化機能の実装
4. UIコンポーネントの修正

### 7.3 フェーズ3: テスト（1週間）

1. 単体テストの実施
2. 統合テストの実施
3. バグ修正

### 7.4 フェーズ4: デプロイ（1週間）

1. 本番環境へのデプロイ
2. ユーザーへの通知
3. モニタリングと問題対応

## 8. まとめ

この移行計画では、ローカルストレージからSupabaseへのデータ移行を段階的に行います。主な変更点は以下の通りです：

1. Supabaseにテーブルを作成（manuals, products, scenarios）
2. `useSupabaseData.ts`を修正してSupabaseからデータを取得・保存するように変更
3. 新規ユーザー登録時にデフォルトデータを自動的に挿入する機能を実装

これらの変更により、以下のメリットが得られます：

- ユーザー間でのデータ共有が可能になる
- デバイス間でのデータ同期が可能になる
- バックアップと復元が容易になる
- セキュリティが向上する（RLSポリシーによるアクセス制御）

移行作業は約1ヶ月で完了する予定です。