import { McpServer } from '@modelcontextprotocol/server';
import type { McpAuthContext } from './auth';
import { MCP_SERVER_VERSION } from './capabilities';
import { registerPrompts } from './prompts';
import { registerResources } from './resources';
import type { ResumeStore } from './store/types';
import { registerItemTools } from './tools/items';
import { registerImportTools, type McpImportServices } from './tools/import';
import { registerJobTools } from './tools/jobs';
import { registerLayoutTools } from './tools/layouts';
import { registerQualityTools } from './tools/quality';
import { registerResumeTools } from './tools/resumes';
import { registerSectionTools } from './tools/sections';

export interface BuildMcpServerOptions {
  store: ResumeStore;
  auth: McpAuthContext;
  importServices?: McpImportServices;
}

export const buildMcpServer = ({
  store,
  auth,
  importServices,
}: BuildMcpServerOptions): McpServer => {
  const server = new McpServer({
    name: 'cevee',
    version: MCP_SERVER_VERSION,
  });

  registerQualityTools(server, store, auth);
  registerResumeTools(server, store, auth);
  registerSectionTools(server, store, auth);
  registerItemTools(server, store, auth);
  registerLayoutTools(server, store, auth);
  registerImportTools(server, store, auth, importServices);
  registerJobTools(server, store, auth);
  registerResources(server, store, auth);
  registerPrompts(server);

  return server;
};
