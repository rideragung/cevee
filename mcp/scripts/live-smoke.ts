import { getAuthenticatedClient } from '../src/session';
import { loadConfigEnv } from '../src/config';

const BASE = process.env.CEEVEE_LIVE_URL || 'https://cevee-beta.vercel.app';

const INITIALIZE_BODY = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2026-07-28',
    capabilities: {},
    clientInfo: { name: 'live-smoke', version: '1.0.0' },
  },
});

const main = async (): Promise<void> => {
  loadConfigEnv();

  const { client } = await getAuthenticatedClient();
  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No Supabase access token is available. Run `cevee-mcp login`.');
  }

  const unauth = await fetch(`${BASE}/api/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: INITIALIZE_BODY,
  });

  const auth = await fetch(`${BASE}/api/mcp`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.access_token}`,
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: INITIALIZE_BODY,
  });

  const text = await auth.text();

  console.log(`base: ${BASE}`);
  console.log(`unauth status: ${unauth.status}`);
  console.log(`auth status: ${auth.status}`);
  console.log(`has cevee: ${text.includes('cevee')}`);

  if (unauth.status !== 401) {
    throw new Error(`Expected 401 without a token, got ${unauth.status}.`);
  }
  if (auth.status !== 200 || !text.includes('cevee')) {
    throw new Error(text.slice(0, 500));
  }

  console.log('live smoke: ok');
};

main().catch((error: unknown) => {
  console.error(
    `live smoke failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
