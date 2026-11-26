import React, { useEffect, useMemo, useState } from 'react';
import {
  IconAlertCircle as AlertCircle,
  IconAlertTriangle as AlertTriangle,
  IconArchive as Archive,
  IconArrowsSort as ArrowUpDown,
  IconBookmark as Bookmark,
  IconBriefcase as Briefcase,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconCircleCheck as CircleCheck,
  IconCircleX as CircleX,
  IconClock as Clock,
  IconCopy as Copy,
  IconDotsVertical as MoreVertical,
  IconEdit as Edit2,
  IconExternalLink as ExternalLink,
  IconEye as Eye,
  IconFileText as FileText,
  IconFilter as Filter,
  IconLayoutKanban as LayoutKanban,
  IconList as List,
  IconMapPin as MapPin,
  IconMessages as Messages,
  IconPlus as Plus,
  IconSearch as Search,
  IconSend as Send,
  IconTrash as Trash2,
  IconX as X,
} from '@tabler/icons-react';
import {
  BOARD_JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  JobApplication,
  JobApplicationInput,
  JobStatus,
  WORK_MODE_LABELS,
} from '../../types/job';
import { ResumeDocument } from '../../types/resume';
import { matchJobToResume } from '../../lib/domain/jdMatch';
import { formatRelativeTime } from '../../utils/relativeTime';
import { ConfirmDialog } from '../ConfirmDialog';
import { JobEmptyState } from './JobEmptyState';
import { JobFormDialog } from './JobFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface JobTrackerViewProps {
  jobs: JobApplication[];
  resumes: ResumeDocument[];
  onSaveJob: (input: JobApplicationInput, existingId?: string) => void;
  onUpdateJobStatus: (jobId: string, nextStatus: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
  onTailorResumeForJob: (
    baseResumeId: string,
    company: string,
    role: string,
    jobId?: string
  ) => string | null;
  onSelectResume: (resumeId: string) => void;
  onPreviewResume: (resumeId: string) => void;
  syncStatus?: 'saved' | 'saving' | 'error';
  isCloudUser?: boolean;
}

type JobViewMode = 'board' | 'list';
type JobSortKey = 'updated' | 'applied' | 'company';

const JOB_VIEW_STORAGE_KEY = 'cevee.jobs.view';
const JOB_SORT_STORAGE_KEY = 'cevee.jobs.sort';

const JOB_VIEW_MODES: readonly JobViewMode[] = ['board', 'list'];
const JOB_SORT_KEYS: readonly JobSortKey[] = ['updated', 'applied', 'company'];

const JOB_SORT_OPTIONS: { key: JobSortKey; label: string }[] = [
  { key: 'updated', label: 'Last updated' },
  { key: 'applied', label: 'Applied date' },
  { key: 'company', label: 'Company (A–Z)' },
];

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

const getStatusIcon = (status: JobStatus, className = 'size-3.5 shrink-0') => {
  switch (status) {
    case 'wishlist':
      return <Bookmark className={className} />;
    case 'applied':
      return <Send className={className} />;
    case 'interview':
      return <Messages className={className} />;
    case 'offer':
      return <CircleCheck className={className} />;
    case 'rejected':
      return <CircleX className={className} />;
    case 'archived':
      return <Archive className={className} />;
  }
};

const getStatusPillClasses = (status: JobStatus): string => {
  switch (status) {
    case 'wishlist':
      return 'border-border bg-secondary text-foreground';
    case 'applied':
      return 'border-primary/25 bg-accent text-primary';
    case 'interview':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'offer':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'rejected':
      return 'border-rose-200 bg-rose-50 text-rose-800';
    case 'archived':
      return 'border-border bg-muted text-muted-foreground';
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
  syncStatus = 'saved',
  isCloudUser = false,
}) => {
  const [viewMode, setViewMode] = useState<JobViewMode>(() =>
    readStoredValue(JOB_VIEW_STORAGE_KEY, JOB_VIEW_MODES, 'board')
  );
  const [sortBy, setSortBy] = useState<JobSortKey>(() =>
    readStoredValue(JOB_SORT_STORAGE_KEY, JOB_SORT_KEYS, 'updated')
  );
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [defaultFormStatus, setDefaultFormStatus] = useState<JobStatus>('wishlist');
  const [deletingJob, setDeletingJob] = useState<JobApplication | null>(null);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    writeStoredValue(JOB_VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    writeStoredValue(JOB_SORT_STORAGE_KEY, sortBy);
  }, [sortBy]);

  const resumeMap = useMemo(() => {
    const map = new Map<string, ResumeDocument>();
    for (const resume of resumes) {
      map.set(resume.id, resume);
    }
    return map;
  }, [resumes]);

  const stats = useMemo(() => {
    let active = 0;
    let interviewing = 0;
    let offers = 0;

    for (const job of jobs) {
      if (job.status === 'applied' || job.status === 'interview') active += 1;
      if (job.status === 'interview') interviewing += 1;
      if (job.status === 'offer') offers += 1;
    }

    return {
      total: jobs.length,
      active,
      interviewing,
      offers,
    };
  }, [jobs]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      const linkedTitle = job.resumeId ? resumeMap.get(job.resumeId)?.title || '' : '';
      const haystack = `${job.company} ${job.role} ${job.location} ${job.notes} ${linkedTitle}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    const toTime = (value?: string) => {
      const time = value ? new Date(value).getTime() : NaN;
      return Number.isNaN(time) ? 0 : time;
    };

    const sorted = [...filtered];
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
  }, [jobs, statusFilter, normalizedQuery, sortBy, resumeMap]);

  const boardColumns = useMemo(() => {
    if (statusFilter !== 'all') {
      return [statusFilter];
    }
    const hasArchived = visibleJobs.some((j) => j.status === 'archived');
    return hasArchived
      ? ([...BOARD_JOB_STATUSES, 'archived'] as JobStatus[])
      : ([...BOARD_JOB_STATUSES] as JobStatus[]);
  }, [statusFilter, visibleJobs]);

  const openCreateModal = (initialStage: JobStatus = 'wishlist') => {
    setEditingJob(null);
    setDefaultFormStatus(initialStage);
    setIsFormOpen(true);
  };

  const openEditModal = (job: JobApplication) => {
    setEditingJob(job);
    setDefaultFormStatus(job.status);
    setIsFormOpen(true);
  };

  const currentSortLabel =
    JOB_SORT_OPTIONS.find((opt) => opt.key === sortBy)?.label ?? 'Last updated';

  const currentFilterLabel =
    statusFilter === 'all' ? 'All stages' : JOB_STATUS_LABELS[statusFilter];

  const renderStageDropdown = (job: JobApplication) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors after:absolute after:-inset-1.5 after:content-[""]',
            getStatusPillClasses(job.status)
          )}
          title={`Stage: ${JOB_STATUS_LABELS[job.status]}. Click to change`}
          aria-label={`Change stage for ${job.role} at ${job.company}, currently ${JOB_STATUS_LABELS[job.status]}`}
        >
          {getStatusIcon(job.status, 'size-3 shrink-0')}
          <span>{JOB_STATUS_LABELS[job.status]}</span>
          <ChevronDown className="size-3 opacity-70 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {JOB_STATUSES.map((st) => (
          <DropdownMenuItem
            key={st}
            onClick={() => onUpdateJobStatus(job.id, st)}
            className="flex items-center justify-between text-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {getStatusIcon(st, 'size-3.5 text-muted-foreground')}
              <span>{JOB_STATUS_LABELS[st]}</span>
            </span>
            {job.status === st && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderJobActionsMenu = (job: JobApplication) => {
    const baseResumeId = job.resumeId || resumes[0]?.id;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="relative size-8 shrink-0 text-muted-foreground after:absolute after:-inset-1.5 after:content-[''] hover:text-foreground"
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
            <DropdownMenuItem
              onClick={() =>
                onTailorResumeForJob(baseResumeId, job.company, job.role, job.id)
              }
              className="gap-2 text-xs cursor-pointer"
            >
              <Copy className="size-3.5 text-muted-foreground" />
              <span>Duplicate & tailor resume</span>
            </DropdownMenuItem>
          )}
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Job tracker
            <span className="ml-2 text-lg font-normal text-muted-foreground tabular-nums" aria-live="polite">
              {normalizedQuery || statusFilter !== 'all'
                ? `(${visibleJobs.length} of ${jobs.length})`
                : `(${jobs.length})`}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track applications, link the resume you sent, and compare job descriptions.
          </p>
        </div>

        <Button
          variant="default"
          onClick={() => openCreateModal('wishlist')}
          className="relative hidden sm:inline-flex gap-2 px-5 font-semibold shrink-0 after:absolute after:-inset-2 after:content-['']"
        >
          <Plus className="size-4" />
          <span>Add application</span>
        </Button>
      </div>

      {syncStatus === 'error' && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>Cloud save failed. Changes are saved on this device.</span>
        </div>
      )}

      {jobs.length === 0 ? (
        <JobEmptyState onCreateJob={() => openCreateModal('wishlist')} />
      ) : (
        <>
          {/* Summary Strip */}
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Total tracked</span>
                <Briefcase className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.total}
              </p>
            </Card>

            <Card className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Active pipeline</span>
                <Send className="size-4 text-primary" />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.active}
              </p>
            </Card>

            <Card className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Interviewing</span>
                <Messages className="size-4 text-amber-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.interviewing}
              </p>
            </Card>

            <Card className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Offers received</span>
                <CircleCheck className="size-4 text-emerald-600" />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.offers}
              </p>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative w-full sm:flex-1 sm:min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, role, location, or resume"
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
              {/* Stage Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative h-9 gap-2 text-xs font-medium text-foreground after:absolute after:-inset-2 after:content-['']"
                    title="Filter by stage"
                    aria-label={`Filter by stage, currently ${currentFilterLabel}`}
                  >
                    <Filter className="size-3.5 text-muted-foreground" />
                    <span>{currentFilterLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setStatusFilter('all')}
                    className="flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span>All stages</span>
                    {statusFilter === 'all' && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {JOB_STATUSES.map((st) => (
                    <DropdownMenuItem
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className="flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {getStatusIcon(st, 'size-3.5 text-muted-foreground')}
                        <span>{JOB_STATUS_LABELS[st]}</span>
                      </span>
                      {statusFilter === st && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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

          {visibleJobs.length === 0 ? (
            <Card className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Search className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground break-words">
                No applications match your filter
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try clearing the search query or selecting all stages.
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-3 text-xs"
              >
                Reset filters
              </Button>
            </Card>
          ) : viewMode === 'board' ? (
            /* Kanban Board View */
            <div
              className={cn(
                'grid grid-cols-1 gap-4 items-start',
                boardColumns.length === 1
                  ? 'max-w-xl'
                  : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              )}
            >
              {boardColumns.map((colStatus) => {
                const colJobs = visibleJobs.filter((j) => j.status === colStatus);
                const isDropTarget = dragOverStatus === colStatus;

                return (
                  <div
                    key={colStatus}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverStatus !== colStatus) {
                        setDragOverStatus(colStatus);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverStatus === colStatus) {
                        setDragOverStatus(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverStatus(null);
                      if (draggedJobId) {
                        onUpdateJobStatus(draggedJobId, colStatus);
                        setDraggedJobId(null);
                      }
                    }}
                    className={cn(
                      'flex flex-col rounded-2xl border bg-muted/35 p-3 transition-colors duration-150 ease-out min-h-[220px]',
                      isDropTarget ? 'border-primary bg-accent/40' : 'border-border/80'
                    )}
                  >
                    {/* Column Header */}
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            getStatusPillClasses(colStatus)
                          )}
                        >
                          {getStatusIcon(colStatus, 'size-3 shrink-0')}
                          <span className="truncate">{JOB_STATUS_LABELS[colStatus]}</span>
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                          {colJobs.length}
                        </span>
                      </div>

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
                    <div className="flex flex-col gap-3">
                      {colJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 px-3 py-8 text-center">
                          <p className="text-xs text-muted-foreground">
                            No applications in {JOB_STATUS_LABELS[colStatus].toLowerCase()}
                          </p>
                        </div>
                      ) : (
                        colJobs.map((job) => {
                          const linkedResume = job.resumeId
                            ? resumeMap.get(job.resumeId) ?? null
                            : null;
                          const matchResult =
                            linkedResume && job.jobDescription.trim()
                              ? matchJobToResume(job.jobDescription, job.role, linkedResume)
                              : null;

                          return (
                            <Card
                              key={job.id}
                              draggable
                              onDragStart={() => setDraggedJobId(job.id)}
                              onDragEnd={() => {
                                setDraggedJobId(null);
                                setDragOverStatus(null);
                              }}
                              className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 ease-out [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:shadow-sm"
                            >
                              {/* Header: Role & Company + Actions */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(job)}
                                      className="block max-w-full truncate text-left hover:underline hover:underline-offset-4"
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
                                        <ExternalLink className="size-3.5 shrink-0" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                                {renderJobActionsMenu(job)}
                              </div>

                              {/* Meta Chips: Work mode, Location, Salary */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0">
                                  {WORK_MODE_LABELS[job.workMode]}
                                </Badge>
                                {job.location && (
                                  <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                                    <MapPin className="size-3 shrink-0" />
                                    <span className="truncate">{job.location}</span>
                                  </span>
                                )}
                                {job.salaryRange && (
                                  <span className="truncate font-medium text-foreground/80">
                                    {job.salaryRange}
                                  </span>
                                )}
                              </div>

                              {/* Linked Resume & JD Match Box */}
                              <div className="rounded-xl border border-border/80 bg-muted/25 p-2.5 space-y-2">
                                {linkedResume ? (
                                  <div className="flex items-center justify-between gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => onSelectResume(linkedResume.id)}
                                      title={`Edit resume: ${linkedResume.title}`}
                                      className="flex items-center gap-1.5 min-w-0 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                                    >
                                      <FileText className="size-3.5 text-primary shrink-0" />
                                      <span className="truncate">{linkedResume.title}</span>
                                    </button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onPreviewResume(linkedResume.id)}
                                      className="relative size-6 shrink-0 text-muted-foreground hover:text-foreground after:absolute after:-inset-2 after:content-['']"
                                      title={`Quick preview ${linkedResume.title}`}
                                      aria-label={`Quick preview ${linkedResume.title}`}
                                    >
                                      <Eye className="size-3.5" />
                                    </Button>
                                  </div>
                                ) : resumes.length > 0 ? (
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground">
                                      No resume linked
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onTailorResumeForJob(
                                          resumes[0].id,
                                          job.company,
                                          job.role,
                                          job.id
                                        )
                                      }
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                    >
                                      <Copy className="size-3" />
                                      <span>Tailor copy</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">
                                    Create a resume to link
                                  </span>
                                )}

                                {matchResult && (
                                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-foreground">
                                      {matchResult.score >= 70 ? (
                                        <Check className="size-3 text-emerald-600 shrink-0" />
                                      ) : (
                                        <AlertCircle className="size-3 text-amber-600 shrink-0" />
                                      )}
                                      <span>{matchResult.score}% JD match</span>
                                    </span>
                                    <span className="text-[11px] text-muted-foreground tabular-nums">
                                      {matchResult.matchedKeywords.length}/{matchResult.totalKeywords} terms
                                    </span>
                                  </div>
                                )}
                              </div>

                              {job.notes.trim() && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {job.notes.trim()}
                                </p>
                              )}

                              {/* Card Footer: Date & Quick Stage Selector */}
                              <div className="mt-auto flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums truncate">
                                  <Clock className="size-3 shrink-0" />
                                  <span className="truncate">
                                    {job.appliedDate
                                      ? `Applied ${job.appliedDate}`
                                      : formatRelativeTime(job.updatedAt)}
                                  </span>
                                </span>
                                {renderStageDropdown(job)}
                              </div>
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
                <div className="col-span-2">Stage</div>
                <div className="col-span-3">Linked resume & JD match</div>
                <div className="col-span-2">Timeline</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border">
                {visibleJobs.map((job) => {
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
                          <h2 className="text-sm font-bold tracking-tight text-foreground truncate">
                            <button
                              type="button"
                              onClick={() => openEditModal(job)}
                              className="truncate text-left hover:underline hover:underline-offset-4"
                            >
                              {job.role}
                            </button>
                          </h2>
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
                          {job.company} · {WORK_MODE_LABELS[job.workMode]}
                          {job.location ? ` · ${job.location}` : ''}
                          {job.salaryRange ? ` · ${job.salaryRange}` : ''}
                        </p>
                      </div>

                      {/* Stage */}
                      <div className="col-span-1 md:col-span-2 flex items-center">
                        {renderStageDropdown(job)}
                      </div>

                      {/* Linked Resume & JD Match */}
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
                            onClick={() =>
                              onTailorResumeForJob(
                                resumes[0].id,
                                job.company,
                                job.role,
                                job.id
                              )
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Copy className="size-3.5" />
                            <span>Duplicate & tailor</span>
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
                            <span>{matchResult.score}% match</span>
                          </Badge>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="col-span-1 md:col-span-2 text-xs text-muted-foreground tabular-nums">
                        <div>
                          {job.appliedDate
                            ? `Applied ${job.appliedDate}`
                            : formatRelativeTime(job.updatedAt)}
                        </div>
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
      {jobs.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 backdrop-blur-md sm:hidden">
          <Button
            variant="default"
            onClick={() => openCreateModal('wishlist')}
            className="w-full gap-2 font-semibold"
          >
            <Plus className="size-4" />
            <span>Add application</span>
          </Button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <JobFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialJob={editingJob}
        defaultStatus={defaultFormStatus}
        resumes={resumes}
        onSave={onSaveJob}
        onTailorResume={(baseResumeId, company, role) =>
          onTailorResumeForJob(baseResumeId, company, role, editingJob?.id)
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
