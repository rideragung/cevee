import React from 'react';
import { MiniPreview, INTER_FONT_STACK } from '../shared/MiniPreview';

interface StandardAtsV1ThumbnailProps {
  className?: string;
}

export const StandardAtsV1Thumbnail: React.FC<StandardAtsV1ThumbnailProps> = ({ className = '' }) => (
  <MiniPreview className={className} variant="standard" fontFamily={INTER_FONT_STACK} />
);
