-- auth.usersテーブルへのアクセス権限を付与
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;
GRANT TRIGGER ON auth.users TO postgres;

-- トリガー関数のデバッグ用ログを追加
CREATE OR REPLACE FUNCTION insert_default_data_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- デバッグログ
  RAISE NOTICE 'Inserting default data for user %', NEW.id;

  -- デフォルトマニュアルデータの挿入
  BEGIN
    INSERT INTO manuals (user_id, content)
    SELECT
      NEW.id,
      (content->>'content')::TEXT
    FROM
      default_templates
    WHERE
      type = 'manual';
    RAISE NOTICE 'Inserted default manuals for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting default manuals: %', SQLERRM;
  END;

  -- デフォルト商品データの挿入
  BEGIN
    INSERT INTO products (user_id, content)
    SELECT
      NEW.id,
      content->>'content'
    FROM
      default_templates
    WHERE
      type = 'product';
    RAISE NOTICE 'Inserted default products for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting default products: %', SQLERRM;
  END;

  -- デフォルトシナリオデータの挿入
  BEGIN
    INSERT INTO scenarios (user_id, title, prompt)
    SELECT
      NEW.id,
      content->>'title',
      content->>'prompt'
    FROM
      default_templates
    WHERE
      type = 'scenario';
    RAISE NOTICE 'Inserted default scenarios for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting default scenarios: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION insert_default_data_for_new_user();