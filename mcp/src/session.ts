import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '../../src/lib/domain/supabaseClientType';
import {
  clearConfig,
  clearSession,
  readConfig,
  readSession,
  writeConfig,
  writeSession,
  type McpConfig,
} from './config';

const SESSION_KEY = 'cevee-mcp-session';

const fileStorage = {
  getItem: (_key: string): string | null => readSession(),
  setItem: (_key: string, value: string): void => writeSession(value),
  removeItem: (_key: string): void => clearSession(),
};

const createClientFor = (config: Pick<McpConfig, 'supabaseUrl' | 'supabaseAnonKey'>): SupabaseClient =>
  createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: fileStorage,
      storageKey: SESSION_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }) as unknown as SupabaseClient;

export interface LoginParams {
  supabaseUrl: string;
  supabaseAnonKey: string;
  email: string;
  password: string;
}

export const login = async (params: LoginParams): Promise<McpConfig> => {
  const client = createClientFor(params);
  const { data, error } = await client.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error || !data.session) {
    throw new Error(error?.message || 'Sign-in failed.');
  }

  const config: McpConfig = {
    supabaseUrl: params.supabaseUrl,
    supabaseAnonKey: params.supabaseAnonKey,
    userId: data.session.user.id,
    email: data.session.user.email ?? params.email,
    savedAt: new Date().toISOString(),
  };

  writeConfig(config);
  return config;
};

export interface AuthenticatedClient {
  client: SupabaseClient;
  userId: string;
  email: string;
}

export const getAuthenticatedClient = async (): Promise<AuthenticatedClient> => {
  const config = readConfig();
  if (!config) {
    throw new Error('Not signed in. Run `cevee-mcp login` first.');
  }

  const client = createClientFor(config);
  let { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData.user) {
    const { data: refreshed, error: refreshError } = await client.auth.refreshSession();
    if (refreshError || !refreshed.session) {
      throw new Error('Session expired. Run `cevee-mcp login` again.');
    }
    ({ data: userData, error: userError } = await client.auth.getUser());
  }

  if (userError || !userData.user) {
    throw new Error('Session expired. Run `cevee-mcp login` again.');
  }

  return {
    client,
    userId: userData.user.id,
    email: userData.user.email ?? config.email,
  };
};

export const whoami = async (): Promise<{ userId: string; email: string }> => {
  const { userId, email } = await getAuthenticatedClient();
  return { userId, email };
};

export const logout = async (): Promise<void> => {
  const config = readConfig();
  if (config) {
    try {
      const client = createClientFor(config);
      await client.auth.signOut();
    } catch {
      // Local cleanup still proceeds if the network call fails.
    }
  }
  clearSession();
  clearConfig();
};
