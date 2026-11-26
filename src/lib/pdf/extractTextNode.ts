import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface NodePdfTextResult {
  text: string;
  pageCount: number;
}

/**
 * Node-side text extraction. Uses the legacy PDF.js build so it runs without a
 * DOM or a browser worker. Rendering is intentionally not supported here.
 */
export const extractTextFromPdfBytes = async (
  data: Uint8Array
): Promise<NodePdfTextResult> => {
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    let pageText = '';
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!('str' in item) || typeof item.str !== 'string') continue;

      const currentY = item.transform ? item.transform[5] : null;

      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
        pageText += '\n';
      } else if (
        pageText.length > 0 &&
        !pageText.endsWith('\n') &&
        !pageText.endsWith(' ')
      ) {
        pageText += ' ';
      }

      pageText += item.str;
      if (item.hasEOL) pageText += '\n';
      lastY = currentY;
    }

    pages.push(pageText.trim());
  }

  const text = pages.join('\n\n--- Next Page ---\n\n').trim();

  if (text.length < 40) {
    throw new Error(
      'Very little or no text was found in this PDF. The document may be a scanned image that requires OCR.'
    );
  }

  return { text, pageCount: pdf.numPages };
};
