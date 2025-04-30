-- updated_atを自動更新するためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- manualsテーブルにトリガーを設定
CREATE TRIGGER update_manuals_updated_at
BEFORE UPDATE ON manuals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- productsテーブルにトリガーを設定
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- scenariosテーブルにトリガーを設定
CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON scenarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();