import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconAlertCircle as AlertCircle,
  IconArchive as Archive,
  IconArrowLeft as ArrowLeft,
  IconArrowsSort as ArrowUpDown,
  IconCalendar as Calendar,
  IconCalendarPlus as CalendarPlus,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconCopy as Copy,
  IconDotsVertical as MoreVertical,
  IconEdit as Edit2,
  IconExternalLink as ExternalLink,
  IconEye as Eye,
  IconFileText as FileText,
  IconFilter as Filter,
  IconLayoutKanban as LayoutKanban,
  IconList as List,
  IconPlus as Plus,
  IconRestore as Restore,
  IconSearch as Search,
  IconTrash as Trash2,
  IconX as X,
} from '@tabler/icons-react';
import {
  ActiveJobStatus,
  BOARD_JOB_STATUSES,
  DEFAULT_JOB_FILTERS,
  EMPLOYMENT_TYPE_LABELS,
  JOB_INDUSTRY_LABELS,
  JOB_PLATFORM_LABELS,
  JOB_PROGRESS_STAGE_LABELS,
  JOB_STATUS_CHOICES,
  applicationStatusLabel,
  JOB_STATUS_LABELS,
  JobApplication,
  JobApplicationInput,
  JobFiltersState,
  JobProgressStage,
  JobStatus,
  WORK_MODE_LABELS,
} from '../../types/job';
import { ResumeDocument } from '../../types/resume';
import { matchJobToResume } from '../../lib/domain/jdMatch';
import { downloadJobCalendar, eventLabel, scheduleDate } from '../../lib/domain/jobCalendar';
import { formatRelativeTime } from '../../utils/relativeTime';
import { ConfirmDialog } from '../ConfirmDialog';
import { JobEmptyState } from './JobEmptyState';
import { JobFilterDialog } from './JobFilterDialog';
import { JobFormDialog } from './JobFormDialog';
import { JobTrackerStats } from './JobTrackerStats';
import {
  JOB_SORT_OPTIONS,
  JobSortKey,
  formatAppliedDate,
  formatInterviewDate,
  getStatusPillClasses,
  sortJobs,
} from './jobUiMeta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface JobTrackerViewProps {
  jobs: JobApplication[];
  resumes: ResumeDocument[];
  onSaveJob: (input: JobApplicationInput, existingId?: string) => void;
  onUpdateJobStatus: (
    jobId: string,
    nextStatus: JobStatus,
    nextProgressStage?: JobProgressStage
  ) => void;
  onDeleteJob: (jobId: string) => void;
  onTailorResumeForJob: (
    baseResumeId: string,
    company: string,
    role: string,
    jobId?: string
  ) => string | null;
  onSelectResume: (resumeId: string) => void;
  onPreviewResume: (resumeId: string) => void;
  syncNotice?: React.ReactNode;
  isCloudUser?: boolean;
}

type JobViewMode = 'board' | 'list';
type JobPeriodFilter = { date: string } | { year: number };
const JOB_VIEW_STORAGE_KEY = 'cevee.jobs.view';
const JOB_SORT_STORAGE_KEY = 'cevee.jobs.sort';
const JOB_VIEW_MODES: readonly JobViewMode[] = ['board', 'list'];
const JOB_SORT_KEYS: readonly JobSortKey[] = ['updated', 'applied', 'company'];

const readStoredValue = <T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T
): T => {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

export const JobTrackerView: React.FC<JobTrackerViewProps> = ({
  jobs,
  resumes,
  onSaveJob,
  onUpdateJobStatus,
  onDeleteJob,
  onTailorResumeForJob,
  onSelectResume,
  onPreviewResume,
  syncNotice,
  isCloudUser = false,
}) => {
  const [viewMode, setViewMode] = useState<JobViewMode>(() =>
    readStoredValue(JOB_VIEW_STORAGE_KEY, JOB_VIEW_MODES, 'board')
  );
  const [sortBy, setSortBy] = useState<JobSortKey>(() =>
    readStoredValue(JOB_SORT_STORAGE_KEY, JOB_SORT_KEYS, 'updated')
  );
  const [filters, setFilters] = useState<JobFiltersState>(DEFAULT_JOB_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<JobPeriodFilter | null>(null);
  const dateFilter = periodFilter && 'date' in periodFilter ? periodFilter.date : null;
  const yearFilter = periodFilter && 'year' in periodFilter ? periodFilter.year : null;
  const statusFilter = filters.status;
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [showArchivedView, setShowArchivedView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [defaultFormStatus, setDefaultFormStatus] = useState<ActiveJobStatus>('applied');
  const [deletingJob, setDeletingJob] = useState<JobApplication | null>(null);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ActiveJobStatus | null>(null);
  const [lastArchived, setLastArchived] = useState<{
    id: string;
    label: string;
    prevStatus: ActiveJobStatus;
    prevProgressStage?: JobProgressStage;
  } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [focusField, setFocusField] = useState<'resume' | 'schedule'>();
  const [moveNotice, setMoveNotice] = useState<{ id: string; text: string } | null>(null);
  const moveJob = (job: JobApplication, status: ActiveJobStatus, step?: JobProgressStage) => {
    if (job.status === status && job.progressStage === step) return;
    onUpdateJobStatus(job.id, status, step);
    setMoveNotice({ id: job.id, text: `${job.role} at ${job.company}: ${step ? JOB_PROGRESS_STAGE_LABELS[step] : JOB_STATUS_LABELS[status]}.` });
    requestAnimationFrame(() => (document.getElementById(`move-${job.id}`) ?? document.getElementById('view-moved-job') ?? headingRef.current)?.focus());
  };

  useEffect(() => {
    writeStoredValue(JOB_VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    writeStoredValue(JOB_SORT_STORAGE_KEY, sortBy);
  }, [sortBy]);

  const switchArchivedView = (nextArchived: boolean) => {
    setShowArchivedView(nextArchived);
    setSearchQuery('');
    requestAnimationFrame(() => {
      headingRef.current?.focus();
    });
  };

  const resumeMap = useMemo(() => {
    const map = new Map<string, ResumeDocument>();
    for (const resume of resumes) {
      map.set(resume.id, resume);
    }
    return map;
  }, [resumes]);

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status !== 'archived'),
    [jobs]
  );

  const archivedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'archived'),
    [jobs]
  );

  const stats = useMemo(() => {
    let applied = 0;
    let onProgress = 0;
    let rejected = 0;
    let offering = 0;
    for (const job of activeJobs) {
      if (job.status === 'applied') applied += 1;
      if (job.status === 'on_progress') onProgress += 1;
      if (job.status === 'rejected') rejected += 1;
      if (job.status === 'offering') offering += 1;
    }
    return { total: activeJobs.length, applied, onProgress, rejected, offering };
  }, [activeJobs]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleActiveJobs = useMemo(() => {
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filtered = activeJobs.filter((job) => {
      if (filters.status !== 'all' && job.status !== filters.status) return false;
      if (
        filters.progressStage !== 'all' &&
        (job.status !== 'on_progress' || job.progressStage !== filters.progressStage)
      ) {
        return false;
      }
      if (filters.employmentType !== 'all' && job.employmentType !== filters.employmentType) return false;
      if (filters.workMode !== 'all' && job.workMode !== filters.workMode) return false;
      if (filters.jobPlatform !== 'all' && job.jobPlatform !== filters.jobPlatform) return false;
      if (filters.industry !== 'all' && job.industry !== filters.industry) return false;
      if (filters.upcomingInterviewOnly) {
        const interview = job.interviewDate?.slice(0, 10);
        if (!interview || interview < todayIso || job.status === 'rejected') return false;
      }
      if (filters.unlinkedResumeOnly && job.resumeId) return false;
      if (dateFilter) {
        const jobDate = (job.appliedDate || job.createdAt || '').slice(0, 10);
        if (jobDate !== dateFilter) return false;
      }
      if (yearFilter !== null) {
        const jobYear = Number((job.appliedDate || job.createdAt || '').slice(0, 4));
        if (jobYear !== yearFilter) return false;
      }
      if (!normalizedQuery) return true;
      const linkedTitle = job.resumeId ? resumeMap.get(job.resumeId)?.title || '' : '';
      const stageText = job.progressStage ? JOB_PROGRESS_STAGE_LABELS[job.progressStage] : '';
      const typeText = EMPLOYMENT_TYPE_LABELS[job.employmentType] || '';
      const workModeText = WORK_MODE_LABELS[job.workMode] || '';
      const platformText = job.jobPlatform ? JOB_PLATFORM_LABELS[job.jobPlatform] : '';
      const industryText = job.industry ? JOB_INDUSTRY_LABELS[job.industry] : '';
      const haystack = `${job.company} ${job.role} ${job.location} ${job.notes} ${linkedTitle} ${stageText} ${typeText} ${workModeText} ${platformText} ${industryText}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
    return sortJobs(filtered, sortBy);
  }, [activeJobs, filters, dateFilter, yearFilter, normalizedQuery, sortBy, resumeMap]);

  const visibleArchivedJobs = useMemo(() => {
    const filtered = archivedJobs.filter((job) => {
      if (!normalizedQuery) return true;
      const linkedTitle = job.resumeId ? resumeMap.get(job.resumeId)?.title || '' : '';
      const platformText = job.jobPlatform ? JOB_PLATFORM_LABELS[job.jobPlatform] : '';
      const industryText = job.industry ? JOB_INDUSTRY_LABELS[job.industry] : '';
      const haystack = `${job.company} ${job.role} ${job.location} ${job.notes} ${linkedTitle} ${platformText} ${industryText}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
    return sortJobs(filtered, sortBy);
  }, [archivedJobs, normalizedQuery, sortBy, resumeMap]);

  const boardColumns: readonly ActiveJobStatus[] = useMemo(
    () => (statusFilter !== 'all' && !draggedJobId ? [statusFilter] : BOARD_JOB_STATUSES),
    [statusFilter, draggedJobId]
  );

  const openCreateModal = (initialStage: ActiveJobStatus = 'applied') => {
    setFocusField(undefined);
    setEditingJob(null);
    setDefaultFormStatus(initialStage);
    setIsFormOpen(true);
  };

  const openEditModal = (job: JobApplication, field?: 'resume' | 'schedule') => {
    setFocusField(field);
    setEditingJob(job);
    setDefaultFormStatus(job.status === 'archived' ? 'applied' : job.status);
    setIsFormOpen(true);
  };

  const handleArchiveJob = (job: JobApplication) => {
    setMoveNotice(null);
    if (job.status === 'archived') return;
    setLastArchived({
      id: job.id,
      label: `${job.role} at ${job.company}`,
      prevStatus: job.status,
      prevProgressStage: job.progressStage,
    });
    onUpdateJobStatus(job.id, 'archived');
  };

  const handleUndoArchive = () => {
    if (!lastArchived) return;
    onUpdateJobStatus(
      lastArchived.id,
      lastArchived.prevStatus,
      lastArchived.prevProgressStage
    );
    setLastArchived(null);
  };

  const currentSortLabel =
    JOB_SORT_OPTIONS.find((opt) => opt.key === sortBy)?.label ?? 'Last updated';
  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.progressStage !== 'all' ? 1 : 0) +
    (filters.employmentType !== 'all' ? 1 : 0) +
    (filters.workMode !== 'all' ? 1 : 0) +
    (filters.jobPlatform !== 'all' ? 1 : 0) +
    (filters.industry !== 'all' ? 1 : 0) +
    (filters.upcomingInterviewOnly ? 1 : 0) +
    (filters.unlinkedResumeOnly ? 1 : 0) +
    (periodFilter !== null ? 1 : 0);
  const periodLabel = dateFilter
    ? formatAppliedDate(dateFilter)
    : yearFilter !== null
      ? String(yearFilter)
      : null;
  const hasActiveFilters = Boolean(normalizedQuery) || activeFilterCount > 0;
  const clearAllFilters = (includeSearch = false) => {
    setFilters(DEFAULT_JOB_FILTERS);
    setPeriodFilter(null);
    if (includeSearch) setSearchQuery('');
  };

  const renderStageDropdown = (job: JobApplication, board = false) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={board ? 'inline-flex min-h-11 items-center gap-2 rounded px-1 text-xs font-semibold text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring' : cn(
            'relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors after:absolute after:-inset-1.5 after:content-[""]',
            getStatusPillClasses(job.status)
          )}
          title={`Change status: ${applicationStatusLabel(job)}`}
          id={`move-${job.id}`}
          aria-label={`Change status for ${job.role} at ${job.company}: ${applicationStatusLabel(job)}`}
        >
          <span>{applicationStatusLabel(job)}</span>
          <ChevronDown className="size-3 opacity-70 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {(() => {
          const current = applicationStatusLabel(job);
          const stageRowClasses = (st: ActiveJobStatus, isSelected: boolean) => {
            switch (st) {
              case 'applied':
                return isSelected
                  ? 'bg-violet-100/80 text-violet-800 focus:bg-violet-100 focus:text-violet-800'
                  : 'text-foreground focus:bg-violet-50 focus:text-violet-800';
              case 'on_progress':
                return isSelected
                  ? 'bg-accent text-primary focus:bg-accent focus:text-primary'
                  : 'text-foreground focus:bg-accent focus:text-primary';
              case 'offering':
                return isSelected
                  ? 'bg-emerald-100/80 text-emerald-800 focus:bg-emerald-100 focus:text-emerald-800'
                  : 'text-foreground focus:bg-emerald-50 focus:text-emerald-800';
              case 'rejected':
                return isSelected
                  ? 'bg-rose-100/80 text-rose-800 focus:bg-rose-100 focus:text-rose-800'
                  : 'text-foreground focus:bg-rose-50 focus:text-rose-800';
            }
          };
          const item = (choice: (typeof JOB_STATUS_CHOICES)[number]) => {
            const isSelected = choice.label === current;
            return (
              <DropdownMenuItem
                key={choice.value}
                onClick={() => moveJob(job, choice.status, choice.step)}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs cursor-pointer',
                  isSelected ? 'font-bold' : 'font-normal',
                  stageRowClasses(choice.status, isSelected)
                )}
              >
                <span aria-current={isSelected || undefined}>{choice.label}</span>
                {isSelected && <Check className="size-3.5 shrink-0" />}
              </DropdownMenuItem>
            );
          };
          return (
            <>
              {JOB_STATUS_CHOICES.filter((c) => c.status === 'applied').map(item)}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
                  In progress
                </DropdownMenuLabel>
                {JOB_STATUS_CHOICES.filter((c) => c.status === 'on_progress').map(item)}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
                  Outcome
                </DropdownMenuLabel>
                {JOB_STATUS_CHOICES.filter(
                  (c) => c.status === 'offering' || c.status === 'rejected'
                ).map(item)}
              </DropdownMenuGroup>
            </>
          );
        })()}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderJobActionsMenu = (job: JobApplication) => {
    const baseResumeId = job.resumeId;
    const isArchived = job.status === 'archived';
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative size-7 shrink-0 rounded-lg text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground"
            title="More actions"
            aria-label={`More actions for ${job.role} at ${job.company}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onClick={() => openEditModal(job)}
            className="gap-2 text-xs cursor-pointer"
          >
            <Edit2 className="size-3.5 text-muted-foreground" />
            <span>Edit application</span>
          </DropdownMenuItem>
          {baseResumeId && (
            <>
            <DropdownMenuItem onClick={() => onPreviewResume(baseResumeId)} className="gap-2 text-xs"><Eye className="size-3.5" />Preview resume</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectResume(baseResumeId)} className="gap-2 text-xs"><FileText className="size-3.5" />Edit resume</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onTailorResumeForJob(baseResumeId, job.company, job.role, job.id)
              }
              className="gap-2 text-xs cursor-pointer"
            >
              <Copy className="size-3.5 text-muted-foreground" />
              <span>Duplicate & tailor resume</span>
            </DropdownMenuItem>
            </>
          )}
          {!baseResumeId && resumes.length > 0 && <DropdownMenuItem onClick={() => openEditModal(job, 'resume')} className="gap-2 text-xs"><FileText className="size-3.5" />Link resume</DropdownMenuItem>}
          {job.jobUrl && (
            <DropdownMenuItem
              onClick={() => window.open(job.jobUrl, '_blank', 'noopener,noreferrer')}
              className="gap-2 text-xs cursor-pointer"
            >
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <span>Open job posting</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isArchived ? (
            <DropdownMenuItem
              onClick={() => job.archivedFrom ? moveJob(job, job.archivedFrom, job.progressStage) : openEditModal(job)}
              className="gap-2 text-xs cursor-pointer"
            >
              <Restore className="size-3.5 text-muted-foreground" />
              <span>Restore application</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => handleArchiveJob(job)}
              className="gap-2 text-xs cursor-pointer"
            >
              <Archive className="size-3.5 text-muted-foreground" />
              <span>Archive</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setDeletingJob(job)}
            className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      {/* Title Row */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {showArchivedView ? (
            <>
              <div className="mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => switchArchivedView(false)}
                  className="-ml-2 h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to job tracker</span>
                </Button>
              </div>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold tracking-tight text-foreground focus:outline-none"
              >
                Archived applications
                <span className="ml-2 text-lg font-normal text-muted-foreground tabular-nums" aria-live="polite">
                  {normalizedQuery
                    ? `(${visibleArchivedJobs.length} of ${archivedJobs.length})`
                    : `(${archivedJobs.length})`}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Archived applications stay out of the active board. Restore one anytime.
              </p>
            </>
          ) : (
            <>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold tracking-tight text-foreground focus:outline-none"
              >
                Job tracker
                <span className="ml-2 text-lg font-normal text-muted-foreground tabular-nums" aria-live="polite">
                  {hasActiveFilters
                    ? `(${visibleActiveJobs.length} of ${activeJobs.length})`
                    : `(${activeJobs.length})`}
                </span>
              </h1>
            </>
          )}
        </div>

        {!showArchivedView && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => switchArchivedView(true)}
              className="relative gap-2 px-4 font-medium after:absolute after:-inset-2 after:content-['']"
              title="View archived applications"
            >
              <Archive className="size-4 text-muted-foreground" />
              <span>Archived</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                ({archivedJobs.length})
              </span>
            </Button>

            {activeJobs.length > 0 && (
              <Button
                variant="default"
                onClick={() => openCreateModal('applied')}
                className="relative inline-flex gap-2 px-5 font-semibold shrink-0 after:absolute after:-inset-2 after:content-['']"
              >
                <Plus className="size-4" />
                <span>Add application</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Polite Status Region: Archive Undo Banner */}
      <div role="status" aria-live="polite">
        {lastArchived && archivedJobs.some(j => j.id === lastArchived.id) && !showArchivedView && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-xs shadow-2xs">
            <span className="text-foreground truncate">
              Archived <span className="font-semibold">{lastArchived.label}</span>.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleUndoArchive}
                className="h-7 px-2.5 text-xs font-semibold"
              >
                Undo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLastArchived(null)}
                aria-label="Dismiss archive notice"
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {syncNotice}
      <div role="status" aria-live="polite">
        {moveNotice && jobs.some(j => j.id === moveNotice.id) && <div className="mb-3 flex items-center gap-3 text-sm">
          <span>{moveNotice.text}</span>
          {!visibleActiveJobs.some(j => j.id === moveNotice.id) && <button id="view-moved-job" className="font-semibold text-primary" onClick={() => {
            const moved = jobs.find(j => j.id === moveNotice.id);
            if (moved) openEditModal(moved);
          }}>View card</button>}
          <Button size="icon" variant="ghost" aria-label="Dismiss stage update" onClick={() => setMoveNotice(null)}><X className="size-4" /></Button>
        </div>}
      </div>

      {showArchivedView ? (
        archivedJobs.length === 0 ? (
          <Card className="mx-auto my-6 max-w-xl rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Archive className="size-5" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              No archived applications
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
              When you archive an application from the board or list, it stays here out of your active pipeline.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => switchArchivedView(false)}
              className="mt-5 gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to job tracker</span>
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:flex-1 sm:min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archived applications"
                  aria-label="Search archived applications"
                  autoComplete="off"
                  spellCheck={false}
                  className="pl-9 pr-9 h-11 text-sm w-full"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    title="Clear search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative h-9 gap-2 text-xs font-medium text-foreground after:absolute after:-inset-2 after:content-['']"
                    title="Sort archived applications"
                    aria-label={`Sort archived applications, currently ${currentSortLabel.toLowerCase()}`}
                  >
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <span>{currentSortLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {JOB_SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.key}
                      onClick={() => setSortBy(option.key)}
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.key && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {visibleArchivedJobs.length === 0 ? (
              <Card className="px-6 py-16 text-center">
                <p className="text-sm font-semibold text-foreground">
                  No archived applications match “{searchQuery.trim()}”
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs"
                >
                  Clear search
                </Button>
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted-foreground">
                  <div className="col-span-5">Role & company</div>
                  <div className="col-span-3">Linked resume</div>
                  <div className="col-span-2">Dates</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-border">
                  {visibleArchivedJobs.map((job) => {
                    const linkedResume = job.resumeId
                      ? resumeMap.get(job.resumeId) ?? null
                      : null;

                    return (
                      <div
                        key={job.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-3.5 items-center transition-colors [@media(hover:hover)]:hover:bg-muted/40"
                      >
                        <div className="col-span-1 md:col-span-5 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <h2 className="min-w-0 text-sm font-bold tracking-tight text-foreground truncate">
                              <button
                                type="button"
                                onClick={() => openEditModal(job)}
                                className="truncate text-left hover:underline hover:underline-offset-4"
                              >
                                {job.role}
                              </button>
                            </h2>
                            {job.jobPlatform && (
                              <Badge
                                variant="outline"
                                className="shrink-0 px-1.5 py-0 text-[11px] font-medium text-muted-foreground"
                              >
                                {JOB_PLATFORM_LABELS[job.jobPlatform]}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {job.company}, {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                            {job.industry ? `, ${JOB_INDUSTRY_LABELS[job.industry]}` : ''}
                            , {WORK_MODE_LABELS[job.workMode]}
                            {job.location ? `, ${job.location}` : ''}
                          </p>
                        </div>

                        <div className="col-span-1 md:col-span-3 min-w-0">
                          {linkedResume ? (
                            <button
                              type="button"
                              onClick={() => onSelectResume(linkedResume.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/70 px-2.5 py-1 text-xs font-medium text-foreground hover:text-primary max-w-full truncate"
                            >
                              <FileText className="size-3.5 text-primary shrink-0" />
                              <span className="truncate">{linkedResume.title}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No resume linked</span>
                          )}
                        </div>

                        <div className="col-span-1 md:col-span-2 text-xs text-muted-foreground tabular-nums">
                          <span className="block">
                            {job.appliedDate
                              ? formatAppliedDate(job.appliedDate)
                              : formatRelativeTime(job.updatedAt)}
                          </span>
                          {job.interviewDate && (
                            <span
                              className={cn(
                                'mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium',
                                job.interviewDate.slice(0, 10) >=
                                  new Date().toISOString().slice(0, 10)
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              )}
                              title={`Interview on ${formatAppliedDate(job.interviewDate)}`}
                            >
                              <Calendar className="size-3 shrink-0" />
                              <span>{eventLabel(job)} · {formatInterviewDate(job.interviewDate)}</span>
                            </span>
                          )}
                        </div>

                        <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1.5">
                          {job.archivedFrom ? <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => moveJob(job, job.archivedFrom!, job.progressStage)}
                            className="h-8 gap-1.5 text-xs font-medium"
                            title={`Restore to ${JOB_STATUS_LABELS[job.archivedFrom]}`}
                          >
                            <Restore className="size-3.5" />
                            <span>Restore</span>
                          </Button> : <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="sm" variant="secondary">Restore to…</Button></DropdownMenuTrigger>
                            <DropdownMenuContent><DropdownMenuLabel>Choose a stage</DropdownMenuLabel>
                              {JOB_STATUS_CHOICES.map(choice => <DropdownMenuItem key={choice.value} onClick={() => moveJob(job, choice.status, choice.step)}>{choice.label}</DropdownMenuItem>)}
                            </DropdownMenuContent>
                          </DropdownMenu>}
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => setDeletingJob(job)}
                            className="relative size-8 shrink-0 text-destructive after:absolute after:-inset-1.5 after:content-[''] hover:text-destructive"
                            title="Delete archived application"
                            aria-label={`Delete ${job.role} at ${job.company}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )
      ) : activeJobs.length === 0 ? (
        <div className="space-y-4">
          <JobEmptyState onCreateJob={() => openCreateModal('applied')} />
          {archivedJobs.length > 0 && (
            <div className="text-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => switchArchivedView(true)}
                className="gap-2 text-xs"
              >
                <Archive className="size-3.5 text-muted-foreground" />
                <span>View archived applications ({archivedJobs.length})</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>

          {/* Toolbar */}
          <JobTrackerStats
            stats={stats}
            jobs={activeJobs}
            activeFilter={statusFilter}
            onFilterChange={(nextStatus) =>
              setFilters((prev) => ({
                ...prev,
                status: nextStatus,
                progressStage:
                  nextStatus === 'all' || nextStatus === 'on_progress'
                    ? prev.progressStage
                    : 'all',
              }))
            }
            selectedDate={dateFilter}
            onDateFilterChange={(date) => setPeriodFilter(date ? { date } : null)}
            selectedYearFilter={yearFilter}
            onYearFilterChange={(year) => setPeriodFilter(year === null ? null : { year })}
          />
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative w-full sm:flex-1 sm:min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, role, platform, or resume"
                aria-label="Search job applications"
                autoComplete="off"
                spellCheck={false}
                className="pl-9 pr-9 h-11 text-sm w-full"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => switchArchivedView(true)}
                className="relative h-9 gap-1.5 text-xs font-medium text-foreground sm:hidden after:absolute after:-inset-2 after:content-['']"
                title="View archived applications"
              >
                <Archive className="size-3.5 text-muted-foreground" />
                <span>Archived ({archivedJobs.length})</span>
              </Button>

              {/* Unified Filters Trigger */}
              <div className="relative inline-flex shrink-0">
                <Button
                  ref={filterTriggerRef}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFilterOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={isFilterOpen}
                  aria-label={
                    activeFilterCount > 0
                      ? `Filters, ${activeFilterCount} active`
                      : 'Filter applications'
                  }
                  title="Filter applications"
                  className={cn(
                    'relative h-9 text-xs transition-colors',
                    activeFilterCount > 0
                      ? 'gap-1.5 border border-primary/30 bg-accent pr-8 font-semibold text-primary hover:bg-accent/90 after:absolute after:-inset-y-2 after:left-0 after:right-7 after:content-[""]'
                      : 'gap-2 font-medium text-foreground after:absolute after:-inset-2 after:content-[""]'
                  )}
                >
                  <Filter
                    className={cn(
                      'size-3.5 shrink-0',
                      activeFilterCount > 0 ? 'text-primary' : 'text-muted-foreground'
                    )}
                    aria-hidden="true"
                  />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground tabular-nums">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFilters(false);
                      filterTriggerRef.current?.focus();
                    }}
                    aria-label="Clear all filters"
                    title="Clear all filters"
                    className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-2 after:-inset-x-1 after:content-['']"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Sort Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative h-9 gap-2 text-xs font-medium text-foreground after:absolute after:-inset-2 after:content-['']"
                    title="Sort applications"
                    aria-label={`Sort applications, currently ${currentSortLabel.toLowerCase()}`}
                  >
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <span>{currentSortLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {JOB_SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.key}
                      onClick={() => setSortBy(option.key)}
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.key && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle (Board / List) */}
              <div
                role="group"
                aria-label="Job tracker view mode"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('board')}
                  aria-pressed={viewMode === 'board'}
                  aria-label="Board view"
                  title="Board view"
                  className={cn(
                    'relative size-8 rounded-[12px] transition-colors after:absolute after:-inset-y-2 after:-inset-x-0.5 after:content-[""]',
                    viewMode === 'board'
                      ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutKanban className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="List view"
                  title="List view"
                  className={cn(
                    'relative size-8 rounded-[12px] transition-colors after:absolute after:-inset-y-2 after:-inset-x-0.5 after:content-[""]',
                    viewMode === 'list'
                      ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {visibleActiveJobs.length === 0 ? (
            <Card className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Search className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground break-words">
                No applications match your filter
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Clear your search or reset filters to see more applications.
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => clearAllFilters(true)}
                className="mt-3 text-xs"
              >
                Reset filters
              </Button>
            </Card>
          ) : viewMode === 'board' ? (
            <div className="job-board" role="region" aria-label="Application board" tabIndex={0}>
              {boardColumns.map((colStatus) => {
                const colJobs = visibleActiveJobs.filter((j) => j.status === colStatus);
                const isDropTarget = dragOverStatus === colStatus;

                return (
                  <div
                    key={colStatus}
                    data-stage={colStatus}
                    onDragOver={(e) => {
                      if (!draggedJobId) return;
                      e.preventDefault();
                      if (dragOverStatus !== colStatus) {
                        setDragOverStatus(colStatus);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
                      if (dragOverStatus === colStatus) {
                        setDragOverStatus(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverStatus(null);
                      if (draggedJobId) {
                        const job = jobs.find(j => j.id === draggedJobId);
                        if (job && job.status !== colStatus) {
                          moveJob(job, colStatus);
                          if (colStatus === 'on_progress' && !job.progressStage) {
                            requestAnimationFrame(() => document.getElementById(`move-${job.id}`)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
                          }
                        }
                        setDraggedJobId(null);
                      }
                    }}
                    className={cn(
                      'job-lane flex min-w-0 flex-col rounded-xl p-2',
                      isDropTarget && 'ring-2 ring-inset ring-primary'
                    )}
                  >
                    {/* Column Header */}
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h2 className="job-stage-badge" aria-label={`${JOB_STATUS_LABELS[colStatus]}, ${colJobs.length} ${colJobs.length === 1 ? 'application' : 'applications'}`}>
                        <span>{JOB_STATUS_LABELS[colStatus]}</span>
                        <span className="job-stage-count">{colJobs.length}</span>
                      </h2>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openCreateModal(colStatus)}
                        className="relative size-7 text-muted-foreground hover:text-foreground after:absolute after:-inset-2 after:content-['']"
                        title={`Add application to ${JOB_STATUS_LABELS[colStatus]}`}
                        aria-label={`Add application to ${JOB_STATUS_LABELS[colStatus]}`}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    {/* Column Cards */}
                    <div className="flex flex-col gap-2">
                      {colJobs.length === 0 ? (
                        <div className="px-1 pb-4 pt-2">
                          <p className="text-xs text-muted-foreground">
                            No applications in {JOB_STATUS_LABELS[colStatus].toLowerCase()}
                          </p>
                        </div>
                      ) : (
                        colJobs.map((job) => {
                          const scheduled = scheduleDate(job.interviewDate);
                          const today = new Date();
                          const past = scheduled && +scheduled < Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

                          return (
                            <Card
                              key={job.id}
                              draggable
                              onDragStart={() => setDraggedJobId(job.id)}
                              onDragEnd={() => {
                                setDraggedJobId(null);
                                setDragOverStatus(null);
                              }}
                              className="group relative flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-[border-color,box-shadow] duration-150 ease-out [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:shadow-sm"
                            >
                              <header className="flex items-center justify-between gap-2 border-b border-border">
                                {renderStageDropdown(job, true)}
                                {renderJobActionsMenu(job)}
                              </header>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(job)}
                                      className="line-clamp-2 max-w-full break-words text-left hover:underline hover:underline-offset-4"
                                      title={`Edit ${job.role} at ${job.company}`}
                                    >
                                      {job.role}
                                    </button>
                                  </h3>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <span className="truncate">{job.company}</span>
                                    {job.jobUrl && (
                                      <a
                                        href={job.jobUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open job posting"
                                        aria-label={`Open job posting for ${job.role} at ${job.company}`}
                                        className="relative inline-flex text-muted-foreground hover:text-primary after:absolute after:-inset-1.5 after:content-['']"
                                      >
                                        <ExternalLink className="size-3 shrink-0" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                               {job.status === 'on_progress' ? <>
                               <div className="flex min-w-0 items-center gap-2">
                                {scheduled && job.interviewDate ? <>
                                  <button type="button" onClick={() => openEditModal(job, 'schedule')} aria-label={`Edit schedule: ${eventLabel(job)}, ${formatAppliedDate(job.interviewDate)}`} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded text-left hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                                    <span aria-hidden="true" className={cn('flex min-w-10 shrink-0 flex-col items-center rounded-lg px-1.5 py-1 tabular-nums', past ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground')}>
                                      <span className="text-[10px] uppercase">{scheduled.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}</span>
                                      <strong className="text-base leading-5">{scheduled.getUTCDate()}</strong>
                                    </span>
                                    <span className="min-w-0 text-xs font-semibold">{past ? 'Past schedule' : 'Scheduled'}<span className="block font-normal text-muted-foreground">{scheduled.getUTCFullYear()}</span></span>
                                  </button>
                                  <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0" title="Add to calendar (.ics)" aria-label={`Add ${eventLabel(job)} at ${job.company} to calendar (.ics)`} onClick={() => downloadJobCalendar(job)}><CalendarPlus className="size-4" /></Button>
                                </> : <button type="button" onClick={() => openEditModal(job, 'schedule')} className="inline-flex min-h-11 items-center gap-2 rounded px-1 text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"><CalendarPlus className="size-4" />Set schedule</button>}
                              </div>
                              </> : (job.status === 'offering' || job.status === 'rejected') && scheduled && job.interviewDate ? (
                                <p className="text-xs text-muted-foreground">{job.progressStage ? JOB_PROGRESS_STAGE_LABELS[job.progressStage] : 'Interview or test'} · <time dateTime={job.interviewDate}>{formatAppliedDate(job.interviewDate)}</time></p>
                              ) : null}
                              <footer className="mt-auto border-t border-border pt-2 text-xs text-muted-foreground tabular-nums">
                                {job.appliedDate ? <>Applied <time dateTime={job.appliedDate}>{formatAppliedDate(job.appliedDate)}</time></> : 'Applied date not set'}
                              </footer>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List / Table View */
            <Card className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted-foreground">
                <div className="col-span-4">Role & company</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-3">Linked resume & match</div>
                <div className="col-span-1">Applied</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border">
                {visibleActiveJobs.map((job) => {
                  const linkedResume = job.resumeId
                    ? resumeMap.get(job.resumeId) ?? null
                    : null;
                  const matchResult =
                    linkedResume && job.jobDescription.trim()
                      ? matchJobToResume(job.jobDescription, job.role, linkedResume)
                      : null;

                  return (
                    <div
                      key={job.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-3.5 items-center transition-colors [@media(hover:hover)]:hover:bg-muted/40"
                    >
                      {/* Role & Company */}
                      <div className="col-span-1 md:col-span-4 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h2 className="min-w-0 text-sm font-bold tracking-tight text-foreground truncate">
                            <button
                              type="button"
                              onClick={() => openEditModal(job)}
                              className="truncate text-left hover:underline hover:underline-offset-4"
                            >
                              {job.role}
                            </button>
                          </h2>
                          {job.jobPlatform && (
                            <Badge
                              variant="outline"
                              className="shrink-0 px-1.5 py-0 text-[11px] font-medium text-muted-foreground"
                            >
                              {JOB_PLATFORM_LABELS[job.jobPlatform]}
                            </Badge>
                          )}
                          {job.jobUrl && (
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open job posting"
                              aria-label={`Open job posting for ${job.role} at ${job.company}`}
                              className="relative text-muted-foreground hover:text-primary shrink-0 after:absolute after:-inset-2 after:content-['']"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job.company}, {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                          {job.industry ? `, ${JOB_INDUSTRY_LABELS[job.industry]}` : ''}
                          , {WORK_MODE_LABELS[job.workMode]}
                          {job.location ? `, ${job.location}` : ''}
                        </p>
                      </div>

                      {/* Stage & Sub-stage */}
                      <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-1.5">
                        {renderStageDropdown(job)}
                        {job.interviewDate && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
                              job.interviewDate.slice(0, 10) >=
                                new Date().toISOString().slice(0, 10)
                                ? 'border-primary/25 bg-accent text-primary'
                                : 'border-border bg-card text-muted-foreground'
                            )}
                            title={`Interview on ${formatAppliedDate(job.interviewDate)}`}
                          >
                            <Calendar className="size-3 shrink-0" />
                            <span>{eventLabel(job)} · {formatInterviewDate(job.interviewDate)}</span>
                          </span>
                        )}
                      </div>

                      {/* Linked Resume & Match */}
                      <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-2 min-w-0">
                        {linkedResume ? (
                          <button
                            type="button"
                            onClick={() => onSelectResume(linkedResume.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/70 px-2.5 py-1 text-xs font-medium text-foreground hover:text-primary max-w-full truncate"
                            title={`Open ${linkedResume.title} in editor`}
                          >
                            <FileText className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">{linkedResume.title}</span>
                          </button>
                        ) : resumes.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => openEditModal(job, 'resume')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <FileText className="size-3.5" />
                            <span>Link resume</span>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">No resume linked</span>
                        )}

                        {matchResult && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[11px] font-semibold tabular-nums"
                          >
                            {matchResult.score >= 70 ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <AlertCircle className="size-3 text-amber-600" />
                            )}
                            <span>Keyword match {matchResult.score}%</span>
                          </Badge>
                        )}
                      </div>

                      {/* Applied Date */}
                      <div className="col-span-1 md:col-span-1 text-xs text-muted-foreground tabular-nums">
                        {job.appliedDate
                          ? formatAppliedDate(job.appliedDate)
                          : formatRelativeTime(job.updatedAt)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-1.5">
                        {linkedResume && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => onPreviewResume(linkedResume.id)}
                            className="relative size-8 shrink-0 text-muted-foreground after:absolute after:-inset-1.5 after:content-[''] hover:text-foreground"
                            title={`Quick preview ${linkedResume.title}`}
                            aria-label={`Quick preview ${linkedResume.title}`}
                          >
                            <Eye className="size-4" />
                          </Button>
                        )}
                        {renderJobActionsMenu(job)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Mobile Primary Action */}
      {!showArchivedView && activeJobs.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 backdrop-blur-md sm:hidden">
          <Button
            variant="default"
            onClick={() => openCreateModal('applied')}
            className="w-full gap-2 font-semibold"
          >
            <Plus className="size-4" />
            <span>Add application</span>
          </Button>
        </div>
      )}

      {/* Unified Filters Modal */}
      <JobFilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        periodLabel={periodLabel}
        onClearPeriod={() => setPeriodFilter(null)}
        onResetAll={() => clearAllFilters(false)}
        activeCount={activeFilterCount}
        resultCount={visibleActiveJobs.length}
      />

      {/* Add / Edit Modal */}
      <JobFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialJob={editingJob}
        defaultStatus={defaultFormStatus}
        focusField={focusField}
        resumes={resumes}
        onSave={onSaveJob}
        onTailorResume={(baseResumeId, company, role) =>
          onTailorResumeForJob(baseResumeId, company, role)
        }
        onOpenResumeEditor={(resumeId) => {
          setIsFormOpen(false);
          onSelectResume(resumeId);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingJob)}
        title={`Delete “${deletingJob?.role} at ${deletingJob?.company}”?`}
        description={
          isCloudUser
            ? 'This permanently removes this job application from your account. Your linked resume will not be deleted.'
            : 'This permanently removes this job application from this device. Your linked resume will not be deleted.'
        }
        confirmLabel="Delete application"
        cancelLabel="Keep application"
        isDestructive={true}
        onConfirm={() => {
          if (deletingJob) {
            onDeleteJob(deletingJob.id);
          }
          setDeletingJob(null);
        }}
        onCancel={() => setDeletingJob(null)}
      />
    </>
  );
};
