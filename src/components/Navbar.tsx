import React, { useState } from 'react';
import { ResumeDocument } from '../types/resume';
import {
  FileText,
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
  LogOut,
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
  userEmail?: string | null;
  onSignOut?: () => void;
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
  userEmail,
  onSignOut,
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

  return (
    <header className="app-navbar sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-3 gap-y-2 py-2 lg:h-14 lg:py-0">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 lg:flex-none">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 group hover:opacity-85 transition flex-shrink-0"
            title="Back to Resumes Dashboard"
          >
            <span className="bg-emerald-600 text-white p-1 rounded-md">
              <FileText size={16} />
            </span>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Cevee
            </span>
          </button>

          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition flex-shrink-0"
              title="View all resumes"
            >
              <ArrowLeft size={13} />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

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
                  className="text-xs font-semibold px-2 py-1 border border-emerald-500 rounded outline-none w-40 sm:w-48"
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
                  <span className="truncate max-w-[130px] sm:max-w-[220px]">
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
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
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

                <div className="absolute left-0 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in-50">
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

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto lg:justify-end">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-md">
            {syncStatus === 'saving' ? (
              <>
                <Loader2 size={13} className="animate-spin text-emerald-600" />
                <span>{isCloudUser ? 'Saving to Cloud...' : 'Saving...'}</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-800">Saved Locally</span>
              </>
            ) : (
              <>
                {isCloudUser ? <Cloud size={13} className="text-emerald-600" /> : <CheckCircle2 size={13} className="text-emerald-600" />}
                <span>{isCloudUser ? 'Cloud Synced' : 'Saved Locally'}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <button
              type="button"
              onClick={onOpenPreview}
              className="inline-flex flex-1 lg:flex-none items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition shadow-2xs"
              title="Preview ATS layout (A4 format)"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Preview PDF</span>
              <span className="sm:hidden">Preview</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex flex-1 lg:flex-none items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition"
              title="Download PDF document"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md transition flex-shrink-0"
              title={userEmail ? `Sign out (${userEmail})` : 'Sign out'}
            >
              <LogOut size={14} />
              <span className="hidden xl:inline">{userEmail ? userEmail.split('@')[0] : 'Sign out'}</span>
            </button>
          )}
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
  );
};
