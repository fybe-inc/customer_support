import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type LineMessage = Database['public']['Tables']['line_messages']['Row'];

// LineMessagesクラス
export const LineMessages = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const save = async (
    lineChatId: string,
    event: { message: { id: string; type: string; text: string }; timestamp: number; replyToken: string }
  ): Promise<LineMessage | null> => {
    try {
      const { data: message, error } = await supabase
        .from('line_messages')
        .insert({
          line_chat_id: lineChatId,
          line_message_id: event.message.id,
          message_type: event.message.type,
          message_text: event.message.text,
          message_data: event.message,
          is_from_user: true,
          reply_token: event.replyToken,
          timestamp: new Date(event.timestamp).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving LINE message:', error);
        return null;
      }

      return message;
    } catch (error) {
      console.error('Error in saveLineMessage:', error);
      return null;
    }
  };

  const saveReply = async (
    lineChatId: string,
    lineMessageId: string,
    replyText: string,
    replyData?: { type: string; text: string }
  ): Promise<LineMessage | null> => {
    try {
      const { data: message, error } = await supabase
        .from('line_messages')
        .insert({
          line_chat_id: lineChatId,
          line_message_id: lineMessageId,
          message_type: 'text',
          message_text: replyText,
          message_data: replyData || { type: 'text', text: replyText },
          is_from_user: false,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving reply message:', error);
        return null;
      }

      return message;
    } catch (error) {
      console.error('Error in saveReply:', error);
      return null;
    }
  };

  const findByChatId = async (lineChatId: string): Promise<LineMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('line_messages')
        .select('*')
        .eq('line_chat_id', lineChatId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error finding messages by chat ID:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findByChatId:', error);
      return [];
    }
  };

  const findById = async (id: string): Promise<LineMessage | null> => {
    try {
      const { data, error } = await supabase
        .from('line_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding message by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const findByLineMessageId = async (lineMessageId: string): Promise<LineMessage | null> => {
    try {
      const { data, error } = await supabase
        .from('line_messages')
        .select('*')
        .eq('line_message_id', lineMessageId)
        .single();

      if (error) {
        console.error('Error finding message by LINE message ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findByLineMessageId:', error);
      return null;
    }
  };

  return {
    save,
    saveReply,
    findByChatId,
    findById,
    findByLineMessageId,
  };
};

// 使用例:
// const lineMessages = LineMessages(supabase);
// const message = await lineMessages.save(lineChatId, event);