import type { Mission } from '@/types';
import type { CreateMissionInput, UpdateMissionInput } from '@/types/supabase';

import { supabase } from '../supabase';

export const missionsApi = {
  async getAll(): Promise<Mission[]> {
    const client = supabase.getClient();
    const { data, error } = await client
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Mission | null> {
    const client = supabase.getClient();
    const { data, error } = await client.from('missions').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateMissionInput): Promise<Mission> {
    const client = supabase.getClient();
    const { data, error } = await client.from('missions').insert(input).select().single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: UpdateMissionInput): Promise<Mission> {
    const client = supabase.getClient();
    const { data, error } = await client
      .from('missions')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const client = supabase.getClient();
    const { error } = await client.from('missions').delete().eq('id', id);
    if (error) throw error;
  },
};
