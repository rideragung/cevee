import type { ParsedResumeRaw } from '../src/lib/ai/types';

export const config = {
  maxDuration: 60,
};

const SYSTEM_INSTRUCTION = `You are an expert AI assistant specializing in professional resume and CV data extraction.
Your task: Read raw resume text (extracted from a PDF) and structure it into a unified, accurate JSON format.

Important Rules:
1. Do NOT add fabricated information or hallucinate. Extract only information present in the source text.
2. If dates exist (e.g., "Jan 2022 - Dec 2023"), parse them into startDate ("Jan 2022") and endDate ("Dec 2023"). If currently employed, set current: true and endDate: "Present".
3. Bullets for experiences (workExperience, volunteering, projects) must be clean, concise achievement or responsibility statements.
4. Separate professional work experience (workExperience) from volunteering or organizational experience (volunteering).
5. Group skills into meaningful categories (e.g., "Programming Languages", "Frameworks & Libraries", "Tools & Platforms", or "Soft Skills"). The "items" field is a comma-separated string.
6. Extract certifications, languages, awards, and publications if present.
7. Output MUST be valid JSON without markdown fences.`;

const PROMPT_SCHEMA_GUIDE = `Target JSON format:
{
  "header": {
    "fullName": "Full Name",
    "roles": ["Target Role / Job Title 1", "Role 2"],
    "location": "City, Country",
    "email": "email@example.com",
    "phone": "+1 234 567 8900",
    "links": [
      { "label": "linkedin.com/in/username", "url": "https://linkedin.com/in/username" },
      { "label": "github.com/username", "url": "https://github.com/username" }
    ]
  },
  "summary": "Professional summary...",
  "skills": [
    { "category": "Category", "items": "Skill 1, Skill 2, Skill 3" }
  ],
  "workExperience": [
    {
      "role": "Role / Title",
      "company": "Company",
      "location": "City, Country",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "current": false,
      "bullets": ["Key accomplishment or responsibility 1", "Responsibility 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree / Field of Study",
      "institution": "University / Institution",
      "startDate": "Start Year",
      "endDate": "End Year",
      "current": false,
      "gpa": "3.85 / 4.00",
      "description": "Additional activities or honors"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "url": "https://project-url.com",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "bullets": ["Project overview, technologies, or achievements"]
    }
  ],
  "volunteering": [
    {
      "role": "Role",
      "company": "Organization Name",
      "location": "City, Country",
      "startDate": "Year",
      "endDate": "Year",
      "current": false,
      "bullets": ["Activities or impact"]
    }
  ],
  "certifications": [
    {
      "title": "Certificate Name",
      "subtitle": "Issuing Organization",
      "issueDate": "Month Year",
      "expiryDate": "Month Year",
      "credentialId": "ID123",
      "credentialUrl": "https://credential-link"
    }
  ],
  "languages": [
    {
      "title": "Language",
      "subtitle": "Proficiency Level (Native / Fluent / Intermediate)"
    }
  ],
  "awards": [
    {
      "title": "Award Title",
      "subtitle": "Awarding Body",
      "period": "Year",
      "description": "Brief description"
    }
  ],
  "publications": [
    {
      "title": "Publication Title",
      "subtitle": "Publisher / Conference",
      "period": "Year",
      "credentialUrl": "https://link",
      "description": "Description"
    }
  ]
}`;

export async function executeGeminiParse(
  pdfText: string,
  rawKeys: string,
  modelOverride?: string
): Promise<ParsedResumeRaw> {
  const keys = rawKeys
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  if (keys.length === 0) {
    throw new Error('GEMINI_API_KEYS is not configured. Add your API key in environment variables.');
  }

  const SLOW_MODELS = new Set([
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3-flash-preview',
  ]);

  const candidateModels: string[] = [
    // Prioritize explicit override if not known to be slow/overloaded
    ...(modelOverride && !SLOW_MODELS.has(modelOverride) ? [modelOverride] : []),
    // Tier 1: Ultra-fast lightweight models (tested ~1.2s - 1.8s, reliable JSON)
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    // Tier 2: Standard flash models (~3s - 6s)
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    // Tier 3: High-latency / preview models (fallback only)
    ...(modelOverride && SLOW_MODELS.has(modelOverride) ? [modelOverride] : []),
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const models = Array.from(
    new Set(candidateModels.filter((m): m is string => Boolean(m && m.trim())))
  );

  let lastError: Error | null = null;
  const requestStartTime = Date.now();
  const isVercelServerless = Boolean(process.env.VERCEL);
  const maxTotalDurationMs = isVercelServerless ? 50000 : 55000;
  const maxPerFetchTimeoutMs = isVercelServerless ? 10000 : 15000;

  for (const model of models) {
    const elapsedModel = Date.now() - requestStartTime;
    if (maxTotalDurationMs - elapsedModel < 2000) {
      lastError = new Error('Request execution time budget exhausted. Please try again.');
      break;
    }

    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      const elapsed = Date.now() - requestStartTime;
      const remainingTime = maxTotalDurationMs - elapsed;

      if (remainingTime < 2000) {
        lastError = new Error('Request execution time budget exhausted. Please try again.');
        break;
      }

      const fetchTimeoutMs = Math.min(remainingTime, maxPerFetchTimeoutMs);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            model
          )}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            signal: AbortSignal.timeout(fetchTimeoutMs),
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_INSTRUCTION}\n\n${PROMPT_SCHEMA_GUIDE}\n\n--- RAW RESUME TEXT ---\n\n${pdfText}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();

          const isRateLimit =
            response.status === 429 ||
            errorBody.includes('RESOURCE_EXHAUSTED') ||
            errorBody.includes('quota');

          if (isRateLimit) {
            lastError = new Error(
              `Service quota reached for ${model} on key #${keyIndex + 1} (429). Trying next key/model...`
            );
            continue; // Try next key for this model
          }

          const isModelUnavailable =
            response.status === 404 ||
            response.status === 503 ||
            response.status === 500 ||
            errorBody.includes('not found') ||
            errorBody.includes('high demand') ||
            errorBody.includes('UNAVAILABLE');

          if (isModelUnavailable) {
            lastError = new Error(
              `Analysis engine ${model} unavailable (${response.status}). Trying next model...`
            );
            break; // Skip remaining keys for this unavailable model, move to next model
          }

          throw new Error(`Analysis engine returned error (${response.status}).`);
        }

        const result = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const candidate = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidate) {
          throw new Error('No structured content could be extracted from this document.');
        }

        let cleanJson = candidate.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanJson) as ParsedResumeRaw;
        return parsed;
      } catch (err: unknown) {
        const isTimeout =
          err instanceof Error &&
          (err.name === 'TimeoutError' ||
            err.name === 'AbortError' ||
            err.message.toLowerCase().includes('timeout') ||
            err.message.toLowerCase().includes('aborted'));
        if (isTimeout) {
          lastError = new Error(
            `Analysis request for ${model} timed out after ${fetchTimeoutMs}ms. Trying next fallback...`
          );
          break; // Timeout on this model, switch to next model
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw (
    lastError ||
    new Error('The resume analysis service is busy. Please try again later.')
  );
}

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

    const parsedData = await executeGeminiParse(pdfText, geminiKeys, geminiModel);
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
