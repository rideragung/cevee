import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Allow stored configuration in localStorage for instant local setup if .env is not present.
// Resolved lazily so saving credentials takes effect without a full page reload.
export const getSupabaseUrl = (): string => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('cevee_supabase_url') : null;
  return (envUrl || stored || '').trim();
};

export const getSupabaseAnonKey = (): string => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('cevee_supabase_key') : null;
  return (envAnonKey || stored || '').trim();
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id')
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  if (isSupabaseConfigured()) {
    try {
      clientInstance = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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
