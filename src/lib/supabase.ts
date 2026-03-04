/**
 * Supabase client export for @lib/supabase imports
 * @module lib/supabase
 * 
 * Re-exports the Supabase client from services/supabase for convenient access
 * via the @/lib/supabase path alias.
 */

export { supabase } from '@/services/supabase';
export type { SupabaseClient } from '@supabase/supabase-js';
