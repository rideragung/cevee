import { standardAtsV1Plugin } from './standard-ats-v1';
import { standardAtsV2Plugin } from './standard-ats-v2';
import { modernPhotoPlugin } from './modern-photo';
import type { LayoutPlugin } from './core/types';
import type { ResumeLayoutId } from '../types/resume';
import { normalizeLayoutId } from './ids';

export { DEFAULT_LAYOUT_ID, LEGACY_LAYOUT_IDS, normalizeLayoutId } from './ids';

export const LAYOUT_PLUGINS: Record<ResumeLayoutId, LayoutPlugin> = {
  'standard-ats-v1': standardAtsV1Plugin,
  'standard-ats-v2': standardAtsV2Plugin,
  'modern-photo': modernPhotoPlugin,
};

export const LAYOUT_LIST: LayoutPlugin[] = [standardAtsV1Plugin, modernPhotoPlugin, standardAtsV2Plugin];

export const getLayoutPlugin = (id?: string): LayoutPlugin => LAYOUT_PLUGINS[normalizeLayoutId(id)];
