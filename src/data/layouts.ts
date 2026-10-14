import { ResumeLayoutId } from '../types/resume';

export interface LayoutDefinition {
  id: ResumeLayoutId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  isDefault?: boolean;
}

export const RESUME_LAYOUTS: LayoutDefinition[] = [
  {
    id: 'classic-ats',
    name: 'Classic ATS',
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
  {
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
];

export const getLayoutById = (id?: string): LayoutDefinition => {
  return RESUME_LAYOUTS.find((l) => l.id === id) || RESUME_LAYOUTS[0];
};
