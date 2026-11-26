import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { buildMcpServer } from '../../src/lib/mcp/server';
import { SupabaseResumeStore } from '../../src/lib/mcp/store/supabaseStore';
import { getAuthenticatedClient } from '../src/session';

interface ToolResult {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

const textOf = (result: ToolResult): unknown => {
  const text = result.content?.find((item) => item.type === 'text')?.text ?? '';
  if (result.isError) throw new Error(text);
  return JSON.parse(text) as unknown;
};

const main = async (): Promise<void> => {
  const { client: supabase, userId, email } = await getAuthenticatedClient();
  const store = new SupabaseResumeStore(supabase, userId);
  const server = buildMcpServer({
    store,
    auth: { userId, mode: 'local', scopes: ['read', 'write'], email },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const mcp = new Client({ name: 'cevee-smoke', version: '1.0.0' });
  await mcp.connect(clientTransport);

  let testResumeId: string | null = null;

  try {
    const before = textOf(
      await mcp.callTool({ name: 'list_resumes', arguments: { limit: 100 } })
    ) as unknown[];
    console.log(`existing resumes: ${before.length}`);

    const created = textOf(
      await mcp.callTool({
        name: 'create_resume',
        arguments: {
          title: 'MCP Phase 1 Smoke Test',
          profile: {
            fullName: 'Smoke Test',
            email: 'smoke@example.com',
            phone: '+62 812 0000 0000',
            location: 'Test City',
          },
        },
      })
    ) as { id: string; version: number };

    testResumeId = created.id;
    console.log(`created test resume: ${testResumeId}`);

    const updated = textOf(
      await mcp.callTool({
        name: 'update_header',
        arguments: {
          resumeId: testResumeId,
          expectedVersion: created.version,
          header: { location: 'Updated Test City' },
        },
      })
    ) as { version: number };
    console.log(`updated header at version: ${updated.version}`);

    const withSection = textOf(
      await mcp.callTool({
        name: 'add_section',
        arguments: {
          resumeId: testResumeId,
          expectedVersion: updated.version,
          presetKey: 'projects',
        },
      })
    ) as { version: number };

    const sections = textOf(
      await mcp.callTool({ name: 'list_sections', arguments: { resumeId: testResumeId } })
    ) as Array<{ id: string; type: string }>;

    const projects = sections.find((section) => section.type === 'projects');
    if (!projects) throw new Error('projects section was not created');

    const withItem = textOf(
      await mcp.callTool({
        name: 'add_item',
        arguments: {
          resumeId: testResumeId,
          expectedVersion: withSection.version,
          sectionId: projects.id,
          item: {
            name: 'Smoke Project',
            bullets: ['Verified the local MCP path', 'No existing resume was modified'],
          },
        },
      })
    ) as { version: number };
    console.log(`added project item at version: ${withItem.version}`);

    const validation = textOf(
      await mcp.callTool({ name: 'validate_resume', arguments: { resumeId: testResumeId } })
    ) as { valid: boolean; issues: Array<{ severity: string }> };
    console.log(
      `validation: valid=${validation.valid}, errors=${
        validation.issues.filter((issue) => issue.severity === 'error').length
      }`
    );

    const deleted = textOf(
      await mcp.callTool({
        name: 'delete_resume',
        arguments: { resumeId: testResumeId, confirm: true },
      })
    ) as { deleted: boolean };
    testResumeId = null;
    console.log(`deleted test resume: ${deleted.deleted}`);

    console.log('smoke: ok');
  } finally {
    if (testResumeId) {
      try {
        await mcp.callTool({
          name: 'delete_resume',
          arguments: { resumeId: testResumeId, confirm: true },
        });
      } catch {
        // Best-effort cleanup; the test resume title makes it identifiable.
      }
    }
    await mcp.close();
  }
};

main().catch((error: unknown) => {
  console.error(`smoke failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
