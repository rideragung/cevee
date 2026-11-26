import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ActiveJobStatus,
  JOB_STATUS_LABELS,
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
  activeFilter: ActiveJobStatus | 'all';
  onFilterChange: (nextFilter: ActiveJobStatus | 'all') => void;
}

interface StageSegment {
  key: ActiveJobStatus;
  label: string;
  count: number;
  pct: number;
  barClass: string;
  dotClass: string;
}

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 35,
};

export const JobTrackerStats: React.FC<JobTrackerStatsProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  const [hoveredStage, setHoveredStage] = useState<ActiveJobStatus | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const total = stats.total;
  const toPct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const responseCount = stats.onProgress + stats.offering;
  const responseRate = toPct(responseCount);
  const offerRate = toPct(stats.offering);

  const segments: StageSegment[] = [
    {
      key: 'applied',
      label: JOB_STATUS_LABELS.applied,
      count: stats.applied,
      pct: toPct(stats.applied),
      barClass: 'bg-slate-300',
      dotClass: 'bg-slate-400',
    },
    {
      key: 'on_progress',
      label: JOB_STATUS_LABELS.on_progress,
      count: stats.onProgress,
      pct: toPct(stats.onProgress),
      barClass: 'bg-primary',
      dotClass: 'bg-primary',
    },
    {
      key: 'offering',
      label: JOB_STATUS_LABELS.offering,
      count: stats.offering,
      pct: toPct(stats.offering),
      barClass: 'bg-emerald-500',
      dotClass: 'bg-emerald-500',
    },
    {
      key: 'rejected',
      label: JOB_STATUS_LABELS.rejected,
      count: stats.rejected,
      pct: toPct(stats.rejected),
      barClass: 'bg-rose-500',
      dotClass: 'bg-rose-500',
    },
  ];

  const focusedStage = hoveredStage ?? (activeFilter !== 'all' ? activeFilter : null);

  const handleToggleStage = (stage: ActiveJobStatus) => {
    onFilterChange(activeFilter === stage ? 'all' : stage);
  };

  return (
    <Card className="mb-6 rounded-2xl border border-border bg-card px-5 pt-5 pb-4 shadow-2xs">
      {/* Top Row: Hero Total + Key Rates */}
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[1.75rem] font-bold leading-none tracking-tight text-foreground tabular-nums">
            {total}
          </span>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total applications
          </span>
        </div>

        <p className="text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{responseRate}%</span> response
          <span className="mx-1.5 text-border" aria-hidden="true">
            ·
          </span>
          <span className="font-semibold text-foreground">{offerRate}%</span> offer
        </p>
      </div>

      {/* 8px Segmented Distribution Bar */}
      <div
        role="img"
        aria-label={`Pipeline distribution: ${stats.applied} applied, ${stats.onProgress} on progress, ${stats.offering} offering, ${stats.rejected} rejected`}
        className="mb-4 flex h-2 w-full gap-1 overflow-hidden rounded-full bg-muted"
      >
        {segments.map((seg) => {
          if (seg.count === 0 || total === 0) return null;
          const widthPct = (seg.count / total) * 100;
          const isDimmed = Boolean(focusedStage && focusedStage !== seg.key);

          return (
            <motion.div
              key={seg.key}
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1, opacity: isDimmed ? 0.25 : 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { scaleX: SPRING_TRANSITION, opacity: { duration: 0.15 } }
              }
              style={{ width: `${widthPct}%`, transformOrigin: 'left center' }}
              className={cn('h-full rounded-full', seg.barClass)}
            />
          );
        })}
      </div>

      {/* 4 Flat Clickable Metric Segments */}
      <div
        role="group"
        aria-label="Filter applications by stage"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
      >
        {segments.map((seg) => {
          const isActive = activeFilter === seg.key;
          return (
            <button
              key={seg.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleToggleStage(seg.key)}
              onMouseEnter={() => setHoveredStage(seg.key)}
              onMouseLeave={() => setHoveredStage(null)}
              onFocus={() => setHoveredStage(seg.key)}
              onBlur={() => setHoveredStage(null)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border px-2.5 py-2 text-left transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'border-primary/25 bg-accent'
                  : 'border-transparent bg-transparent [@media(hover:hover)]:hover:bg-muted/60'
              )}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn('size-2 rounded-full shrink-0', seg.dotClass)} aria-hidden="true" />
                <span className="truncate">{seg.label}</span>
              </span>
              <span className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-lg font-bold leading-tight tracking-tight text-foreground">
                  {seg.count}
                </span>
                <span className="text-xs text-muted-foreground">{seg.pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
