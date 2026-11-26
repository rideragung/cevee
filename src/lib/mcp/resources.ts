import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { LAYOUT_CATALOG_LIST } from '../../layouts/catalog';
import type { McpAuthContext } from './auth';
import { getMcpCapabilities } from './capabilities';
import { resumeDocumentSchema } from './schema/resume';
import type { ResumeStore } from './store/types';

const jsonContents = (uri: URL, data: unknown) => ({
  contents: [
    {
      uri: uri.href,
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    },
  ],
});

const textContents = (uri: URL, text: string) => ({
  contents: [
    {
      uri: uri.href,
      mimeType: 'text/plain',
      text,
    },
  ],
});

const ATS_GUIDE = `Cevee ATS guide

- Use a single-column, ATS-friendly layout (standard-ats-v1, standard-ats-v2, or modern-photo).
- Keep contact details in the header: full name, email, phone, location, and at least one link.
- Write two to six achievement bullets per role. Start with an action verb and include an outcome.
- Use month-year ranges such as "Jan 2024 - Present" and keep entries reverse-chronological.
- Group skills into three to eight categories; each category is a comma-separated list.
- Avoid tables, text boxes, images with text, and decorative characters.
- Keep the document concise; one to two A4 pages is the practical target.
`;

export const registerResources = (
  server: McpServer,
  store: ResumeStore,
  _auth: McpAuthContext
): void => {
  server.registerResource(
    'capabilities',
    'cevee://capabilities',
    {
      title: 'Cevee capabilities',
      description: 'Server version, supported sections, layouts, features, and limits.',
      mimeType: 'application/json',
    },
    async (uri) => jsonContents(uri, getMcpCapabilities())
  );

  server.registerResource(
    'resumes',
    'cevee://resumes',
    {
      title: 'Resume list',
      description: 'All resumes owned by the signed-in user.',
      mimeType: 'application/json',
    },
    async (uri) => jsonContents(uri, await store.listResumes({ limit: 100 }))
  );

  server.registerResource(
    'resume',
    new ResourceTemplate('cevee://resumes/{resumeId}', { list: undefined }),
    {
      title: 'Resume document',
      description: 'One resume document by id.',
      mimeType: 'application/json',
    },
    async (uri, variables) => {
      const resumeId = String(variables.resumeId);
      const resume = await store.getResume(resumeId);
      if (!resume) {
        return textContents(uri, `Resume "${resumeId}" was not found.`);
      }
      return jsonContents(uri, resume);
    }
  );

  server.registerResource(
    'layouts',
    'cevee://layouts',
    {
      title: 'Layout catalog',
      description: 'Supported resume layouts and their descriptions.',
      mimeType: 'application/json',
    },
    async (uri) => jsonContents(uri, LAYOUT_CATALOG_LIST)
  );

  server.registerResource(
    'resume-schema',
    'cevee://schema/resume',
    {
      title: 'Resume JSON schema',
      description: 'JSON Schema for the ResumeDocument shape.',
      mimeType: 'application/schema+json',
    },
    async (uri) => {
      try {
        return jsonContents(uri, z.toJSONSchema(resumeDocumentSchema));
      } catch {
        return textContents(
          uri,
          'The runtime could not generate the JSON Schema. Use get_resume to inspect the shape.'
        );
      }
    }
  );

  server.registerResource(
    'ats-guide',
    'cevee://guides/ats',
    {
      title: 'ATS guide',
      description: 'Practical rules for keeping a resume ATS-friendly.',
      mimeType: 'text/plain',
    },
    async (uri) => textContents(uri, ATS_GUIDE)
  );
};
