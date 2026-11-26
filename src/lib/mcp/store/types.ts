import type { ResumeDocument, ResumeLanguage, ResumeLayoutId } from '../../../types/resume';
import type { JobApplication, JobStatus } from '../../../types/job';

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

export interface ListJobsOptions {
  status?: JobStatus;
  limit?: number;
  offset?: number;
}

export type StoreUpdateResult =
  | { ok: true; resume: ResumeDocument }
  | { ok: false; reason: 'conflict'; latest: ResumeDocument | null }
  | { ok: false; reason: 'error'; message: string };

export type StoreJobUpdateResult =
  | { ok: true; job: JobApplication }
  | { ok: false; reason: 'conflict'; latest: JobApplication | null }
  | { ok: false; reason: 'error'; message: string };

export interface ResumeStore {
  listResumes(options?: ListResumesOptions): Promise<ResumeSummary[]>;
  getResume(id: string): Promise<ResumeDocument | null>;
  createResume(resume: ResumeDocument): Promise<ResumeDocument>;
  updateResume(resume: ResumeDocument, expectedVersion: number): Promise<StoreUpdateResult>;
  deleteResume(id: string): Promise<boolean>;

  listJobs?(options?: ListJobsOptions): Promise<JobApplication[]>;
  getJob?(id: string): Promise<JobApplication | null>;
  createJob?(job: JobApplication): Promise<JobApplication>;
  updateJob?(job: JobApplication, expectedVersion: number): Promise<StoreJobUpdateResult>;
  deleteJob?(id: string): Promise<boolean>;
}
