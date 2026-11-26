import React from 'react';
import {
  IconArchive as Archive,
  IconChecks as Checks,
  IconCircleCheck as CircleCheck,
  IconCircleX as CircleX,
  IconClipboardCheck as ClipboardCheck,
  IconClock as Clock,
  IconCode as Code,
  IconNotebook as Notebook,
  IconSend as Send,
  IconUserCheck as UserCheck,
  IconUsers as Users,
} from '@tabler/icons-react';
import type { JobApplication, JobProgressStage, JobStatus } from '../../types/job';

export type JobSortKey = 'updated' | 'applied' | 'company';

export const JOB_SORT_OPTIONS: { key: JobSortKey; label: string }[] = [
  { key: 'updated', label: 'Last updated' },
  { key: 'applied', label: 'Applied date' },
  { key: 'company', label: 'Company (A–Z)' },
];

export const getStatusIcon = (status: JobStatus, className = 'size-3.5 shrink-0') => {
  switch (status) {
    case 'applied':
      return <Send className={className} />;
    case 'on_progress':
      return <Clock className={className} />;
    case 'offering':
      return <CircleCheck className={className} />;
    case 'rejected':
      return <CircleX className={className} />;
    case 'archived':
      return <Archive className={className} />;
  }
};

export const getStatusPillClasses = (status: JobStatus): string => {
  switch (status) {
    case 'applied':
      return 'border-border bg-secondary text-foreground';
    case 'on_progress':
      return 'border-primary/25 bg-accent text-primary';
    case 'offering':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'rejected':
      return 'border-rose-200 bg-rose-50 text-rose-800';
    case 'archived':
      return 'border-border bg-muted text-muted-foreground';
  }
};

export const getProgressStageIcon = (
  stage: JobProgressStage,
  className = 'size-3 shrink-0'
) => {
  switch (stage) {
    case 'hr_interview':
      return <UserCheck className={className} />;
    case 'assessment_test':
      return <ClipboardCheck className={className} />;
    case 'technical_test':
      return <Code className={className} />;
    case 'user_interview':
      return <Users className={className} />;
    case 'preparing_interview':
      return <Notebook className={className} />;
    case 'interview_finished':
      return <Checks className={className} />;
  }
};

export const formatAppliedDate = (isoDate: string): string => {
  try {
    const parts = isoDate.split('-').map(Number);
    const date =
      parts.length === 3 && parts.every((n) => Number.isFinite(n))
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
};

export const sortJobs = (list: JobApplication[], sortBy: JobSortKey): JobApplication[] => {
  const toTime = (value?: string) => {
    const time = value ? new Date(value).getTime() : NaN;
    return Number.isNaN(time) ? 0 : time;
  };

  const sorted = [...list];
  switch (sortBy) {
    case 'applied':
      sorted.sort(
        (a, b) =>
          toTime(b.appliedDate || b.createdAt || b.updatedAt) -
          toTime(a.appliedDate || a.createdAt || a.updatedAt)
      );
      break;
    case 'company':
      sorted.sort((a, b) => a.company.localeCompare(b.company));
      break;
    default:
      sorted.sort((a, b) => toTime(b.updatedAt) - toTime(a.updatedAt));
  }
  return sorted;
};
