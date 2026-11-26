import path from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.resolve(import.meta.dirname, '../dist/index.js')],
  stderr: 'pipe',
});

const client = new Client({ name: 'cevee-check', version: '1.0.0' });
await client.connect(transport);

const tools = await client.listTools();
console.log(`tools: ${tools.tools.length}`);
console.log(tools.tools.map((tool) => tool.name).sort().join('\n'));

const resources = await client.listResources();
console.log(`resources: ${resources.resources.length}`);

const prompts = await client.listPrompts();
console.log(`prompts: ${prompts.prompts.length}`);

await client.close();
