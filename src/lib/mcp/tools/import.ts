import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { DEFAULT_LAYOUT_ID, isResumeLayoutId } from '../../../layouts/ids';
import { executeGeminiParse } from '../../ai/gemini';
import { adaptParsedResumeToDocument } from '../../ai/resumeAdapter';
import type { ParsedResumeRaw } from '../../ai/types';
import { createResumeId, RESUME_SCHEMA_VERSION } from '../../domain/resumeFactory';
import type { McpAuthContext } from '../auth';
import { resumeDocumentSchema } from '../schema/resume';
import type { ResumeStore } from '../store/types';
import { ensureWrite } from './mutate';
import { errorResult, jsonResult } from './result';

export interface GeminiImportConfig {
  apiKeys: string;
  model?: string;
}

export interface PdfTextExtractionResult {
  text: string;
  pageCount: number;
}

export interface McpImportServices {
  gemini?: GeminiImportConfig;
  /** Injectable for tests; defaults to the shared Gemini parser. */
  parseResumeText?: (
    text: string,
    config: GeminiImportConfig
  ) => Promise<ParsedResumeRaw>;
  /** Local-only: base64 PDF bytes. */
  extractPdfTextFromBase64?: (base64: string) => Promise<PdfTextExtractionResult>;
  /** Local-only: a PDF path on the user's machine. */
  extractPdfTextFromFile?: (filePath: string) => Promise<PdfTextExtractionResult>;
}

const defaultParseResumeText = (
  text: string,
  config: GeminiImportConfig
): Promise<ParsedResumeRaw> =>
  executeGeminiParse(text, config.apiKeys, config.model);

export const registerImportTools = (
  server: McpServer,
  store: ResumeStore,
  auth: McpAuthContext,
  services?: McpImportServices
): void => {
  server.registerTool(
    'import_resume',
    {
      title: 'Import resume from PDF',
      description:
        'Extract a resume from PDF text or a PDF file using Google Gemini. Returns a draft by default; set save=true to create a new resume. Never overwrites an existing resume. The extracted text is sent to Gemini.',
      inputSchema: z.object({
        pdfText: z.string().min(40).optional(),
        pdfBase64: z.string().min(100).optional(),
        filePath: z.string().min(1).optional(),
        title: z.string().optional(),
        layoutId: z.string().optional(),
        language: z.enum(['en', 'id']).optional(),
        save: z.boolean().optional(),
      }),
      annotations: { openWorldHint: true },
    },
    async ({ pdfText, pdfBase64, filePath, title, layoutId, language, save }) => {
      const provided = [pdfText, pdfBase64, filePath].filter(
        (value): value is string => typeof value === 'string' && value.length > 0
      );

      if (provided.length !== 1) {
        return errorResult('Provide exactly one of pdfText, pdfBase64, or filePath.');
      }

      if (layoutId !== undefined && !isResumeLayoutId(layoutId)) {
        return errorResult(
          `Unknown layout "${layoutId}". Call list_layouts for the supported ids.`
        );
      }

      if (save) {
        const denied = ensureWrite(auth);
        if (denied) return denied;
      }

      const gemini = services?.gemini;
      if (!gemini?.apiKeys) {
        return errorResult(
          'Gemini is not configured. Set GEMINI_API_KEYS (and optionally GEMINI_MODEL) in the MCP environment.'
        );
      }

      try {
        let text = pdfText ?? '';
        let pageCount: number | undefined;
        let format: 'text' | 'base64' | 'file' = 'text';

        if (!text && pdfBase64) {
          if (!services?.extractPdfTextFromBase64) {
            return errorResult('Base64 PDF import is not enabled on this server.');
          }
          const extracted = await services.extractPdfTextFromBase64(pdfBase64);
          text = extracted.text;
          pageCount = extracted.pageCount;
          format = 'base64';
        } else if (!text && filePath) {
          if (!services?.extractPdfTextFromFile) {
            return errorResult('File path import is not enabled on this server.');
          }
          const extracted = await services.extractPdfTextFromFile(filePath);
          text = extracted.text;
          pageCount = extracted.pageCount;
          format = 'file';
        }

        if (!text.trim()) {
          return errorResult('No text could be extracted from the PDF.');
        }

        const parse = services?.parseResumeText ?? defaultParseResumeText;
        const parsed = await parse(text, gemini);

        const draft = adaptParsedResumeToDocument(
          parsed,
          layoutId ?? DEFAULT_LAYOUT_ID,
          title,
          language ?? 'en'
        );

        const now = new Date().toISOString();
        draft.id = createResumeId();
        draft.version = 1;
        draft.createdAt = now;
        draft.updatedAt = now;
        draft.content.schemaVersion = RESUME_SCHEMA_VERSION;

        const validation = resumeDocumentSchema.safeParse(draft);
        if (!validation.success) {
          return errorResult(
            'Gemini returned data that could not be mapped to a valid resume.',
            validation.error.issues
          );
        }

        if (save) {
          const created = await store.createResume(draft);
          return jsonResult({
            saved: true,
            resume: created,
            source: { format, pageCount },
          });
        }

        return jsonResult({
          saved: false,
          draft,
          source: { format, pageCount },
        });
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : String(error));
      }
    }
  );
};
