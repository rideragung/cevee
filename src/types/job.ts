export type JobStatus = 'on_progress' | 'rejected' | 'offering' | 'archived';

export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export const ACTIVE_JOB_STATUSES: readonly Exclude<JobStatus, 'archived'>[] = [
  'on_progress',
  'rejected',
  'offering',
] as const;

export const BOARD_JOB_STATUSES: readonly Exclude<JobStatus, 'archived'>[] =
  ACTIVE_JOB_STATUSES;

export const JOB_STATUSES: readonly JobStatus[] = [
  'on_progress',
  'rejected',
  'offering',
  'archived',
] as const;

export const WORK_MODES: readonly WorkMode[] = ['onsite', 'hybrid', 'remote'] as const;

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  on_progress: 'On progress',
  rejected: 'Rejected',
  offering: 'Offering',
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
  // Map legacy statuses non-destructively
  if (value === 'offer') return 'offering';
  if (value === 'wishlist' || value === 'applied' || value === 'interview') {
    return 'on_progress';
  }
  return 'on_progress';
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
  appliedDate?: string; // ISO date YYYY-MM-DD
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
