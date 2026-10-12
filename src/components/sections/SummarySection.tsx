import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { RichTextEditor } from '../RichTextEditor';
import { Pencil, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

interface SummarySectionProps {
  title: string;
  showTitle?: boolean;
  isPlaceholder?: boolean;
  data: { html: string };
  onRename: (title: string) => void;
  onUpdateData: (data: { html: string }, isPlaceholder?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  title,
  showTitle = false,
  isPlaceholder = false,
  data,
  onRename,
  onUpdateData,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst,
  isLast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.html);

  const handleSave = () => {
    const hasText = Boolean(content && content.replace(/<[^>]*>/g, '').trim());
    onUpdateData({ html: content }, hasText ? false : isPlaceholder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(data.html);
    setIsEditing(false);
  };

  return (
    <section className="group relative mb-2.5">
      {showTitle && !isEditing && (
        <SectionHeader
          title={title}
          onRename={onRename}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onToggleEdit={() => setIsEditing(!isEditing)}
          isFirst={isFirst}
          isLast={isLast}
        />
      )}

      {/* Hover action toolbar when title is hidden */}
      {!showTitle && !isEditing && (
        <div
          data-editor-control="true"
          className="absolute -top-3.5 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-200 shadow-xs rounded-md px-1.5 py-0.5 text-slate-500 no-print transition z-10"
        >
          <button
            type="button"
            onClick={() => {
              setContent(isPlaceholder ? '' : data.html);
              setIsEditing(true);
            }}
            className="p-1 text-slate-600 hover:text-slate-900 rounded transition"
            title="Edit Summary"
          >
            <Pencil size={13} />
          </button>
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
            title="Delete Summary"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="bg-[#f8fafc] rounded-xl border border-slate-200/90 p-5 shadow-xs my-2.5 no-print font-sans">
          {/* Header Section Title */}
          <div className="border-b border-slate-900 pb-1 mb-5">
            <h3 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider">
              {title || 'SUMMARY'}
            </h3>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Summary Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              initialContent={isPlaceholder ? '' : data.html}
              onChange={(newHtml) => setContent(newHtml)}
              hideActions={true}
              editorClassName="min-h-[90px] p-2.5 text-[7.75pt] text-justify leading-[1.38] text-slate-800 focus:outline-none border border-slate-300 rounded-lg bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Action Bar (Cancel & Save) */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            setContent(isPlaceholder ? '' : data.html);
            setIsEditing(true);
          }}
          className={`cursor-pointer hover:bg-slate-50/70 p-1 -m-1 rounded transition resume-summary-text text-justify text-[7.75pt] leading-[1.38] ${
            isPlaceholder ? 'text-slate-400 select-none' : 'text-slate-800'
          }`}
          title="Click to edit profile summary"
        >
          {isPlaceholder ? (
            <p className="text-slate-400">
              A summary includes short, concise and targeted statements to summarize your skills and experiences. Mostly people will start with why they are here. What is the reason why they do what they do. Followed by “how” they do it and close it with “what” is the thing that they currently doing right now with respect to the ‘why’ and the ‘how’.
            </p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: data.html }} />
          )}
        </div>
      )}
    </section>
  );
};
