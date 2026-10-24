import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';
import { RichTextEditor } from '../RichTextEditor';
import {
  IconPencil as Pencil,
  IconArrowDown as ArrowDown,
  IconArrowUp as ArrowUp,
  IconTrash as Trash2,
} from '@tabler/icons-react';
import { sanitizeHtml } from '../../utils/sanitize';
import { normalizeLayoutId } from '../../layouts/registry';

interface SummarySectionProps {
  title: string;
  showTitle?: boolean;
  isPlaceholder?: boolean;
  data: { html: string };
  layoutId?: string;
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
  layoutId,
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
  const normalizedLayout = normalizeLayoutId(layoutId);
  const topMarginClass = !showTitle
    ? normalizedLayout === 'modern-photo'
      ? 'mt-2.5'
      : normalizedLayout === 'standard-ats-v1'
        ? 'mt-2'
        : ''
    : '';

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
    <section className={`group relative mb-1.5 ${topMarginClass}`}>
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
          className="z-10 mb-1 ml-auto flex w-fit items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-muted-foreground opacity-100 shadow-sm transition no-print [@media(hover:hover)]:hover:text-foreground lg:absolute lg:-top-3.5 lg:right-0 lg:mb-0 lg:ml-0 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <button
            type="button"
            onClick={() => {
              setContent(isPlaceholder ? '' : data.html);
              setIsEditing(true);
            }}
            className="rounded p-1 text-muted-foreground transition [@media(hover:hover)]:hover:text-foreground"
            title="Edit summary"
          >
            <Pencil size={13} />
          </button>
          {!isFirst && (
            <button
              type="button"
              onClick={onMoveUp}
              className="rounded p-1 text-muted-foreground transition [@media(hover:hover)]:hover:text-foreground"
              title="Move summary up"
            >
              <ArrowUp size={13} />
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={onMoveDown}
              className="rounded p-1 text-muted-foreground transition [@media(hover:hover)]:hover:text-foreground"
              title="Move summary down"
            >
              <ArrowDown size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-destructive transition hover:text-destructive/80"
            title="Delete summary"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="my-2.5 rounded-xl border border-border bg-muted/50 p-4 font-sans shadow-sm no-print sm:p-5">
          {/* Header Section Title */}
          <div className="mb-5 border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">
              {title || 'Summary'}
            </h3>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-foreground">
              Summary description <span className="text-destructive">*</span>
            </label>
            <RichTextEditor
              initialContent={isPlaceholder ? '' : data.html}
              onChange={(newHtml) => setContent(newHtml)}
              hideActions={true}
              ariaLabel="Summary description"
              editorClassName="min-h-[90px] rounded-lg border border-input bg-card p-2.5 text-justify text-[7.75pt] leading-[1.48] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Action Bar (Cancel & Save) */}
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-semibold text-primary transition hover:text-primary/80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-primary px-6 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setContent(isPlaceholder ? '' : data.html);
            setIsEditing(true);
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          className={`cursor-pointer hover:bg-accent/50 p-1 -m-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resume-summary-text text-justify text-[7.75pt] leading-[1.48] ${
            isPlaceholder ? 'text-slate-400 select-none' : 'text-slate-800'
          }`}
          title="Click to edit profile summary"
          aria-label="Edit profile summary"
        >
          {isPlaceholder ? (
            <p className="text-slate-400">
              Results-driven professional with proven experience delivering impactful solutions and collaborating across multidisciplinary teams. Skilled in problem-solving, project execution, and standardizing workflows that drive measurable business outcomes. Passionate about continuous learning and contributing to high-performing product environments.
            </p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.html) }} />
          )}
        </div>
      )}
    </section>
  );
};

