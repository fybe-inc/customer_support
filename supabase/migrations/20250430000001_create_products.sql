-- productsテーブルの作成
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
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