import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Precedent = Database['public']['Tables']['precedents']['Row'];

export const Precedents = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const create = async (precedentData: {
    content: Database['public']['Tables']['precedents']['Insert']['content'];
    user_id: string;
  }): Promise<Precedent | null> => {
    try {
      const { data, error } = await supabase
        .from('precedents')
        .insert({
          content: precedentData.content,
          user_id: precedentData.user_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating precedent:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  };

  const findById = async (id: number): Promise<Precedent | null> => {
    try {
      const { data, error } = await supabase
        .from('precedents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding precedent by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const findByUserId = async (user_id: string): Promise<Precedent[]> => {
    try {
      const { data, error } = await supabase
        .from('precedents')
        .select('*')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding precedents by user ID:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return [];
    }
  };

  const update = async (
    id: number,
    updateData: {
      content?: Database['public']['Tables']['precedents']['Update']['content'];
    }
  ): Promise<Precedent | null> => {
    try {
      const { data, error } = await supabase
        .from('precedents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating precedent:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in update:', error);
      return null;
    }
  };

  const deleteById = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('precedents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting precedent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteById:', error);
      return false;
    }
  };

  const findAll = async (): Promise<Precedent[]> => {
    try {
      const { data, error } = await supabase
        .from('precedents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding all precedents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  };

  const findRecent = async (limit: number = 10, user_id?: string): Promise<Precedent[]> => {
    try {
      let query = supabase
        .from('precedents')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding recent precedents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findRecent:', error);
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
    findRecent,
  };
};

// 使用例:
// const precedents = Precedents(supabase);
// const precedent = await precedents.create({
//   content: { inquiry: "質問", response: "回答" },
//   user_id: 'user-123'
// });