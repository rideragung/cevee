declare module 'pdfjs-dist/legacy/build/pdf.mjs' {
  export interface PdfTextItem {
    str: string;
    transform?: number[];
    hasEOL?: boolean;
  }

  export interface PdfTextContent {
    items: Array<PdfTextItem | { type?: string }>;
  }

  export interface PdfPageProxy {
    getTextContent(): Promise<PdfTextContent>;
  }

  export interface PdfDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PdfPageProxy>;
  }

  export interface PdfDocumentLoadingTask {
    promise: Promise<PdfDocumentProxy>;
  }

  export function getDocument(params: {
    data: Uint8Array;
    useSystemFonts?: boolean;
  }): PdfDocumentLoadingTask;
}
