import type { ResumeDocument } from '../../../types/resume';
import type { JobApplication } from '../../../types/job';
import { normalizeLayoutId } from '../../../layouts/ids';
import type {
  ListJobsOptions,
  ListResumesOptions,
  ResumeStore,
  ResumeSummary,
  StoreJobUpdateResult,
  StoreUpdateResult,
} from './types';

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

/**
 * In-memory store for tool tests and local smoke runs. It mirrors the same
 * version guard as the Supabase store so conflict behaviour is testable.
 */
export class MemoryStore implements ResumeStore {
  private readonly resumes = new Map<string, ResumeDocument>();
  private readonly jobs = new Map<string, JobApplication>();

  constructor(seed: ResumeDocument[] = [], jobSeed: JobApplication[] = []) {
    for (const resume of seed) {
      this.resumes.set(resume.id, structuredClone(resume));
    }
    for (const job of jobSeed) {
      this.jobs.set(job.id, structuredClone(job));
    }
  }

  async listResumes(options: ListResumesOptions = {}): Promise<ResumeSummary[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    return Array.from(this.resumes.values())
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(offset, offset + limit)
      .map(toSummary);
  }

  async getResume(id: string): Promise<ResumeDocument | null> {
    const resume = this.resumes.get(id);
    return resume ? structuredClone(resume) : null;
  }

  async createResume(resume: ResumeDocument): Promise<ResumeDocument> {
    if (this.resumes.has(resume.id)) {
      throw new Error(`Resume "${resume.id}" already exists.`);
    }
    const created: ResumeDocument = {
      ...structuredClone(resume),
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    this.resumes.set(created.id, created);
    return structuredClone(created);
  }

  async updateResume(
    resume: ResumeDocument,
    expectedVersion: number
  ): Promise<StoreUpdateResult> {
    const current = this.resumes.get(resume.id);
    if (!current) {
      return { ok: false, reason: 'conflict', latest: null };
    }

    const currentVersion = current.version ?? 1;
    if (currentVersion !== expectedVersion) {
      return { ok: false, reason: 'conflict', latest: structuredClone(current) };
    }

    const updated: ResumeDocument = {
      ...structuredClone(resume),
      version: expectedVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    this.resumes.set(updated.id, updated);
    return { ok: true, resume: structuredClone(updated) };
  }

  async deleteResume(id: string): Promise<boolean> {
    const deleted = this.resumes.delete(id);
    if (deleted) {
      for (const [jobId, job] of this.jobs.entries()) {
        if (job.resumeId === id) {
          this.jobs.set(jobId, { ...job, resumeId: undefined });
        }
      }
    }
    return deleted;
  }

  async listJobs(options: ListJobsOptions = {}): Promise<JobApplication[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    return Array.from(this.jobs.values())
      .filter((job) => (options.status ? job.status === options.status : true))
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(offset, offset + limit)
      .map((job) => structuredClone(job));
  }

  async getJob(id: string): Promise<JobApplication | null> {
    const job = this.jobs.get(id);
    return job ? structuredClone(job) : null;
  }

  async createJob(job: JobApplication): Promise<JobApplication> {
    if (this.jobs.has(job.id)) {
      throw new Error(`Job application "${job.id}" already exists.`);
    }
    const now = new Date().toISOString();
    const created: JobApplication = {
      ...structuredClone(job),
      version: 1,
      createdAt: job.createdAt || now,
      updatedAt: now,
    };
    this.jobs.set(created.id, created);
    return structuredClone(created);
  }

  async updateJob(
    job: JobApplication,
    expectedVersion: number
  ): Promise<StoreJobUpdateResult> {
    const current = this.jobs.get(job.id);
    if (!current) {
      return { ok: false, reason: 'conflict', latest: null };
    }

    const currentVersion = current.version ?? 1;
    if (currentVersion !== expectedVersion) {
      return { ok: false, reason: 'conflict', latest: structuredClone(current) };
    }

    const updated: JobApplication = {
      ...structuredClone(job),
      version: expectedVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(updated.id, updated);
    return { ok: true, job: structuredClone(updated) };
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }
}
