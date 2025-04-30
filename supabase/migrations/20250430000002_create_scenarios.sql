-- scenariosテーブルの作成
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