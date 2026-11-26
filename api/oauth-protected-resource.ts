import {
  buildProtectedResourceMetadata,
  getSupabaseIssuer,
} from '../src/lib/mcp/remote';

export const config = { runtime: 'edge' };

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

export default function handler(request: Request): Response {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...CORS_HEADERS, Allow: 'GET' },
    });
  }

  const supabaseUrl = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  if (!supabaseUrl) {
    return Response.json(
      { error: 'Supabase is not configured.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  const requestUrl = new URL(request.url);
  const origin = (
    process.env.MCP_PUBLIC_ORIGIN?.trim().replace(/\/+$/, '') || requestUrl.origin
  ).replace(/\/+$/, '');

  const metadata = buildProtectedResourceMetadata(
    new URL('/api/mcp', origin),
    getSupabaseIssuer(supabaseUrl)
  );

  return Response.json(metadata, {
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': 'public, max-age=300',
    },
  });
}
