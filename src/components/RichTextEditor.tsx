import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered } from 'lucide-react';

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

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (e.g. https://example.com):', previousUrl || '');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="space-y-2 no-print font-sans">
      {/* Formatting Toolbar in standalone white container */}
      <div className="inline-flex flex-wrap items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('bold') ? 'bg-slate-100 text-slate-900 font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
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
        >
          <Italic size={14} />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        <button
          type="button"
          onClick={setLink}
          className={`p-2 sm:p-1.5 rounded hover:bg-slate-100 text-slate-700 transition ${
            editor.isActive('link') ? 'bg-slate-100 text-blue-700' : ''
          }`}
          title="Insert Link"
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
        >
          <ListOrdered size={14} />
        </button>
      </div>

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
              className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-1.5 rounded-lg shadow-2xs transition"
            >
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
};
