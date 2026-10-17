import React from 'react';
import { MiniPreview, LIBERATION_FONT_STACK } from '../shared/MiniPreview';

interface StandardAtsV2ThumbnailProps {
  className?: string;
}

export const StandardAtsV2Thumbnail: React.FC<StandardAtsV2ThumbnailProps> = ({ className = '' }) => (
  <MiniPreview className={className} variant="standard" fontFamily={LIBERATION_FONT_STACK} />
);
