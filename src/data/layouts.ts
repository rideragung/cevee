import { ResumeLayoutId } from '../types/resume';
import { LAYOUT_CATALOG_LIST } from '../layouts/catalog';
import { getLayoutPlugin } from '../layouts/registry';

export interface LayoutDefinition {
  id: ResumeLayoutId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  isDefault?: boolean;
}

export const RESUME_LAYOUTS: LayoutDefinition[] = LAYOUT_CATALOG_LIST.map((layout) => ({
  ...layout,
}));

export const getLayoutById = (id?: string): LayoutDefinition => {
  const plugin = getLayoutPlugin(id);
  return RESUME_LAYOUTS.find((l) => l.id === plugin.id) || RESUME_LAYOUTS[0];
};
