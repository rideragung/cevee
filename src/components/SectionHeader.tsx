import React, { useState, useEffect, useRef } from 'react';
import {
  IconPencil as Pencil,
  IconArrowUp as ArrowUp,
  IconArrowDown as ArrowDown,
  IconTrash as Trash2,
  IconCheck as Check,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

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
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const trimmed = editedTitle.trim();
    if (trimmed) {
      if (trimmed.toUpperCase() !== title) {
        onRename(trimmed.toUpperCase());
      }
    } else {
      setEditedTitle(title);
    }
    setIsEditingTitle(false);
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 100);
  };

  return (
    <div className="group relative resume-section-divider border-b-[0.5px] border-slate-900 pb-0.5 mb-[4.5917pt] mt-[5.2058pt]">
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
              className="text-[8.5pt] font-bold tracking-wider text-slate-900 uppercase border-b-2 border-primary bg-accent/40 px-1 outline-none rounded-t"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-6 text-primary no-print"
              title="Save section title"
              aria-label="Save section title"
            >
              <Check className="size-3.5" />
            </Button>
          </form>
        ) : (
          <h2 className="inline-flex items-center gap-1.5 text-[8.5pt] font-bold uppercase tracking-wider text-slate-900">
            <span>{title}</span>
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="no-print inline-flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity duration-150 [@media(hover:hover)]:hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label={`Rename ${title}`}
            >
              <Pencil className="size-3" />
            </button>
          </h2>
        )}

        {/* Section action controls in hover pill */}
        <div
          data-editor-control="true"
          className="no-print flex flex-shrink-0 items-center gap-0.5 rounded-lg border border-border bg-card px-1 py-0.5 text-muted-foreground opacity-100 shadow-2xs transition-opacity duration-150 lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100"
        >
          {onToggleEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleEdit}
              className="size-6 text-muted-foreground [@media(hover:hover)]:hover:text-foreground"
              title="Edit section"
              aria-label="Edit section"
            >
              <Pencil className="size-3" />
            </Button>
          )}

          {!isFirst && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMoveUp}
              className="size-6 text-muted-foreground [@media(hover:hover)]:hover:text-foreground"
              title="Move section up"
              aria-label="Move section up"
            >
              <ArrowUp className="size-3" />
            </Button>
          )}

          {!isLast && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMoveDown}
              className="size-6 text-muted-foreground [@media(hover:hover)]:hover:text-foreground"
              title="Move section down"
              aria-label="Move section down"
            >
              <ArrowDown className="size-3" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="size-6 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            title="Delete section"
            aria-label="Delete section"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

