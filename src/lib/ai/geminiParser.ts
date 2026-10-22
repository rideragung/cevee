import type { ParsedResumeRaw } from './types';

export interface ParseOptions {
  onStatusUpdate?: (status: string) => void;
  model?: string;
}

export async function parseResumeWithGemini(
  pdfText: string,
  options?: ParseOptions
): Promise<ParsedResumeRaw> {
  options?.onStatusUpdate?.('Structuring your experience and skills...');

  const response = await fetch('/api/parse-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfText,
      model: options?.model,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
    const message = errorData?.error || `Server error (${response.status})`;
    throw new Error(message);
  }

  const result = (await response.json()) as { success?: boolean; data?: ParsedResumeRaw };
  if (!result.data) {
    throw new Error('No valid response data received from server.');
  }

  return result.data;
}

/**
 * Translates technical API or parsing errors into clear, actionable,
 * human-friendly UX copy. Follows the product voice: calm, neutral,
 * without vendor/provider terminology or blame.
 */
export function formatResumeImportError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || '');
  const lower = raw.toLowerCase();

  // Rate limits / high traffic
  if (
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted')
  ) {
    return 'The resume analyzer is receiving high traffic right now. Wait a moment and try again, or continue by choosing a blank template.';
  }

  // Timeouts / Vercel 504 / Aborted
  if (
    lower.includes('504') ||
    lower.includes('timeout') ||
    lower.includes('aborted') ||
    lower.includes('budget exhausted')
  ) {
    return 'Document analysis took longer than expected. Try uploading a simpler PDF or fill in your details manually.';
  }

  // Service unavailable / 503 / 500 / high demand
  if (
    lower.includes('503') ||
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('server error')
  ) {
    return 'The resume analysis service is temporarily busy. Please wait a few moments and try again.';
  }

  // Not configured / missing key
  if (
    lower.includes('configured') ||
    lower.includes('api key') ||
    lower.includes('api_key')
  ) {
    return 'Automated resume import is currently unavailable. You can still select any layout and build your resume manually.';
  }

  // Empty text / PDF readability
  if (
    lower.includes('empty pdftext') ||
    lower.includes('readable text') ||
    lower.includes('scanned')
  ) {
    return 'Could not find readable text in this PDF. Ensure your file has selectable text rather than a scanned image, or enter your details manually.';
  }

  // Network issues
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Connection problem while uploading. Check your internet connection and try again.';
  }

  return 'Unable to analyze this resume right now. Check that your PDF file is valid and try again, or start with a blank template.';
}
