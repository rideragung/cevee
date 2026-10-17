import { standardAtsV1Plugin } from './standard-ats-v1';
import { standardAtsV2Plugin } from './standard-ats-v2';
import { modernPhotoPlugin } from './modern-photo';
import type { LayoutPlugin } from './core/types';
import type { ResumeLayoutId } from '../types/resume';

export const LAYOUT_PLUGINS: Record<ResumeLayoutId, LayoutPlugin> = {
  'standard-ats-v1': standardAtsV1Plugin,
  'standard-ats-v2': standardAtsV2Plugin,
  'modern-photo': modernPhotoPlugin,
};

export const LAYOUT_LIST: LayoutPlugin[] = [standardAtsV1Plugin, modernPhotoPlugin, standardAtsV2Plugin];

export const LEGACY_LAYOUT_IDS: Record<string, ResumeLayoutId> = {
  'classic-ats': 'standard-ats-v1',
  'reference-nodeflair': 'standard-ats-v2',
};

export const DEFAULT_LAYOUT_ID: ResumeLayoutId = 'standard-ats-v1';

export const normalizeLayoutId = (id?: string): ResumeLayoutId => {
  if (id && id in LAYOUT_PLUGINS) return id as ResumeLayoutId;
  return (id && LEGACY_LAYOUT_IDS[id]) || DEFAULT_LAYOUT_ID;
};

export const getLayoutPlugin = (id?: string): LayoutPlugin => LAYOUT_PLUGINS[normalizeLayoutId(id)];
