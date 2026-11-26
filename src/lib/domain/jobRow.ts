import {
  JobApplication,
  JobApplicationInput,
  normalizeJobStatus,
  normalizeWorkMode,
} from '../../types/job';

export interface JobRow {
  id: string;
  user_id?: string | null;
  resume_id?: string | null;
  company: string;
  role: string;
  status?: string | null;
  work_mode?: string | null;
  location?: string | null;
  salary_range?: string | null;
  job_url?: string | null;
  applied_date?: string | null;
  job_description?: string | null;
  notes?: string | null;
  version?: number | null;
  created_at?: string | null;
  updated_at: string;
}

export const mapJobRowToDocument = (row: JobRow): JobApplication => ({
  id: row.id,
  company: row.company || '',
  role: row.role || '',
  status: normalizeJobStatus(row.status),
  workMode: normalizeWorkMode(row.work_mode),
  location: row.location ?? '',
  salaryRange: row.salary_range ?? '',
  jobUrl: row.job_url ?? '',
  appliedDate: row.applied_date ?? undefined,
  resumeId: row.resume_id ?? undefined,
  jobDescription: row.job_description ?? '',
  notes: row.notes ?? '',
  createdAt: row.created_at ?? row.updated_at,
  updatedAt: row.updated_at,
  version: typeof row.version === 'number' ? row.version : 1,
});

export const buildJobRowPayload = (
  job: JobApplication,
  version: number,
  userId?: string
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: job.id,
    resume_id: job.resumeId?.trim() ? job.resumeId.trim() : null,
    company: job.company.trim(),
    role: job.role.trim(),
    status: normalizeJobStatus(job.status),
    work_mode: normalizeWorkMode(job.workMode),
    location: job.location.trim(),
    salary_range: job.salaryRange.trim(),
    job_url: job.jobUrl.trim(),
    applied_date: job.appliedDate?.trim() ? job.appliedDate.trim() : null,
    job_description: job.jobDescription,
    notes: job.notes,
    updated_at: new Date().toISOString(),
    version,
  };

  if (userId) {
    payload.user_id = userId;
  }

  return payload;
};

export const createJobApplication = (
  input: JobApplicationInput,
  id?: string
): JobApplication => {
  const now = new Date().toISOString();
  const status = normalizeJobStatus(input.status);
  const defaultAppliedDate = input.appliedDate?.trim() || now.slice(0, 10);

  return {
    id: id || `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    company: input.company.trim(),
    role: input.role.trim(),
    status,
    workMode: normalizeWorkMode(input.workMode),
    location: (input.location ?? '').trim(),
    salaryRange: (input.salaryRange ?? '').trim(),
    jobUrl: (input.jobUrl ?? '').trim(),
    appliedDate: defaultAppliedDate,
    resumeId: input.resumeId?.trim() || undefined,
    jobDescription: input.jobDescription ?? '',
    notes: input.notes ?? '',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
};
