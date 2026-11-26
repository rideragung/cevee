import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { ResumeDocument, ResumeSection } from '../../../types/resume';
import { htmlToPlainText } from '../../domain/html';
import { getMcpCapabilities } from '../capabilities';
import { resumeDocumentSchema } from '../schema/resume';
import type { McpAuthContext } from '../auth';
import type { ResumeStore } from '../store/types';
import { errorResult, jsonResult } from './result';

interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sectionIsEmpty = (section: ResumeSection): boolean => {
  if (section.type === 'summary' || section.type === 'custom_text') {
    return htmlToPlainText(section.data.html).length === 0;
  }
  if (section.type === 'skills') {
    return section.data.categories.length === 0;
  }
  return section.data.items.length === 0;
};

const sectionItemIds = (section: ResumeSection): string[] => {
  if (section.type === 'summary' || section.type === 'custom_text') return [];
  if (section.type === 'skills') return section.data.categories.map((category) => category.id);
  return section.data.items.map((item) => item.id);
};

const validateResume = (resume: ResumeDocument): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const parsed = resumeDocumentSchema.safeParse(resume);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        path: issue.path.join('.'),
        message: issue.message,
        severity: 'error',
      });
    }
  }

  const sectionIds = new Set<string>();
  for (const section of resume.content.sections) {
    if (sectionIds.has(section.id)) {
      issues.push({
        path: `sections.${section.id}`,
        message: 'Duplicate section id.',
        severity: 'error',
      });
    }
    sectionIds.add(section.id);

    const itemIds = new Set<string>();
    for (const itemId of sectionItemIds(section)) {
      if (itemIds.has(itemId)) {
        issues.push({
          path: `sections.${section.id}.items.${itemId}`,
          message: 'Duplicate item id within the section.',
          severity: 'error',
        });
      }
      itemIds.add(itemId);
    }

    if (sectionIsEmpty(section)) {
      issues.push({
        path: `sections.${section.id}`,
        message: 'Section is empty.',
        severity: 'info',
      });
    }
  }

  const header = resume.content.header;
  if (!header.fullName.trim() || /^(your name|nama lengkap)$/i.test(header.fullName.trim())) {
    issues.push({
      path: 'content.header.fullName',
      message: 'The resume still uses a placeholder name.',
      severity: 'warning',
    });
  }
  if (!EMAIL_PATTERN.test(header.email.trim())) {
    issues.push({
      path: 'content.header.email',
      message: 'The email address is missing or invalid.',
      severity: 'warning',
    });
  }
  if (header.phone.replace(/\D/g, '').length < 7) {
    issues.push({
      path: 'content.header.phone',
      message: 'The phone number is missing or too short.',
      severity: 'warning',
    });
  }

  return issues;
};

export const registerQualityTools = (
  server: McpServer,
  store: ResumeStore,
  _auth: McpAuthContext
): void => {
  server.registerTool(
    'get_capabilities',
    {
      title: 'Get Cevee capabilities',
      description:
        'Return the Cevee MCP server version, supported section presets, layouts, features, and limits.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async () => jsonResult(getMcpCapabilities())
  );

  server.registerTool(
    'validate_resume',
    {
      title: 'Validate resume structure',
      description:
        'Check a resume against the Cevee schema, duplicate ids, empty sections, and placeholder contact fields.',
      inputSchema: z.object({ resumeId: z.string() }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ resumeId }) => {
      const resume = await store.getResume(resumeId);
      if (!resume) return errorResult(`Resume "${resumeId}" was not found.`);

      const issues = validateResume(resume);
      return jsonResult({
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
      });
    }
  );
};
