/**
 * Optimizes image URLs (especially Unsplash images) for fast loading
 * by injecting low bandwidth parameters (WebP format, compressed quality, exact width).
 */
export const getOptimizedImageUrl = (url: string, width: number = 400): string => {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=70';

  // Check if Unsplash URL
  if (url.includes('images.unsplash.com')) {
    try {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=70`;
    } catch {
      return url;
    }
  }

  return url;
};
