import type { ResumeLayoutId } from '../types/resume';

export interface LayoutCatalogEntry {
  id: ResumeLayoutId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  isDefault?: boolean;
}

/**
 * Framework-free layout metadata.
 * The plugin registry adds rendering behaviour on top of this catalog, while
 * the MCP server can read the same metadata without importing React.
 */
export const LAYOUT_CATALOG: Record<ResumeLayoutId, LayoutCatalogEntry> = {
  'standard-ats-v1': {
    id: 'standard-ats-v1',
    name: 'Standard ATS V1',
    badge: 'Standard Single-Column',
    description:
      'Engineered for Applicant Tracking Systems with centered header, 7.75pt calibrated typography, and hairline section dividers.',
    features: [
      '100% ATS parser compatible',
      'Centered header & inline contact row',
      'Dense A4 content capacity',
      'Consistent vector print output',
    ],
    isDefault: true,
  },
  'standard-ats-v2': {
    id: 'standard-ats-v2',
    name: 'Standard ATS V2',
    badge: 'Liberation Sans • 8.41pt',
    description:
      'Calibrated reference ATS format: Liberation Sans font, 8.41pt body text, 12.61pt line advance, 0.60pt dividers, and justified body text.',
    features: [
      'Liberation Sans / Arimo font stack',
      '8.41pt unified content font size',
      '12.61pt exact line advance rhythm',
      'Justified summary & bullet descriptions',
      '0.60pt slate dividers & 2.40pt bullet glyphs',
    ],
  },
  'modern-photo': {
    id: 'modern-photo',
    name: 'Modern Photo',
    badge: 'Photo Header • Single Column',
    description:
      'Single-column ATS format with left-aligned header and 3:4 portrait profile photo frame.',
    features: [
      '3:4 portrait profile photo',
      'Left-aligned header & contact details',
      '100% content & section parity with ATS standard',
      'Compact print-optimized vector layout',
    ],
  },
};

/** UI ordering: default first, then photo, then the calibrated reference. */
export const LAYOUT_CATALOG_LIST: LayoutCatalogEntry[] = [
  LAYOUT_CATALOG['standard-ats-v1'],
  LAYOUT_CATALOG['modern-photo'],
  LAYOUT_CATALOG['standard-ats-v2'],
];
