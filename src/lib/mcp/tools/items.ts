import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { McpAuthContext } from '../auth';
import type { ResumeStore } from '../store/types';
import { mutateResume } from './mutate';
import { errorResult } from './result';
import {
  findSection,
  normalizeItemForSection,
  sectionItems,
  withSectionItems,
} from './sectionUtils';

const itemObjectSchema = z.record(z.string(), z.unknown());

export const registerItemTools = (
  server: McpServer,
  store: ResumeStore,
  auth: McpAuthContext
): void => {
  server.registerTool(
    'add_item',
    {
      title: 'Add item to section',
      description:
        'Add one entry to an experience, project, education, custom_list, or skills section. Bullets are plain strings or string arrays. Requires the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionId: z.string(),
        item: itemObjectSchema,
        position: z.number().int().min(0).optional(),
      }),
    },
    async ({ resumeId, expectedVersion, sectionId, item, position }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = findSection(current, sectionId);
        if (!section) throw new Error(`Section "${sectionId}" was not found.`);

        const items = sectionItems(section);
        if (!items) {
          throw new Error(`Section "${section.title}" does not support items.`);
        }

        const normalized = normalizeItemForSection(section, item, 'item');
        const nextItems = [...items];
        const index = Math.min(Math.max(position ?? nextItems.length, 0), nextItems.length);
        nextItems.splice(index, 0, normalized);

        const nextSection = withSectionItems(section, nextItems);
        return {
          ...current,
          content: {
            ...current.content,
            sections: current.content.sections.map((entry) =>
              entry.id === sectionId ? nextSection : entry
            ),
          },
        };
      });
    }
  );

  server.registerTool(
    'update_item',
    {
      title: 'Update item',
      description:
        'Merge a patch into one section item. The item id cannot be changed. Requires the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionId: z.string(),
        itemId: z.string(),
        patch: itemObjectSchema,
      }),
    },
    async ({ resumeId, expectedVersion, sectionId, itemId, patch }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = findSection(current, sectionId);
        if (!section) throw new Error(`Section "${sectionId}" was not found.`);

        const items = sectionItems(section);
        if (!items) {
          throw new Error(`Section "${section.title}" does not support items.`);
        }

        const existing = items.find(
          (entry) => (entry as { id?: string }).id === itemId
        );
        if (!existing) {
          throw new Error(`Item "${itemId}" was not found in section "${section.title}".`);
        }

        const merged = {
          ...(existing as Record<string, unknown>),
          ...patch,
          id: itemId,
        };
        const normalized = normalizeItemForSection(section, merged, 'item');

        const nextSection = withSectionItems(
          section,
          items.map((entry) =>
            (entry as { id?: string }).id === itemId ? normalized : entry
          )
        );

        return {
          ...current,
          content: {
            ...current.content,
            sections: current.content.sections.map((entry) =>
              entry.id === sectionId ? nextSection : entry
            ),
          },
        };
      });
    }
  );

  server.registerTool(
    'remove_item',
    {
      title: 'Remove item',
      description:
        'Permanently remove one item from a section. Requires confirm: true and the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionId: z.string(),
        itemId: z.string(),
        confirm: z.boolean(),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ resumeId, expectedVersion, sectionId, itemId, confirm }) => {
      if (!confirm) {
        return errorResult('Set confirm: true to remove an item.');
      }

      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = findSection(current, sectionId);
        if (!section) throw new Error(`Section "${sectionId}" was not found.`);

        const items = sectionItems(section);
        if (!items) {
          throw new Error(`Section "${section.title}" does not support items.`);
        }

        if (!items.some((entry) => (entry as { id?: string }).id === itemId)) {
          throw new Error(`Item "${itemId}" was not found in section "${section.title}".`);
        }

        const nextSection = withSectionItems(
          section,
          items.filter((entry) => (entry as { id?: string }).id !== itemId)
        );

        return {
          ...current,
          content: {
            ...current.content,
            sections: current.content.sections.map((entry) =>
              entry.id === sectionId ? nextSection : entry
            ),
          },
        };
      });
    }
  );

  server.registerTool(
    'reorder_items',
    {
      title: 'Reorder items',
      description:
        'Reorder every item in a section. The id list must contain each existing item exactly once. Requires the current version.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        sectionId: z.string(),
        itemIds: z.array(z.string()).min(1),
      }),
    },
    async ({ resumeId, expectedVersion, sectionId, itemIds }) => {
      return mutateResume(store, auth, resumeId, expectedVersion, (current) => {
        const section = findSection(current, sectionId);
        if (!section) throw new Error(`Section "${sectionId}" was not found.`);

        const items = sectionItems(section);
        if (!items) {
          throw new Error(`Section "${section.title}" does not support items.`);
        }

        const currentIds = items.map((entry) => (entry as { id?: string }).id ?? '');
        const valid =
          itemIds.length === currentIds.length &&
          new Set(itemIds).size === itemIds.length &&
          itemIds.every((id) => currentIds.includes(id));

        if (!valid) {
          throw new Error('itemIds must contain every existing item id exactly once.');
        }

        const byId = new Map(
          items.map((entry) => [(entry as { id?: string }).id ?? '', entry])
        );
        const nextSection = withSectionItems(
          section,
          itemIds.map((id) => byId.get(id)!)
        );

        return {
          ...current,
          content: {
            ...current.content,
            sections: current.content.sections.map((entry) =>
              entry.id === sectionId ? nextSection : entry
            ),
          },
        };
      });
    }
  );
};
