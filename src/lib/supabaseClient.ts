import { createClient, SupabaseClient } from '@supabase/supabase-js';

let customSupabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const supabaseUrl = url || import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL') {
    if (!customSupabaseClient) {
      customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return customSupabaseClient;
  }
  return null;
};

export const resetSupabaseClient = (url: string, key: string) => {
  if (url && key) {
    customSupabaseClient = createClient(url, key);
    return customSupabaseClient;
  }
  customSupabaseClient = null;
  return null;
};
