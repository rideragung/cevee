import React, { useMemo, useState } from 'react';
import {
  ActiveJobStatus,
  JOB_STATUS_LABELS,
  JobApplication,
} from '../../types/job';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface JobPipelineStats {
  total: number;
  applied: number;
  onProgress: number;
  offering: number;
  rejected: number;
}

interface JobTrackerStatsProps {
  stats: JobPipelineStats;
  jobs: JobApplication[];
  activeFilter: ActiveJobStatus | 'all';
  onFilterChange: (nextFilter: ActiveJobStatus | 'all') => void;
}

interface HeatmapDay {
  iso: string;
  label: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isFuture: boolean;
}

const WEEKS_TO_SHOW = 32;

const toLocalIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatFullDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

const formatShortMonth = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

const getHeatLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
};

const HEAT_LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-muted',
  1: 'bg-primary/20',
  2: 'bg-primary/45',
  3: 'bg-primary/75',
  4: 'bg-primary',
};

export const JobTrackerStats: React.FC<JobTrackerStatsProps> = ({
  stats,
  jobs,
  activeFilter,
  onFilterChange,
}) => {
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const { weeks, monthLabels, last7DaysCount } = useMemo(() => {
    const countsByDate = new Map<string, number>();
    for (const job of jobs) {
      const rawDate = (job.appliedDate || job.createdAt || '').slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        countsByDate.set(rawDate, (countsByDate.get(rawDate) ?? 0) + 1);
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = toLocalIsoDate(today);

    // Align grid to Monday..Sunday ending on current week's Sunday
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - dayOfWeek);

    const startMonday = new Date(currentWeekMonday);
    startMonday.setDate(currentWeekMonday.getDate() - (WEEKS_TO_SHOW - 1) * 7);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const sevenDaysAgoIso = toLocalIsoDate(sevenDaysAgo);

    let recent7 = 0;
    const builtWeeks: HeatmapDay[][] = [];
    const labels: { colIndex: number; text: string }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS_TO_SHOW; w += 1) {
      const col: HeatmapDay[] = [];
      for (let d = 0; d < 7; d += 1) {
        const cellDate = new Date(startMonday);
        cellDate.setDate(startMonday.getDate() + w * 7 + d);
        const iso = toLocalIsoDate(cellDate);
        const isFuture = iso > todayIso;
        const count = isFuture ? 0 : countsByDate.get(iso) ?? 0;

        if (!isFuture && iso >= sevenDaysAgoIso) {
          recent7 += count;
        }

        if (d === 0 && cellDate.getMonth() !== lastMonth) {
          labels.push({ colIndex: w, text: formatShortMonth(cellDate) });
          lastMonth = cellDate.getMonth();
        }

        col.push({
          iso,
          label: formatFullDate(cellDate),
          count,
          level: getHeatLevel(count),
          isFuture,
        });
      }
      builtWeeks.push(col);
    }

    return { weeks: builtWeeks, monthLabels: labels, last7DaysCount: recent7 };
  }, [jobs]);

  const stageRows: {
    key: ActiveJobStatus;
    label: string;
    count: number;
    dotClass: string;
  }[] = [
    { key: 'applied', label: JOB_STATUS_LABELS.applied, count: stats.applied, dotClass: 'bg-slate-400' },
    { key: 'on_progress', label: JOB_STATUS_LABELS.on_progress, count: stats.onProgress, dotClass: 'bg-primary' },
    { key: 'offering', label: JOB_STATUS_LABELS.offering, count: stats.offering, dotClass: 'bg-emerald-500' },
    { key: 'rejected', label: JOB_STATUS_LABELS.rejected, count: stats.rejected, dotClass: 'bg-rose-500' },
  ];

  const handleToggleStage = (stage: ActiveJobStatus) => {
    onFilterChange(activeFilter === stage ? 'all' : stage);
  };

  return (
    <Card className="mb-5 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
        {/* Left: Compact Clickable Stage Counters */}
        <div className="w-full md:w-[11.5rem] shrink-0 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            aria-pressed={activeFilter === 'all'}
            className="mb-0.5 flex items-baseline gap-2 rounded-lg px-2 py-0.5 text-left transition-colors [@media(hover:hover)]:hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Show all active stages"
          >
            <span className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Total applications
            </span>
          </button>

          <div
            role="group"
            aria-label="Filter applications by stage"
            className="grid grid-cols-2 md:grid-cols-1 gap-0.5"
          >
            {stageRows.map((row) => {
              const isActive = activeFilter === row.key;
              return (
                <button
                  key={row.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleToggleStage(row.key)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-2 py-0.5 text-xs transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-primary/25 bg-accent text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground [@media(hover:hover)]:hover:bg-muted/60 [@media(hover:hover)]:hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className={cn('size-1.5 rounded-full shrink-0', row.dotClass)} aria-hidden="true" />
                    <span className="truncate">{row.label}</span>
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {row.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Compact 32-Week Activity Heatmap (fixed 11px cells) */}
        <div className="min-w-0 flex-1 border-t border-border/70 pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-foreground">
              Application activity
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{last7DaysCount}</span> in the last 7 days
            </span>
          </div>

          <div className="overflow-x-auto pb-0.5">
            <div className="inline-block">
              {/* Month Labels Row */}
              <div
                className="mb-1 grid gap-[3px] text-[10px] leading-none font-medium text-muted-foreground"
                style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, 11px)` }}
                aria-hidden="true"
              >
                {Array.from({ length: WEEKS_TO_SHOW }).map((_, colIdx) => {
                  const label = monthLabels.find((m) => m.colIndex === colIdx);
                  return (
                    <span key={colIdx} className="overflow-visible whitespace-nowrap">
                      {label ? label.text : ''}
                    </span>
                  );
                })}
              </div>

              {/* 32 Weeks x 7 Days Fixed-Size Grid */}
              <div
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, 11px)` }}
                role="grid"
                aria-label="Daily job applications over the last 32 weeks"
                onMouseLeave={() => setSelectedDay(null)}
              >
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]" role="row">
                    {week.map((day) => {
                      const countText =
                        day.count === 1 ? '1 application' : `${day.count} applications`;
                      const isSelected = selectedDay?.iso === day.iso;

                      if (day.isFuture) {
                        return (
                          <div
                            key={day.iso}
                            aria-hidden="true"
                            className="size-[11px] rounded-[2.5px] bg-transparent"
                          />
                        );
                      }

                      return (
                        <button
                          key={day.iso}
                          type="button"
                          onMouseEnter={() => setSelectedDay(day)}
                          onFocus={() => setSelectedDay(day)}
                          onBlur={() => setSelectedDay(null)}
                          onClick={() =>
                            setSelectedDay((prev) => (prev?.iso === day.iso ? null : day))
                          }
                          aria-label={`${day.label}: ${countText}`}
                          title={`${day.label} — ${countText}`}
                          className={cn(
                            'size-[11px] rounded-[2.5px] transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                            HEAT_LEVEL_CLASSES[day.level],
                            isSelected && 'ring-1 ring-foreground/50'
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Exact Hover/Tap Readout + 4-Level Legend */}
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span role="status" aria-live="polite" className="tabular-nums truncate">
              {selectedDay ? (
                <>
                  <span className="font-semibold text-foreground">{selectedDay.label}</span>
                  {' · '}
                  {selectedDay.count === 1
                    ? '1 application'
                    : `${selectedDay.count} applications`}
                </>
              ) : (
                'Last 32 weeks · Hover or tap a day'
              )}
            </span>

            <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
              <span>Less</span>
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span
                  key={lvl}
                  className={cn('size-[10px] rounded-[2px]', HEAT_LEVEL_CLASSES[lvl])}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
