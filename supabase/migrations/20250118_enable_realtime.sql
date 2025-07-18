-- Enable realtime for LINE tables
ALTER PUBLICATION supabase_realtime ADD TABLE line_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE line_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE line_webhook_events;

-- Optional: Enable realtime for other tables if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE manuals;
-- ALTER PUBLICATION supabase_realtime ADD TABLE products;
-- ALTER PUBLICATION supabase_realtime ADD TABLE scenarios;
-- ALTER PUBLICATION supabase_realtime ADD TABLE precedents;