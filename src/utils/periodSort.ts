// Automatic reverse-chronological period sorting utility.
// Entries across sections (experience, education, projects, certifications, etc.)
// are ordered newest to oldest.

export interface PeriodSortable {
  period?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  positions?: { period?: string; startDate?: string; endDate?: string; current?: boolean }[];
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0, januari: 0, janw: 0,
  feb: 1, february: 1, februari: 1,
  mar: 2, march: 2, maret: 2,
  apr: 3, april: 3,
  may: 4, mei: 4,
  jun: 5, june: 5, juni: 5,
  jul: 6, july: 6, juli: 6,
  aug: 7, august: 7, agustus: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, okt: 9, oktober: 9,
  nov: 10, november: 10,
  dec: 11, december: 11, des: 11, desember: 11,
};

// Convert "Month YYYY" / "YYYY" into numeric value (year * 12 + month)
const parseTextToMonths = (text?: string): { min: number; max: number; present: boolean } => {
  if (!text) return { min: 0, max: 0, present: false };

  const lower = text.toLowerCase();
  const present = /\b(present|current|now|ongoing|sekarang|saat ini|hingga kini)\b/.test(lower);

  const dates: number[] = [];
  const regex = /([a-z]+)?\s*(\d{4})/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(lower)) !== null) {
    const monthWord = match[1]?.toLowerCase();
    const year = parseInt(match[2], 10);
    const month = monthWord && MONTH_MAP[monthWord] !== undefined ? MONTH_MAP[monthWord] : 0;
    dates.push(year * 12 + month);
  }

  if (dates.length === 0) return { min: 0, max: 0, present };
  return { min: Math.min(...dates), max: Math.max(...dates), present };
};

const HUGE = Number.MAX_SAFE_INTEGER;

interface SortKey {
  end: number;
  start: number;
}

export const getPeriodSortKey = (item: PeriodSortable): SortKey => {
  let endBest = -1;
  let startBest = -1;
  let present = item.current || false;

  const consider = (
    period?: string,
    startDate?: string,
    endDate?: string,
    current?: boolean
  ) => {
    if (current) present = true;

    const combined = [startDate, endDate, period].filter(Boolean).join(' - ');
    const parsed = parseTextToMonths(combined);
    if (parsed.present) present = true;

    // Also inspect individual fields if period is incomplete
    const s = parseTextToMonths(startDate);
    const e = parseTextToMonths(endDate);

    const maxCandidate = Math.max(parsed.max, e.max, s.max);
    const minCandidate = Math.min(
      parsed.min || maxCandidate,
      s.min || parsed.min || maxCandidate,
      e.min || parsed.min || maxCandidate
    );

    if (maxCandidate > endBest) endBest = maxCandidate;
    if (minCandidate > startBest) startBest = minCandidate;
  };

  consider(item.period, item.startDate, item.endDate, item.current);
  item.positions?.forEach((p) => consider(p.period, p.startDate, p.endDate, p.current));

  return {
    end: present ? HUGE : (endBest < 0 ? 0 : endBest),
    start: startBest < 0 ? 0 : startBest,
  };
};

// Sort newest to oldest (latest at top). Stable with respect to original order.
export const sortByPeriodDesc = <T extends PeriodSortable>(items: T[]): T[] => {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ka = getPeriodSortKey(a.item);
      const kb = getPeriodSortKey(b.item);
      if (kb.end !== ka.end) return kb.end - ka.end;
      if (kb.start !== ka.start) return kb.start - ka.start;
      return a.index - b.index;
    })
    .map((entry) => entry.item);
};
