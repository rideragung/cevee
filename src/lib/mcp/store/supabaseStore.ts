import type { SupabaseClient } from '@supabase/supabase-js';
import type { ResumeDocument } from '../../../types/resume';
import { normalizeLayoutId } from '../../../layouts/ids';
import {
  buildResumeRowPayload,
  mapResumeRowToDocument,
  type ResumeRow,
} from '../../domain/resumeRow';
import { migrateResumeDocument } from '../../domain/migrations';
import type {
  ListResumesOptions,
  ResumeStore,
  ResumeSummary,
  StoreUpdateResult,
} from './types';

const SUMMARY_COLUMNS = 'id,title,layout_id,updated_at,version,content';

const toSummary = (resume: ResumeDocument): ResumeSummary => ({
  id: resume.id,
  title: resume.title,
  layoutId: normalizeLayoutId(resume.layoutId),
  updatedAt: resume.updatedAt,
  version: resume.version ?? 1,
  candidateName: resume.content.header.fullName,
  sectionCount: resume.content.sections.length,
  language: resume.content.language ?? 'en',
});

const versionMigrationMessage =
  'The resumes.version column is missing. Run supabase/migrations/20261126_add_resume_version.sql.';

/**
 * RLS-scoped Supabase store. The injected client must carry the end user's
 * access token (OAuth or local session); the store never uses a service role.
 */
export class SupabaseResumeStore implements ResumeStore {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string
  ) {}

  async listResumes(options: ListResumesOptions = {}): Promise<ResumeSummary[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const { data, error } = await this.client
      .from('resumes')
      .select(SUMMARY_COLUMNS)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as ResumeRow[]).map((row) =>
      toSummary(migrateResumeDocument(mapResumeRowToDocument(row)))
    );
  }

  async getResume(id: string): Promise<ResumeDocument | null> {
    const { data, error } = await this.client
      .from('resumes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data
      ? migrateResumeDocument(mapResumeRowToDocument(data as ResumeRow))
      : null;
  }

  async createResume(resume: ResumeDocument): Promise<ResumeDocument> {
    const { data, error } = await this.client
      .from('resumes')
      .insert(buildResumeRowPayload(resume, 1, this.userId))
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return migrateResumeDocument(mapResumeRowToDocument(data as ResumeRow));
  }

  async updateResume(
    resume: ResumeDocument,
    expectedVersion: number
  ): Promise<StoreUpdateResult> {
    const { data, error } = await this.client
      .from('resumes')
      .update(buildResumeRowPayload(resume, expectedVersion + 1))
      .eq('id', resume.id)
      .eq('version', expectedVersion)
      .select('*')
      .maybeSingle();

    if (error) {
      if (/version/i.test(error.message)) {
        return { ok: false, reason: 'error', message: versionMigrationMessage };
      }
      return { ok: false, reason: 'error', message: error.message };
    }

    if (!data) {
      const latest = await this.getResume(resume.id);
      return { ok: false, reason: 'conflict', latest };
    }

    return { ok: true, resume: migrateResumeDocument(mapResumeRowToDocument(data as ResumeRow)) };
  }

  async deleteResume(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('resumes')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      throw new Error(error.message);
    }

    return Array.isArray(data) && data.length > 0;
  }
}
