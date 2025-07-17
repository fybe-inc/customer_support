import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type LineChat = Database['public']['Tables']['line_chats']['Row'];

// LineChatsクラス
export const LineChats = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const getOrCreate = async (
    lineUserId: string,
    displayName?: string
  ): Promise<LineChat | null> => {
    try {
      // 既存のチャットを検索
      const { data: existingChat, error: findError } = await supabase
        .from('line_chats')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding LINE chat:', findError);
        return null;
      }

      if (existingChat) {
        return existingChat;
      }

      // 新しいチャットを作成
      const { data: newChat, error: createError } = await supabase
        .from('line_chats')
        .insert({
          line_user_id: lineUserId,
          display_name: displayName || 'LINE User',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating LINE chat:', createError);
        return null;
      }

      return newChat;
    } catch (error) {
      console.error('Error in getOrCreateLineChat:', error);
      return null;
    }
  };

  const findById = async (id: string): Promise<LineChat | null> => {
    try {
      const { data, error } = await supabase
        .from('line_chats')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding chat by id:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const findByLineUserId = async (lineUserId: string): Promise<LineChat | null> => {
    try {
      const { data, error } = await supabase
        .from('line_chats')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single();

      if (error) {
        console.error('Error finding chat by LINE user ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findByLineUserId:', error);
      return null;
    }
  };

  const updateDisplayName = async (
    lineUserId: string,
    displayName: string
  ): Promise<LineChat | null> => {
    try {
      const { data, error } = await supabase
        .from('line_chats')
        .update({ display_name: displayName })
        .eq('line_user_id', lineUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating display name:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateDisplayName:', error);
      return null;
    }
  };

  const findAll = async (): Promise<LineChat[]> => {
    try {
      const { data, error } = await supabase
        .from('line_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding all chats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  };

  const findAllWithProfiles = async (): Promise<(LineChat & { profile: Database['public']['Tables']['line_profiles']['Row'] | null })[]> => {
    try {
      const { data, error } = await supabase
        .from('line_chats')
        .select(`
          *,
          profile:line_profiles(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding chats with profiles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAllWithProfiles:', error);
      return [];
    }
  };

  return {
    getOrCreate,
    findById,
    findByLineUserId,
    updateDisplayName,
    findAll,
    findAllWithProfiles,
  };
};

// 使用例:
// const lineChats = LineChats(supabase);
// const chat = await lineChats.getOrCreate(lineUserId, displayName);