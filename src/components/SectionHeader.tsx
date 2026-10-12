import React, { useState } from 'react';
import { Pencil, ArrowUp, ArrowDown, Trash2, Check } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onRename: (newTitle: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onToggleEdit?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onRename,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleEdit,
  isFirst = false,
  isLast = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editedTitle.trim()) {
      onRename(editedTitle.trim().toUpperCase());
    } else {
      setEditedTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="group relative resume-section-divider border-b-[0.5px] border-slate-900 pb-0.5 mb-1.5 mt-2.5 first:mt-0.5">
      <div className="flex items-center justify-between">
        {/* Title area */}
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5 py-0.5">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => handleTitleSubmit()}
              autoFocus
              className="text-[8.5pt] font-bold tracking-wider text-slate-900 uppercase border-b-2 border-emerald-500 bg-emerald-50/50 px-1 outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-600 hover:text-emerald-700 rounded no-print"
              title="Save Section Title"
            >
              <Check size={13} />
            </button>
          </form>
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-[8.5pt] font-bold tracking-wider text-slate-900 uppercase cursor-pointer hover:text-emerald-700 transition"
            title="Click to rename section"
          >
            {title}
          </h2>
        )}

        {/* Section action controls (pen, up, down, trash) in hover pill */}
        <div
          data-editor-control="true"
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-200 shadow-xs rounded-md px-1.5 py-0.5 text-slate-500 no-print transition"
        >
          {onToggleEdit && (
            <button
              type="button"
              onClick={onToggleEdit}
              className="p-1 text-slate-600 hover:text-slate-900 rounded transition"
              title="Edit Section"
            >
              <Pencil size={13} />
            </button>
          )}

          {!isFirst && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-slate-600 hover:text-slate-900 rounded transition"
              title="Move Up"
            >
              <ArrowUp size={13} />
            </button>
          )}

          {!isLast && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-slate-600 hover:text-slate-900 rounded transition"
              title="Move Down"
            >
              <ArrowDown size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-red-500 hover:text-red-700 rounded transition"
            title="Delete Section"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
