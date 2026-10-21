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

class ServerKeyRotator {
  private keys: string[] = [];
  private currentIndex = 0;
  private cooldownMap = new Map<string, number>();

  constructor(rawKeys: string) {
    this.keys = rawKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  public getKeysCount(): number {
    return this.keys.length;
  }

  public getNextKey(): { key: string; index: number } {
    if (this.keys.length === 0) {
      throw new Error('GEMINI_API_KEYS is not configured.');
    }

    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const key = this.keys[idx];
      const cooldown = this.cooldownMap.get(key) || 0;

      if (now >= cooldown) {
        this.currentIndex = (idx + 1) % this.keys.length;
        return { key, index: idx + 1 };
      }
    }

    const currentKey = this.keys[this.currentIndex];
    const keyIndex = this.currentIndex + 1;
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return { key: currentKey, index: keyIndex };
  }

  public markRateLimited(key: string, cooldownMs = 60000): void {
    this.cooldownMap.set(key, Date.now() + cooldownMs);
  }
}

export async function executeGeminiParse(
  pdfText: string,
  rawKeys: string,
  modelOverride?: string
): Promise<ParsedResumeRaw> {
  const rotator = new ServerKeyRotator(rawKeys);
  const totalKeys = rotator.getKeysCount();

  if (totalKeys === 0) {
    throw new Error('GEMINI_API_KEYS is not configured. Add your API key in environment variables.');
  }

  const models = Array.from(
    new Set(
      [
        modelOverride,
        'gemini-3.8-flash',
        'gemini-3.7-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-flash-latest',
      ].filter((m): m is string => Boolean(m && m.trim()))
    )
  );

  let attempts = 0;
  const maxAttempts = totalKeys;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    const { key, index } = rotator.getNextKey();

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            model
          )}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
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
            rotator.markRateLimited(key);
            lastError = new Error(`Gemini key #${index} quota exceeded (429).`);
            break;
          }

          const isRetryableModelError =
            response.status === 404 ||
            response.status === 503 ||
            response.status === 500 ||
            errorBody.includes('not found') ||
            errorBody.includes('high demand') ||
            errorBody.includes('UNAVAILABLE');

          if (isRetryableModelError) {
            lastError = new Error(
              `Gemini model ${model} unavailable (${response.status}). Trying next model...`
            );
            continue;
          }

          throw new Error(`Gemini API Error (${response.status}): ${errorBody}`);
        }

        const result = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const candidate = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidate) {
          throw new Error('No valid response received from Gemini.');
        }

        let cleanJson = candidate.trim();
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanJson) as ParsedResumeRaw;
        return parsed;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('quota exceeded')) {
          break;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (attempts < maxAttempts) {
      rotator.markRateLimited(key);
    }
  }

  throw lastError || new Error('Failed to process resume with available Gemini API keys.');
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
        error:
          'GEMINI_API_KEYS is not configured on the server. Please add GEMINI_API_KEYS to your Vercel Environment Variables or .env file.',
      });
      return;
    }

    const parsedData = await executeGeminiParse(pdfText, geminiKeys, geminiModel);
    res.status(200).json({ success: true, data: parsedData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error.';
    res.status(500).json({ error: message });
  }
}
