import { LineWebhookEvents } from "./line_webhook_events";
import { SupabaseClient } from "@supabase/supabase-js";
import { LineChats } from "./line_chats";
import { LineMessages } from "./line_messages";
import { LineProfiles } from "./line_profiles";
import { Database } from "./database.types";

export const tables = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  return {
    lineWebhookEvents: LineWebhookEvents(supabase),
    lineChats: LineChats(supabase),
    lineMessages: LineMessages(supabase),
    lineProfiles: LineProfiles(supabase),
  };
};