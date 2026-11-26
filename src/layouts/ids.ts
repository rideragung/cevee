import type { ResumeLayoutId } from '../types/resume';

export const DEFAULT_LAYOUT_ID: ResumeLayoutId = 'standard-ats-v1';

export const LEGACY_LAYOUT_IDS: Record<string, ResumeLayoutId> = {
  'classic-ats': 'standard-ats-v1',
  'reference-nodeflair': 'standard-ats-v2',
};

export const RESUME_LAYOUT_IDS: ResumeLayoutId[] = [
  'standard-ats-v1',
  'standard-ats-v2',
  'modern-photo',
];

export const isResumeLayoutId = (id?: string): id is ResumeLayoutId =>
  Boolean(id && RESUME_LAYOUT_IDS.includes(id as ResumeLayoutId));

export const normalizeLayoutId = (id?: string): ResumeLayoutId => {
  if (isResumeLayoutId(id)) return id;
  return (id && LEGACY_LAYOUT_IDS[id]) || DEFAULT_LAYOUT_ID;
};
