import React from 'react';
import { sanitizeHtml } from '../../utils/sanitize';
import type { ContentPart } from './types';

export const stripHtml = (html: string): string => {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
};

// Pecah HTML menjadi bagian-bagian kecil (per <li> atau per <p>)
export const parseContentParts = (html: string): ContentPart[] => {
  if (!html || !html.trim()) return [];

  const liMatches = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches.map((li) => ({
      kind: 'list' as const,
      html: li.replace(/^<li[^>]*>/i, '').replace(/<\/li>\s*$/i, '').trim(),
    }));
  }

  const pMatches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    return pMatches
      .map((p) => p.replace(/^<p[^>]*>/i, '').replace(/<\/p>\s*$/i, '').trim())
      .filter((t) => stripHtml(t).length > 0)
      .map((t) => ({ kind: 'paragraph' as const, html: t }));
  }

  const text = stripHtml(html);
  return text ? [{ kind: 'paragraph' as const, html: text }] : [];
};

export interface ContentPartClasses {
  list: string;
  paragraph: string;
}

// Render satu bagian konten agar aman saat dipecah antar halaman
export const renderContentPart = (part: ContentPart, classes: ContentPartClasses) => {
  if (part.kind === 'list') {
    return (
      <ul className={classes.list}>
        <li dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.html) }} />
      </ul>
    );
  }
  return <p className={classes.paragraph} dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.html) }} />;
};
