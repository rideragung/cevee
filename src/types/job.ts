export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'archived';

export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export const JOB_STATUSES: readonly JobStatus[] = [
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
  'archived',
] as const;

export const BOARD_JOB_STATUSES: readonly JobStatus[] = [
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
] as const;

export const WORK_MODES: readonly WorkMode[] = ['onsite', 'hybrid', 'remote'] as const;

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  wishlist: 'Saved',
  applied: 'Applied',
  interview: 'Interviewing',
  offer: 'Offer received',
  rejected: 'Not selected',
  archived: 'Archived',
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
};

export const normalizeJobStatus = (value?: string | null): JobStatus => {
  if (value && (JOB_STATUSES as readonly string[]).includes(value)) {
    return value as JobStatus;
  }
  return 'wishlist';
};

export const normalizeWorkMode = (value?: string | null): WorkMode => {
  if (value && (WORK_MODES as readonly string[]).includes(value)) {
    return value as WorkMode;
  }
  return 'onsite';
};

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  workMode: WorkMode;
  location: string;
  salaryRange: string;
  jobUrl: string;
  appliedDate?: string; // ISO date YYYY-MM-DD or month-year string
  resumeId?: string;
  jobDescription: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface JobApplicationInput {
  company: string;
  role: string;
  status?: JobStatus;
  workMode?: WorkMode;
  location?: string;
  salaryRange?: string;
  jobUrl?: string;
  appliedDate?: string;
  resumeId?: string;
  jobDescription?: string;
  notes?: string;
}
