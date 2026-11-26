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

const WEEKS_TO_SHOW = 16;

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
    <Card className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-[12.5rem_minmax(0,1fr)] gap-5 md:gap-6 items-center">
        {/* Left: Compact Clickable Stage Counters */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            aria-pressed={activeFilter === 'all'}
            className="mb-1 flex items-baseline gap-2 rounded-lg px-2 py-1 text-left transition-colors [@media(hover:hover)]:hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Show all active stages"
          >
            <span className="text-[1.75rem] font-bold leading-none tracking-tight text-foreground tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Total applications
            </span>
          </button>

          <div role="group" aria-label="Filter applications by stage" className="flex flex-col gap-0.5">
            {stageRows.map((row) => {
              const isActive = activeFilter === row.key;
              return (
                <button
                  key={row.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleToggleStage(row.key)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-2 py-1 text-xs transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-primary/25 bg-accent text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground [@media(hover:hover)]:hover:bg-muted/60 [@media(hover:hover)]:hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={cn('size-2 rounded-full shrink-0', row.dotClass)} aria-hidden="true" />
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

        {/* Right: 16-Week Daily Application Activity Heatmap */}
        <div className="min-w-0 border-t border-border/70 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-foreground">
              Application activity
            </span>
            <span className="text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{last7DaysCount}</span> in the last 7 days
            </span>
          </div>

          {/* Month Labels Row */}
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[300px]">
              <div
                className="mb-1.5 grid gap-1 text-[10px] font-medium text-muted-foreground"
                style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, minmax(0, 1fr))` }}
                aria-hidden="true"
              >
                {Array.from({ length: WEEKS_TO_SHOW }).map((_, colIdx) => {
                  const label = monthLabels.find((m) => m.colIndex === colIdx);
                  return (
                    <span key={colIdx} className="truncate">
                      {label ? label.text : ''}
                    </span>
                  );
                })}
              </div>

              {/* 16 Weeks x 7 Days Grid */}
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, minmax(0, 1fr))` }}
                role="grid"
                aria-label="Daily job applications over the last 16 weeks"
                onMouseLeave={() => setSelectedDay(null)}
              >
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1" role="row">
                    {week.map((day) => {
                      const countText =
                        day.count === 1 ? '1 application' : `${day.count} applications`;
                      const isSelected = selectedDay?.iso === day.iso;

                      if (day.isFuture) {
                        return (
                          <div
                            key={day.iso}
                            aria-hidden="true"
                            className="aspect-square w-full rounded-[4px] bg-transparent"
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
                            'aspect-square w-full rounded-[4px] transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                            HEAT_LEVEL_CLASSES[day.level],
                            isSelected && 'ring-1 ring-foreground/40'
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
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
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
                'Last 16 weeks · Select a day for count'
              )}
            </span>

            <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <span>Less</span>
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span
                  key={lvl}
                  className={cn('size-2.5 rounded-[3px]', HEAT_LEVEL_CLASSES[lvl])}
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
