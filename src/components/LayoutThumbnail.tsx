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
  title = 'Classic ATS Layout',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`group relative aspect-[210/297] w-40 sm:w-44 xl:w-48 rounded-xl p-2 sm:p-2.5 bg-white transition-all select-none cursor-pointer flex flex-col justify-between text-left ${
        isActive
          ? 'border-2 border-emerald-600 ring-4 ring-emerald-500/15 shadow-md shadow-emerald-950/5'
          : 'border border-slate-200 hover:border-slate-400 hover:shadow-xs hover:scale-[1.01]'
      } ${className}`}
    >
      {/* High-Fidelity Vector Document Preview */}
      <ResumeMiniPreview
        layoutId={layoutId}
        className="w-full h-full border border-slate-200/80 shadow-2xs rounded-md"
      />

      {/* Active Indicator Badge (Top Right Corner) */}
      {isActive && (
        <span
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white z-10"
          aria-hidden="true"
        >
          <Check size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
};
