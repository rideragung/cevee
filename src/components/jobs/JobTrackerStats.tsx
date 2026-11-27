import React, { useMemo, useRef, useState } from 'react';
import {
  ActiveJobStatus,
  JOB_STATUS_LABELS,
  JobApplication,
} from '../../types/job';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { StudioDonutChart } from './StudioDonutChart';
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
  selectedDate: string | null;
  onDateFilterChange: (nextDate: string | null) => void;
  selectedYearFilter: number | null;
  onYearFilterChange: (nextYear: number | null) => void;
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

const toLocalIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseIsoToLocalDate = (iso: string): Date | undefined => {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return undefined;
  return new Date(parts[0], parts[1] - 1, parts[2]);
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
  selectedDate,
  onDateFilterChange,
  selectedYearFilter,
  onYearFilterChange,
}) => {
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const currentYear = todayDate.getFullYear();
  const [selectedYear, setSelectedYear] = useState(
    () => selectedYearFilter ?? (selectedDate ? Number(selectedDate.slice(0, 4)) : currentYear)
  );
  const [hoveredStage, setHoveredStage] = useState<ActiveJobStatus | null>(null);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [focusedIso, setFocusedIso] = useState<string | null>(null);
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const stageRows = useMemo(
    () => [
      {
        key: 'applied' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.applied,
        count: stats.applied,
        dotClass: 'bg-[#7C3AED]',
        color: '#A78BFA',
        colorEnd: '#6D28D9',
      },
      {
        key: 'on_progress' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.on_progress,
        count: stats.onProgress,
        dotClass: 'bg-[#1E66FF]',
        color: '#60A5FA',
        colorEnd: '#1E66FF',
      },
      {
        key: 'offering' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.offering,
        count: stats.offering,
        dotClass: 'bg-[#00C896]',
        color: '#34D399',
        colorEnd: '#059669',
      },
      {
        key: 'rejected' as ActiveJobStatus,
        label: JOB_STATUS_LABELS.rejected,
        count: stats.rejected,
        dotClass: 'bg-[#FF4D6D]',
        color: '#FB7185',
        colorEnd: '#E11D48',
      },
    ],
    [stats.applied, stats.onProgress, stats.offering, stats.rejected]
  );

  const donutData = useMemo(
    () =>
      stageRows.map((row) => ({
        key: row.key,
        label: row.label,
        value: row.count,
        color: row.color,
        colorEnd: row.colorEnd,
      })),
    [stageRows]
  );

  // Full-Year Calendar Heatmap (Jan 1 to Dec 31 of selectedYear), synced with activeFilter
  const {
    weeks,
    monthColMap,
    yearTotal,
    selectableIsos,
    dayLookup,
    defaultTabIso,
  } = useMemo(() => {
    const scopedJobs =
      activeFilter === 'all'
        ? jobs
        : jobs.filter((job) => job.status === activeFilter);

    const countsByDate = new Map<string, number>();
    let totalInYear = 0;

    for (const job of scopedJobs) {
      const rawDate = (job.appliedDate || job.createdAt || '').slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        countsByDate.set(rawDate, (countsByDate.get(rawDate) ?? 0) + 1);
        if (rawDate.startsWith(`${selectedYear}-`)) {
          totalInYear += 1;
        }
      }
    }

    const todayIso = toLocalIsoDate(todayDate);

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
    const validIsos: string[] = [];
    const lookup = new Map<string, HeatmapDay>();

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

        const dayObj: HeatmapDay = {
          iso,
          label: formatFullDate(dt),
          count,
          level: getHeatLevel(count),
          inYear,
          isFuture,
        };

        if (inYear && !isFuture) {
          validIsos.push(iso);
          lookup.set(iso, dayObj);
        }

        col.push(dayObj);
      }
      builtWeeks.push(col);
    }

    const fallbackIso = validIsos.includes(todayIso)
      ? todayIso
      : validIsos[validIsos.length - 1] ?? null;

    return {
      weeks: builtWeeks,
      monthColMap: monthLabels,
      yearTotal: totalInYear,
      selectableIsos: validIsos,
      dayLookup: lookup,
      defaultTabIso: fallbackIso,
    };
  }, [jobs, activeFilter, selectedYear, todayDate]);

  const activeTabIso =
    (focusedIso && dayLookup.has(focusedIso) ? focusedIso : null) ??
    (selectedDate && dayLookup.has(selectedDate) ? selectedDate : null) ??
    defaultTabIso;

  const selectedDayObj = selectedDate ? dayLookup.get(selectedDate) ?? null : null;
  const selectedDateValue = useMemo(
    () => (selectedDate ? parseIsoToLocalDate(selectedDate) : undefined),
    [selectedDate]
  );

  const pickerYears = useMemo(() => {
    const currentYear = todayDate.getFullYear();
    let earliestDataYear = currentYear;

    for (const job of jobs) {
      const rawYear = Number((job.appliedDate || job.createdAt || '').slice(0, 4));
      if (Number.isFinite(rawYear) && rawYear >= 2000 && rawYear < earliestDataYear) {
        earliestDataYear = rawYear;
      }
    }

    // Always offer the current year plus the previous three, so the year menu
    // never locks to a single year when all applications share one date year.
    // Older data extends the range on its own.
    const floorYear = Math.min(earliestDataYear, currentYear - 3);

    const list: number[] = [];
    for (let year = currentYear; year >= floorYear; year -= 1) {
      list.push(year);
    }
    return list;
  }, [jobs, todayDate]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return null;
    if (selectedDayObj) return selectedDayObj.label;
    return selectedDateValue ? formatFullDate(selectedDateValue) : selectedDate;
  }, [selectedDate, selectedDayObj, selectedDateValue]);

  const handleToggleStage = (stage: ActiveJobStatus) => {
    onFilterChange(activeFilter === stage ? 'all' : stage);
  };

  const handleSelectDay = (day: HeatmapDay) => {
    if (selectedDate === day.iso) {
      onDateFilterChange(null);
      return;
    }
    onDateFilterChange(day.iso);
  };

  const handleDatePickerChange = (nextDate: Date | undefined) => {
    if (!nextDate) {
      onDateFilterChange(null);
      return;
    }
    const iso = toLocalIsoDate(nextDate);
    setSelectedYear(nextDate.getFullYear());
    setHoveredDay(null);
    setFocusedIso(iso);
    onDateFilterChange(iso);
  };

  const handleYearFilterChange = (year: number | null) => {
    if (year !== null) {
      setSelectedYear(year);
      setHoveredDay(null);
      setFocusedIso(null);
    }
    onYearFilterChange(year);
  };

  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, iso: string) => {
    const idx = selectableIsos.indexOf(iso);
    if (idx === -1) return;

    let nextIdx: number | null = null;
    if (event.key === 'ArrowRight') nextIdx = Math.min(selectableIsos.length - 1, idx + 7);
    if (event.key === 'ArrowLeft') nextIdx = Math.max(0, idx - 7);
    if (event.key === 'ArrowDown') nextIdx = Math.min(selectableIsos.length - 1, idx + 1);
    if (event.key === 'ArrowUp') nextIdx = Math.max(0, idx - 1);
    if (event.key === 'Home') nextIdx = 0;
    if (event.key === 'End') nextIdx = selectableIsos.length - 1;

    if (nextIdx !== null && nextIdx !== idx) {
      event.preventDefault();
      const targetIso = selectableIsos[nextIdx];
      setFocusedIso(targetIso);
      const targetDay = dayLookup.get(targetIso) ?? null;
      setHoveredDay(targetDay);
      cellRefs.current.get(targetIso)?.focus();
    }
  };

  const applicationCount = `${yearTotal} ${yearTotal === 1 ? 'application' : 'applications'}`;
  const yearCountLabel = selectedYearFilter === null
    ? `${applicationCount} in ${selectedYear}`
    : applicationCount;

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)] gap-3 items-stretch">
      {/* Left Card: Applications by stage + Studio Plan Donut */}
      <Card className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="mb-3 flex min-h-8 items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            Applications by stage
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1">
          <StudioDonutChart
            data={donutData}
            total={stats.total}
            defaultLabel="Total"
            size={110}
            activeKey={activeFilter !== 'all' ? activeFilter : null}
            hoveredKey={hoveredStage}
            onHoverChange={setHoveredStage}
            onSelect={handleToggleStage}
            ariaLabel={`Applications by stage: ${stats.total} total (${stats.applied} applied, ${stats.onProgress} on progress, ${stats.offering} offering, ${stats.rejected} rejected)`}
          />

          {/* 4 Clickable Stage Filter Rows (Solid Bullets) */}
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

        {/* Simple Guidance Footer */}
        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          {activeFilter !== 'all' ? (
            <>
              <span className="truncate">
                Stage:{' '}
                <span className="font-semibold text-foreground">
                  {JOB_STATUS_LABELS[activeFilter]}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className="font-semibold text-primary hover:underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Clear filter
              </button>
            </>
          ) : (
            <span>Select a stage to filter</span>
          )}
        </div>
      </Card>

      {/* Right Card: Full-Year Jan to Dec Daily Applications Heatmap */}
      <Card className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-semibold text-foreground">
              Daily applications
            </span>
            <span className="truncate text-[11px] text-muted-foreground tabular-nums">
              {yearCountLabel}
            </span>
          </div>

          <DatePicker
            value={selectedDateValue}
            onChange={handleDatePickerChange}
            selectedYearFilter={selectedYearFilter}
            onYearFilterChange={handleYearFilterChange}
            initialYear={selectedYear}
            years={pickerYears}
            placeholder="Pick date"
            maxDate={todayDate}
            align="end"
            ariaLabel={
              formattedSelectedDate
                ? `${formattedSelectedDate}. Change date or year filter`
                : selectedYearFilter !== null
                  ? `${selectedYearFilter}. Change year or date filter`
                  : 'Pick date or year to filter applications'
            }
          />
        </div>

        {/* Full-Width Responsive 52 to 53 Week Calendar Grid */}
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
              {/* Month Labels Row */}
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

              {/* Calendar Cells with Roving Tabindex */}
              <div
                className="grid gap-[2.5px]"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
                role="grid"
                aria-label={`Daily job applications in ${selectedYear}. Use arrow keys to move across days and Enter to filter.`}
                onMouseLeave={() => setHoveredDay(null)}
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
                      const isLocked = selectedDate === day.iso;
                      const isHovered = hoveredDay?.iso === day.iso;
                      const isTabStop = activeTabIso === day.iso;

                      return (
                        <button
                          key={day.iso}
                          ref={(node) => {
                            if (node) {
                              cellRefs.current.set(day.iso, node);
                            } else {
                              cellRefs.current.delete(day.iso);
                            }
                          }}
                          type="button"
                          role="gridcell"
                          tabIndex={isTabStop ? 0 : -1}
                          aria-pressed={isLocked}
                          aria-label={`${day.label}: ${countText}`}
                          title={`${day.label}: ${countText}`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onFocus={() => {
                            setFocusedIso(day.iso);
                            setHoveredDay(day);
                          }}
                          onBlur={() => setHoveredDay(null)}
                          onKeyDown={(e) => handleGridKeyDown(e, day.iso)}
                          onClick={() => handleSelectDay(day)}
                          className={cn(
                            'w-full aspect-square rounded-[2px] cursor-pointer transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            HEAT_LEVEL_CLASSES[day.level],
                            isLocked
                              ? 'ring-2 ring-foreground'
                              : isHovered && 'ring-1 ring-foreground/60'
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

        {/* Daily detail and intensity legend */}
        <div className="mt-3 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 min-w-0 tabular-nums"
          >
            {hoveredDay ? (
              <span className="truncate">
                <span className="font-semibold text-foreground">{hoveredDay.label}</span>
                {': '}
                {hoveredDay.count === 1
                  ? '1 application'
                  : `${hoveredDay.count} applications`}
              </span>
            ) : selectedDayObj ? (
              <span className="truncate">
                <span className="font-semibold text-foreground">{selectedDayObj.label}</span>
                {`: ${selectedDayObj.count} ${selectedDayObj.count === 1 ? 'application' : 'applications'}`}
              </span>
            ) : null}
          </div>

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
