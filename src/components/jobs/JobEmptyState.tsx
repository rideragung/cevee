import React from 'react';
import {
  IconBriefcase as Briefcase,
  IconCircleCheck as CircleCheck,
  IconFileText as FileText,
  IconPlus as Plus,
  IconSend as Send,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface JobEmptyStateProps {
  onCreateJob: () => void;
}

export const JobEmptyState: React.FC<JobEmptyStateProps> = ({ onCreateJob }) => {
  return (
    <Card className="group relative mx-auto my-6 max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-8 sm:py-12 sm:px-10 text-center shadow-pillow-secondary">
      {/* Layered Icon Stack */}
      <div
        aria-hidden="true"
        className="relative mx-auto mb-6 flex h-32 w-48 items-center justify-center select-none"
      >
        {/* Back Stack Card (Left tilt) */}
        <div className="absolute size-20 -translate-x-8 -translate-y-1 -rotate-12 rounded-2xl border border-border bg-card p-3 shadow-xs transition-transform duration-150 ease-out motion-safe:[@media(hover:hover)]:group-hover:-rotate-16 motion-safe:[@media(hover:hover)]:group-hover:-translate-x-9">
          <div className="flex h-full w-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <FileText className="size-4 text-muted-foreground" />
              <div className="size-1.5 rounded-full bg-border" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-muted" />
              <div className="h-1 w-3/4 rounded-full bg-muted" />
            </div>
          </div>
        </div>

        {/* Back Stack Card (Right tilt) */}
        <div className="absolute size-20 translate-x-8 -translate-y-1 rotate-12 rounded-2xl border border-border bg-card p-3 shadow-xs transition-transform duration-150 ease-out motion-safe:[@media(hover:hover)]:group-hover:rotate-16 motion-safe:[@media(hover:hover)]:group-hover:translate-x-9">
          <div className="flex h-full w-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="size-1.5 rounded-full bg-border" />
              <Send className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-5/6 rounded-full bg-muted" />
              <div className="h-1 w-1/2 rounded-full bg-muted" />
            </div>
          </div>
        </div>

        {/* Centerpiece Hero Card */}
        <div className="relative z-10 flex size-24 flex-col items-center justify-center rounded-2xl border border-border bg-card p-2.5 shadow-sm transition-transform duration-150 ease-out motion-safe:[@media(hover:hover)]:group-hover:scale-105">
          <div className="mb-1.5 flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
            <Briefcase className="size-6 text-primary" />
          </div>
          <div className="w-12 space-y-1">
            <div className="h-1 w-full rounded-full bg-primary/40" />
            <div className="h-0.5 w-8 mx-auto rounded-full bg-muted-foreground/25" />
          </div>

          {/* Top Left Status Badge */}
          <div className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-lg border border-border bg-card text-emerald-600 shadow-2xs">
            <CircleCheck className="size-3.5" />
          </div>

          {/* Bottom Right Plus Badge */}
          <div className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-2 ring-background">
            <Plus className="size-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
        Track your first job application
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Save roles you are applying for, link the resume version you sent, and check keyword match against the job description.
      </p>

      <div className="mt-6 flex items-center justify-center">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onCreateJob}
          className="gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-pillow-primary"
        >
          <Plus className="size-4" />
          <span>Add application</span>
        </Button>
      </div>
    </Card>
  );
};
