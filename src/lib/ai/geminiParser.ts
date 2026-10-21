import type { ParsedResumeRaw } from './types';

export interface ParseOptions {
  onStatusUpdate?: (status: string) => void;
  model?: string;
}

export async function parseResumeWithGemini(
  pdfText: string,
  options?: ParseOptions
): Promise<ParsedResumeRaw> {
  options?.onStatusUpdate?.('Analyzing and structuring resume with Gemini AI...');

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
