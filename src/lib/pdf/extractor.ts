import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts raw textual content from an uploaded PDF file.
 */
export async function extractTextFromPdf(file: File): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const extractedPages: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let pageText = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        const currentY = item.transform ? item.transform[5] : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' ';
        }

        pageText += item.str;
        if (item.hasEOL) {
          pageText += '\n';
        }
        lastY = currentY;
      }
    }

    extractedPages.push(pageText.trim());
  }

  const fullText = extractedPages.join('\n\n--- Next Page ---\n\n').trim();

  if (fullText.length < 40) {
    throw new Error(
      'Very little or no text was found in this PDF. The document may be a scanned image that requires OCR.'
    );
  }

  return {
    text: fullText,
    pageCount,
  };
}
