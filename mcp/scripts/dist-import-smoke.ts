import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.resolve(import.meta.dirname, '../dist/index.js')],
  stderr: 'pipe',
});

const client = new Client({ name: 'cevee-dist-import-smoke', version: '1.0.0' });
await client.connect(transport);

try {
  const bytes = await readFile(
    new URL('../test/fixtures/sample.pdf', import.meta.url)
  );
  const result = await client.callTool({
    name: 'import_resume',
    arguments: {
      pdfBase64: Buffer.from(bytes).toString('base64'),
      save: false,
    },
  });

  const text = result.content?.find((item) => item.type === 'text')?.text ?? '';
  if (result.isError) throw new Error(text);

  const payload = JSON.parse(text) as {
    saved: boolean;
    source?: { pageCount?: number };
    draft: { content: { sections: unknown[] } };
  };

  console.log(`saved: ${payload.saved}`);
  console.log(`pages: ${payload.source?.pageCount ?? 'unknown'}`);
  console.log(`sections: ${payload.draft.content.sections.length}`);
  console.log('dist import smoke: ok');
} finally {
  await client.close();
}
