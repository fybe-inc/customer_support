-- 新規ユーザー作成時にデフォルトデータを挿入する関数を修正
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