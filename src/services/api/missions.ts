import { supabase } from '../supabase';

import type { Mission, CreateMissionInput, UpdateMissionInput } from '@types';

export const missionsApi = {
  async getAll(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Mission | null> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateMissionInput): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: UpdateMissionInput): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) throw error;
  },
};
