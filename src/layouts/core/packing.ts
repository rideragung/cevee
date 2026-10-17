import type { ContentBlock } from './types';

export const DEFAULT_PAGE_CONTENT_MAX_HEIGHT_PX = 1020;

// Pure deterministic item-level packing engine
export function runPagination(
  blocks: ContentBlock[],
  measuredHeights?: Record<string, number>,
  maxHeight: number = DEFAULT_PAGE_CONTENT_MAX_HEIGHT_PX
): ContentBlock[][] {
  const calculatedPages: ContentBlock[][] = [];
  let currentPageBlocks: ContentBlock[] = [];
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const h =
      measuredHeights && measuredHeights[b.id] !== undefined ? measuredHeights[b.id] : b.height;

    // Anti-orphan rule untuk judul section, header item, dan sub-header posisi:
    // Pastikan blok header TIDAK pernah tertinggal sendirian di dasar halaman.
    // Blok header wajib muat bersama minimal satu blok konten berikutnya.
    if (b.type === 'section-title' || b.type === 'item-head' || b.type === 'item-subhead') {
      const nextBlock = i + 1 < blocks.length ? blocks[i + 1] : null;
      const nextH = nextBlock
        ? measuredHeights && measuredHeights[nextBlock.id] !== undefined
          ? measuredHeights[nextBlock.id]
          : nextBlock.height
        : 0;

      if (currentHeight + h + nextH > maxHeight && currentPageBlocks.length > 0) {
        calculatedPages.push(currentPageBlocks);
        currentPageBlocks = [b];
        currentHeight = h;
        continue;
      }
    }

    // Normal item-level packing:
    if (currentHeight + h <= maxHeight) {
      currentPageBlocks.push(b);
      currentHeight += h;
    } else {
      // Item melebihi sisa tinggi halaman: pindahkan item ke halaman baru
      if (currentPageBlocks.length > 0) {
        calculatedPages.push(currentPageBlocks);
        currentPageBlocks = [b];
        currentHeight = h;
      } else {
        currentPageBlocks.push(b);
        currentHeight = h;
      }
    }
  }

  if (currentPageBlocks.length > 0) {
    calculatedPages.push(currentPageBlocks);
  }

  return calculatedPages;
}
