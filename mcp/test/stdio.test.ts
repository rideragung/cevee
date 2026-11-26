import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

let client: Client;

const childEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  )
);

beforeAll(async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve(import.meta.dirname, '../dist/index.js')],
    env: { ...childEnv, CEEVEE_MCP_TEST_MODE: '1' },
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

  it('exposes the resume tool set', async () => {
    const result = await client.listTools();
    const names = result.tools.map((tool) => tool.name);

    expect(names).toEqual(
      expect.arrayContaining([
        'list_resumes',
        'get_resume',
        'create_resume',
        'update_resume',
        'update_header',
        'add_section',
        'add_item',
        'validate_resume',
        'delete_resume',
      ])
    );
  });

  it('creates a resume in test mode', async () => {
    const result = await client.callTool({
      name: 'create_resume',
      arguments: { title: 'Stdio Test Resume' },
    });

    const first = result.content?.[0];
    const text = first && first.type === 'text' ? first.text : '';

    expect(result.isError).toBeFalsy();
    expect(text).toContain('Stdio Test Resume');
  });
});
