import { readFile } from 'node:fs/promises';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { buildMcpServer } from '../../src/lib/mcp/server';
import { SupabaseResumeStore } from '../../src/lib/mcp/store/supabaseStore';
import { getAuthenticatedClient } from '../src/session';
import { getGeminiKeys, getGeminiModel, loadConfigEnv } from '../src/config';
import { extractPdfTextFromBase64, extractPdfTextFromFile } from '../src/pdf';

const SAMPLE_RESUME = `Jane Doe
jane.doe@example.com | +62 812 3456 7890 | Jakarta, Indonesia

Summary
Software engineer with five years of experience building web applications.

Experience
Senior Software Engineer, Acme Corp, Jakarta
Jan 2022 - Present
- Led a team of four engineers.
- Reduced page load time by 40%.

Education
Bachelor of Computer Science, University of Indonesia
2015 - 2019

Skills
TypeScript, React, Node.js, PostgreSQL`;

const main = async (): Promise<void> => {
  loadConfigEnv();

  const apiKeys = getGeminiKeys();
  if (!apiKeys) {
    throw new Error('GEMINI_API_KEYS is not set. Add it to .env or the MCP environment.');
  }

  const { client: supabase, userId, email } = await getAuthenticatedClient();
  const store = new SupabaseResumeStore(supabase, userId);
  const server = buildMcpServer({
    store,
    auth: { userId, mode: 'local', scopes: ['read', 'write'], email },
    importServices: {
      gemini: { apiKeys, model: getGeminiModel() },
      extractPdfTextFromBase64,
      extractPdfTextFromFile,
    },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const mcp = new Client({ name: 'cevee-import-smoke', version: '1.0.0' });
  await mcp.connect(clientTransport);

  try {
    const result = await mcp.callTool({
      name: 'import_resume',
      arguments: { pdfText: SAMPLE_RESUME, save: false },
    });

    const text = result.content?.find((item) => item.type === 'text')?.text ?? '';

    if (result.isError) {
      throw new Error(text);
    }

    const payload = JSON.parse(text) as {
      saved: boolean;
      draft: {
        content: {
          language?: string;
          header: { fullName: string };
          sections: unknown[];
        };
      };
    };

    console.log(`saved: ${payload.saved}`);
    console.log(`name: ${payload.draft.content.header.fullName}`);
    console.log(`sections: ${payload.draft.content.sections.length}`);
    console.log(`language: ${payload.draft.content.language ?? 'en'}`);

    const pdfBytes = await readFile(
      new URL('../test/fixtures/sample.pdf', import.meta.url)
    );
    const pdfResult = await mcp.callTool({
      name: 'import_resume',
      arguments: {
        pdfBase64: Buffer.from(pdfBytes).toString('base64'),
        save: false,
      },
    });
    const pdfText = pdfResult.content?.find((item) => item.type === 'text')?.text ?? '';
    if (pdfResult.isError) throw new Error(pdfText);
    const pdfPayload = JSON.parse(pdfText) as {
      saved: boolean;
      source?: { pageCount?: number };
      draft: { content: { sections: unknown[] } };
    };
    console.log(`pdf saved: ${pdfPayload.saved}`);
    console.log(`pdf pages: ${pdfPayload.source?.pageCount ?? 'unknown'}`);
    console.log(`pdf sections: ${pdfPayload.draft.content.sections.length}`);

    console.log('import smoke: ok');
  } finally {
    await mcp.close();
  }
};

main().catch((error: unknown) => {
  console.error(
    `import smoke failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
