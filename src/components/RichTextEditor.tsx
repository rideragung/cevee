import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  IconBold as Bold,
  IconItalic as Italic,
  IconUnderline as UnderlineIcon,
  IconLink as LinkIcon,
  IconList as List,
  IconListNumbers as ListOrdered,
  IconCheck as Check,
  IconX as X,
} from '@tabler/icons-react';

interface RichTextEditorProps {
  initialContent: string;
  onSave?: (html: string) => void;
  onCancel?: () => void;
  onChange?: (html: string) => void;
  hideActions?: boolean;
  editorClassName?: string;
  ariaLabel?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
  onChange,
  hideActions = false,
  editorClassName,
  ariaLabel = 'Rich text editor',
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'resume-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'resume-ordered-list',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        class:
          editorClassName ||
          'min-h-[90px] rounded-lg border border-input bg-card p-2.5 text-[7.75pt] leading-relaxed text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30',
      },
    },
  });

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  const openLinkEditor = () => {
    setLinkUrl(editor.getAttributes('link').href || '');
    setIsLinkOpen(true);
  };

  const applyLink = () => {
    const raw = linkUrl.trim();
    if (!raw) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^(https?:\/\/|mailto:|tel:)/i.test(raw) ? raw : `https://${raw}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setIsLinkOpen(false);
    setLinkUrl('');
  };

  const cancelLink = () => {
    setIsLinkOpen(false);
    setLinkUrl('');
  };

  return (
    <div className="space-y-2 no-print font-sans">
      {/* Formatting Toolbar in standalone white container */}
      <div className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-card p-1 shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:p-1.5 ${
            editor.isActive('bold') ? 'bg-accent font-bold text-primary' : ''
          }`}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <Bold size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:p-1.5 ${
            editor.isActive('underline') ? 'bg-accent text-primary' : ''
          }`}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <UnderlineIcon size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:p-1.5 ${
            editor.isActive('italic') ? 'bg-accent text-primary' : ''
          }`}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <Italic size={14} />
        </button>

        <div className="mx-0.5 h-4 w-px bg-border" />

        <button
          type="button"
          onClick={openLinkEditor}
          className={`rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:p-1.5 ${
            editor.isActive('link') ? 'bg-accent text-primary' : ''
          }`}
          title="Insert link"
          aria-label="Insert link"
        >
          <LinkIcon size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:p-1.5 ${
            editor.isActive('bulletList') ? 'bg-accent text-primary' : ''
          }`}
          title="Bullet list"
          aria-label="Bullet list"
        >
          <List size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:p-1.5 ${
            editor.isActive('orderedList') ? 'bg-accent text-primary' : ''
          }`}
          title="Numbered list"
          aria-label="Numbered list"
        >
          <ListOrdered size={14} />
        </button>
      </div>

      {/* Inline link editor */}
      {isLinkOpen && (
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 shadow-sm">
          <input
            type="url"
            inputMode="url"
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelLink();
              }
            }}
            placeholder="https://example.com"
            aria-label="Link URL"
            className="min-w-0 flex-1 rounded-lg border border-input px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded bg-primary p-1.5 text-primary-foreground transition hover:bg-primary/90"
            title="Apply link"
            aria-label="Apply link"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={cancelLink}
            className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Cancel link"
            aria-label="Cancel link"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Action Buttons: Cancel and Save */}
      {!hideActions && (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-semibold text-primary transition hover:text-primary/80"
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(editor.getHTML())}
              className="rounded-lg bg-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
};
