import { executeGeminiParse } from '../src/lib/ai/gemini';

export const config = {
  maxDuration: 60,
};

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  setHeader?: (name: string, value: string) => void;
  status: (statusCode: number) => ApiResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const rawBody = req.body;
    const body =
      typeof rawBody === 'string'
        ? (JSON.parse(rawBody) as { pdfText?: string; model?: string })
        : (rawBody as { pdfText?: string; model?: string });

    const pdfText = body?.pdfText;
    if (!pdfText || typeof pdfText !== 'string' || pdfText.trim().length === 0) {
      res.status(400).json({ error: 'Missing or empty pdfText in request body.' });
      return;
    }

    const geminiKeys =
      process.env.GEMINI_API_KEYS || process.env.VITE_GEMINI_API_KEYS || '';
    const geminiModel =
      body?.model || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || '';

    if (!geminiKeys.trim()) {
      res.status(500).json({
        error: 'Resume analysis service is not configured on the server.',
      });
      return;
    }

    const parsedData = await executeGeminiParse(pdfText, geminiKeys, geminiModel, {
      isServerless: Boolean(process.env.VERCEL),
    });
    res.status(200).json({ success: true, data: parsedData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error.';
    const statusCode =
      message.includes('429') || message.includes('quota exceeded')
        ? 429
        : message.includes('503') || message.includes('high demand')
          ? 503
          : 500;
    res.status(statusCode).json({ error: message });
  }
}
