import React from 'react';
import { buildSingleColumnBlocks } from '../shared/single-column-blocks';
import { renderModernPhotoHeader, estimateModernPhotoHeaderHeight } from './header';
import { ModernPhotoThumbnail } from './Thumbnail';
import { LAYOUT_CATALOG } from '../catalog';
import type { LayoutPlugin } from '../core/types';
import type { ResumeDocument } from '../../types/resume';

export const modernPhotoPlugin: LayoutPlugin = {
  ...LAYOUT_CATALOG['modern-photo'],
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
