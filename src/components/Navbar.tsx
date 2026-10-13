import React, { useState } from 'react';
import { ResumeDocument } from '../types/resume';
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  ChevronDown,
  Edit2,
  Check,
  ArrowLeft,
  Cloud,
  Loader2,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface NavbarProps {
  resumes: ResumeDocument[];
  currentResumeId: string;
  onSelectResume: (id: string) => void;
  onCreateResume: () => void;
  onDuplicateResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onRenameResume: (id: string, newTitle: string) => void;
  onOpenPreview: () => void;
  onDownloadPdf: () => void;
  onBackToDashboard?: () => void;
  syncStatus?: 'saved' | 'saving' | 'error';
  isCloudUser?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  resumes,
  currentResumeId,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onRenameResume,
  onOpenPreview,
  onDownloadPdf,
  onBackToDashboard,
  syncStatus = 'saved',
  isCloudUser = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const currentResume = resumes.find((r) => r.id === currentResumeId) || resumes[0];
  const [editTitle, setEditTitle] = useState(currentResume?.title || '');

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameResume(currentResume.id, editTitle.trim());
      setIsRenaming(false);
    }
  };

  const syncTitle =
    syncStatus === 'saving'
      ? isCloudUser
        ? 'Saving to Cloud...'
        : 'Saving...'
      : syncStatus === 'error'
      ? 'Saved Locally'
      : isCloudUser
      ? 'Synced to Cloud'
      : 'Saved Locally';

  return (
    <>
      <header className="app-navbar sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs no-print">
      <div className="w-full max-w-[210mm] mx-auto px-2.5 sm:px-6 min-[901px]:px-0 flex items-center justify-between gap-2 sm:gap-3 py-2 lg:h-14 lg:py-0">
        {/* Left: Back button (aligned to canvas left edge) */}
        <div className="flex items-center min-w-0 flex-1">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition flex-shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft size={15} />
              <span className="hidden md:inline">Back</span>
            </button>
          )}
        </div>

        {/* Center: sync indicator + file selector */}
        <div className="flex items-center gap-1.5 justify-center min-w-0">
          {/* Sync status icon only, placed left of the file selector */}
          <div className="flex items-center justify-center flex-shrink-0" title={syncTitle}>
            {syncStatus === 'saving' ? (
              <Loader2 size={14} className="animate-spin text-emerald-600" />
            ) : syncStatus === 'error' ? (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            ) : isCloudUser ? (
              <Cloud size={14} className="text-emerald-600" />
            ) : (
              <CheckCircle2 size={14} className="text-emerald-600" />
            )}
          </div>

          {/* Multi-CV Switcher Dropdown */}
          <div className="relative min-w-0">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRenameSubmit}
                  autoFocus
                  className="text-xs font-semibold px-2 py-1 border border-emerald-500 rounded outline-none w-36 sm:w-48"
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-600 hover:text-emerald-700"
                  title="Save"
                >
                  <Check size={14} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-md transition min-w-0"
                >
                  <span className="truncate max-w-[110px] sm:max-w-[220px]">
                    {currentResume?.title}
                  </span>
                  <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditTitle(currentResume.title);
                    setIsRenaming(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition flex-shrink-0"
                  title="Rename CV"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Transparent backdrop to cleanly dismiss dropdown on outside click */}
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Your Resumes ({resumes.length})
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    {resumes.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onSelectResume(r.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition ${
                          r.id === currentResumeId
                            ? 'bg-emerald-50 font-semibold text-emerald-900 border-l-2 border-emerald-600'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{r.title}</span>
                        {r.id === currentResumeId && (
                          <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 my-1" />

                  {/* Actions inside dropdown */}
                  <button
                    type="button"
                    onClick={() => {
                      onCreateResume();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                  >
                    <Plus size={14} className="text-emerald-600" />
                    <span>Create New Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onDuplicateResume(currentResume.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                  >
                    <Copy size={14} className="text-blue-600" />
                    <span>Duplicate Resume</span>
                  </button>

                  {resumes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(false);
                        setIsConfirmingDelete(true);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete Resume</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Preview + Download (aligned to canvas right edge, desktop only) */}
        <div className="hidden sm:flex items-center justify-end gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition shadow-2xs flex-shrink-0"
            title="Preview ATS layout (A4 format)"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition flex-shrink-0"
            title="Download PDF document"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Resume Deletion from Navbar */}
      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title={`Delete "${currentResume.title}"?`}
        description="This action cannot be undone. All customized sections, contact details, and formatted content in this resume will be permanently removed from your browser storage."
        confirmLabel="Delete Resume"
        cancelLabel="Keep Resume"
        isDestructive={true}
        onConfirm={() => {
          onDeleteResume(currentResume.id);
          setIsConfirmingDelete(false);
        }}
        onCancel={() => setIsConfirmingDelete(false)}
      />
      </header>

      {/* Mobile Bottom Action Bar (fixed white overlay, mobile only) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 no-print bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-6px_16px_-6px_rgba(15,23,42,0.15)] px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenPreview}
          className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex-shrink-0"
          title="Preview ATS layout (A4 format)"
          aria-label="Preview"
        >
          <Eye size={18} />
        </button>

        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          title="Download PDF document"
        >
          <Download size={16} />
          <span>Download PDF</span>
        </button>
      </div>
    </>
  );
};
