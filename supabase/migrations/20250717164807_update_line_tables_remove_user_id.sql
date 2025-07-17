-- Update RLS policies to remove user_id dependency first
DROP POLICY IF EXISTS "Users can only access their own LINE chats" ON line_chats;
DROP POLICY IF EXISTS "Users can only access their own LINE messages" ON line_messages;  
DROP POLICY IF EXISTS "Users can only access their own LINE webhook events" ON line_webhook_events;

-- Disable RLS for LINE tables
ALTER TABLE line_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE line_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE line_webhook_events DISABLE ROW LEVEL SECURITY;

-- Remove user_id from line_webhook_events table
ALTER TABLE line_webhook_events DROP COLUMN user_id CASCADE;

-- Remove user_id from line_chats table
ALTER TABLE line_chats DROP COLUMN user_id CASCADE;

-- Remove user_id from line_messages table
ALTER TABLE line_messages DROP COLUMN user_id CASCADE;


-- Update indexes to remove user_id
DROP INDEX IF EXISTS idx_line_chats_user_id;
DROP INDEX IF EXISTS idx_line_chats_user_line_user;
DROP INDEX IF EXISTS idx_line_messages_user_id;
DROP INDEX IF EXISTS idx_line_webhook_events_user_id;

-- Add new indexes for line_user_id based queries
CREATE INDEX IF NOT EXISTS idx_line_chats_line_user_id ON line_chats(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_messages_line_chat_id ON line_messages(line_chat_id);
CREATE INDEX IF NOT EXISTS idx_line_webhook_events_event_type ON line_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_line_webhook_events_created_at ON line_webhook_events(created_at);