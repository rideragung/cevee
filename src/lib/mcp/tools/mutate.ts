import type { ResumeDocument } from '../../../types/resume';
import { canWrite, type McpAuthContext } from '../auth';
import { resumeDocumentSchema } from '../schema/resume';
import type { ResumeStore } from '../store/types';
import { errorResult, jsonResult, type ToolTextResult } from './result';
import { sectionItemCount } from './sectionUtils';

export const ensureWrite = (auth: McpAuthContext): ToolTextResult | null =>
  canWrite(auth) ? null : errorResult('This token is read-only.');

/**
 * Sections created by the app start as placeholders so the preview can show
 * sample text. Once a section holds real content that flag must go, otherwise
 * the renderer keeps drawing the sample text instead of the content.
 */
const syncPlaceholderFlags = (resume: ResumeDocument): ResumeDocument => ({
  ...resume,
  content: {
    ...resume.content,
    sections: resume.content.sections.map((section) =>
      section.isPlaceholder && sectionItemCount(section) > 0
        ? { ...section, isPlaceholder: false }
        : section
    ),
  },
});

/**
 * Reads, mutates, validates, and conditionally writes a resume.
 * The validated object is intentionally not used for the write: `next` keeps
 * unknown fields from future app versions that the current schema ignores.
 */
export const mutateResume = async (
  store: ResumeStore,
  auth: McpAuthContext,
  resumeId: string,
  expectedVersion: number,
  mutate: (current: ResumeDocument) => ResumeDocument
): Promise<ToolTextResult> => {
  const denied = ensureWrite(auth);
  if (denied) return denied;

  const current = await store.getResume(resumeId);
  if (!current) {
    return errorResult(`Resume "${resumeId}" was not found.`);
  }

  const next = syncPlaceholderFlags(mutate(current));
  const validation = resumeDocumentSchema.safeParse(next);
  if (!validation.success) {
    return errorResult(
      'The update would produce an invalid resume document.',
      validation.error.issues
    );
  }

  const result = await store.updateResume(next, expectedVersion);
  if (result.ok) {
    return jsonResult(result.resume);
  }

  if (result.reason === 'conflict') {
    return errorResult(
      'The resume changed since it was read. Re-read it and retry with the latest version.',
      { latest: result.latest }
    );
  }

  return errorResult(result.message);
};
