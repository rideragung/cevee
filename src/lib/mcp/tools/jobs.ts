import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {
  EMPLOYMENT_TYPES,
  JOB_INDUSTRIES,
  JOB_PLATFORMS,
  JOB_PROGRESS_STAGES,
  JOB_STATUSES,
  WORK_MODES,
  normalizeEmploymentType,
  normalizeJobIndustry,
  normalizeJobPlatform,
  normalizeJobStatus,
  normalizeProgressStage,
  normalizeWorkMode,
  type JobApplication,
} from '../../../types/job';
import { createJobApplication } from '../../domain/jobRow';
import { matchJobToResume } from '../../domain/jdMatch';
import type { McpAuthContext } from '../auth';
import type { ResumeStore } from '../store/types';
import { ensureWrite } from './mutate';
import { errorResult, jsonResult } from './result';

const jobStatusEnum = z.enum(JOB_STATUSES);
const progressStageEnum = z.enum(JOB_PROGRESS_STAGES);
const employmentTypeEnum = z.enum(EMPLOYMENT_TYPES);
const workModeEnum = z.enum(WORK_MODES);
const jobPlatformEnum = z.enum(JOB_PLATFORMS);
const jobIndustryEnum = z.enum(JOB_INDUSTRIES);

export const registerJobTools = (
  server: McpServer,
  store: ResumeStore,
  auth: McpAuthContext
): void => {
  server.registerTool(
    'list_jobs',
    {
      title: 'List tracked job applications',
      description:
        'List tracked job applications (active non-archived applications by default; pass status "archived" or includeArchived: true to view archived ones).',
      inputSchema: z.object({
        status: jobStatusEnum.optional(),
        progressStage: progressStageEnum.optional(),
        employmentType: employmentTypeEnum.optional(),
        jobPlatform: jobPlatformEnum.optional(),
        industry: jobIndustryEnum.optional(),
        includeArchived: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ status, progressStage, employmentType, jobPlatform, industry, includeArchived, limit, offset }) => {
      if (!store.listJobs) {
        return errorResult('Job tracker storage is not available on this store.');
      }
      const jobs = await store.listJobs({ status, limit, offset });
      const filtered = jobs.filter((job) => {
        if (!status && !includeArchived && job.status === 'archived') return false;
        if (progressStage && job.progressStage !== progressStage) return false;
        if (employmentType && job.employmentType !== employmentType) return false;
        if (jobPlatform && job.jobPlatform !== jobPlatform) return false;
        if (industry && job.industry !== industry) return false;
        return true;
      });
      return jsonResult(filtered);
    }
  );

  server.registerTool(
    'get_job',
    {
      title: 'Get job application',
      description:
        'Read one tracked job application, including its full job description, notes, and keyword match against the linked resume if present.',
      inputSchema: z.object({
        jobId: z.string(),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ jobId }) => {
      if (!store.getJob) {
        return errorResult('Job tracker storage is not available on this store.');
      }
      const job = await store.getJob(jobId);
      if (!job) {
        return errorResult(`Job application "${jobId}" was not found.`);
      }

      let jdMatch = null;
      if (job.resumeId && job.jobDescription.trim()) {
        const linkedResume = await store.getResume(job.resumeId);
        if (linkedResume) {
          jdMatch = matchJobToResume(job.jobDescription, job.role, linkedResume);
        }
      }

      return jsonResult({
        ...job,
        jdMatch,
      });
    }
  );

  server.registerTool(
    'create_job',
    {
      title: 'Create job application',
      description:
        'Add a new job application to the Cevee Job Tracker and optionally link an existing resume id.',
      inputSchema: z.object({
        company: z.string().min(1),
        role: z.string().min(1),
        status: jobStatusEnum.optional(),
        progressStage: progressStageEnum.optional(),
        employmentType: employmentTypeEnum.optional(),
        workMode: workModeEnum.optional(),
        location: z.string().optional(),
        provinceCode: z.string().optional(),
        regencyCode: z.string().optional(),
        jobPlatform: jobPlatformEnum.optional(),
        industry: jobIndustryEnum.optional(),
        salaryRange: z.string().optional(),
        jobUrl: z.string().optional(),
        appliedDate: z.string().optional(),
        interviewDate: z.string().optional(),
        resumeId: z.string().optional(),
        jobDescription: z.string().optional(),
        notes: z.string().optional(),
      }),
    },
    async (input) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;
      if (!store.createJob) {
        return errorResult('Job tracker storage is not available on this store.');
      }

      const draft = createJobApplication(input);
      const created = await store.createJob(draft);
      return jsonResult(created);
    }
  );

  server.registerTool(
    'update_job',
    {
      title: 'Update job application',
      description:
        'Update a tracked job application stage, linked resume, job description, or notes. Requires the current version.',
      inputSchema: z.object({
        jobId: z.string(),
        expectedVersion: z.number().int().min(1),
        company: z.string().min(1).optional(),
        role: z.string().min(1).optional(),
        status: jobStatusEnum.optional(),
        progressStage: progressStageEnum.nullable().optional(),
        employmentType: employmentTypeEnum.optional(),
        workMode: workModeEnum.optional(),
        location: z.string().optional(),
        provinceCode: z.string().nullable().optional(),
        regencyCode: z.string().nullable().optional(),
        jobPlatform: jobPlatformEnum.nullable().optional(),
        industry: jobIndustryEnum.nullable().optional(),
        salaryRange: z.string().optional(),
        jobUrl: z.string().optional(),
        appliedDate: z.string().optional(),
        interviewDate: z.string().nullable().optional(),
        resumeId: z.string().nullable().optional(),
        jobDescription: z.string().optional(),
        notes: z.string().optional(),
      }),
    },
    async ({
      jobId,
      expectedVersion,
      company,
      role,
      status,
      progressStage,
      employmentType,
      workMode,
      location,
      provinceCode,
      regencyCode,
      jobPlatform,
      industry,
      salaryRange,
      jobUrl,
      appliedDate,
      interviewDate,
      resumeId,
      jobDescription,
      notes,
    }) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;
      if (!store.getJob || !store.updateJob) {
        return errorResult('Job tracker storage is not available on this store.');
      }

      const current = await store.getJob(jobId);
      if (!current) {
        return errorResult(`Job application "${jobId}" was not found.`);
      }

      const currentVersion = current.version ?? 1;
      if (currentVersion !== expectedVersion) {
        return errorResult(
          'The job application changed since it was read. Re-read it and retry with the latest version.',
          { latest: current }
        );
      }

      const nextStatus = status !== undefined ? normalizeJobStatus(status) : current.status;
      const nextProgressStage =
        progressStage === null
          ? undefined
          : progressStage !== undefined
          ? normalizeProgressStage(progressStage)
          : nextStatus === 'on_progress'
          ? current.progressStage ?? 'hr_interview'
          : current.progressStage;

      const next: JobApplication = {
        ...current,
        company: company !== undefined ? company.trim() : current.company,
        role: role !== undefined ? role.trim() : current.role,
        status: nextStatus,
        progressStage: nextProgressStage,
        employmentType:
          employmentType !== undefined
            ? normalizeEmploymentType(employmentType)
            : current.employmentType,
        workMode: workMode !== undefined ? normalizeWorkMode(workMode) : current.workMode,
        location: location !== undefined ? location.trim() : current.location,
        provinceCode:
          provinceCode === null
            ? undefined
            : provinceCode !== undefined
            ? provinceCode.trim() || undefined
            : current.provinceCode,
        regencyCode:
          regencyCode === null
            ? undefined
            : regencyCode !== undefined
            ? regencyCode.trim() || undefined
            : current.regencyCode,
        jobPlatform:
          jobPlatform === null
            ? undefined
            : jobPlatform !== undefined
            ? normalizeJobPlatform(jobPlatform)
            : current.jobPlatform,
        industry:
          industry === null
            ? undefined
            : industry !== undefined
            ? normalizeJobIndustry(industry)
            : current.industry,
        salaryRange: salaryRange !== undefined ? salaryRange.trim() : current.salaryRange,
        jobUrl: jobUrl !== undefined ? jobUrl.trim() : current.jobUrl,
        appliedDate:
          appliedDate !== undefined ? appliedDate.trim() || undefined : current.appliedDate,
        interviewDate:
          interviewDate === null
            ? undefined
            : interviewDate !== undefined
            ? interviewDate.trim() || undefined
            : current.interviewDate,
        resumeId:
          resumeId === null
            ? undefined
            : resumeId !== undefined
            ? resumeId.trim() || undefined
            : current.resumeId,
        jobDescription:
          jobDescription !== undefined ? jobDescription : current.jobDescription,
        notes: notes !== undefined ? notes : current.notes,
        updatedAt: new Date().toISOString(),
      };

      const saved = await store.updateJob(next, expectedVersion);
      if (!saved.ok) {
        if (saved.reason === 'conflict') {
          return errorResult(
            'The job application changed since it was read. Re-read it and retry with the latest version.',
            { latest: saved.latest }
          );
        }
        return errorResult(saved.message);
      }

      return jsonResult(saved.job);
    }
  );

  server.registerTool(
    'delete_job',
    {
      title: 'Delete job application',
      description:
        'Permanently delete one tracked job application. Requires confirm: true.',
      inputSchema: z.object({
        jobId: z.string(),
        confirm: z.boolean(),
      }),
      annotations: { destructiveHint: true },
    },
    async ({ jobId, confirm }) => {
      const denied = ensureWrite(auth);
      if (denied) return denied;
      if (!store.deleteJob) {
        return errorResult('Job tracker storage is not available on this store.');
      }
      if (!confirm) {
        return errorResult('Set confirm: true to delete a job application.');
      }

      const deleted = await store.deleteJob(jobId);
      if (!deleted) {
        return errorResult(`Job application "${jobId}" was not found or already deleted.`);
      }

      return jsonResult({ deleted: true, jobId });
    }
  );

  server.registerTool(
    'match_job_resume',
    {
      title: 'Match job description keywords against a resume',
      description:
        'Compare a tracked job application (by jobId) or raw jobDescription text against a resumeId and return the ATS keyword match percentage, matched keywords, and missing keywords.',
      inputSchema: z.object({
        resumeId: z.string(),
        jobId: z.string().optional(),
        jobDescription: z.string().optional(),
        roleTitle: z.string().optional(),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    async ({ resumeId, jobId, jobDescription, roleTitle }) => {
      const resume = await store.getResume(resumeId);
      if (!resume) {
        return errorResult(`Resume "${resumeId}" was not found.`);
      }

      let jdText = jobDescription ?? '';
      let role = roleTitle ?? '';

      if (jobId && store.getJob) {
        const job = await store.getJob(jobId);
        if (!job) {
          return errorResult(`Job application "${jobId}" was not found.`);
        }
        if (!jdText) jdText = job.jobDescription;
        if (!role) role = job.role;
      }

      if (!jdText.trim() && !role.trim()) {
        return errorResult('Provide a jobDescription or a jobId with a saved job description.');
      }

      const match = matchJobToResume(jdText, role, resume);
      return jsonResult(
        match ?? {
          score: 0,
          matchedKeywords: [],
          missingKeywords: [],
          totalKeywords: 0,
        }
      );
    }
  );
};
