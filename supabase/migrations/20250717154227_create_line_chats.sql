-- LINE chat management table
CREATE TABLE line_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id VARCHAR(255) NOT NULL,
  group_id VARCHAR(255),
  room_id VARCHAR(255),
  display_name VARCHAR(255),
  picture_url TEXT,
  status_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LINE message management table
CREATE TABLE line_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_chat_id UUID NOT NULL REFERENCES line_chats(id) ON DELETE CASCADE,
  line_message_id VARCHAR(255) NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'text',
  message_text TEXT,
  message_data JSONB,
  is_from_user BOOLEAN NOT NULL DEFAULT true,
  reply_token VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LINE webhook events table
CREATE TABLE line_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_line_chats_user_id ON line_chats(user_id);
CREATE INDEX idx_line_chats_line_user_id ON line_chats(line_user_id);
CREATE INDEX idx_line_messages_user_id ON line_messages(user_id);
CREATE INDEX idx_line_messages_line_chat_id ON line_messages(line_chat_id);
CREATE INDEX idx_line_messages_timestamp ON line_messages(timestamp);
CREATE INDEX idx_line_webhook_events_user_id ON line_webhook_events(user_id);
CREATE INDEX idx_line_webhook_events_created_at ON line_webhook_events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE line_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own LINE chats"
  ON line_chats FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own LINE messages"
  ON line_messages FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own LINE webhook events"
  ON line_webhook_events FOR ALL
  USING (auth.uid() = user_id);

-- Trigger function for automatic updated_at update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_line_chats_updated_at
  BEFORE UPDATE ON line_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Composite indexes for performance
CREATE INDEX idx_line_chats_user_line_user ON line_chats(user_id, line_user_id);
CREATE INDEX idx_line_messages_chat_timestamp ON line_messages(line_chat_id, timestamp DESC);