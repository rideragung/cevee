import type { ResumeDocument } from '../../../types/resume';
import { normalizeLayoutId } from '../../../layouts/ids';
import type {
  ListResumesOptions,
  ResumeStore,
  ResumeSummary,
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

  constructor(seed: ResumeDocument[] = []) {
    for (const resume of seed) {
      this.resumes.set(resume.id, structuredClone(resume));
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
    return this.resumes.delete(id);
  }
}
