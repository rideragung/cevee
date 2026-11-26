import React from 'react';
import { buildStandardAtsV2Blocks } from './blocks';
import { REFERENCE_PAGE_CONTENT_MAX_HEIGHT_PX } from './metrics';
import { StandardAtsV2Thumbnail } from './Thumbnail';
import { LAYOUT_CATALOG } from '../catalog';
import type { LayoutPlugin } from '../core/types';

export const standardAtsV2Plugin: LayoutPlugin = {
  ...LAYOUT_CATALOG['standard-ats-v2'],
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
