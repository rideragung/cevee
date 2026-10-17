import React from 'react';
import { buildSingleColumnBlocks } from '../shared/single-column-blocks';
import { renderModernPhotoHeader, estimateModernPhotoHeaderHeight } from './header';
import { ModernPhotoThumbnail } from './Thumbnail';
import type { LayoutPlugin } from '../core/types';
import type { ResumeDocument } from '../../types/resume';

export const modernPhotoPlugin: LayoutPlugin = {
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
  geometry: {
    contentWidth: '184mm',
    maxPageHeightPx: 1020,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSize: '7.75pt',
    lineHeight: '1.48',
    color: '#111827',
    roundMeasuredHeight: Math.ceil,
  },
  buildBlocks: (resume: ResumeDocument) =>
    buildSingleColumnBlocks(resume, {
      estimateHeight: estimateModernPhotoHeaderHeight,
      render: renderModernPhotoHeader,
    }),
  renderThumbnail: ({ className }) => <ModernPhotoThumbnail className={className} />,
};
