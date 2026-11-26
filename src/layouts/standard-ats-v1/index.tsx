import React from 'react';
import { buildSingleColumnBlocks } from '../shared/single-column-blocks';
import { renderStandardAtsV1Header, estimateStandardAtsV1HeaderHeight } from './header';
import { StandardAtsV1Thumbnail } from './Thumbnail';
import { LAYOUT_CATALOG } from '../catalog';
import type { LayoutPlugin } from '../core/types';
import type { ResumeDocument } from '../../types/resume';

export const standardAtsV1Plugin: LayoutPlugin = {
  ...LAYOUT_CATALOG['standard-ats-v1'],
  geometry: {
    contentWidth: '184mm',
    maxPageHeightPx: 1050,
    sheetPadding: '7mm 13mm 7mm 13mm',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSize: '7.75pt',
    lineHeight: '1.48',
    color: '#111827',
    roundMeasuredHeight: Math.ceil,
  },
  buildBlocks: (resume: ResumeDocument) =>
    buildSingleColumnBlocks(resume, {
      estimateHeight: estimateStandardAtsV1HeaderHeight,
      render: renderStandardAtsV1Header,
    }),
  renderThumbnail: ({ className }) => <StandardAtsV1Thumbnail className={className} />,
};
