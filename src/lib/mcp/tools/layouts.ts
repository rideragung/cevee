import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { LAYOUT_CATALOG_LIST } from '../../../layouts/catalog';
import { isResumeLayoutId } from '../../../layouts/ids';
import type { McpAuthContext } from '../auth';
import type { ResumeStore } from '../store/types';
import { ensureWrite } from './mutate';
import { errorResult, jsonResult } from './result';

export const registerLayoutTools = (
  server: McpServer,
  store: ResumeStore,
  auth: McpAuthContext
): void => {
  server.registerTool(
    'list_layouts',
    {
      title: 'List resume layouts',
      description:
        'List the ATS layouts supported by Cevee, including their ids, names, and descriptions.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async () => jsonResult(LAYOUT_CATALOG_LIST)
  );

  server.registerTool(
    'set_layout',
    {
      title: 'Set resume layout',
      description:
        'Change the layout of a resume. Requires the current version; returns a conflict when the resume changed.',
      inputSchema: z.object({
        resumeId: z.string(),
        expectedVersion: z.number().int().min(1),
        layoutId: z.string(),
      }),
      annotations: { idempotentHint: true },
    },
    async ({ resumeId, expectedVersion, layoutId }) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;

      if (!isResumeLayoutId(layoutId)) {
        return errorResult(
          `Unknown layout "${layoutId}". Call list_layouts for the supported ids.`
        );
      }

      const current = await store.getResume(resumeId);
      if (!current) return errorResult(`Resume "${resumeId}" was not found.`);

      const next = { ...current, layoutId };
      const result = await store.updateResume(next, expectedVersion);
      if (result.ok) return jsonResult(result.resume);
      if (result.reason === 'conflict') {
        return errorResult(
          'The resume changed since it was read. Re-read it and retry with the latest version.',
          { latest: result.latest }
        );
      }
      return errorResult(result.message);
    }
  );
};
