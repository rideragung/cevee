import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { buildMcpServer } from '../../src/lib/mcp/server';
import { MemoryStore } from '../../src/lib/mcp/store/memoryStore';
import { SupabaseResumeStore } from '../../src/lib/mcp/store/supabaseStore';
import { runCli } from './cli';
import { getGeminiKeys, getGeminiModel, loadConfigEnv } from './config';
import { extractPdfTextFromBase64, extractPdfTextFromFile } from './pdf';
import { getAuthenticatedClient } from './session';

const CLI_COMMANDS = new Set(['login', 'whoami', 'logout', 'help', '--help', '-h']);

const main = async (): Promise<void> => {
  loadConfigEnv();

  const command = process.argv[2];
  if (command && CLI_COMMANDS.has(command)) {
    await runCli(command);
    return;
  }

  if (process.env.CEEVEE_MCP_TEST_MODE === '1') {
    const store = new MemoryStore();
    const server = buildMcpServer({
      store,
      auth: { userId: 'test-user', mode: 'local', scopes: ['read', 'write'] },
    });
    await server.connect(new StdioServerTransport());
    console.error('[cevee-mcp] connected in test mode');
    return;
  }

  const { client, userId, email } = await getAuthenticatedClient();
  const store = new SupabaseResumeStore(client, userId);
  const server = buildMcpServer({
    store,
    auth: { userId, mode: 'local', scopes: ['read', 'write'], email },
    importServices: {
      gemini: {
        apiKeys: getGeminiKeys(),
        model: getGeminiModel(),
      },
      extractPdfTextFromBase64,
      extractPdfTextFromFile,
    },
  });

  await server.connect(new StdioServerTransport());
  console.error(`[cevee-mcp] connected as ${email}`);
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[cevee-mcp] ${message}`);
  process.exitCode = 1;
});
