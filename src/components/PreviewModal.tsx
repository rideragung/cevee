import React, { useState } from 'react';
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
  const [zoom, setZoom] = useState(0.9);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-between overflow-hidden animate-in fade-in no-print">
      {/* Top Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">
            1:1 PDF Preview • {resume.title}
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 hidden sm:inline">
            Standard A4 Print (210 × 297 mm)
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 px-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs text-slate-200 px-2 font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
              className="p-1.5 text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(0.9)}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow-xs"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start bg-slate-800/95">
        <PaginatedResumeView resume={resume} scale={zoom} showPageNumbers={true} />
      </div>
    </div>
  );
};
