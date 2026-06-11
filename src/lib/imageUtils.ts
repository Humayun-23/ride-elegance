type ImageOptimizationOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit";
};

/**
 * Optimizes Cloudinary image URLs by injecting auto-format, auto-quality,
 * and size constraints to reduce bytes before images reach the browser.
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  options: ImageOptimizationOptions = {},
): string => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;

  const { width = 800, height, crop = "limit" } = options;
  const transforms = ["q_auto", "f_auto", `c_${crop}`, `w_${width}`];
  if (height) transforms.push(`h_${height}`);

  return url.replace('/upload/', `/upload/${transforms.join(",")}/`);
};
