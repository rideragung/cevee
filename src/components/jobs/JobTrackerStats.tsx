import React, { useMemo, useState } from 'react';
import {
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
} from '@tabler/icons-react';
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
  inYear: boolean;
  isFuture: boolean;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const DONUT_RADIUS = 38;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

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
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hoveredStage, setHoveredStage] = useState<ActiveJobStatus | null>(null);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const responseRate =
    stats.total > 0
      ? Math.round(((stats.onProgress + stats.offering) / stats.total) * 100)
      : 0;
  const offerRate =
    stats.total > 0 ? Math.round((stats.offering / stats.total) * 100) : 0;

  // Stage rows & Donut arcs
  const stageRows = useMemo(
    () => [
      {
        key: 'applied' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.applied,
        count: stats.applied,
        dotClass: 'bg-slate-400',
        strokeColor: '#94A3B8',
      },
      {
        key: 'on_progress' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.on_progress,
        count: stats.onProgress,
        dotClass: 'bg-primary',
        strokeColor: 'var(--primary)',
      },
      {
        key: 'offering' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.offering,
        count: stats.offering,
        dotClass: 'bg-emerald-500',
        strokeColor: '#10B981',
      },
      {
        key: 'rejected' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.rejected,
        count: stats.rejected,
        dotClass: 'bg-rose-500',
        strokeColor: '#E11D48',
      },
    ],
    [stats.applied, stats.onProgress, stats.offering, stats.rejected]
  );

  const donutArcs = useMemo(() => {
    if (stats.total <= 0) return [];
    const nonZeroCount = stageRows.filter((r) => r.count > 0).length;
    const gap = nonZeroCount > 1 ? 2.5 : 0;
    let cumulative = 0;

    return stageRows
      .filter((r) => r.count > 0)
      .map((row) => {
        const rawLength = (row.count / stats.total) * DONUT_CIRCUMFERENCE;
        const dashLength = Math.max(rawLength - gap, 1.5);
        const offset = -cumulative;
        cumulative += rawLength;
        return {
          ...row,
          dashArray: `${dashLength} ${DONUT_CIRCUMFERENCE - dashLength}`,
          dashOffset: offset,
        };
      });
  }, [stageRows, stats.total]);

  const focusedStage = hoveredStage ?? (activeFilter !== 'all' ? activeFilter : null);
  const focusedRow = focusedStage
    ? stageRows.find((r) => r.key === focusedStage) ?? null
    : null;

  // Full-Year Calendar Heatmap (Jan 1 – Dec 31 of selectedYear)
  const { weeks, monthColMap, yearTotal } = useMemo(() => {
    const countsByDate = new Map<string, number>();
    let totalInYear = 0;

    for (const job of jobs) {
      const rawDate = (job.appliedDate || job.createdAt || '').slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        countsByDate.set(rawDate, (countsByDate.get(rawDate) ?? 0) + 1);
        if (rawDate.startsWith(`${selectedYear}-`)) {
          totalInYear += 1;
        }
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = toLocalIsoDate(today);

    const jan1 = new Date(selectedYear, 0, 1);
    const dec31 = new Date(selectedYear, 11, 31);
    const startOffset = (jan1.getDay() + 6) % 7; // Mon=0 .. Sun=6
    const gridStart = new Date(selectedYear, 0, 1 - startOffset);

    const endOffset = 6 - ((dec31.getDay() + 6) % 7);
    const gridEnd = new Date(selectedYear, 11, 31 + endOffset);

    const totalDays =
      Math.round((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    const builtWeeks: HeatmapDay[][] = [];
    const monthLabels: Record<number, string> = {};

    for (let w = 0; w < totalWeeks; w += 1) {
      const col: HeatmapDay[] = [];
      for (let d = 0; d < 7; d += 1) {
        const dt = new Date(gridStart);
        dt.setDate(gridStart.getDate() + w * 7 + d);
        const inYear = dt.getFullYear() === selectedYear;
        const iso = toLocalIsoDate(dt);
        const isFuture = iso > todayIso;
        const count = inYear && !isFuture ? countsByDate.get(iso) ?? 0 : 0;

        if (inYear && dt.getDate() === 1 && monthLabels[w] === undefined) {
          monthLabels[w] = MONTH_NAMES[dt.getMonth()];
        }

        col.push({
          iso,
          label: formatFullDate(dt),
          count,
          level: getHeatLevel(count),
          inYear,
          isFuture,
        });
      }
      builtWeeks.push(col);
    }

    return { weeks: builtWeeks, monthColMap: monthLabels, yearTotal: totalInYear };
  }, [jobs, selectedYear]);

  const handleToggleStage = (stage: ActiveJobStatus) => {
    onFilterChange(activeFilter === stage ? 'all' : stage);
  };

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-[276px_minmax(0,1fr)] gap-3 items-stretch">
      {/* Left Card: Compact Donut Ring + 4 Clickable Stage Counters */}
      <Card className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            Pipeline breakdown
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{responseRate}%</span> response
          </span>
        </div>

        <div className="flex items-center gap-3.5 flex-1">
          {/* Interactive Donut Ring */}
          <svg
            width="96"
            height="96"
            viewBox="0 0 100 100"
            className="shrink-0"
            role="img"
            aria-label={`Pipeline breakdown: ${stats.total} total applications (${stats.applied} applied, ${stats.onProgress} on progress, ${stats.offering} offering, ${stats.rejected} rejected)`}
          >
            <circle
              cx="50"
              cy="50"
              r={DONUT_RADIUS}
              fill="none"
              className="stroke-muted"
              strokeWidth="11"
            />
            {donutArcs.map((arc) => {
              const isDimmed = Boolean(focusedStage && focusedStage !== arc.key);
              return (
                <circle
                  key={arc.key}
                  cx="50"
                  cy="50"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={arc.strokeColor}
                  strokeWidth="11"
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={arc.dashOffset}
                  transform="rotate(-90 50 50)"
                  onMouseEnter={() => setHoveredStage(arc.key)}
                  onMouseLeave={() => setHoveredStage(null)}
                  onClick={() => handleToggleStage(arc.key)}
                  style={{ opacity: isDimmed ? 0.25 : 1 }}
                  className="cursor-pointer transition-opacity duration-150 ease-out"
                />
              );
            })}
            <text
              x="50"
              y="48"
              textAnchor="middle"
              className="fill-foreground text-[18px] font-bold tabular-nums"
            >
              {focusedRow ? focusedRow.count : stats.total}
            </text>
            <text
              x="50"
              y="61"
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-medium"
            >
              {focusedRow ? focusedRow.label : 'Total'}
            </text>
          </svg>

          {/* 4 Clickable Stage Filter Rows */}
          <div
            role="group"
            aria-label="Filter applications by stage"
            className="flex flex-1 flex-col gap-0.5 min-w-0"
          >
            {stageRows.map((row) => {
              const isActive = activeFilter === row.key;
              return (
                <button
                  key={row.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleToggleStage(row.key)}
                  onMouseEnter={() => setHoveredStage(row.key)}
                  onMouseLeave={() => setHoveredStage(null)}
                  onFocus={() => setHoveredStage(row.key)}
                  onBlur={() => setHoveredStage(null)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg border px-2 py-1 text-xs transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-primary/25 bg-accent text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground [@media(hover:hover)]:hover:bg-muted/60 [@media(hover:hover)]:hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn('size-2 rounded-full shrink-0', row.dotClass)}
                      aria-hidden="true"
                    />
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

        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            Offer rate <span className="font-semibold text-foreground">{offerRate}%</span>
          </span>
          {activeFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Show all
            </button>
          ) : (
            <span>Click stage to filter</span>
          )}
        </div>
      </Card>

      {/* Right Card: Full-Year Jan–Dec Activity Heatmap */}
      <Card className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            Application activity
          </span>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{yearTotal}</span> in {selectedYear}
            </span>

            <div
              role="group"
              aria-label="Select activity year"
              className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 text-[11px] font-semibold text-foreground tabular-nums"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedYear((y) => y - 1);
                  setSelectedDay(null);
                }}
                aria-label={`Show ${selectedYear - 1}`}
                title={`Show ${selectedYear - 1}`}
                className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <span className="px-1.5">{selectedYear}</span>
              <button
                type="button"
                disabled={selectedYear >= currentYear}
                onClick={() => {
                  setSelectedYear((y) => Math.min(currentYear, y + 1));
                  setSelectedDay(null);
                }}
                aria-label={`Show ${selectedYear + 1}`}
                title={`Show ${selectedYear + 1}`}
                className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Responsive 52–53 Week Calendar Grid */}
        <div className="overflow-x-auto pb-0.5">
          <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-1.5 min-w-[540px]">
            {/* Weekday Axis */}
            <div
              className="grid grid-rows-7 gap-[2.5px] pt-[15px] text-[9px] leading-none font-medium text-muted-foreground items-center"
              aria-hidden="true"
            >
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
              <span />
            </div>

            <div>
              {/* Month Labels Row (Jan – Dec) */}
              <div
                className="mb-0.5 grid gap-[2.5px] h-[13px] text-[9.5px] leading-none font-medium text-muted-foreground"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
                aria-hidden="true"
              >
                {weeks.map((_, colIdx) => (
                  <span key={colIdx} className="overflow-visible whitespace-nowrap">
                    {monthColMap[colIdx] || ''}
                  </span>
                ))}
              </div>

              {/* Calendar Cells */}
              <div
                className="grid gap-[2.5px]"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
                role="grid"
                aria-label={`Daily job applications in ${selectedYear}`}
                onMouseLeave={() => setSelectedDay(null)}
              >
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[2.5px]" role="row">
                    {week.map((day) => {
                      if (!day.inYear) {
                        return (
                          <div
                            key={day.iso}
                            aria-hidden="true"
                            className="w-full aspect-square rounded-[2px] bg-transparent"
                          />
                        );
                      }

                      if (day.isFuture) {
                        return (
                          <div
                            key={day.iso}
                            title={day.label}
                            aria-hidden="true"
                            className="w-full aspect-square rounded-[2px] bg-muted/45"
                          />
                        );
                      }

                      const countText =
                        day.count === 1 ? '1 application' : `${day.count} applications`;
                      const isSelected = selectedDay?.iso === day.iso;

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
                            'w-full aspect-square rounded-[2px] transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            HEAT_LEVEL_CLASSES[day.level],
                            isSelected && 'ring-1 ring-foreground/60'
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Date Readout & 4-Level Legend */}
        <div className="mt-3 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
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
              `Jan – Dec ${selectedYear} · Hover or tap a day`
            )}
          </span>

          <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
            <span>Less</span>
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <span
                key={lvl}
                className={cn('size-[9px] rounded-[2px]', HEAT_LEVEL_CLASSES[lvl])}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
