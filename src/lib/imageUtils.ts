/**
 * Optimizes Cloudinary image URLs by injecting auto-format, auto-quality, 
 * and width constraints to drastically reduce file sizes.
 */
export const getOptimizedImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  
  // Insert optimizations (q_auto, f_auto, width constraint) after the 'upload/' segment
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
};