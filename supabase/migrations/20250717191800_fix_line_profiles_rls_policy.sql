-- Drop existing RLS policies for line_profiles
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON line_profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON line_profiles;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON line_profiles;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON line_profiles;

-- Create new RLS policies that allow webhook access (service role)
CREATE POLICY "Enable read access for service role and authenticated users" ON line_profiles
    FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for service role and authenticated users" ON line_profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable update access for service role and authenticated users" ON line_profiles
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for service role and authenticated users" ON line_profiles
    FOR DELETE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Also update line_chats policies to allow service role access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON line_chats;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON line_chats;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON line_chats;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON line_chats;

CREATE POLICY "Enable read access for service role and authenticated users" ON line_chats
    FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for service role and authenticated users" ON line_chats
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable update access for service role and authenticated users" ON line_chats
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for service role and authenticated users" ON line_chats
    FOR DELETE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Also update line_messages policies to allow service role access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON line_messages;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON line_messages;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON line_messages;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON line_messages;

CREATE POLICY "Enable read access for service role and authenticated users" ON line_messages
    FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for service role and authenticated users" ON line_messages
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable update access for service role and authenticated users" ON line_messages
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for service role and authenticated users" ON line_messages
    FOR DELETE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Also update line_webhook_events policies to allow service role access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON line_webhook_events;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON line_webhook_events;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON line_webhook_events;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON line_webhook_events;

CREATE POLICY "Enable read access for service role and authenticated users" ON line_webhook_events
    FOR SELECT USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for service role and authenticated users" ON line_webhook_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable update access for service role and authenticated users" ON line_webhook_events
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for service role and authenticated users" ON line_webhook_events
    FOR DELETE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');