import React from 'react';
import { FileText, Sparkles, Layers, Plus, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResumeEmptyStateProps {
  onCreateResume: () => void;
}

/**
 * Empty state component featuring a layered "Icon Stack" illustration
 * following Pillow Light tokens and Better Design microcopy principles.
 */
export const ResumeEmptyState: React.FC<ResumeEmptyStateProps> = ({ onCreateResume }) => {
  return (
    <Card className="group relative mx-auto my-6 max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-8 sm:py-12 sm:px-10 text-center shadow-pillow-secondary">
      {/* Soft Ambient Radial Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 size-48 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Layered Icon Stack */}
      <div
        aria-hidden="true"
        className="relative mx-auto mb-6 flex h-32 w-48 items-center justify-center select-none"
      >
        {/* Back Stack Card (Left tilt) */}
        <div className="absolute size-20 -translate-x-8 -translate-y-1 -rotate-12 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-xs transition-transform duration-300 group-hover:-rotate-16 group-hover:-translate-x-9">
          <div className="flex h-full w-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <Layers className="size-4 text-primary/60" />
              <div className="size-1.5 rounded-full bg-primary/30" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-muted-foreground/20" />
              <div className="h-1 w-3/4 rounded-full bg-muted-foreground/15" />
            </div>
          </div>
        </div>

        {/* Back Stack Card (Right tilt) */}
        <div className="absolute size-20 translate-x-8 -translate-y-1 rotate-12 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-xs transition-transform duration-300 group-hover:rotate-16 group-hover:translate-x-9">
          <div className="flex h-full w-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="size-1.5 rounded-full bg-primary/30" />
              <FileCheck className="size-4 text-primary/70" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-5/6 rounded-full bg-muted-foreground/20" />
              <div className="h-1 w-1/2 rounded-full bg-muted-foreground/15" />
            </div>
          </div>
        </div>

        {/* Centerpiece Hero Card (Elevated Front) */}
        <div className="relative z-10 flex size-24 flex-col items-center justify-center rounded-2xl border-2 border-primary/25 bg-card p-2.5 shadow-md shadow-primary/5 ring-4 ring-primary/5 transition-transform duration-300 group-hover:scale-105">
          <div className="mb-1.5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-6 text-primary" />
          </div>
          <div className="w-12 space-y-1">
            <div className="h-1 w-full rounded-full bg-primary/40" />
            <div className="h-0.5 w-8 mx-auto rounded-full bg-muted-foreground/25" />
          </div>

          {/* Floating Sparkle Badge (Top Left) */}
          <div className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-lg border border-border bg-card text-amber-500 shadow-2xs">
            <Sparkles className="size-3.5 fill-amber-500/20" />
          </div>

          {/* Floating Plus Badge (Bottom Right) */}
          <div className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-2 ring-background">
            <Plus className="size-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* UX Writing: Forward-looking orientation and clear next steps */}
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
        Create your first resume
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        Choose an ATS-friendly layout, import an existing PDF, or start with a clean template.
      </p>

      {/* Primary Action Button */}
      <div className="mt-6 flex items-center justify-center">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onCreateResume}
          className="gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-pillow-primary hover:shadow-pillow-primary-hover active:scale-[0.98] transition-all"
        >
          <Plus className="size-4" />
          <span>Create resume</span>
        </Button>
      </div>
    </Card>
  );
};
