/**
 * Image optimization utilities for better performance
 */

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (img: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        if (src) {
          target.src = src;
          target.removeAttribute('data-src');
          observer.unobserve(target);
        }
      }
    });
  });

  observer.observe(img);
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280, 1920]
): string => {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Optimize image loading with blur placeholder
 */
export const createBlurPlaceholder = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
};

/**
 * Check if image format is supported
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Get optimized image URL based on browser support
 */
export const getOptimizedImageUrl = (url: string): string => {
  if (supportsWebP() && !url.endsWith('.webp')) {
    // If your CDN supports automatic WebP conversion, append format parameter
    return `${url}?format=webp`;
  }
  return url;
};
