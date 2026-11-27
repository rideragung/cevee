import {
  ACTIVE_JOB_STATUSES,
  type ActiveJobStatus,
  JobApplication,
  JobApplicationInput,
  normalizeEmploymentType,
  normalizeJobIndustry,
  normalizeJobPlatform,
  normalizeJobStatus,
  normalizeProgressStage,
  normalizeWorkMode,
} from '../../types/job';

export interface JobRow {
  id: string;
  user_id?: string | null;
  resume_id?: string | null;
  company: string;
  role: string;
  status?: string | null;
  archived_from?: string | null;
  progress_stage?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  location?: string | null;
  province_code?: string | null;
  regency_code?: string | null;
  job_platform?: string | null;
  industry?: string | null;
  salary_range?: string | null;
  job_url?: string | null;
  applied_date?: string | null;
  interview_date?: string | null;
  job_description?: string | null;
  notes?: string | null;
  version?: number | null;
  created_at?: string | null;
  updated_at: string;
}

export const mapJobRowToDocument = (row: JobRow): JobApplication => {
  const status = normalizeJobStatus(row.status);
  const progressStage = normalizeProgressStage(row.progress_stage);

  return {
    id: row.id,
    company: row.company || '',
    role: row.role || '',
    status,
    archivedFrom: status === 'archived' && ACTIVE_JOB_STATUSES.includes(row.archived_from as ActiveJobStatus)
      ? row.archived_from as ActiveJobStatus : undefined,
    progressStage,
    employmentType: normalizeEmploymentType(row.employment_type),
    workMode: normalizeWorkMode(row.work_mode),
    location: row.location ?? '',
    provinceCode: row.province_code ?? undefined,
    regencyCode: row.regency_code ?? undefined,
    jobPlatform: normalizeJobPlatform(row.job_platform),
    industry: normalizeJobIndustry(row.industry),
    salaryRange: row.salary_range ?? '',
    jobUrl: row.job_url ?? '',
    appliedDate: row.applied_date ?? undefined,
    interviewDate: row.interview_date ?? undefined,
    resumeId: row.resume_id ?? undefined,
    jobDescription: row.job_description ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at ?? row.updated_at,
    updatedAt: row.updated_at,
    version: typeof row.version === 'number' ? row.version : 1,
  };
};

export const buildJobRowPayload = (
  job: JobApplication,
  version: number,
  userId?: string
): Record<string, unknown> => {
  const status = normalizeJobStatus(job.status);
  const progressStage = normalizeProgressStage(job.progressStage) ?? null;

  const payload: Record<string, unknown> = {
    id: job.id,
    resume_id: job.resumeId?.trim() ? job.resumeId.trim() : null,
    company: job.company.trim(),
    role: job.role.trim(),
    status,
    progress_stage: progressStage,
    archived_from: status === 'archived' ? job.archivedFrom ?? null : null,
    employment_type: normalizeEmploymentType(job.employmentType),
    work_mode: normalizeWorkMode(job.workMode),
    location: job.location.trim(),
    province_code: (job.provinceCode ?? '').trim(),
    regency_code: (job.regencyCode ?? '').trim(),
    job_platform: normalizeJobPlatform(job.jobPlatform) ?? '',
    industry: normalizeJobIndustry(job.industry) ?? '',
    salary_range: job.salaryRange.trim(),
    job_url: job.jobUrl.trim(),
    applied_date: job.appliedDate?.trim() ? job.appliedDate.trim() : null,
    interview_date: job.interviewDate?.trim() ? job.interviewDate.trim() : null,
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
  const progressStage = status === 'on_progress' ? normalizeProgressStage(input.progressStage) : undefined;
  const defaultAppliedDate = input.appliedDate?.trim() || now.slice(0, 10);

  return {
    id: id || `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    company: input.company.trim(),
    role: input.role.trim(),
    status,
    progressStage,
    employmentType: normalizeEmploymentType(input.employmentType),
    workMode: normalizeWorkMode(input.workMode),
    location: (input.location ?? '').trim(),
    provinceCode: (input.provinceCode ?? '').trim() || undefined,
    regencyCode: (input.regencyCode ?? '').trim() || undefined,
    jobPlatform: normalizeJobPlatform(input.jobPlatform),
    industry: normalizeJobIndustry(input.industry),
    salaryRange: (input.salaryRange ?? '').trim(),
    jobUrl: (input.jobUrl ?? '').trim(),
    appliedDate: defaultAppliedDate,
    interviewDate: status === 'on_progress' ? input.interviewDate?.trim() || undefined : undefined,
    resumeId: input.resumeId?.trim() || undefined,
    jobDescription: input.jobDescription ?? '',
    notes: input.notes ?? '',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
};
