import type { HeaderData } from '../../types/resume';
import type { ContentPart } from '../core/types';
import { stripHtml } from '../core/content';
import { formatDisplayUrl } from '../../utils/formatUrl';

// Reference preset geometry (pt): content box 541.0341pt x 826.1632pt = 1080.435px at 96 DPI;
// 1080px keeps the measured page-1 fill and pushes the next item to page 2.
export const REFERENCE_PAGE_CONTENT_MAX_HEIGHT_PX = 1080;

export const estimateStandardAtsV2HeaderHeight = (header: HeaderData): number => {
  const usableLinks = (header.links || []).filter((l) => l.label || l.url);
  const rolesCount =
    header.roles && header.roles.length > 0
      ? header.roles.filter(Boolean).length
      : (header.headline || '').split('|').map((s) => s.trim()).filter(Boolean).length;
  const isRelocating =
    header.willingToRelocate ??
    (header.relocationStatus && header.relocationStatus.includes('Willing'));
  const linksLen = usableLinks.reduce(
    (acc, l) => acc + (formatDisplayUrl(l.url, l.label).length || 10) + 3,
    0
  );
  const totalContactLen =
    (header.location?.length || 0) +
    (isRelocating ? 24 : 0) +
    (header.email?.length || 0) +
    (header.phone?.length || 0) +
    linksLen +
    6;
  const rowCount = Math.max(1, Math.ceil(totalContactLen / 115));
  return 29.624 + (rolesCount > 0 ? 16.8135 : 0) + rowCount * 16.8135 + 4.804;
};

export const estimateStandardAtsV2ContentPartHeight = (part: ContentPart): number => {
  const text = stripHtml(part.html);
  const charsPerLine = part.kind === 'list' || part.kind === 'ordered-list' ? 128 : 134;
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return lines * 16.8135;
};

export const estimateStandardAtsV2SummaryHeight = (html: string, isPlaceholder?: boolean): number => {
  if (isPlaceholder) return 50.44;
  const text = stripHtml(html);
  if (!text) return 0;
  const lines = Math.max(1, Math.ceil(text.length / 134));
  return lines * 16.8135;
};

export const estimateStandardAtsV2SkillsCategoryHeight = (category: string, items: string): number => {
  const text = `${category}: ${items}`;
  const lines = Math.max(1, Math.ceil(text.length / 134));
  return lines * 16.8135 + 1.60133;
};
