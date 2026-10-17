import React, { useState } from 'react';
import { ResumeLayoutId } from '../types/resume';
import { RESUME_LAYOUTS, LayoutDefinition } from '../data/layouts';
import { normalizeLayoutId } from '../layouts/registry';
import { LayoutThumbnail } from './LayoutThumbnail';
import { LayoutTemplate, X } from 'lucide-react';

interface LayoutSidebarProps {
  activeLayoutId: ResumeLayoutId | string;
  onSelectLayout: (layoutId: ResumeLayoutId) => void;
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  activeLayoutId,
  onSelectLayout,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Left Sidebar Container (Docked, Full Height Beside Navbar & Canvas) */}
      <aside className="no-print hidden lg:flex flex-col w-56 xl:w-64 bg-white border-r border-slate-200/90 flex-shrink-0 sticky top-0 h-screen z-30">
        <div className="h-14 border-b border-slate-200 flex items-center gap-2 px-4 flex-shrink-0">
          <LayoutTemplate size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Layouts</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4">
          {/* Layout Selector Inside Container (Pure Visual Preview, Zero Text) */}
          {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
            const isActive = normalizeLayoutId(activeLayoutId) === layout.id;

            return (
              <LayoutThumbnail
                key={layout.id}
                layoutId={layout.id}
                isActive={isActive}
                onClick={() => onSelectLayout(layout.id)}
                title={layout.name}
              />
            );
          })}
        </div>
      </aside>

      {/* Mobile & Tablet Floating Left Rail Trigger */}
      <div className="lg:hidden fixed left-2.5 top-20 z-30 no-print">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur border border-slate-200/90 shadow-md text-slate-700 hover:text-emerald-700 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Change layout"
          aria-label="Change layout"
        >
          <LayoutTemplate size={18} />
        </button>
      </div>

      {/* Mobile Drawer Container */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 no-print flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Left Container Drawer */}
          <div className="relative w-56 sm:w-64 max-w-[80vw] h-full bg-white border-r border-slate-200 shadow-2xl flex flex-col z-10">
            {/* Header: Close button only */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition"
                title="Close"
                aria-label="Close layout drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Layout Selector inside Drawer Container (Pure Visual Preview, Zero Text) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4">
              {RESUME_LAYOUTS.map((layout: LayoutDefinition) => {
                const isActive = normalizeLayoutId(activeLayoutId) === layout.id;

                return (
                  <LayoutThumbnail
                    key={layout.id}
                    layoutId={layout.id}
                    isActive={isActive}
                    onClick={() => {
                      onSelectLayout(layout.id);
                      setIsMobileOpen(false);
                    }}
                    title={layout.name}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
