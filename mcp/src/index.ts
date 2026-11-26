import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { MCP_CAPABILITIES } from '../../src/lib/mcp/capabilities';

const server = new McpServer({
  name: 'cevee',
  version: MCP_CAPABILITIES.serverVersion,
});

server.registerTool(
  'get_capabilities',
  {
    title: 'Get Cevee capabilities',
    description:
      'Return the Cevee MCP server version, supported section types, layouts, features, and limits.',
    inputSchema: z.object({}),
    annotations: {
      readOnlyHint: true,
      idempotentHint: true,
    },
  },
  async () => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify(MCP_CAPABILITIES, null, 2),
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('[cevee-mcp] connected over stdio');
