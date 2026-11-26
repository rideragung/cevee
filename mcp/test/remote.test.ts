import { describe, expect, it } from 'vitest';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server';
import { buildMcpServer } from '../../src/lib/mcp/server';
import { buildProtectedResourceMetadata, getSupabaseIssuer } from '../../src/lib/mcp/remote';
import { MemoryStore } from '../../src/lib/mcp/store/memoryStore';

describe('remote MCP helpers', () => {
  it('builds the Supabase issuer', () => {
    expect(getSupabaseIssuer('https://example.supabase.co/')).toBe(
      'https://example.supabase.co/auth/v1'
    );
  });

  it('builds RFC 9728 protected resource metadata', () => {
    const metadata = buildProtectedResourceMetadata(
      new URL('https://cevee.app/api/mcp'),
      'https://example.supabase.co/auth/v1'
    );

    expect(metadata.resource).toBe('https://cevee.app/api/mcp');
    expect(metadata.authorization_servers).toEqual([
      'https://example.supabase.co/auth/v1',
    ]);
    expect(metadata.scopes_supported).toContain('offline_access');
    expect(metadata.bearer_methods_supported).toEqual(['header']);
  });

  it('serves initialize over the web-standard transport', async () => {
    const server = buildMcpServer({
      store: new MemoryStore(),
      auth: { userId: 'test-user', mode: 'oauth', scopes: [] },
    });
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);

    const response = await transport.handleRequest(
      new Request('https://cevee.app/api/mcp', {
        method: 'POST',
        headers: {
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
            clientInfo: { name: 'remote-test', version: '1.0.0' },
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('cevee');
    expect(text).toContain('result');
  });
});
