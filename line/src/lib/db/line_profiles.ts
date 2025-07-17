import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

type LineProfile = Database['public']['Tables']['line_profiles']['Row'];

// LineProfilesクラス
export const LineProfiles = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const create = async (profileData: {
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
    language?: string;
  }): Promise<LineProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('line_profiles')
        .insert({
          line_user_id: profileData.lineUserId,
          display_name: profileData.displayName,
          picture_url: profileData.pictureUrl,
          status_message: profileData.statusMessage,
          language: profileData.language || 'ja',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  };

  const findByLineUserId = async (lineUserId: string): Promise<LineProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('line_profiles')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('Error finding profile by LINE user ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findByLineUserId:', error);
      return null;
    }
  };

  const findById = async (id: string): Promise<LineProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('line_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding profile by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const update = async (
    lineUserId: string,
    profileData: {
      displayName?: string;
      pictureUrl?: string;
      statusMessage?: string;
      language?: string;
    }
  ): Promise<LineProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('line_profiles')
        .update({
          display_name: profileData.displayName,
          picture_url: profileData.pictureUrl,
          status_message: profileData.statusMessage,
          language: profileData.language,
        })
        .eq('line_user_id', lineUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in update:', error);
      return null;
    }
  };

  const upsert = async (profileData: {
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
    language?: string;
  }): Promise<LineProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('line_profiles')
        .upsert({
          line_user_id: profileData.lineUserId,
          display_name: profileData.displayName,
          picture_url: profileData.pictureUrl,
          status_message: profileData.statusMessage,
          language: profileData.language || 'ja',
        }, {
          onConflict: 'line_user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsert:', error);
      return null;
    }
  };

  const findAll = async (): Promise<LineProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('line_profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding all profiles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  };

  const deleteByLineUserId = async (lineUserId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('line_profiles')
        .delete()
        .eq('line_user_id', lineUserId);

      if (error) {
        console.error('Error deleting profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteByLineUserId:', error);
      return false;
    }
  };

  return {
    create,
    findByLineUserId,
    findById,
    update,
    upsert,
    findAll,
    deleteByLineUserId,
  };
};

// 使用例:
// const lineProfiles = LineProfiles(supabase);
// const profile = await lineProfiles.upsert({
//   lineUserId: 'U123456789',
//   displayName: 'John Doe',
//   pictureUrl: 'https://example.com/picture.jpg',
//   statusMessage: 'Hello World',
//   language: 'en'
// });