import type { SupabaseClient } from '@supabase/supabase-js';
import type { ResumeDocument } from '../../../types/resume';
import type { JobApplication } from '../../../types/job';
import { normalizeLayoutId } from '../../../layouts/ids';
import {
  buildResumeRowPayload,
  mapResumeRowToDocument,
  type ResumeRow,
} from '../../domain/resumeRow';
import {
  buildJobRowPayload,
  mapJobRowToDocument,
  type JobRow,
} from '../../domain/jobRow';
import { migrateResumeDocument } from '../../domain/migrations';
import type {
  ListJobsOptions,
  ListResumesOptions,
  ResumeStore,
  ResumeSummary,
  StoreJobUpdateResult,
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

const jobsTableMigrationMessage =
  'The public.job_applications table is missing. Run supabase/migrations/20261127_add_job_applications.sql.';

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

  async listJobs(options: ListJobsOptions = {}): Promise<JobApplication[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    let query = this.client
      .from('job_applications')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;

    if (error) {
      if (/job_applications/i.test(error.message)) {
        throw new Error(jobsTableMigrationMessage);
      }
      throw new Error(error.message);
    }

    return ((data ?? []) as JobRow[]).map(mapJobRowToDocument);
  }

  async getJob(id: string): Promise<JobApplication | null> {
    const { data, error } = await this.client
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (/job_applications/i.test(error.message)) {
        throw new Error(jobsTableMigrationMessage);
      }
      throw new Error(error.message);
    }

    return data ? mapJobRowToDocument(data as JobRow) : null;
  }

  async createJob(job: JobApplication): Promise<JobApplication> {
    const { data, error } = await this.client
      .from('job_applications')
      .insert(buildJobRowPayload(job, 1, this.userId))
      .select('*')
      .single();

    if (error) {
      if (/job_applications/i.test(error.message)) {
        throw new Error(jobsTableMigrationMessage);
      }
      throw new Error(error.message);
    }

    return mapJobRowToDocument(data as JobRow);
  }

  async updateJob(
    job: JobApplication,
    expectedVersion: number
  ): Promise<StoreJobUpdateResult> {
    const { data, error } = await this.client
      .from('job_applications')
      .update(buildJobRowPayload(job, expectedVersion + 1))
      .eq('id', job.id)
      .eq('version', expectedVersion)
      .select('*')
      .maybeSingle();

    if (error) {
      if (/job_applications/i.test(error.message)) {
        return { ok: false, reason: 'error', message: jobsTableMigrationMessage };
      }
      return { ok: false, reason: 'error', message: error.message };
    }

    if (!data) {
      const latest = await this.getJob(job.id);
      return { ok: false, reason: 'conflict', latest };
    }

    return { ok: true, job: mapJobRowToDocument(data as JobRow) };
  }

  async deleteJob(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('job_applications')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      if (/job_applications/i.test(error.message)) {
        throw new Error(jobsTableMigrationMessage);
      }
      throw new Error(error.message);
    }

    return Array.isArray(data) && data.length > 0;
  }
}
