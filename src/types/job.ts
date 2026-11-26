export type JobStatus = 'applied' | 'on_progress' | 'offering' | 'rejected' | 'archived';

export type ActiveJobStatus = Exclude<JobStatus, 'archived'>;

export type JobProgressStage =
  | 'hr_interview'
  | 'assessment_test'
  | 'technical_test'
  | 'user_interview'
  | 'preparing_interview'
  | 'interview_finished';

export type EmploymentType =
  | 'full_time'
  | 'internship'
  | 'contract'
  | 'part_time'
  | 'freelance'
  | 'other';

export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export const ACTIVE_JOB_STATUSES: readonly ActiveJobStatus[] = [
  'applied',
  'on_progress',
  'offering',
  'rejected',
] as const;

export const BOARD_JOB_STATUSES: readonly ActiveJobStatus[] = ACTIVE_JOB_STATUSES;

export const JOB_STATUSES: readonly JobStatus[] = [
  'applied',
  'on_progress',
  'offering',
  'rejected',
  'archived',
] as const;

export const JOB_PROGRESS_STAGES: readonly JobProgressStage[] = [
  'hr_interview',
  'assessment_test',
  'technical_test',
  'user_interview',
  'preparing_interview',
  'interview_finished',
] as const;

export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  'full_time',
  'internship',
  'contract',
  'part_time',
  'freelance',
  'other',
] as const;

export const WORK_MODES: readonly WorkMode[] = ['onsite', 'hybrid', 'remote'] as const;

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  applied: 'Applied',
  on_progress: 'On progress',
  offering: 'Offering',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const JOB_PROGRESS_STAGE_LABELS: Record<JobProgressStage, string> = {
  hr_interview: 'HR interview',
  assessment_test: 'Assessment test',
  technical_test: 'Technical test',
  user_interview: 'User interview',
  preparing_interview: 'Preparing interview',
  interview_finished: 'Interview finished',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  internship: 'Internship',
  contract: 'Contract',
  part_time: 'Part-time',
  freelance: 'Freelance',
  other: 'Other',
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
  if (value === 'interview') return 'on_progress';
  if (value === 'wishlist') return 'applied';
  return 'applied';
};

export const normalizeProgressStage = (value?: string | null): JobProgressStage | undefined => {
  if (value && (JOB_PROGRESS_STAGES as readonly string[]).includes(value)) {
    return value as JobProgressStage;
  }
  return undefined;
};

export const normalizeEmploymentType = (value?: string | null): EmploymentType => {
  if (value && (EMPLOYMENT_TYPES as readonly string[]).includes(value)) {
    return value as EmploymentType;
  }
  return 'full_time';
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
  progressStage?: JobProgressStage;
  employmentType: EmploymentType;
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
  progressStage?: JobProgressStage;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  location?: string;
  salaryRange?: string;
  jobUrl?: string;
  appliedDate?: string;
  resumeId?: string;
  jobDescription?: string;
  notes?: string;
}
