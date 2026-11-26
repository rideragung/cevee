import type { ResumeContent, ResumeDocument } from '../../types/resume';
import { RESUME_SCHEMA_VERSION } from './resumeFactory';

export const CURRENT_RESUME_SCHEMA_VERSION = RESUME_SCHEMA_VERSION;

/**
 * Normalizes older resume documents without dropping unknown fields.
 * Spreading the original objects is intentional: a newer app feature must
 * survive an MCP read/write cycle even if the MCP schema does not know it yet.
 */
export const migrateResumeDocument = (input: ResumeDocument): ResumeDocument => {
  const document = input as ResumeDocument;
  const content = (document.content || {}) as Partial<ResumeContent>;

  return {
    ...document,
    version: typeof document.version === 'number' ? document.version : 1,
    content: {
      ...content,
      language: content.language ?? 'en',
      schemaVersion:
        typeof content.schemaVersion === 'number'
          ? content.schemaVersion
          : CURRENT_RESUME_SCHEMA_VERSION,
      header: content.header as ResumeContent['header'],
      sections: content.sections ?? [],
    },
  };
};

export const migrateResumeDocuments = (documents: ResumeDocument[]): ResumeDocument[] =>
  documents.map(migrateResumeDocument);
