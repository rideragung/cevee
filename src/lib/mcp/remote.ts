/**
 * Framework-free helpers shared by the remote MCP endpoints and tests.
 */

export const getSupabaseIssuer = (supabaseUrl: string): string =>
  `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`;

export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  scopes_supported: string[];
  bearer_methods_supported: string[];
}

export const buildProtectedResourceMetadata = (
  resourceUrl: URL,
  issuer: string
): ProtectedResourceMetadata => ({
  resource: resourceUrl.href,
  authorization_servers: [issuer],
  scopes_supported: ['openid', 'email', 'profile', 'offline_access'],
  bearer_methods_supported: ['header'],
});

export const PROTECTED_RESOURCE_PATHS = [
  '/.well-known/oauth-protected-resource',
  '/.well-known/oauth-protected-resource/api/mcp',
] as const;
