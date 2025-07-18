import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../db/database.types';

// line_chatsテーブルのrealtime購読
export function subscribeLineChats(
  supabase: SupabaseClient<Database, 'public', Database['public']>,
  onChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    newRecord: unknown;
    oldRecord: unknown;
  }) => void
) {
  const channel = supabase
    .channel('realtime:line_chats')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'line_chats' },
      (payload) => {
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRecord: payload.new,
          oldRecord: payload.old,
        });
      }
    )
    .subscribe();

  // チャンネル解除用の関数を返す
  return () => {
    supabase.removeChannel(channel);
  };
}

// line_messagesテーブルのrealtime購読
export function subscribeLineMessages(
  supabase: SupabaseClient<Database, 'public', Database['public']>,
  chatId: string,
  onChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    newRecord: unknown;
    oldRecord: unknown;
  }) => void
) {
  const channel = supabase
    .channel('realtime:line_messages_' + chatId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'line_messages', filter: `chat_id=eq.${chatId}` },
      (payload) => {
        onChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          newRecord: payload.new,
          oldRecord: payload.old,
        });
      }
    )
    .subscribe();

  // チャンネル解除用の関数を返す
  return () => {
    supabase.removeChannel(channel);
  };
}
