import type { MinimumWageRow, MinimumWageSource } from '../data/indonesiaWages.snapshot';
import { getProvinceName, getRegencyName } from '../data/indonesiaRegions';

export type MinimumWageKind = 'UMK' | 'UMP';

export interface MinimumWageDataset {
  year: number;
  fetchedAt: string;
  origin: 'live' | 'snapshot';
  ump: Record<string, MinimumWageRow>;
  umk: Record<string, MinimumWageRow>;
  sources: Record<string, MinimumWageSource>;
}

export interface ResolvedMinimumWage {
  kind: MinimumWageKind;
  amountIdr: number;
  year: number;
  provinceName: string;
  scopeLabel: string;
  note?: string;
  source: MinimumWageSource | null;
  origin: MinimumWageDataset['origin'];
}

interface WageApiPayload {
  year: number;
  fetchedAt: string;
  ump: MinimumWageRow[];
  umk: MinimumWageRow[];
  sources: Record<string, MinimumWageSource>;
}

const CACHE_KEY = 'cevee.minimum_wages.dataset.v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6000;

const isSnapshotRow = (value: unknown): value is MinimumWageRow => {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<MinimumWageRow>;
  return (
    typeof row.code === 'string' &&
    row.code.length > 0 &&
    typeof row.amountIdr === 'number' &&
    Number.isFinite(row.amountIdr) &&
    typeof row.sourceKey === 'string'
  );
};

const isSourceRecord = (value: unknown): value is MinimumWageSource => {
  if (!value || typeof value !== 'object') return false;
  const source = value as Partial<MinimumWageSource>;
  return typeof source.label === 'string' && typeof source.url === 'string';
};

const isWageApiPayload = (value: unknown): value is WageApiPayload => {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<WageApiPayload>;
  return (
    typeof payload.year === 'number' &&
    Number.isFinite(payload.year) &&
    Array.isArray(payload.ump) &&
    Array.isArray(payload.umk) &&
    payload.ump.every(isSnapshotRow) &&
    payload.umk.every(isSnapshotRow) &&
    Boolean(payload.sources) &&
    typeof payload.sources === 'object' &&
    Object.values(payload.sources).every(isSourceRecord)
  );
};

const toDataset = (
  payload: WageApiPayload,
  origin: MinimumWageDataset['origin']
): MinimumWageDataset => ({
  year: payload.year,
  fetchedAt: payload.fetchedAt,
  origin,
  ump: Object.fromEntries(payload.ump.map((row) => [row.code, row])),
  umk: Object.fromEntries(payload.umk.map((row) => [row.code, row])),
  sources: payload.sources,
});

const readCache = (): { payload: WageApiPayload; fresh: boolean } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; payload?: unknown };
    if (!isWageApiPayload(parsed.payload)) return null;
    const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : 0;
    return {
      payload: parsed.payload,
      fresh: Date.now() - savedAt < CACHE_TTL_MS,
    };
  } catch {
    return null;
  }
};

const writeCache = (payload: WageApiPayload) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), payload })
    );
  } catch {
    // Storage can be full or blocked; the in-memory dataset still works.
  }
};

export const readCachedMinimumWageDataset = (): {
  dataset: MinimumWageDataset;
  fresh: boolean;
} | null => {
  const cached = readCache();
  if (!cached) return null;
  return { dataset: toDataset(cached.payload, 'live'), fresh: cached.fresh };
};

export const loadSnapshotMinimumWageDataset = async (): Promise<MinimumWageDataset> => {
  const snapshot = await import('../data/indonesiaWages.snapshot');
  return toDataset(
    {
      year: snapshot.MINIMUM_WAGE_SNAPSHOT_YEAR,
      fetchedAt: snapshot.MINIMUM_WAGE_SNAPSHOT_FETCHED_AT,
      ump: [...snapshot.UMP_SNAPSHOT],
      umk: [...snapshot.UMK_SNAPSHOT],
      sources: snapshot.MINIMUM_WAGE_SOURCES,
    },
    'snapshot'
  );
};

export const fetchLiveMinimumWageDataset = async (): Promise<MinimumWageDataset | null> => {
  if (typeof fetch !== 'function') return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/wages', {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!isWageApiPayload(payload)) return null;

    writeCache(payload);
    return toDataset(payload, 'live');
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const resolveMinimumWage = (
  dataset: MinimumWageDataset | null,
  provinceCode?: string | null,
  regencyCode?: string | null
): ResolvedMinimumWage | null => {
  if (!dataset || !provinceCode) return null;

  const provinceName = getProvinceName(provinceCode);
  if (!provinceName) return null;

  const regencyName = regencyCode ? getRegencyName(regencyCode) : '';
  const umk = regencyCode ? dataset.umk[regencyCode] : undefined;

  if (umk) {
    return {
      kind: 'UMK',
      amountIdr: umk.amountIdr,
      year: dataset.year,
      provinceName,
      scopeLabel: regencyName || provinceName,
      source: dataset.sources[umk.sourceKey] ?? null,
      origin: dataset.origin,
    };
  }

  const ump = dataset.ump[provinceCode];
  if (!ump) return null;

  return {
    kind: 'UMP',
    amountIdr: ump.amountIdr,
    year: dataset.year,
    provinceName,
    scopeLabel: provinceName,
    note: regencyName
      ? `No UMK is listed for ${regencyName}, so the ${provinceName} provincial minimum is shown.`
      : undefined,
    source: dataset.sources[ump.sourceKey] ?? null,
    origin: dataset.origin,
  };
};

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const formatRupiah = (value: number): string =>
  rupiahFormatter.format(Math.round(value));

export const formatWageEffectiveDate = (isoDate?: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return isoDate;
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

export const describeWageSource = (source: MinimumWageSource | null): string => {
  if (!source) return 'Official source';
  if (/^BPS table/i.test(source.label)) return 'BPS statistics table';
  if (/^(Keputusan Gubernur|SK Gubernur|Surat Keputusan Gubernur|Pengumuman Gubernur)/i.test(source.label)) {
    return 'Governor decree';
  }
  return 'Official source';
};
