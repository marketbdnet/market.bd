/**
 * Optimizes image URLs (especially Unsplash images) for fast loading
 * by injecting low bandwidth parameters (WebP format, compressed quality, exact width).
 */
export const getOptimizedImageUrl = (url: string, width: number = 380): string => {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=380&q=65';

  // If already a base64 data URI, return as-is
  if (url.startsWith('data:image')) {
    return url;
  }

  // Check if Unsplash URL - serve ultra-fast compressed WebP
  if (url.includes('images.unsplash.com')) {
    try {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=65`;
    } catch {
      return url;
    }
  }

  return url;
};
