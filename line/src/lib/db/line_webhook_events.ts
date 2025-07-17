import { Database } from "./database.types";
import { SupabaseClient } from "@supabase/supabase-js";

type LineWebhookEvent =
  Database["public"]["Tables"]["line_webhook_events"]["Row"];

// LineWebhookEventsクラス
export const LineWebhookEvents = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const save = async (event: { type: string; [key: string]: unknown }): Promise<LineWebhookEvent | null> => {
    try {
      const { data: webhookEvent, error } = await supabase
        .from("line_webhook_events")
        .insert({
          event_type: event.type,
          event_data: event as unknown as Database["public"]["Tables"]["line_webhook_events"]["Insert"]["event_data"],
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving LINE webhook event:", error);
        return null;
      }

      return webhookEvent;
    } catch (error) {
      console.error("Error in saveLineWebhookEvent:", error);
      return null;
    }
  };

  const findById = async (id: string): Promise<LineWebhookEvent | null> => {
    try {
      const { data, error } = await supabase
        .from("line_webhook_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error finding webhook event:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in findById:", error);
      return null;
    }
  };

  const findByEventType = async (
    eventType: string
  ): Promise<LineWebhookEvent[]> => {
    try {
      const { data, error } = await supabase
        .from("line_webhook_events")
        .select("*")
        .eq("event_type", eventType)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error finding webhook events by type:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in findByEventType:", error);
      return [];
    }
  };
  return {
    save,
    findById,
    findByEventType,
  };
};

// 使用例:
// const webhookEvents = LineWebhookEvents(supabase);
// const savedEvent = await webhookEvents.save(event);
