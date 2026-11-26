import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { buildMcpServer } from '../../src/lib/mcp/server';
import { MemoryStore } from '../../src/lib/mcp/store/memoryStore';
import type { ResumeDocument } from '../../src/types/resume';

interface TextContent {
  type: string;
  text?: string;
}

const parseResult = (result: { content?: TextContent[]; isError?: boolean }) => {
  const text = result.content?.find((item) => item.type === 'text')?.text ?? '{}';
  return JSON.parse(text) as Record<string, unknown>;
};

let client: Client;
let resume: ResumeDocument;

beforeAll(async () => {
  const store = new MemoryStore();
  const server = buildMcpServer({
    store,
    auth: { userId: 'test-user', mode: 'local', scopes: ['read', 'write'] },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  client = new Client({ name: 'cevee-tools-test', version: '1.0.0' });
  await client.connect(clientTransport);
});

afterAll(async () => {
  await client.close();
});

describe('MCP tools', () => {
  it('creates a resume and reads a summary', async () => {
    const created = parseResult(
      await client.callTool({
        name: 'create_resume',
        arguments: {
          title: 'Test Resume',
          profile: {
            fullName: 'Ada Lovelace',
            email: 'ada@example.com',
            phone: '+62 812 3456 7890',
            location: 'Jakarta, Indonesia',
          },
        },
      })
    );

    expect(created.id).toBeTruthy();
    expect(created.version).toBe(1);
    resume = created as unknown as ResumeDocument;

    const summary = parseResult(
      await client.callTool({
        name: 'get_resume',
        arguments: { resumeId: resume.id, format: 'summary' },
      })
    );

    expect((summary.header as { fullName: string }).fullName).toBe('Ada Lovelace');
    expect(Array.isArray(summary.sections)).toBe(true);
  });

  it('updates the header and increments the version', async () => {
    const updated = parseResult(
      await client.callTool({
        name: 'update_header',
        arguments: {
          resumeId: resume.id,
          expectedVersion: resume.version,
          header: { headline: 'Computing Pioneer', location: 'London, UK' },
        },
      })
    );

    expect(updated.version).toBe(2);
    expect(
      (updated.content as { header: { location: string } }).header.location
    ).toBe('London, UK');
    resume = updated as unknown as ResumeDocument;
  });

  it('adds a section and an item', async () => {
    const withSection = parseResult(
      await client.callTool({
        name: 'add_section',
        arguments: {
          resumeId: resume.id,
          expectedVersion: resume.version,
          presetKey: 'projects',
        },
      })
    );
    resume = withSection as unknown as ResumeDocument;

    const sections = parseResult(
      await client.callTool({
        name: 'list_sections',
        arguments: { resumeId: resume.id },
      })
    ) as unknown as Array<{ id: string; type: string; title: string }>;

    const projects = sections.find((section) => section.type === 'projects');
    expect(projects).toBeTruthy();

    const withItem = parseResult(
      await client.callTool({
        name: 'add_item',
        arguments: {
          resumeId: resume.id,
          expectedVersion: resume.version,
          sectionId: projects!.id,
          item: {
            name: 'Analytical Engine Notes',
            bullets: ['Documented the first algorithm', 'Collaborated with Charles Babbage'],
          },
        },
      })
    );
    resume = withItem as unknown as ResumeDocument;

    const full = parseResult(
      await client.callTool({
        name: 'get_resume',
        arguments: { resumeId: resume.id, format: 'full' },
      })
    ) as unknown as ResumeDocument;

    const projectSection = full.content.sections.find(
      (section) => section.id === projects!.id
    ) as { data: { items: Array<{ bullets: string }> } };
    expect(projectSection.data.items).toHaveLength(1);
    expect(projectSection.data.items[0].bullets).toContain('<li>');
  });

  it('rejects a stale version', async () => {
    const result = await client.callTool({
      name: 'update_header',
      arguments: {
        resumeId: resume.id,
        expectedVersion: 1,
        header: { location: 'Stale' },
      },
    });

    expect(result.isError).toBe(true);
  });

  it('validates the resume', async () => {
    const validation = parseResult(
      await client.callTool({
        name: 'validate_resume',
        arguments: { resumeId: resume.id },
      })
    );

    expect(typeof validation.valid).toBe('boolean');
    expect(Array.isArray(validation.issues)).toBe(true);
  });

  it('requires confirmation before deleting', async () => {
    const denied = await client.callTool({
      name: 'delete_resume',
      arguments: { resumeId: resume.id, confirm: false },
    });
    expect(denied.isError).toBe(true);

    const deleted = parseResult(
      await client.callTool({
        name: 'delete_resume',
        arguments: { resumeId: resume.id, confirm: true },
      })
    );
    expect(deleted.deleted).toBe(true);
  });
});
