import { getAuthenticatedClient } from '../src/session';
import { loadConfigEnv } from '../src/config';

const INITIALIZE_BODY = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2026-07-28',
    capabilities: {},
    clientInfo: { name: 'remote-local-smoke', version: '1.0.0' },
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

  const { default: handler } = await import('../../api/mcp');
  const { default: metadataHandler } = await import(
    '../../api/oauth-protected-resource'
  );

  const metadataResponse = metadataHandler(
    new Request('http://localhost/.well-known/oauth-protected-resource')
  );
  const metadata = (await metadataResponse.json()) as {
    resource?: string;
    authorization_servers?: string[];
    scopes_supported?: string[];
  };
  console.log(`metadata status: ${metadataResponse.status}`);
  console.log(`metadata resource: ${metadata.resource}`);
  console.log(`metadata issuer: ${metadata.authorization_servers?.[0] || 'missing'}`);
  console.log(
    `metadata offline_access: ${Boolean(
      metadata.scopes_supported?.includes('offline_access')
    )}`
  );

  const unauth = await handler(
    new Request('http://localhost/api/mcp', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: INITIALIZE_BODY,
    })
  );

  console.log(`unauth status: ${unauth.status}`);
  const challenge = unauth.headers.get('www-authenticate') || '';
  console.log(`challenge: ${challenge.includes('oauth-protected-resource')}`);

  const response = await handler(
    new Request('http://localhost/api/mcp', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${session.access_token}`,
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: INITIALIZE_BODY,
    })
  );

  const text = await response.text();
  console.log(`auth status: ${response.status}`);
  console.log(`has cevee: ${text.includes('cevee')}`);

  if (unauth.status !== 401) {
    throw new Error(`Expected 401 without a token, got ${unauth.status}.`);
  }
  if (!challenge.includes('oauth-protected-resource')) {
    throw new Error('The 401 response is missing the protected resource challenge.');
  }
  if (response.status !== 200 || !text.includes('cevee')) {
    throw new Error(text.slice(0, 500));
  }

  console.log('remote local smoke: ok');
};

main().catch((error: unknown) => {
  console.error(
    `remote local smoke failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
