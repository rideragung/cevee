import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { SectionType } from '../types/resume';

interface AddSectionBarProps {
  onAddSection: (title: string, type: SectionType) => void;
  existingTitles: string[];
}

export const AddSectionBar: React.FC<AddSectionBarProps> = ({
  onAddSection,
  existingTitles,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const presetOptions: { title: string; type: SectionType }[] = [
    { title: 'CERTIFICATIONS', type: 'custom_list' },
    { title: 'LANGUAGES', type: 'custom_list' },
    { title: 'PUBLICATIONS', type: 'custom_list' },
    { title: 'AWARDS', type: 'custom_list' },
    { title: 'ORGANIZATIONAL & VOLUNTEERING EXPERIENCE', type: 'experience' },
    { title: 'REFERENCES', type: 'custom_list' },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim()) {
      onAddSection(customTitle.trim().toUpperCase(), 'custom_list');
      setCustomTitle('');
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="mt-4 pt-2.5 border-t border-slate-200 no-print" data-editor-control="true">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {presetOptions.map((opt) => {
          const isAdded = existingTitles.includes(opt.title);
          return (
            <button
              key={opt.title}
              type="button"
              disabled={isAdded}
              onClick={() => onAddSection(opt.title, opt.type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                isAdded
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900 shadow-sm'
              }`}
            >
              <Plus size={13} className={isAdded ? 'opacity-40' : 'text-slate-600'} />
              <span>
                Add{' '}
                {opt.title
                  .toLowerCase()
                  .split(' ')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
              </span>
            </button>
          );
        })}

        {/* Custom Section Button */}
        {!isCustomOpen ? (
          <button
            type="button"
            onClick={() => setIsCustomOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm transition"
          >
            <Plus size={13} />
            <span>Add Custom Section</span>
          </button>
        ) : (
          <form
            onSubmit={handleCustomSubmit}
            className="inline-flex items-center gap-1.5 p-1 bg-white border border-emerald-500 rounded-full shadow-sm"
          >
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Type section title..."
              autoFocus
              className="text-xs px-2.5 py-1 outline-none text-slate-900 w-44 rounded-full"
            />
            <button
              type="submit"
              className="p-1 text-emerald-600 hover:text-emerald-700 rounded-full"
              title="Add"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => setIsCustomOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
