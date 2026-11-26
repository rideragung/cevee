import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const CEEVEE_HOME =
  process.env.CEEVEE_HOME?.trim() || path.join(os.homedir(), '.cevee');
export const CONFIG_FILE = path.join(CEEVEE_HOME, 'config.json');
export const SESSION_FILE = path.join(CEEVEE_HOME, 'session.json');

export const ensureHome = (): void => {
  fs.mkdirSync(CEEVEE_HOME, { recursive: true, mode: 0o700 });
};

const parseEnvFile = (file: string): void => {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    if (key in process.env) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
};

/** Loads `.env` from ~/.cevee and the current working directory without overriding real env vars. */
export const loadConfigEnv = (): void => {
  ensureHome();
  parseEnvFile(path.join(CEEVEE_HOME, '.env'));
  parseEnvFile(path.join(process.cwd(), '.env'));
};

export const getDefaultSupabaseUrl = (): string =>
  (process.env.CEEVEE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();

export const getDefaultSupabaseAnonKey = (): string =>
  (process.env.CEEVEE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const getGeminiKeys = (): string =>
  (process.env.GEMINI_API_KEYS || process.env.VITE_GEMINI_API_KEYS || '').trim();

export const getGeminiModel = (): string =>
  (process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || '').trim();

export interface McpConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  userId: string;
  email: string;
  savedAt: string;
}

export const readConfig = (): McpConfig | null => {
  if (!fs.existsSync(CONFIG_FILE)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as Partial<McpConfig>;
    if (
      typeof parsed.supabaseUrl !== 'string' ||
      typeof parsed.supabaseAnonKey !== 'string' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string'
    ) {
      return null;
    }
    return {
      supabaseUrl: parsed.supabaseUrl,
      supabaseAnonKey: parsed.supabaseAnonKey,
      userId: parsed.userId,
      email: parsed.email,
      savedAt: parsed.savedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

export const writeConfig = (config: McpConfig): void => {
  ensureHome();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
};

export const clearConfig = (): void => {
  if (fs.existsSync(CONFIG_FILE)) fs.rmSync(CONFIG_FILE);
};

export const readSession = (): string | null => {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    return fs.readFileSync(SESSION_FILE, 'utf8');
  } catch {
    return null;
  }
};

export const writeSession = (value: string): void => {
  ensureHome();
  fs.writeFileSync(SESSION_FILE, value, { mode: 0o600 });
};

export const clearSession = (): void => {
  if (fs.existsSync(SESSION_FILE)) fs.rmSync(SESSION_FILE);
};
