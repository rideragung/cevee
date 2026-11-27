import React from 'react';
import {
  ACTIVE_JOB_STATUSES,
  ActiveJobStatus,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  EmploymentType,
  JOB_INDUSTRIES,
  JOB_INDUSTRY_LABELS,
  JOB_PLATFORM_LABELS,
  JOB_PLATFORMS,
  JOB_PROGRESS_STAGE_LABELS,
  JOB_PROGRESS_STAGES,
  JOB_STATUS_LABELS,
  JobFiltersState,
  JobIndustry,
  JobPlatform,
  WORK_MODE_LABELS,
  WORK_MODES,
} from '../../types/job';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JobFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: JobFiltersState;
  onChange: (next: JobFiltersState) => void;
  periodLabel: string | null;
  onClearPeriod: () => void;
  onResetAll: () => void;
  activeCount: number;
  resultCount: number;
}

export const JobFilterDialog: React.FC<JobFilterDialogProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  periodLabel,
  onClearPeriod,
  onResetAll,
  activeCount,
  resultCount,
}) => {
  const canFilterStep = filters.status === 'all' || filters.status === 'on_progress';

  const setStatus = (nextStatus: ActiveJobStatus | 'all') => {
    const keepStep = nextStatus === 'all' || nextStatus === 'on_progress';
    onChange({
      ...filters,
      status: nextStatus,
      progressStage: keepStep ? filters.progressStage : 'all',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-w-xl max-h-[90dvh] flex-col overflow-hidden rounded-2xl p-4 sm:p-6 [&>button:last-child]:size-11 [&>button:last-child]:grid [&>button:last-child]:place-items-center [&>button:last-child]:right-1 [&>button:last-child]:top-1 [&>button:last-child]:before:inset-0"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            Filter applications
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-1 py-2">
          {/* Stage */}
          <div className="space-y-1.5">
            <span id="filter-stage-label" className="block text-xs font-semibold text-foreground">
              Stage
            </span>
            <div
              role="group"
              aria-labelledby="filter-stage-label"
              className="flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                aria-pressed={filters.status === 'all'}
                onClick={() => setStatus('all')}
                className={cn(
                  'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                  filters.status === 'all'
                    ? 'border-primary/40 bg-accent text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                )}
              >
                All stages
              </button>
              {ACTIVE_JOB_STATUSES.map((st) => {
                const isSelected = filters.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setStatus(isSelected ? 'all' : st)}
                    className={cn(
                      'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                      isSelected
                        ? 'border-primary/40 bg-accent text-primary font-semibold'
                        : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                    )}
                  >
                    {JOB_STATUS_LABELS[st]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview / test step */}
          {canFilterStep && (
            <div className="space-y-1.5">
              <span id="filter-step-label" className="block text-xs font-semibold text-foreground">
                Interview or test step
              </span>
              <div
                role="group"
                aria-labelledby="filter-step-label"
                className="flex flex-wrap gap-1.5"
              >
                <button
                  type="button"
                  aria-pressed={filters.progressStage === 'all'}
                  onClick={() => onChange({ ...filters, progressStage: 'all' })}
                  className={cn(
                    'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                    filters.progressStage === 'all'
                      ? 'border-primary/40 bg-accent text-primary font-semibold'
                      : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                  )}
                >
                  All steps
                </button>
                {JOB_PROGRESS_STAGES.map((step) => {
                  const isSelected = filters.progressStage === step;
                  return (
                    <button
                      key={step}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        onChange({
                          ...filters,
                          progressStage: isSelected ? 'all' : step,
                        })
                      }
                      className={cn(
                        'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                        isSelected
                          ? 'border-primary/40 bg-accent text-primary font-semibold'
                          : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                      )}
                    >
                      {JOB_PROGRESS_STAGE_LABELS[step]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Work mode */}
          <div className="space-y-1.5">
            <span id="filter-work-mode-label" className="block text-xs font-semibold text-foreground">
              Work mode
            </span>
            <div
              role="group"
              aria-labelledby="filter-work-mode-label"
              className="flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                aria-pressed={filters.workMode === 'all'}
                onClick={() => onChange({ ...filters, workMode: 'all' })}
                className={cn(
                  'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                  filters.workMode === 'all'
                    ? 'border-primary/40 bg-accent text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                )}
              >
                All modes
              </button>
              {WORK_MODES.map((wm) => {
                const isSelected = filters.workMode === wm;
                return (
                  <button
                    key={wm}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      onChange({ ...filters, workMode: isSelected ? 'all' : wm })
                    }
                    className={cn(
                      'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                      isSelected
                        ? 'border-primary/40 bg-accent text-primary font-semibold'
                        : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                    )}
                  >
                    {WORK_MODE_LABELS[wm]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employment Type & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="filter-employment-type" className="block text-xs font-semibold text-foreground">
                Employment type
              </label>
              <select
                id="filter-employment-type"
                value={filters.employmentType}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    employmentType: e.target.value as EmploymentType | 'all',
                  })
                }
                className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All types</option>
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {EMPLOYMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-platform" className="block text-xs font-semibold text-foreground">
                Job posting platform
              </label>
              <select
                id="filter-platform"
                value={filters.jobPlatform}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    jobPlatform: e.target.value as JobPlatform | 'all',
                  })
                }
                className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All platforms</option>
                {JOB_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {JOB_PLATFORM_LABELS[platform]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label htmlFor="filter-industry" className="block text-xs font-semibold text-foreground">
              Industry
            </label>
            <select
              id="filter-industry"
              value={filters.industry}
              onChange={(e) =>
                onChange({
                  ...filters,
                  industry: e.target.value as JobIndustry | 'all',
                })
              }
              className="flex h-11 w-full min-w-0 rounded-[0.875rem] border border-input bg-card px-3 py-2 text-base text-foreground sm:text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All industries</option>
              {JOB_INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {JOB_INDUSTRY_LABELS[industry]}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Conditions */}
          <div className="space-y-1.5">
            <span id="filter-conditions-label" className="block text-xs font-semibold text-foreground">
              Quick conditions
            </span>
            <div
              role="group"
              aria-labelledby="filter-conditions-label"
              className="flex flex-wrap gap-1.5"
            >
              <button
                type="button"
                aria-pressed={filters.upcomingInterviewOnly}
                onClick={() =>
                  onChange({
                    ...filters,
                    upcomingInterviewOnly: !filters.upcomingInterviewOnly,
                  })
                }
                className={cn(
                  'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                  filters.upcomingInterviewOnly
                    ? 'border-primary/40 bg-accent text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                )}
              >
                Has upcoming interview
              </button>
              <button
                type="button"
                aria-pressed={filters.unlinkedResumeOnly}
                onClick={() =>
                  onChange({
                    ...filters,
                    unlinkedResumeOnly: !filters.unlinkedResumeOnly,
                  })
                }
                className={cn(
                  'relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-y-1.5 after:content-[""]',
                  filters.unlinkedResumeOnly
                    ? 'border-primary/40 bg-accent text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:text-foreground'
                )}
              >
                No resume linked
              </button>
            </div>
          </div>

          {/* Active Period Filter Notice (synced with Insights DatePicker) */}
          {periodLabel && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-accent/50 px-3 py-2 text-xs">
              <span className="text-foreground">
                Applied period: <span className="font-semibold tabular-nums">{periodLabel}</span>
              </span>
              <button
                type="button"
                onClick={onClearPeriod}
                className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t border-border pt-3 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onResetAll}
            disabled={activeCount === 0}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Reset all
          </Button>
          <Button type="button" variant="default" onClick={onClose} className="font-semibold tabular-nums">
            Show {resultCount} {resultCount === 1 ? 'application' : 'applications'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
