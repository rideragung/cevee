import React from 'react';
import { Check } from 'lucide-react';
import { ResumeLayoutId } from '../types/resume';
import { ResumeMiniPreview } from './ResumeMiniPreview';

interface LayoutThumbnailProps {
  layoutId: ResumeLayoutId | string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
}

export const LayoutThumbnail: React.FC<LayoutThumbnailProps> = ({
  layoutId,
  isActive = false,
  onClick,
  className = '',
  title = 'Standard ATS V1 Layout',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`group relative flex aspect-[210/297] w-40 cursor-pointer select-none flex-col justify-between rounded-xl bg-card p-2 text-left transition-[transform,box-shadow,border-color] duration-150 sm:w-44 sm:p-2.5 xl:w-48 ${
        isActive
          ? 'border-2 border-primary shadow-md shadow-primary/5 ring-4 ring-primary/15'
          : 'border border-border [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:shadow-sm motion-safe:[@media(hover:hover)]:hover:scale-[1.01]'
      } ${className}`}
    >
      {/* High-Fidelity Vector Document Preview */}
      <ResumeMiniPreview
        layoutId={layoutId}
        className="h-full w-full rounded-md border border-border/80"
      />

      {/* Active Indicator Badge (Top Right Corner) */}
      {isActive && (
        <span
          className="absolute -right-1.5 -top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background"
          aria-hidden="true"
        >
          <Check size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

