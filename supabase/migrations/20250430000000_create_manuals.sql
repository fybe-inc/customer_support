-- manualsテーブルの作成
CREATE TABLE IF NOT EXISTS manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
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