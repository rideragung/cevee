import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import {
  getDefaultSupabaseAnonKey,
  getDefaultSupabaseUrl,
  loadConfigEnv,
} from './config';
import { login, logout, whoami } from './session';

const promptText = async (question: string): Promise<string> => {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
};

const promptHidden = async (question: string): Promise<string> => {
  if (!stdin.isTTY) {
    throw new Error(
      'Cannot prompt for a password without a TTY. Set CEEVEE_PASSWORD for non-interactive login.'
    );
  }

  return new Promise<string>((resolve) => {
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    process.stderr.write(question);

    let value = '';

    const onData = (char: string): void => {
      if (char === '\r' || char === '\n') {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stderr.write('\n');
        resolve(value);
        return;
      }

      if (char === '\u0003') {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stderr.write('\n');
        process.exit(130);
      }

      if (char === '\u007f' || char === '\b') {
        if (value.length > 0) {
          value = value.slice(0, -1);
          process.stderr.write('\b \b');
        }
        return;
      }

      if (char >= ' ') {
        value += char;
        process.stderr.write('*');
      }
    };

    stdin.on('data', onData);
  });
};

const loginCommand = async (): Promise<void> => {
  loadConfigEnv();

  const defaultUrl = getDefaultSupabaseUrl();
  const defaultKey = getDefaultSupabaseAnonKey();

  const supabaseUrl =
    defaultUrl || (await promptText('Supabase URL: ')).trim();
  const supabaseAnonKey =
    defaultKey || (await promptText('Supabase anon key: ')).trim();

  const email = process.env.CEEVEE_EMAIL?.trim() || (await promptText('Email: '));
  const password = process.env.CEEVEE_PASSWORD || (await promptHidden('Password: '));

  if (!supabaseUrl || !supabaseAnonKey || !email || !password) {
    throw new Error('Supabase URL, anon key, email, and password are required.');
  }

  const config = await login({ supabaseUrl, supabaseAnonKey, email, password });
  console.log(`Signed in as ${config.email}.`);
  console.log('Session saved in ~/.cevee. The MCP server can now start.');
};

const printHelp = (): void => {
  console.log(`cevee-mcp

Usage:
  cevee-mcp            Start the MCP stdio server
  cevee-mcp login      Sign in to Supabase and store the session
  cevee-mcp whoami     Print the signed-in account
  cevee-mcp logout     Remove the stored session
  cevee-mcp help       Show this help

Environment:
  CEEVEE_HOME                  Config directory (default: ~/.cevee)
  CEEVEE_SUPABASE_URL          Supabase project URL
  CEEVEE_SUPABASE_ANON_KEY     Supabase anon key
  CEEVEE_EMAIL                 Email for non-interactive login
  CEEVEE_PASSWORD              Password for non-interactive login
`);
};

export const runCli = async (command: string): Promise<void> => {
  switch (command) {
    case 'login':
      await loginCommand();
      return;
    case 'whoami': {
      const account = await whoami();
      console.log(`${account.email} (${account.userId})`);
      return;
    }
    case 'logout':
      await logout();
      console.log('Signed out and local session removed.');
      return;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      return;
    default:
      throw new Error(`Unknown command "${command}". Run cevee-mcp help.`);
  }
};
