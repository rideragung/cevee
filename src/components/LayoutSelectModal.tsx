import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { ResumeLayoutId } from '../types/resume';
import { RESUME_LAYOUTS, LayoutDefinition } from '../data/layouts';
import { ResumeMiniPreview } from './ResumeMiniPreview';

interface LayoutSelectModalProps {
  isOpen: boolean;
  mode: 'create' | 'switch';
  currentLayoutId?: string;
  onConfirm: (layoutId: ResumeLayoutId) => void;
  onClose: () => void;
}

export const LayoutSelectModal: React.FC<LayoutSelectModalProps> = ({
  isOpen,
  mode,
  currentLayoutId = 'classic-ats',
  onConfirm,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<ResumeLayoutId>(
    (currentLayoutId as ResumeLayoutId) || 'classic-ats'
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedId((currentLayoutId as ResumeLayoutId) || 'classic-ats');
    }
  }, [isOpen, currentLayoutId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedId);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="layout-modal-title"
      aria-describedby="layout-modal-desc"
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col relative font-sans animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/60 flex-shrink-0 mt-0.5">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h2
                id="layout-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
              >
                {mode === 'create' ? 'Choose resume layout' : 'Change resume layout'}
              </h2>
              <p
                id="layout-modal-desc"
                className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed"
              >
                {mode === 'create'
                  ? 'Select a layout format to start your resume. You can switch anytime inside the editor.'
                  : 'Select a layout format for this resume. All content and sections remain 100% intact.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
            title="Close dialog"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Layout Options */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
              const isSelected = selectedId === layout.id;

              return (
                <div
                  key={layout.id}
                  onClick={() => setSelectedId(layout.id)}
                  className={`cursor-pointer rounded-xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 items-start text-left relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  {/* High-Fidelity Vector Document Preview */}
                  <ResumeMiniPreview
                    layoutId={layout.id}
                    className="w-full sm:w-36 flex-shrink-0"
                  />

                  {/* Layout Metadata & Content */}
                  <div className="flex-1 min-w-0 pr-8 sm:pr-6">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {layout.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {layout.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {layout.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-1.5">
                      {layout.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-[11px] text-slate-700 font-medium"
                        >
                          <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Radio / Selection Circle */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-medium">
              ATS-optimized vector output • Zero data loss
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition inline-flex items-center justify-center gap-1.5"
              >
                <span>{mode === 'create' ? 'Create resume' : 'Apply layout'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
