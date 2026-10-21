import React from 'react';
import { sanitizeHtml } from '../../utils/sanitize';
import type { ContentPart } from './types';

export const stripHtml = (html: string): string => {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
};

// Split HTML into discrete units (per <li> or per <p>)
export const parseContentParts = (html: string): ContentPart[] => {
  if (!html || !html.trim()) return [];

  // 1. If content contains list items (inside <ol> or <ul>), split per <li> so each bullet is a separate block
  const liMatches = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    const isOrdered = /<ol[^>]*>/i.test(html);
    return liMatches.map((li, idx) => ({
      kind: isOrdered ? ('ordered-list' as const) : ('list' as const),
      order: isOrdered ? idx + 1 : undefined,
      html: li.replace(/^<li[^>]*>/i, '').replace(/<\/li>\s*$/i, '').trim(),
    }));
  }

  // 2. If no <li>, split per paragraph <p>
  const pMatches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    return pMatches
      .map((p) => p.replace(/^<p[^>]*>/i, '').replace(/<\/p>\s*$/i, '').trim())
      .filter((t) => stripHtml(t).length > 0)
      .map((t) => ({ kind: 'paragraph' as const, html: t }));
  }

  // 3. Plain text fallback
  const text = stripHtml(html);
  return text ? [{ kind: 'paragraph' as const, html: text }] : [];
};

export interface ContentPartClasses {
  list: string;
  orderedList?: string;
  paragraph: string;
}

// Render a single content part safely across page breaks
export const renderContentPart = (part: ContentPart, classes: ContentPartClasses) => {
  if (part.kind === 'ordered-list') {
    return (
      <ol className={classes.orderedList || classes.list} start={part.order || 1}>
        <li dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.html) }} />
      </ol>
    );
  }
  if (part.kind === 'list') {
    return (
      <ul className={classes.list}>
        <li dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.html) }} />
      </ul>
    );
  }
  return <p className={classes.paragraph} dangerouslySetInnerHTML={{ __html: sanitizeHtml(part.html) }} />;
};
