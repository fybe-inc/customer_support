-- プレセントテーブルの作成
CREATE TABLE precedents (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- ユーザーIDでインデックスを作成
CREATE INDEX IF NOT EXISTS idx_precedents_user_id ON precedents(user_id);

-- RLSポリシーの設定
ALTER TABLE precedents ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ閲覧可能" ON precedents
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ挿入可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ挿入可能" ON precedents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ更新可能" ON precedents
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "ユーザーは自分のシナリオデータのみ削除可能" ON precedents
  FOR DELETE USING (auth.uid() = user_id);

-- サービスロールは全てのデータにアクセス可能
CREATE POLICY "サービスロールは全てのデータにアクセス可能" ON precedents
  FOR ALL USING (auth.role() = 'service_role');