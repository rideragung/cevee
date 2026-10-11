import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Allow stored configuration in localStorage for instant local setup if .env is not present
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('cevee_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('cevee_supabase_key') : null;

export const supabaseUrl = (envUrl || storedUrl || '').trim();
export const supabaseAnonKey = (envAnonKey || storedKey || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  if (isSupabaseConfigured()) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
};

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  localStorage.setItem('cevee_supabase_url', url.trim());
  localStorage.setItem('cevee_supabase_key', anonKey.trim());
  clientInstance = null; // reset to re-init
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('cevee_supabase_url');
  localStorage.removeItem('cevee_supabase_key');
  clientInstance = null;
};
