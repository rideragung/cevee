import { ResumeLayoutId } from '../types/resume';
import { LAYOUT_LIST, getLayoutPlugin } from '../layouts/registry';

export interface LayoutDefinition {
  id: ResumeLayoutId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  isDefault?: boolean;
}

export const RESUME_LAYOUTS: LayoutDefinition[] = LAYOUT_LIST.map((plugin) => ({
  id: plugin.id,
  name: plugin.name,
  badge: plugin.badge,
  description: plugin.description,
  features: plugin.features,
  isDefault: plugin.isDefault,
}));

export const getLayoutById = (id?: string): LayoutDefinition => {
  const plugin = getLayoutPlugin(id);
  return RESUME_LAYOUTS.find((l) => l.id === plugin.id) || RESUME_LAYOUTS[0];
};
