-- デフォルトデータを保存するテーブルの作成
CREATE TABLE IF NOT EXISTS default_templates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'manual', 'product', 'scenario'のいずれか
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- updated_atトリガーを設定
CREATE TRIGGER update_default_templates_updated_at
BEFORE UPDATE ON default_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- デフォルトマニュアルデータの挿入
INSERT INTO default_templates (id, type, content)
VALUES
  ('default-manual-1', 'manual', '{"content": "署名として,合同会社FYBE.jp カスタマーサポート担当：内藤剛汰をメッセージの末尾に追加してください。"}'::jsonb),
  ('default-manual-2', 'manual', '{"content": "ユーザーへカジュアルに答えてください。"}'::jsonb);

-- デフォルト商品データの挿入
INSERT INTO default_templates (id, type, content)
VALUES
  ('default-product-1', 'product', '{"content": {"商品名": "Anker PowerCore Essential 20000", "価格": "¥4,990（税込）", "在庫状況": "在庫あり", "商品説明": "20000mAhの超大容量で、iPhone 15を約3回以上、Galaxy S22を約3回、iPad mini 5を2回以上満充電可能。Anker独自技術PowerIQとVoltageBoostにより、最適なスピードで充電が可能です（低電流モード搭載で小型機器にも対応）。2つのUSB出力ポート搭載で2台同時に充電可能。USB-CとMicro USBの両入力ポートを備え、状況に応じて充電可能。多重保護システム採用で長期間安心して使用できます。", "主要な仕様・特徴": ["超大容量（20,000mAh）でスマホを約3回以上充電可能", "PowerIQ搭載で最適な高速充電（※Quick Charge非対応）", "USB出力ポート2つ搭載で2台同時充電対応（合計15W）", "USB-C/Micro USBの2入力方式に対応", "低電流モード搭載（小型電子機器に最適）"], "カテゴリー情報": "モバイルバッテリー", "ユーザーレビュー（概要）": "平均4.5／5 （18件のレビュー）", "商品ページURL": "https://www.ankerjapan.com/products/a1268"}}'::jsonb),
  ('default-product-2', 'product', '{"content": {"商品名": "Anker 622 Magnetic Battery (MagGo)", "価格": "¥6,990（税込）", "在庫状況": "在庫なし", "商品説明": "MagSafe対応のワイヤレスバッテリー。5000mAhの容量でiPhoneへのワイヤレス充電に対応。折りたたみ式スタンド機能付きで動画視聴などに便利。マグネットでiPhone背面に吸着し、一体化して充電可能。安全性にも配慮した多重保護機能搭載。", "主要な仕様・特徴": ["MagSafe対応の5000mAhワイヤレスバッテリー", "折りたたみスタンド搭載でハンズフリー利用", "マグネットでiPhoneにしっかり吸着", "最大7.5Wのワイヤレス充電に対応", "多重保護機能搭載で安全に充電"], "カテゴリー情報": "モバイルバッテリー", "ユーザーレビュー（概要）": "平均4.3／5 （56件のレビュー）", "商品ページURL": "https://www.ankerjapan.com/products/a1611"}}'::jsonb);

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
  INSERT INTO manuals (user_id, content)
  SELECT
    NEW.id,
    (content->>'content')::TEXT
  FROM
    default_templates
  WHERE
    type = 'manual';

  -- デフォルト商品データの挿入
  INSERT INTO products (user_id, content)
  SELECT
    NEW.id,
    content->>'content'
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