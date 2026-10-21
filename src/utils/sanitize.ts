import DOMPurify from 'dompurify';

// Tags produced by the rich text editor (Tiptap StarterKit) and inline formatting.
const ALLOWED_TAGS = [
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'p',
  'br',
  'div',
  'span',
];

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'start', 'value'],
  });
};
