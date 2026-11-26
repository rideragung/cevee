import type { ResumeDocument, ResumeLanguage, ResumeLayoutId } from '../../../types/resume';

export interface ResumeSummary {
  id: string;
  title: string;
  layoutId: ResumeLayoutId;
  updatedAt: string;
  version: number;
  candidateName: string;
  sectionCount: number;
  language: ResumeLanguage;
}

export interface ListResumesOptions {
  limit?: number;
  offset?: number;
}

export type StoreUpdateResult =
  | { ok: true; resume: ResumeDocument }
  | { ok: false; reason: 'conflict'; latest: ResumeDocument | null }
  | { ok: false; reason: 'error'; message: string };

export interface ResumeStore {
  listResumes(options?: ListResumesOptions): Promise<ResumeSummary[]>;
  getResume(id: string): Promise<ResumeDocument | null>;
  createResume(resume: ResumeDocument): Promise<ResumeDocument>;
  updateResume(resume: ResumeDocument, expectedVersion: number): Promise<StoreUpdateResult>;
  deleteResume(id: string): Promise<boolean>;
}
