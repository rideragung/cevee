import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { createSectionFromPreset } from '../../domain/resumeFactory';
import type { McpAuthContext } from '../auth';
import type { ResumeStore } from '../store/types';
import { mutateResume } from './mutate';
import { errorResult, jsonResult } from './result';
import {
  findSection,
  normalizeSectionDataPatch,
  sectionItemCount,
} from './sectionUtils';

const presetKeySchema = z.enum([
  'summary',
  'experience',
  'education',
  'projects',
  'skills',
  'certifications',
  'languages',
  'publications',
  'awards',
  'volunteering',
  'references',
  'custom',
]);

export const registerSectionTools = (
  server: McpServer,
  store: ResumeStore,
  auth: McpAuthContext
): void => {
  server.registerTool(
    'list_sections',
    {
      title: 'List resume sections',
      description:
        'List the sections of one resume with their ids, types, titles, and item counts.',
      inputSchema: z.object({ resumeId: z.string() }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ resumeId }) => {
      const resume = await store.getResume(resumeId);
      if (!resume) return errorResult(`Resume "${resumeId}" was not found.`);

      return jsonResult(
        resume.content.sections.map((section) => ({
          id: section.id,
          type: section.type,
          title: section.title,
          presetKey: section.presetKey,
          showTitle: section.showTitle,
          isPlaceholder: section.isPlaceholder ?? false,
          itemCount: sectionItemCount(section),
        }))
      );
    }
  );

  server.registerTool(
    'add_section',
    {
      title: 'Add section',
      description:
        'Add an empty section from a preset. Requires the current resume version. Use the item tools to fill it.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        presetKey: presetKeySchema,
        title: z.string().optional(),
        position: z.number().int().min(0).optional(),
      }),
    },
    async ({ resumeId, expectedVersion, presetKey, title, position }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = createSectionFromPreset({
          presetKey,
          language: current.content.language,
          title,
        });
        const sections = [...current.content.sections];
        const index = Math.min(Math.max(position ?? sections.length, 0), sections.length);
        sections.splice(index, 0, section);

        return {
          ...current,
          content: {
            ...current.content,
            sections,
          },
        };
      });
    }
  );

  server.registerTool(
    'update_section',
    {
      title: 'Update section',
      description:
        'Update a section title, visibility, or data. Send plain text in data.text for summary/custom_text; send data.items for experience/projects. Requires the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionId: z.string(),
        title: z.string().optional(),
        showTitle: z.boolean().optional(),
        data: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    async ({ resumeId, expectedVersion, sectionId, title, showTitle, data }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = findSection(current, sectionId);
        if (!section) {
          throw new Error(`Section "${sectionId}" was not found.`);
        }

        let dataPatch: Record<string, unknown> | undefined;
        if (data !== undefined) {
          try {
            dataPatch = normalizeSectionDataPatch(section, data);
          } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error), {
              cause: error,
            });
          }
        }

        const nextSection = {
          ...section,
          ...(title !== undefined ? { title } : {}),
          ...(showTitle !== undefined ? { showTitle } : {}),
          ...(dataPatch !== undefined
            ? { data: { ...section.data, ...dataPatch } }
            : {}),
        };

        return {
          ...current,
          content: {
            ...current.content,
            sections: current.content.sections.map((item) =>
              item.id === sectionId ? (nextSection as typeof section) : item
            ),
          },
        };
      });
    }
  );

  server.registerTool(
    'remove_section',
    {
      title: 'Remove section',
      description:
        'Permanently remove one section and all of its items. Requires confirm: true and the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionId: z.string(),
        confirm: z.boolean(),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ resumeId, expectedVersion, sectionId, confirm }) => {
      if (!confirm) {
        return errorResult('Set confirm: true to remove a section.');
      }

      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = findSection(current, sectionId);
        if (!section) {
          throw new Error(`Section "${sectionId}" was not found.`);
        }

        return {
          ...current,
          content: {
            ...current.content,
            sections: current.content.sections.filter((item) => item.id !== sectionId),
          },
        };
      });
    }
  );

  server.registerTool(
    'reorder_sections',
    {
      title: 'Reorder sections',
      description:
        'Reorder all sections by id. The id list must contain every existing section exactly once. Requires the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionIds: z.array(z.string()).min(1),
      }),
    },
    async ({ resumeId, expectedVersion, sectionIds }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const currentIds = current.content.sections.map((section) => section.id);
        const valid =
          sectionIds.length === currentIds.length &&
          new Set(sectionIds).size === sectionIds.length &&
          sectionIds.every((id) => currentIds.includes(id));

        if (!valid) {
          throw new Error(
            'sectionIds must contain every existing section id exactly once.'
          );
        }

        const byId = new Map(current.content.sections.map((section) => [section.id, section]));
        return {
          ...current,
          content: {
            ...current.content,
            sections: sectionIds.map((id) => byId.get(id)!),
          },
        };
      });
    }
  );
};
