import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { getAuthenticatedClient } from '../src/session';
import { loadConfigEnv } from '../src/config';

const ENDPOINT = 'https://cevee-beta.vercel.app/api/mcp';

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

  const { client: supabase } = await getAuthenticatedClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No Supabase access token is available.');
  }

  const transport = new StreamableHTTPClientTransport(new URL(ENDPOINT), {
    authProvider: {
      token: async () => session.access_token,
    },
  });

  const client = new Client({ name: 'live-tool-smoke', version: '1.0.0' });

  try {
    await client.connect(transport);

    const tools = await client.listTools();
    console.log(`tools: ${tools.tools.length}`);

    const listResult = await client.callTool({
      name: 'list_resumes',
      arguments: { limit: 10 },
    });
    const listText =
      listResult.content?.find((item) => item.type === 'text')?.text ?? '';
    if (listResult.isError) throw new Error(listText);
    const existingResumes = JSON.parse(listText) as unknown[];
    console.log(`existing resumes: ${existingResumes.length}`);

    const result = await client.callTool({
      name: 'import_resume',
      arguments: { pdfText: SAMPLE_RESUME, save: false },
    });

    const text = result.content?.find((item) => item.type === 'text')?.text ?? '';
    if (result.isError) throw new Error(text);

    const payload = JSON.parse(text) as {
      saved: boolean;
      draft: {
        content: {
          header: { fullName: string };
          sections: unknown[];
        };
      };
    };

    console.log(`saved: ${payload.saved}`);
    console.log(`name: ${payload.draft.content.header.fullName}`);
    console.log(`sections: ${payload.draft.content.sections.length}`);
    console.log('live tool smoke: ok');
  } finally {
    await client.close();
  }
};

main().catch((error: unknown) => {
  console.error(
    `live tool smoke failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
