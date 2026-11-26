/**
 * Framework-free HTML helpers shared by the app and the MCP server.
 * The browser app still sanitizes rendered content with DOMPurify; these
 * helpers are for building and measuring plain text only.
 */

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const plainTextToHtml = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
};

export const bulletsToHtml = (bullets: string[]): string => {
  const items = bullets.map((bullet) => bullet.trim()).filter(Boolean);
  if (items.length === 0) return '';
  return `<ul>${items.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`;
};

export const htmlToPlainText = (html: string): string => {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const countListItems = (html: string): number =>
  (html.match(/<li[\s>]/gi) || []).length;

export const countWords = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

export const extractBullets = (html: string): string[] => {
  const listItems = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
  if (listItems && listItems.length > 0) {
    return listItems
      .map((item) => htmlToPlainText(item.replace(/<\/?li[^>]*>/gi, '')))
      .filter(Boolean);
  }

  return htmlToPlainText(html)
    .split(/\n+/)
    .map((line) => line.replace(/^•\s*/, '').trim())
    .filter(Boolean);
};
