import React, { useEffect, useState } from 'react';
import { ResumeDocument } from '../types/resume';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { PaginatedResumeView } from './PaginatedResumeView';

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume preview"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-between overflow-hidden no-print"
    >
      {/* Top Toolbar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-3 flex items-center justify-between gap-3 shadow-md z-30">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-sm truncate">
            1:1 PDF Preview • {resume.title}
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 hidden sm:inline flex-shrink-0">
            Standard A4 Print (210 × 297 mm)
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center bg-slate-800 rounded-md border border-slate-700 px-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs text-slate-200 px-2 font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(getInitialZoom())}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow-sm"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition"
            title="Close (Esc)"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto p-3 sm:p-10 flex justify-center items-start bg-slate-800/95">
        <PaginatedResumeView resume={resume} scale={zoom} showPageNumbers={true} />
      </div>
    </div>
  );
};
