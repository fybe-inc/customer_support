-- ユーザー体験テーブルの作成
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

-- ユーザーIDと作成日時でインデックスを作成
CREATE INDEX IF NOT EXISTS idx_user_experiences_user_id ON user_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experiences_created_at ON user_experiences(created_at);

-- RLSポリシーの設定
ALTER TABLE user_experiences ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "ユーザーは自分の体験データのみ閲覧可能" ON user_experiences
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ挿入可能
CREATE POLICY "ユーザーは自分の体験データのみ挿入可能" ON user_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "ユーザーは自分の体験データのみ更新可能" ON user_experiences
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のデータのみ削除可能
CREATE POLICY "ユーザーは自分の体験データのみ削除可能" ON user_experiences
  FOR DELETE USING (auth.uid() = user_id);

-- サービスロールは全てのデータにアクセス可能
CREATE POLICY "サービスロールは全てのデータにアクセス可能" ON user_experiences
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE user_experiences IS 'ユーザーの問い合わせとAIの応答履歴を保存するテーブル';
COMMENT ON COLUMN user_experiences.id IS 'ユニークID';
COMMENT ON COLUMN user_experiences.user_id IS 'ユーザーID';
COMMENT ON COLUMN user_experiences.inquiry IS 'ユーザーの問い合わせ内容';
COMMENT ON COLUMN user_experiences.response IS 'AIの応答（JSONBフォーマット）';
COMMENT ON COLUMN user_experiences.manuals IS '使用されたマニュアル情報（JSONBフォーマット）';
COMMENT ON COLUMN user_experiences.products IS '使用された商品情報（JSONBフォーマット）';
COMMENT ON COLUMN user_experiences.scenarios IS '使用されたシナリオ（JSONBフォーマット）';
COMMENT ON COLUMN user_experiences.created_at IS '作成日時';