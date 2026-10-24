import React, { useState } from 'react';
import { ResumeDocument } from '../types/resume';
import {
  IconX as X,
  IconZoomIn as ZoomIn,
  IconZoomOut as ZoomOut,
  IconRotate2 as RotateCcw,
  IconDownload as Download,
} from '@tabler/icons-react';
import { PaginatedResumeView } from './PaginatedResumeView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface PreviewModalProps {
  resume: ResumeDocument;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  resume,
  isOpen,
  onClose,
  onDownload,
}) => {
  const getInitialZoom = () => {
    if (typeof window === 'undefined') return 0.9;
    const available = window.innerWidth - 24;
    const fit = available / 794;
    return Number(Math.min(0.9, Math.max(0.3, fit)).toFixed(2));
  };

  const [zoom, setZoom] = useState(getInitialZoom);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="no-print grid h-[100dvh] w-screen max-w-none grid-rows-[auto_1fr] gap-0 overflow-hidden border-0 bg-foreground p-0 text-background shadow-none sm:rounded-none [&>button]:hidden">
        <DialogTitle className="sr-only">Resume preview</DialogTitle>
        <DialogDescription className="sr-only">
          Full-screen A4 preview of {resume.title}
        </DialogDescription>

        {/* Top Toolbar */}
        <div className="z-30 flex flex-shrink-0 items-center justify-between gap-3 border-b border-background/10 bg-foreground/95 px-3 py-2.5 shadow-md sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="truncate text-sm font-semibold">PDF preview</span>
            <span className="hidden truncate text-xs text-background/60 sm:inline">
              {resume.title}
            </span>
            <Badge
              variant="outline"
              className="hidden border-background/15 text-[11px] text-background/70 sm:inline-flex"
            >
              A4, 210 × 297 mm
            </Badge>
          </div>

          {/* Zoom & Action Controls */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="hidden items-center rounded-lg border border-background/10 bg-background/5 px-1 sm:flex">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
                className="size-8 text-background/70 [@media(hover:hover)]:hover:bg-background/10 [@media(hover:hover)]:hover:text-background"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="px-2 text-xs tabular-nums text-background/80">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
                className="size-8 text-background/70 [@media(hover:hover)]:hover:bg-background/10 [@media(hover:hover)]:hover:text-background"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setZoom(getInitialZoom())}
                className="size-8 text-background/70 [@media(hover:hover)]:hover:bg-background/10 [@media(hover:hover)]:hover:text-background"
                title="Reset zoom"
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onDownload}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 text-background/70 [@media(hover:hover)]:hover:bg-background/10 [@media(hover:hover)]:hover:text-background"
              title="Close preview"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-foreground/95 p-3 sm:p-10">
          <PaginatedResumeView resume={resume} scale={zoom} showPageNumbers={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

