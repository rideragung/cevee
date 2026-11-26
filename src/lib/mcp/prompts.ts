import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export const registerPrompts = (server: McpServer): void => {
  server.registerPrompt(
    'create-resume-from-bio',
    {
      title: 'Create a resume from a bio',
      description:
        'Guide an agent through creating a Cevee resume from a short professional bio.',
      argsSchema: z.object({
        bio: z.string().describe('The professional bio or background text.'),
        targetRole: z.string().optional().describe('The role the resume targets.'),
        language: z
          .enum(['en', 'id'])
          .optional()
          .describe('Document language: English or Bahasa Indonesia.'),
      }),
    },
    ({ bio, targetRole, language }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'Create a Cevee resume from the bio below.',
              '',
              `Target role: ${targetRole || 'not specified'}`,
              `Language: ${language || 'en'}`,
              '',
              'Workflow:',
              '1. Call create_resume with a clear title and the target role.',
              '2. Call update_header with the name, email, phone, location, and links you can infer.',
              '3. Call list_sections, then use update_section or add_item to fill summary, experience, education, projects, and skills.',
              '4. Call validate_resume and fix every error before finishing.',
              '5. Do not invent employers, dates, degrees, or metrics that are not in the bio.',
              '',
              'Bio:',
              bio,
            ].join('\n'),
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'ats-review',
    {
      title: 'ATS review',
      description:
        'Review one resume for ATS readability and structural problems using the Cevee tools.',
      argsSchema: z.object({
        resumeId: z.string().describe('The resume id to review.'),
      }),
    },
    ({ resumeId }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              `Review resume "${resumeId}" for ATS readiness.`,
              '',
              'Steps:',
              '1. Call get_resume with format "summary" to understand the structure.',
              '2. Call validate_resume and report every error, warning, and info item.',
              '3. Read cevee://guides/ats and compare the resume against each rule.',
              '4. Propose concrete fixes. Do not rewrite content that is already strong.',
              '5. If the user asks you to apply fixes, use the section/item tools with expectedVersion.',
            ].join('\n'),
          },
        },
      ],
    })
  );
};
