import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered, Check, X } from 'lucide-react';

interface RichTextEditorProps {
  initialContent: string;
  onSave?: (html: string) => void;
  onCancel?: () => void;
  onChange?: (html: string) => void;
  hideActions?: boolean;
  editorClassName?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
  onChange,
  hideActions = false,
  editorClassName,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'resume-bullet-list',
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
        class:
          editorClassName ||
          'min-h-[90px] p-2.5 text-[7.75pt] leading-relaxed text-slate-800 focus:outline-none border border-slate-300 rounded-lg bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors',
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
      <div className="inline-flex flex-wrap items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('bold') ? 'bg-slate-100 text-slate-900 font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <Bold size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('underline') ? 'bg-slate-100 text-slate-900' : ''
          }`}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <UnderlineIcon size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('italic') ? 'bg-slate-100 text-slate-900' : ''
          }`}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <Italic size={14} />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        <button
          type="button"
          onClick={openLinkEditor}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('link') ? 'bg-slate-100 text-blue-700' : ''
          }`}
          title="Insert Link"
          aria-label="Insert link"
        >
          <LinkIcon size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('bulletList') ? 'bg-slate-100 text-slate-900' : ''
          }`}
          title="Bullet List"
          aria-label="Bullet list"
        >
          <List size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('orderedList') ? 'bg-slate-100 text-slate-900' : ''
          }`}
          title="Numbered List"
          aria-label="Numbered list"
        >
          <ListOrdered size={14} />
        </button>
      </div>

      {/* Inline link editor */}
      {isLinkOpen && (
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
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
            className="flex-1 min-w-0 text-xs px-2 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={applyLink}
            className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition"
            title="Apply link"
            aria-label="Apply link"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={cancelLink}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition"
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
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 transition"
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(editor.getHTML())}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded-lg shadow-sm transition"
            >
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
};
