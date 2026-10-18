import type { ContentBlock } from './types';

export const DEFAULT_PAGE_CONTENT_MAX_HEIGHT_PX = 1020;

const HEADER_BLOCK_TYPES: ContentBlock['type'][] = ['section-title', 'item-head', 'item-subhead'];

// Pure deterministic item-level packing engine
export function runPagination(
  blocks: ContentBlock[],
  measuredHeights?: Record<string, number>,
  maxHeight: number = DEFAULT_PAGE_CONTENT_MAX_HEIGHT_PX
): ContentBlock[][] {
  const calculatedPages: ContentBlock[][] = [];
  let currentPageBlocks: ContentBlock[] = [];
  let currentHeight = 0;

  const heightOf = (block: ContentBlock) =>
    measuredHeights && measuredHeights[block.id] !== undefined
      ? measuredHeights[block.id]
      : block.height;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const h = heightOf(b);

    // Anti-orphan rule untuk judul section, header item, dan sub-header posisi:
    // Pastikan blok header TIDAK pernah tertinggal sendirian di dasar halaman.
    // Blok header wajib muat bersama seluruh rangkaian header berurutan
    // berikutnya (judul section → header item → sub-header posisi) plus satu
    // blok konten pertama setelah rangkaian tersebut.
    if (HEADER_BLOCK_TYPES.includes(b.type)) {
      let chainHeight = h;
      let j = i + 1;
      while (j < blocks.length && HEADER_BLOCK_TYPES.includes(blocks[j].type)) {
        chainHeight += heightOf(blocks[j]);
        j += 1;
      }
      if (j < blocks.length) {
        chainHeight += heightOf(blocks[j]);
      }

      if (currentHeight + chainHeight > maxHeight && currentPageBlocks.length > 0) {
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
