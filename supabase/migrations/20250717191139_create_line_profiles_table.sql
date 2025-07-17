-- Create line_profiles table
CREATE TABLE line_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    picture_url TEXT,
    status_message TEXT,
    language TEXT DEFAULT 'ja',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE line_profiles ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX idx_line_profiles_line_user_id ON line_profiles(line_user_id);
CREATE INDEX idx_line_profiles_updated_at ON line_profiles(updated_at);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_line_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_line_profiles_updated_at
    BEFORE UPDATE ON line_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_line_profiles_updated_at();

-- Add comments
COMMENT ON TABLE line_profiles IS 'LINE user profile information';
COMMENT ON COLUMN line_profiles.line_user_id IS 'LINE user ID (unique)';
COMMENT ON COLUMN line_profiles.display_name IS 'User display name';
COMMENT ON COLUMN line_profiles.picture_url IS 'Profile picture URL';
COMMENT ON COLUMN line_profiles.status_message IS 'Status message';
COMMENT ON COLUMN line_profiles.language IS 'User preferred language';

-- Add RLS policies (authenticated users only)
CREATE POLICY "Enable read access for authenticated users" ON line_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON line_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON line_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON line_profiles
    FOR DELETE USING (auth.role() = 'authenticated');