import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Manual = Database['public']['Tables']['manuals']['Row'];
// type ManualInsert = Database['public']['Tables']['manuals']['Insert'];
// type ManualUpdate = Database['public']['Tables']['manuals']['Update'];

export const Manuals = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const create = async (manualData: {
    content: string;
    user_id: string;
  }): Promise<Manual | null> => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .insert({
          content: manualData.content,
          user_id: manualData.user_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating manual:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  };

  const findById = async (id: string): Promise<Manual | null> => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding manual by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const findByUserId = async (user_id: string): Promise<Manual[]> => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding manuals by user ID:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return [];
    }
  };

  const update = async (
    id: string,
    updateData: {
      content?: string;
    }
  ): Promise<Manual | null> => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating manual:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in update:', error);
      return null;
    }
  };

  const deleteById = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manuals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting manual:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteById:', error);
      return false;
    }
  };

  const findAll = async (): Promise<Manual[]> => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding all manuals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  };

  const searchByContent = async (searchTerm: string, user_id?: string): Promise<Manual[]> => {
    try {
      let query = supabase
        .from('manuals')
        .select('*')
        .ilike('content', `%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching manuals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchByContent:', error);
      return [];
    }
  };

  return {
    create,
    findById,
    findByUserId,
    update,
    deleteById,
    findAll,
    searchByContent,
  };
};

// 使用例:
// const manuals = Manuals(supabase);
// const manual = await manuals.create({
//   content: 'カスタマーサポートマニュアル',
//   user_id: 'user-123'
// });