import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { HeaderData, ResumeDocument } from '../../../types/resume';
import { isResumeLayoutId } from '../../../layouts/ids';
import { createEmptyResume, createResumeId } from '../../domain/resumeFactory';
import { switchResumeLanguage } from '../../../utils/resumeLocale';
import type { McpAuthContext } from '../auth';
import type { ResumeStore } from '../store/types';
import { ensureWrite, mutateResume } from './mutate';
import { errorResult, jsonResult } from './result';
import { sectionItemCount } from './sectionUtils';

const linkInputSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const profileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  links: z.array(linkInputSchema).optional(),
});

const headerPatchSchema = z.object({
  fullName: z.string().optional(),
  roles: z.array(z.string()).max(4).optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  willingToRelocate: z.boolean().optional(),
  relocationStatus: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  links: z.array(linkInputSchema).optional(),
  photoUrl: z.string().max(2_000_000).optional(),
  isPlaceholder: z.boolean().optional(),
});

const summarizeResume = (resume: ResumeDocument) => ({
  id: resume.id,
  title: resume.title,
  layoutId: resume.layoutId,
  updatedAt: resume.updatedAt,
  version: resume.version ?? 1,
  language: resume.content.language ?? 'en',
  header: {
    fullName: resume.content.header.fullName,
    email: resume.content.header.email,
    phone: resume.content.header.phone,
    location: resume.content.header.location,
    links: resume.content.header.links,
  },
  sections: resume.content.sections.map((section) => ({
    id: section.id,
    type: section.type,
    title: section.title,
    presetKey: section.presetKey,
    isPlaceholder: section.isPlaceholder ?? false,
    itemCount: sectionItemCount(section),
  })),
});

const applyProfile = (resume: ResumeDocument, profile: z.infer<typeof profileSchema>): ResumeDocument => {
  const header: HeaderData = { ...resume.content.header };

  if (profile.fullName !== undefined) {
    header.fullName = profile.fullName.trim();
    header.isPlaceholder = !header.fullName;
  }
  if (profile.email !== undefined) header.email = profile.email.trim();
  if (profile.phone !== undefined) header.phone = profile.phone.trim();
  if (profile.location !== undefined) header.location = profile.location.trim();
  if (profile.headline !== undefined) header.headline = profile.headline.trim();
  if (profile.links !== undefined) {
    header.links = profile.links.map((link, index) => ({
      id: `l-${index + 1}`,
      label: link.label,
      url: link.url,
    }));
  }

  return {
    ...resume,
    content: {
      ...resume.content,
      header,
    },
  };
};

export const registerResumeTools = (
  server: McpServer,
  store: ResumeStore,
  auth: McpAuthContext
): void => {
  server.registerTool(
    'list_resumes',
    {
      title: 'List resumes',
      description:
        'List the signed-in user resumes with id, title, layout, version, candidate name, and section count.',
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ limit, offset }) => jsonResult(await store.listResumes({ limit, offset }))
  );

  server.registerTool(
    'get_resume',
    {
      title: 'Get resume',
      description:
        'Read one resume. Use format "summary" for a compact overview, or "full" for the complete document including section content.',
      inputSchema: z.object({
        resumeId: z.string(),
        format: z.enum(['summary', 'full']).optional(),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ resumeId, format }) => {
      const resume = await store.getResume(resumeId);
      if (!resume) return errorResult(`Resume "${resumeId}" was not found.`);
      return jsonResult(format === 'summary' ? summarizeResume(resume) : resume);
    }
  );

  server.registerTool(
    'create_resume',
    {
      title: 'Create resume',
      description:
        'Create a new resume with Cevee default sections. Optionally fill the header profile and target role.',
      inputSchema: z.object({
        title: z.string().optional(),
        layoutId: z.string().optional(),
        language: z.enum(['en', 'id']).optional(),
        targetRole: z.string().optional(),
        profile: profileSchema.optional(),
      }),
    },
    async ({ title, layoutId, language, targetRole, profile }) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;

      if (layoutId !== undefined && !isResumeLayoutId(layoutId)) {
        return errorResult(`Unknown layout "${layoutId}". Call list_layouts for the supported ids.`);
      }

      const base = createEmptyResume({ title, layoutId, language, targetRole });
      const resume = profile ? applyProfile(base, profile) : base;
      const created = await store.createResume(resume);
      return jsonResult(created);
    }
  );

  server.registerTool(
    'update_resume',
    {
      title: 'Update resume metadata',
      description:
        'Update title, layout, or document language. Requires the current version; content changes use the section tools.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        title: z.string().optional(),
        layoutId: z.string().optional(),
        language: z.enum(['en', 'id']).optional(),
      }),
    },
    async ({ resumeId, expectedVersion, title, layoutId, language }) => {
      if (layoutId !== undefined && !isResumeLayoutId(layoutId)) {
        return errorResult(`Unknown layout "${layoutId}". Call list_layouts for the supported ids.`);
      }

      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        let next = current;

        if (language && language !== (current.content.language ?? 'en')) {
          next = switchResumeLanguage(next, language);
        }
        if (title !== undefined && title.trim()) {
          next = { ...next, title: title.trim() };
        }
        if (layoutId !== undefined) {
          next = { ...next, layoutId };
        }

        return next;
      });
    }
  );

  server.registerTool(
    'duplicate_resume',
    {
      title: 'Duplicate resume',
      description: 'Copy an existing resume into a new resume with a fresh id and version 1.',
      inputSchema: z.object({
        resumeId: z.string(),
        title: z.string().optional(),
      }),
    },
    async ({ resumeId, title }) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;

      const source = await store.getResume(resumeId);
      if (!source) return errorResult(`Resume "${resumeId}" was not found.`);

      const now = new Date().toISOString();
      const copy = structuredClone(source);
      const created = await store.createResume({
        ...copy,
        id: createResumeId(),
        title: title?.trim() || `${source.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
        version: 1,
      });

      return jsonResult(created);
    }
  );

  server.registerTool(
    'delete_resume',
    {
      title: 'Delete resume',
      description:
        'Permanently delete one resume. Requires confirm: true. This cannot be undone.',
      inputSchema: z.object({
        resumeId: z.string(),
        confirm: z.boolean(),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ resumeId, confirm }) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;

      if (!confirm) {
        return errorResult('Set confirm: true to delete a resume.');
      }

      const deleted = await store.deleteResume(resumeId);
      if (!deleted) return errorResult(`Resume "${resumeId}" was not found or already deleted.`);

      return jsonResult({ deleted: true, resumeId });
    }
  );

  server.registerTool(
    'update_header',
    {
      title: 'Update resume header',
      description:
        'Update contact and profile fields. Links are plain label/url pairs. Requires the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        header: headerPatchSchema,
      }),
    },
    async ({ resumeId, expectedVersion, header: patch }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const header: HeaderData = { ...current.content.header };

        if (patch.fullName !== undefined) {
          header.fullName = patch.fullName;
          header.isPlaceholder = !patch.fullName.trim();
        }
        if (patch.roles !== undefined) {
          header.roles = patch.roles;
          header.headline = patch.headline ?? patch.roles[0] ?? '';
        }
        if (patch.headline !== undefined) header.headline = patch.headline;
        if (patch.location !== undefined) header.location = patch.location;
        if (patch.willingToRelocate !== undefined) {
          header.willingToRelocate = patch.willingToRelocate;
        }
        if (patch.relocationStatus !== undefined) {
          header.relocationStatus = patch.relocationStatus;
        }
        if (patch.email !== undefined) header.email = patch.email;
        if (patch.phone !== undefined) header.phone = patch.phone;
        if (patch.links !== undefined) {
          header.links = patch.links.map((link, index) => ({
            id: `l-${resumeId}-${index + 1}`,
            label: link.label,
            url: link.url,
          }));
        }
        if (patch.photoUrl !== undefined) header.photoUrl = patch.photoUrl;
        if (patch.isPlaceholder !== undefined) header.isPlaceholder = patch.isPlaceholder;

        return {
          ...current,
          content: {
            ...current.content,
            header,
          },
        };
      });
    }
  );
};
