export const config = { runtime: 'edge' };

const REFNUSA_BASE = 'https://refnusa.dev';
const REQUEST_TIMEOUT_MS = 8000;

interface RefnusaWageRow {
  amount_idr?: number | string;
  source_instrument?: string;
  source_url?: string;
  effective_date?: string;
  province_code?: string;
  regency_code?: string;
}

interface WageSource {
  label: string;
  url: string;
  effectiveDate: string;
}

interface WageRow {
  code: string;
  amountIdr: number;
  sourceKey: string;
}

interface WagePayload {
  year: number;
  fetchedAt: string;
  ump: WageRow[];
  umk: WageRow[];
  sources: Record<string, WageSource>;
}

const clean = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim();

const json = (status: number, body: unknown, cacheControl: string): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
      'access-control-allow-origin': '*',
    },
  });

const fetchJson = async (path: string): Promise<unknown | null> => {
  try {
    const response = await fetch(`${REFNUSA_BASE}${path}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

const normalize = (
  year: number,
  ump: RefnusaWageRow[],
  umk: RefnusaWageRow[]
): WagePayload => {
  const sources: Record<string, WageSource> = {};

  const toRow = (code: string | undefined, entry: RefnusaWageRow): WageRow | null => {
    const amount = Number(entry.amount_idr);
    if (!code || !Number.isFinite(amount)) return null;

    const source: WageSource = {
      label: clean(entry.source_instrument),
      url: clean(entry.source_url),
      effectiveDate: clean(entry.effective_date),
    };
    const sourceKey = `${source.label}|${source.url}|${source.effectiveDate}`;
    sources[sourceKey] = source;

    return { code: clean(code), amountIdr: amount, sourceKey };
  };

  return {
    year,
    fetchedAt: new Date().toISOString(),
    ump: ump
      .map((entry) => toRow(entry.province_code, entry))
      .filter((row): row is WageRow => Boolean(row)),
    umk: umk
      .map((entry) => toRow(entry.regency_code, entry))
      .filter((row): row is WageRow => Boolean(row)),
    sources,
  };
};

const loadYear = async (year: number): Promise<WagePayload | null> => {
  const [umpPayload, umkPayload] = await Promise.all([
    fetchJson(`/v1/wages/ump?year=${year}`),
    fetchJson(`/v1/wages/umk?year=${year}`),
  ]);

  const ump = (umpPayload as { ump?: RefnusaWageRow[] } | null)?.ump;
  // A new year is filled in province by province after the decrees land. Only
  // accept a year once most provinces are present, so a partial rollout does
  // not replace a complete previous year with missing rows.
  const minimumProvinceRows = 30;
  if (!Array.isArray(ump) || ump.length < minimumProvinceRows) return null;

  const umk = (umkPayload as { umk?: RefnusaWageRow[] } | null)?.umk;

  return normalize(year, ump, Array.isArray(umk) ? umk : []);
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedYear = Number(url.searchParams.get('year'));
  const currentYear = new Date().getUTCFullYear();

  const candidates =
    Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2100
      ? [requestedYear]
      : [currentYear, currentYear - 1, currentYear - 2];

  for (const year of candidates) {
    const payload = await loadYear(year);
    if (payload) {
      return json(200, payload, 'public, s-maxage=86400, stale-while-revalidate=604800');
    }
  }

  return json(
    503,
    { error: 'minimum_wage_unavailable', message: 'Minimum wage data is temporarily unavailable.' },
    'public, s-maxage=300'
  );
}
