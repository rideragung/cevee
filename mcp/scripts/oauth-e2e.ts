import { createHash, randomBytes } from 'node:crypto';
import { getAuthenticatedClient } from '../src/session';
import { getDefaultSupabaseUrl, loadConfigEnv } from '../src/config';

// Diagnostic: registers a temporary DCR client named
// "Cevee E2E Test (safe to remove)". Remove it in Supabase →
// Authentication → OAuth Server after running this script.

const RESOURCE = 'https://cevee-beta.vercel.app/api/mcp';
const REDIRECT_URI = 'http://localhost:9999/callback';

const base64url = (value: Buffer): string => value.toString('base64url');

const main = async (): Promise<void> => {
  loadConfigEnv();

  const supabaseUrl = getDefaultSupabaseUrl();
  if (!supabaseUrl) throw new Error('Supabase URL is not configured.');

  const issuer = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`;
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash('sha256').update(verifier).digest());

  const registration = await fetch(`${issuer}/oauth/clients/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_name: 'Cevee E2E Test (safe to remove)',
      redirect_uris: [REDIRECT_URI],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    }),
  });

  const client = (await registration.json()) as {
    client_id?: string;
    error?: string;
    error_description?: string;
  };

  if (!registration.ok || !client.client_id) {
    throw new Error(
      `Client registration failed: ${client.error || registration.status} ${
        client.error_description || ''
      }`
    );
  }

  console.log(`client id: ${client.client_id}`);

  const authorizeUrl = new URL(`${issuer}/oauth/authorize`);
  authorizeUrl.searchParams.set('client_id', client.client_id);
  authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('scope', 'openid email profile offline_access');
  authorizeUrl.searchParams.set('state', 'cevee-e2e');
  authorizeUrl.searchParams.set('resource', RESOURCE);

  const authorizeResponse = await fetch(authorizeUrl, { redirect: 'manual' });
  const location = authorizeResponse.headers.get('location') || '';
  console.log(`authorize status: ${authorizeResponse.status}`);
  console.log(`authorize location: ${location.slice(0, 200)}`);

  const authorizationId = location
    ? new URL(location).searchParams.get('authorization_id')
    : null;

  if (!authorizationId) {
    throw new Error('No authorization_id in the authorize redirect.');
  }

  const { client: supabase } = await getAuthenticatedClient();
  const oauth = (
    supabase.auth as unknown as {
      oauth: {
        getAuthorizationDetails: (id: string) => Promise<{
          data: { client?: { name?: string }; scope?: string } | null;
          error: { message: string } | null;
        }>;
        approveAuthorization: (id: string) => Promise<{
          data: { redirect_url?: string } | null;
          error: { message: string } | null;
        }>;
      };
    }
  ).oauth;

  const details = await oauth.getAuthorizationDetails(authorizationId);
  if (details.error) throw new Error(details.error.message);
  console.log(`consent client: ${details.data?.client?.name || 'unknown'}`);
  console.log(`consent scope: ${details.data?.scope || 'none'}`);

  const approved = await oauth.approveAuthorization(authorizationId);
  if (approved.error) throw new Error(approved.error.message);

  const redirectUrl = approved.data?.redirect_url || '';
  const code = redirectUrl ? new URL(redirectUrl).searchParams.get('code') : null;
  console.log(`approval redirect has code: ${Boolean(code)}`);

  if (!code) {
    throw new Error('No authorization code in the approval redirect.');
  }

  const tokenResponse = await fetch(`${issuer}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: client.client_id,
      code_verifier: verifier,
    }),
  });

  const tokens = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  console.log(`token status: ${tokenResponse.status}`);
  console.log(`has access token: ${Boolean(tokens.access_token)}`);

  if (!tokenResponse.ok || !tokens.access_token) {
    throw new Error(
      `Token exchange failed: ${tokens.error || tokenResponse.status} ${
        tokens.error_description || ''
      }`
    );
  }

  const initResponse = await fetch(RESOURCE, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${tokens.access_token}`,
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2026-07-28',
        capabilities: {},
        clientInfo: { name: 'oauth-e2e', version: '1.0.0' },
      },
    }),
  });

  const text = await initResponse.text();
  console.log(`live status: ${initResponse.status}`);
  console.log(`has cevee: ${text.includes('cevee')}`);

  if (initResponse.status !== 200 || !text.includes('cevee')) {
    throw new Error(text.slice(0, 500));
  }

  console.log('oauth e2e: ok');
};

main().catch((error: unknown) => {
  console.error(
    `oauth e2e failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
