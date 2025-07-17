-- Add profile_id to line_chats table
ALTER TABLE line_chats 
ADD COLUMN profile_id UUID REFERENCES line_profiles(id) ON DELETE SET NULL;

-- Remove profile-related columns from line_chats (they are now in line_profiles)
ALTER TABLE line_chats 
DROP COLUMN IF EXISTS picture_url,
DROP COLUMN IF EXISTS status_message,
DROP COLUMN IF EXISTS language,
DROP COLUMN IF EXISTS profile_updated_at;

-- Add index for profile_id
CREATE INDEX idx_line_chats_profile_id ON line_chats(profile_id);

-- Add comments
COMMENT ON COLUMN line_chats.profile_id IS 'Reference to line_profiles table';

-- Migrate existing data: create profiles for existing chats
INSERT INTO line_profiles (line_user_id, display_name, language)
SELECT 
    line_user_id,
    COALESCE(display_name, 'LINE User') as display_name,
    'ja' as language
FROM line_chats 
WHERE line_user_id IS NOT NULL
ON CONFLICT (line_user_id) DO NOTHING;

-- Update line_chats to reference the profiles
UPDATE line_chats 
SET profile_id = line_profiles.id
FROM line_profiles 
WHERE line_chats.line_user_id = line_profiles.line_user_id;