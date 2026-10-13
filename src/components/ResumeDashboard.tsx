import React, { useState } from 'react';
import { ResumeDocument } from '../types/resume';
import { FileText, Plus, Copy, Trash2, Eye, ArrowRight, Cloud, CalendarDays, LogOut, User as UserIcon, MoreVertical, Download } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface ResumeDashboardProps {
  resumes: ResumeDocument[];
  onSelectResume: (id: string) => void;
  onCreateResume: () => void;
  onDuplicateResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onPreviewResume: (id: string) => void;
  onDownloadResume: (id: string) => void;
  userEmail?: string | null;
  userName?: string | null;
  userAvatarUrl?: string | null;
  onSignOut?: () => void;
}

export const ResumeDashboard: React.FC<ResumeDashboardProps> = ({
  resumes,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onPreviewResume,
  onDownloadResume,
  userEmail,
  userName,
  userAvatarUrl,
  onSignOut,
}) => {
  const [deletingResume, setDeletingResume] = useState<ResumeDocument | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    const source = (name || userEmail || '').trim();
    if (!source) return '';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(userName);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-2">
              <span className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-2xs">
                <FileText size={18} />
              </span>
              Cevee
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onSignOut && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 hover:border-slate-300 shadow-2xs transition flex items-center justify-center bg-emerald-600 text-white"
                  title="Account"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : initials ? (
                    <span className="text-xs font-bold leading-none">{initials}</span>
                  ) : (
                    <UserIcon size={16} />
                  )}
                </button>

                {isUserMenuOpen && (
                  <>
                    {/* Backdrop to dismiss on outside click */}
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in-50">
                      {userEmail && (
                        <>
                          <div className="px-3 py-2 text-[11px] text-slate-500 truncate" title={userEmail}>
                            {userEmail}
                          </div>
                          <div className="border-t border-slate-100" />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                      >
                        <LogOut size={14} />
                        <span>Log out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 sm:py-10 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Resumes</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage, customize, and export your professional ATS-compliant resumes.
            </p>
          </div>

          {resumes.length > 0 && (
            <button
              type="button"
              onClick={onCreateResume}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex-shrink-0 whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Create Resume</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {resumes.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-2xs my-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">No resumes created yet</h2>
            <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
              You haven't created any resumes yet. Start building your first ATS-friendly resume to customize and download.
            </p>
            <button
              type="button"
              onClick={onCreateResume}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus size={15} />
              <span>Start Building Resume</span>
            </button>
          </div>
        ) : (
          /* Resumes Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => {
              const fullName = resume.content.header.fullName || 'Untitled Candidate';

              return (
                <div
                  key={resume.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Card Bar: title + actions (more, preview) */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg flex-shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h2
                            onClick={() => onSelectResume(resume.id)}
                            className="text-sm font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer transition"
                            title={resume.title}
                          >
                            {resume.title}
                          </h2>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {fullName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* More menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === resume.id ? null : resume.id)
                            }
                            className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                            title="More actions"
                            aria-label="More actions"
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === resume.id}
                          >
                            <MoreVertical size={15} />
                          </button>

                          {openMenuId === resume.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in-50">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onDuplicateResume(resume.id);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                                >
                                  <Copy size={14} className="text-blue-600" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onDownloadResume(resume.id);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                                >
                                  <Download size={14} className="text-emerald-600" />
                                  <span>Download</span>
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeletingResume(resume);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Preview button (rounded bordered box) */}
                        <button
                          type="button"
                          onClick={() => onPreviewResume(resume.id)}
                          className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                          title="Preview PDF"
                          aria-label="Preview PDF"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-3">
                      <span className="flex items-center gap-1" title="Last updated">
                        <Cloud size={12} className="text-emerald-500 flex-shrink-0" />
                        <span>
                          Last update:{' '}
                          <span className="text-slate-500 font-medium">
                            {formatDate(resume.updatedAt)}
                          </span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1" title="Date created">
                        <CalendarDays size={12} className="flex-shrink-0" />
                        <span>
                          Created:{' '}
                          <span className="text-slate-500 font-medium">
                            {formatDate(resume.createdAt || resume.updatedAt)}
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectResume(resume.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                    >
                      <span>Customize</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Resume Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingResume)}
        title={`Delete "${deletingResume?.title}"?`}
        description="This action cannot be undone. All customized sections, contact details, and formatted content in this resume will be permanently removed from your browser storage."
        confirmLabel="Delete Resume"
        cancelLabel="Keep Resume"
        isDestructive={true}
        onConfirm={() => {
          if (deletingResume) {
            onDeleteResume(deletingResume.id);
            setDeletingResume(null);
          }
        }}
        onCancel={() => setDeletingResume(null)}
      />

      {/* Mobile Bottom Action Bar: Create Resume (fixed white overlay) */}
      {resumes.length > 0 && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-6px_16px_-6px_rgba(15,23,42,0.15)] px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCreateResume}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            <span>Create Resume</span>
          </button>
        </div>
      )}
    </div>
  );
};
