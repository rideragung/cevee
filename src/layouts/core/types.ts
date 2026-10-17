import type { ReactNode } from 'react';
import type { ResumeDocument, ResumeLayoutId } from '../../types/resume';

export type ContentBlockType =
  | 'header'
  | 'section-title'
  | 'summary'
  | 'skills'
  | 'item'
  | 'item-head'
  | 'item-subhead'
  | 'item-bullet';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  height: number;
  render: () => ReactNode;
}

export interface ContentPart {
  kind: 'list' | 'paragraph';
  html: string;
}

export interface LayoutGeometry {
  contentWidth: string;
  maxPageHeightPx: number;
  sheetPadding?: string;
  pageContentClassName?: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  color: string;
  roundMeasuredHeight: (height: number) => number;
}

export interface LayoutPlugin {
  id: ResumeLayoutId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  isDefault?: boolean;
  geometry: LayoutGeometry;
  buildBlocks: (resume: ResumeDocument) => ContentBlock[];
  renderThumbnail: (props: { className?: string }) => ReactNode;
}
