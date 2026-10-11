import React, { useState } from 'react';
import { ResumeDocument } from '../types/resume';
import { FileText, Plus, Copy, Trash2, Eye, ArrowRight, Clock, LogOut } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface ResumeDashboardProps {
  resumes: ResumeDocument[];
  onSelectResume: (id: string) => void;
  onCreateResume: () => void;
  onDuplicateResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onPreviewResume: (id: string) => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const ResumeDashboard: React.FC<ResumeDashboardProps> = ({
  resumes,
  onSelectResume,
  onCreateResume,
  onDuplicateResume,
  onDeleteResume,
  onPreviewResume,
  userEmail,
  onSignOut,
}) => {
  const [deletingResume, setDeletingResume] = useState<ResumeDocument | null>(null);

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
            {userEmail && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {userEmail}
              </span>
            )}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}

            {resumes.length > 0 && (
              <button
                type="button"
                onClick={onCreateResume}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <Plus size={15} />
                <span>Create New Resume</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Resumes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, customize, and export your professional ATS-compliant resumes.
          </p>
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
              const sectionCount = resume.content.sections.length;

              return (
                <div
                  key={resume.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Card Bar */}
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
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 pt-3 mt-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatDate(resume.updatedAt)}</span>
                      </span>
                      <span>•</span>
                      <span>{sectionCount} sections</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onPreviewResume(resume.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Preview PDF"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateResume(resume.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Duplicate Resume"
                      >
                        <Copy size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingResume(resume)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Resume"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectResume(resume.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
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
    </div>
  );
};
