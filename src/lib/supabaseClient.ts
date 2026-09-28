import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseUrlAndKey = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('gm_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gm_supabase_anon_key') || '' : '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  };
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseUrlAndKey();

  if (url && key && url !== 'MY_SUPABASE_URL' && url.startsWith('http')) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(url, key);
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gm_supabase_url', url.trim());
    localStorage.setItem('gm_supabase_anon_key', key.trim());
    if (url && key && url.startsWith('http')) {
      supabaseInstance = createClient(url.trim(), key.trim());
    } else {
      supabaseInstance = null;
    }
  }
};
