import React from 'react';
import { ResumeLayoutId } from '../types/resume';
import { getLayoutPlugin } from '../layouts/registry';

interface ResumeMiniPreviewProps {
  layoutId?: ResumeLayoutId | string;
  className?: string;
}

export const ResumeMiniPreview: React.FC<ResumeMiniPreviewProps> = ({ layoutId, className = '' }) => (
  <>{getLayoutPlugin(layoutId).renderThumbnail({ className })}</>
);
