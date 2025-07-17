import { LineWebhookEvents } from "./line_webhook_events";
import { SupabaseClient } from "@supabase/supabase-js";
import { LineChats } from "./line_chats";
import { LineMessages } from "./line_messages";
import { LineProfiles } from "./line_profiles";
import { Manuals } from "./manuals";
import { Precedents } from "./precedents";
import { Products } from "./products";
import { Scenarios } from "./scenarios";
import { Database } from "./database.types";

export const tables = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  return {
    // LINE関連テーブル
    lineWebhookEvents: LineWebhookEvents(supabase),
    lineChats: LineChats(supabase),
    lineMessages: LineMessages(supabase),
    lineProfiles: LineProfiles(supabase),
    
    // カスタマーサポート関連テーブル
    manuals: Manuals(supabase),
    precedents: Precedents(supabase),
    products: Products(supabase),
    scenarios: Scenarios(supabase),
  };
};