import React from 'react';
import { MiniPreview, INTER_FONT_STACK } from '../shared/MiniPreview';

interface ModernPhotoThumbnailProps {
  className?: string;
}

export const ModernPhotoThumbnail: React.FC<ModernPhotoThumbnailProps> = ({ className = '' }) => (
  <MiniPreview className={className} variant="photo" fontFamily={INTER_FONT_STACK} />
);
