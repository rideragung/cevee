export type McpAuthMode = 'local' | 'oauth' | 'pat';

export interface McpAuthContext {
  userId: string;
  mode: McpAuthMode;
  scopes: readonly string[];
  email?: string;
}

export const canWrite = (auth: McpAuthContext): boolean =>
  auth.mode !== 'pat' || auth.scopes.includes('write');
