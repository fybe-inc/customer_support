import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Product = Database['public']['Tables']['products']['Row'];

export const Products = (supabase: SupabaseClient<Database, "public", Database["public"]>) => {
  const create = async (productData: {
    content: string;
    user_id: string;
  }): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          content: productData.content,
          user_id: productData.user_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  };

  const findById = async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding product by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  };

  const findByUserId = async (user_id: string): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user_id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding products by user ID:', error);
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
  ): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
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
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteById:', error);
      return false;
    }
  };

  const findAll = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error finding all products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    }
  };

  const searchByContent = async (searchTerm: string, user_id?: string): Promise<Product[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .ilike('content', `%${searchTerm}%`)
        .order('updated_at', { ascending: false });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchByContent:', error);
      return [];
    }
  };

  const findRecent = async (limit: number = 10, user_id?: string): Promise<Product[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding recent products:', error);
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
    searchByContent,
    findRecent,
  };
};

// 使用例:
// const products = Products(supabase);
// const product = await products.create({
//   content: '商品情報: 新商品A',
//   user_id: 'user-123'
// });