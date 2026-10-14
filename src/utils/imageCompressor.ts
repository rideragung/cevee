/**
 * Client-side lightweight image compressor (Zero dependencies, pure HTML5 Canvas).
 * Centers and crops image to 3:4 aspect ratio, resizes to target dimensions (max 300x400),
 * and compresses to ~25-40 KB without distortion or stretching.
 * ponytail: upgrade to Web Worker or OffscreenCanvas if user uploads massive multi-megapixel files in bulk.
 */
export const compressProfilePhoto = (
  file: File,
  targetWidth = 300,
  targetHeight = 400,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const sw = img.naturalWidth || img.width;
        const sh = img.naturalHeight || img.height;

        if (!sw || !sh) {
          reject(new Error('Invalid image dimensions'));
          return;
        }

        // Target aspect ratio 3:4 (0.75)
        const targetAspect = targetWidth / targetHeight;
        const srcAspect = sw / sh;

        let cropWidth = sw;
        let cropHeight = sh;
        let cropX = 0;
        let cropY = 0;

        if (srcAspect > targetAspect) {
          // Source is wider than 3:4 -> crop sides (horizontal center)
          cropWidth = Math.round(sh * targetAspect);
          cropX = Math.round((sw - cropWidth) / 2);
        } else if (srcAspect < targetAspect) {
          // Source is taller than 3:4 -> crop top/bottom (vertical center)
          cropHeight = Math.round(sw / targetAspect);
          cropY = Math.round((sh - cropHeight) / 2);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Draw center-cropped source image onto target canvas with exact aspect ratio
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Export compressed JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
