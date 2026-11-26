import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

let client: Client;

beforeAll(async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve(import.meta.dirname, '../dist/index.js')],
    stderr: 'pipe',
  });

  client = new Client({ name: 'cevee-test', version: '1.0.0' });
  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
});

describe('stdio server', () => {
  it('lists the capabilities tool', async () => {
    const result = await client.listTools();
    expect(result.tools.some((tool) => tool.name === 'get_capabilities')).toBe(true);
  });

  it('returns the capabilities payload', async () => {
    const result = await client.callTool({
      name: 'get_capabilities',
      arguments: {},
    });

    const first = result.content?.[0];
    const text = first && first.type === 'text' ? first.text : '';

    expect(text).toContain('"serverVersion"');
    expect(text).toContain('"standard-ats-v1"');
  });
});
