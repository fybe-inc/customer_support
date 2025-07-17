import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Scenario = Database['public']['Tables']['scenarios']['Row'];

export const Scenarios = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const create = async (scenarioData: {
    title: string;
    prompt: string;
    user_id: string;
  }): Promise<Scenario | null> => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          title: scenarioData.title,
          prompt: scenarioData.prompt,
          user_id: scenarioData.user_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating scenario:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  };

  const findById = async (id: string): Promise<Scenario | null> => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding scenario by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const findByUserId = async (user_id: string): Promise<Scenario[]> => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding scenarios by user ID:', error);
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
      title?: string;
      prompt?: string;
    }
  ): Promise<Scenario | null> => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scenario:', error);
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
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting scenario:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteById:', error);
      return false;
    }
  };

  const findAll = async (): Promise<Scenario[]> => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding all scenarios:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  };

  const searchByTitle = async (searchTerm: string, user_id?: string): Promise<Scenario[]> => {
    try {
      let query = supabase
        .from('scenarios')
        .select('*')
        .ilike('title', `%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching scenarios by title:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchByTitle:', error);
      return [];
    }
  };

  const searchByPrompt = async (searchTerm: string, user_id?: string): Promise<Scenario[]> => {
    try {
      let query = supabase
        .from('scenarios')
        .select('*')
        .ilike('prompt', `%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching scenarios by prompt:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchByPrompt:', error);
      return [];
    }
  };

  const findRecent = async (limit: number = 10, user_id?: string): Promise<Scenario[]> => {
    try {
      let query = supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding recent scenarios:', error);
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
    searchByTitle,
    searchByPrompt,
    findRecent,
  };
};

// 使用例:
// const scenarios = Scenarios(supabase);
// const scenario = await scenarios.create({
//   title: 'カスタマーサポートシナリオ',
//   prompt: 'お客様からの問い合わせに対する回答テンプレート',
//   user_id: 'user-123'
// });