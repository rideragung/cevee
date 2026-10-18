import React from 'react';
import { buildStandardAtsV2Blocks } from './blocks';
import { REFERENCE_PAGE_CONTENT_MAX_HEIGHT_PX } from './metrics';
import { StandardAtsV2Thumbnail } from './Thumbnail';
import type { LayoutPlugin } from '../core/types';

export const standardAtsV2Plugin: LayoutPlugin = {
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
  geometry: {
    contentWidth: '541.0341pt',
    maxPageHeightPx: REFERENCE_PAGE_CONTENT_MAX_HEIGHT_PX,
    sheetPadding: '15.8368pt 27.3838pt 15.8368pt 26.8577pt',
    pageContentClassName: ' resume-page-content',
    fontFamily: "'Liberation Sans', 'Arimo', Arial, sans-serif",
    fontSize: '8.40675pt',
    lineHeight: '12.61013pt',
    color: '#212529',
    roundMeasuredHeight: (height: number) => Math.round(height * 100) / 100,
  },
  buildBlocks: buildStandardAtsV2Blocks,
  renderThumbnail: ({ className }) => <StandardAtsV2Thumbnail className={className} />,
};
