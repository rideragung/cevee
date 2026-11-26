import type { ResumeContent, ResumeDocument } from '../../types/resume';
import { normalizeLayoutId } from '../../layouts/ids';

export interface ResumeRow {
  id: string;
  title: string;
  layout_id?: string | null;
  content: ResumeContent;
  created_at?: string | null;
  updated_at: string;
  version?: number | null;
}

/**
 * Single mapping used by the web app and the MCP Supabase store so both
 * surfaces interpret the same row identically.
 */
export const mapResumeRowToDocument = (row: ResumeRow): ResumeDocument => ({
  id: row.id,
  title: row.title,
  layoutId: normalizeLayoutId(row.layout_id ?? undefined),
  createdAt: row.created_at ?? row.updated_at,
  updatedAt: row.updated_at,
  version: typeof row.version === 'number' ? row.version : 1,
  content: row.content,
});

export const buildResumeRowPayload = (
  resume: ResumeDocument,
  version: number,
  userId?: string
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: resume.id,
    title: resume.title,
    layout_id: normalizeLayoutId(resume.layoutId),
    content: resume.content,
    updated_at: new Date().toISOString(),
    version,
  };

  if (userId) {
    payload.user_id = userId;
  }

  return payload;
};
