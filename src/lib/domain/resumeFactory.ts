import type {
  ResumeDocument,
  ResumeLanguage,
  ResumeSection,
  ResumeSectionPresetKey,
} from '../../types/resume';
import { DEFAULT_LAYOUT_ID, normalizeLayoutId } from '../../layouts/ids';
import {
  DEFAULT_RESUME_LANGUAGE,
  SECTION_PRESET_TITLES,
  buildDefaultHeader,
  buildDefaultSections,
  normalizeResumeLanguage,
} from '../../utils/resumeLocale';

export const RESUME_SCHEMA_VERSION = 1;

const randomId = (): string => {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const resolvePresetTitle = (
  presetKey: ResumeSectionPresetKey,
  lang: ResumeLanguage,
  customTitle?: string
): string => {
  if (presetKey === 'custom') {
    return customTitle?.trim() || 'CUSTOM SECTION';
  }
  return SECTION_PRESET_TITLES[presetKey][lang];
};

export interface CreateResumeOptions {
  title?: string;
  layoutId?: string;
  language?: ResumeLanguage;
  targetRole?: string;
}

/**
 * Builds a new resume document with the same defaults the web editor uses.
 * IDs are generated once so header links and section items stay stable.
 */
export const createEmptyResume = (options: CreateResumeOptions = {}): ResumeDocument => {
  const lang = normalizeResumeLanguage(options.language ?? DEFAULT_RESUME_LANGUAGE);
  const now = new Date().toISOString();
  const token = randomId();
  const id = `resume-${token}`;
  const targetRole = options.targetRole?.trim() || '';
  const roles = targetRole ? [targetRole] : [];

  return {
    id,
    title: options.title?.trim() || 'Untitled Resume',
    layoutId: normalizeLayoutId(options.layoutId ?? DEFAULT_LAYOUT_ID),
    createdAt: now,
    updatedAt: now,
    version: 1,
    content: {
      language: lang,
      schemaVersion: RESUME_SCHEMA_VERSION,
      header: buildDefaultHeader(lang, `l-${token}`, roles, targetRole),
      sections: buildDefaultSections(lang, `sec-${token}`),
    },
  };
};

export interface CreateSectionOptions {
  presetKey: ResumeSectionPresetKey;
  language?: ResumeLanguage;
  title?: string;
  id?: string;
  showTitle?: boolean;
}

/**
 * Creates an empty section for a preset. New section types only need a case
 * here (and a schema entry) to become available to the app and MCP tools.
 */
export const createSectionFromPreset = (options: CreateSectionOptions): ResumeSection => {
  const lang = normalizeResumeLanguage(options.language ?? DEFAULT_RESUME_LANGUAGE);
  const id = options.id || `sec-${randomId()}`;
  const presetKey = options.presetKey;
  const title = resolvePresetTitle(presetKey, lang, options.title);

  const base = {
    id,
    title,
    presetKey,
    isPlaceholder: true,
  };

  switch (presetKey) {
    case 'summary':
      return {
        ...base,
        type: 'summary',
        showTitle: options.showTitle ?? false,
        data: { html: '' },
      };
    case 'skills':
      return { ...base, type: 'skills', data: { categories: [] } };
    case 'experience':
      return { ...base, type: 'experience', data: { items: [] } };
    case 'education':
      return { ...base, type: 'education', data: { items: [] } };
    case 'projects':
      return { ...base, type: 'projects', data: { items: [] } };
    case 'volunteering':
      return { ...base, type: 'experience', data: { items: [] } };
    case 'certifications':
    case 'languages':
    case 'publications':
    case 'awards':
    case 'references':
    case 'custom':
      return { ...base, type: 'custom_list', data: { items: [] } };
    default: {
      const exhaustive: never = presetKey;
      return exhaustive;
    }
  }
};

export const createResumeId = (): string => `resume-${randomId()}`;
export const createSectionId = (): string => `sec-${randomId()}`;
export const createItemId = (prefix: string): string => `${prefix}-${randomId()}`;
