import { createClient } from '@supabase/supabase-js';
import {
  OAuthError,
  OAuthErrorCode,
  requireBearerAuth,
  WebStandardStreamableHTTPServerTransport,
  type AuthInfo,
} from '@modelcontextprotocol/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { executeGeminiParse } from '../src/lib/ai/gemini';
import { buildMcpServer } from '../src/lib/mcp/server';
import { SupabaseResumeStore } from '../src/lib/mcp/store/supabaseStore';

export const config = { runtime: 'edge' };

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '')
  .trim()
  .replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();
const GEMINI_API_KEYS = (process.env.GEMINI_API_KEYS || '').trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || '').trim();

const ISSUER = SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : '';
const JWKS = ISSUER
  ? createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`))
  : null;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, Mcp-Session-Id',
};

const withCors = (response: Response): Response => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const jsonError = (status: number, message: string): Response =>
  withCors(
    Response.json(
      { error: message },
      { status, headers: { 'Content-Type': 'application/json' } }
    )
  );

const createVerifier = (resourceUrl: URL) => ({
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    if (!JWKS || !ISSUER) {
      throw new OAuthError(
        OAuthErrorCode.InvalidToken,
        'The MCP server is not configured.'
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: ISSUER,
        audience: 'authenticated',
      });

      const userId = typeof payload.sub === 'string' ? payload.sub : '';
      if (!userId) {
        throw new Error('Missing subject');
      }

      return {
        token,
        clientId:
          typeof payload.client_id === 'string' ? payload.client_id : 'supabase',
        scopes:
          typeof payload.scope === 'string'
            ? payload.scope.split(' ').filter(Boolean)
            : [],
        expiresAt: typeof payload.exp === 'number' ? payload.exp : undefined,
        resource: resourceUrl,
        extra: {
          userId,
          email: typeof payload.email === 'string' ? payload.email : undefined,
        },
      };
    } catch {
      throw new OAuthError(
        OAuthErrorCode.InvalidToken,
        'Invalid or expired access token.'
      );
    }
  },
});

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonError(500, 'Supabase is not configured on the MCP server.');
  }

  const requestUrl = new URL(request.url);
  const origin = (
    process.env.MCP_PUBLIC_ORIGIN?.trim().replace(/\/+$/, '') || requestUrl.origin
  ).replace(/\/+$/, '');
  const resourceUrl = new URL('/api/mcp', origin);

  const gate = requireBearerAuth({
    verifier: createVerifier(resourceUrl),
    resourceMetadataUrl: `${origin}/.well-known/oauth-protected-resource`,
  });

  const auth = await gate(request);
  if (auth instanceof Response) {
    return withCors(auth);
  }

  const userId =
    typeof auth.extra?.userId === 'string' ? auth.extra.userId : '';
  if (!userId) {
    return jsonError(401, 'Unauthorized.');
  }

  const email =
    typeof auth.extra?.email === 'string' ? auth.extra.email : undefined;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    type QuotaRow = {
      allowed: boolean;
      remaining: number;
      reset_at: string;
    };

    const { data: quotaData, error: quotaError } = await supabase.rpc(
      'consume_mcp_quota',
      { p_limit: 120, p_window_seconds: 60 }
    );

    if (quotaError) {
      console.error('[cevee-mcp] rate limit check failed:', quotaError.message);
      return jsonError(500, 'The rate limit check failed.');
    }

    const quota = (Array.isArray(quotaData) ? quotaData[0] : quotaData) as
      | QuotaRow
      | null;

    if (!quota?.allowed) {
      const resetAt = quota?.reset_at
        ? new Date(quota.reset_at).getTime()
        : Date.now() + 60_000;
      const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      });
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        headers.set(key, value);
      }
      return new Response(
        JSON.stringify({ error: 'rate_limited', retry_after: retryAfter }),
        { status: 429, headers }
      );
    }

    const server = buildMcpServer({
      store: new SupabaseResumeStore(supabase, userId),
      auth: { userId, mode: 'oauth', scopes: auth.scopes, email },
      importServices: GEMINI_API_KEYS
        ? {
            gemini: { apiKeys: GEMINI_API_KEYS, model: GEMINI_MODEL },
            parseResumeText: (text, config) =>
              executeGeminiParse(text, config.apiKeys, config.model, {
                isServerless: true,
              }),
          }
        : undefined,
    });

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);

    const response = await transport.handleRequest(request);
    return withCors(response);
  } catch (error) {
    console.error(
      '[cevee-mcp] remote request failed:',
      error instanceof Error ? error.message : 'unknown error'
    );
    return jsonError(500, 'The MCP request failed.');
  }
}
