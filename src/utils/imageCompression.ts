/**
 * Utility functions for image compression
 */

/**
 * Compresses an image data URL to reduce its size
 * @param dataUrl The original image data URL
 * @param maxWidth Maximum width of the compressed image
 * @param quality JPEG quality (0-1)
 * @returns A promise that resolves to the compressed image data URL
 */
export const compressImage = (
  dataUrl: string,
  maxWidth = 1200,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image to load the data URL
      const img = new Image();
      img.onload = () => {
        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        console.log(`Image compressed: ${Math.round((dataUrl.length - compressedDataUrl.length) / 1024)}KB saved`);
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Batch compresses multiple images
 * @param images Object with image data URLs as values
 * @returns Promise resolving to object with compressed image data URLs
 */
export const compressImages = async (
  images: Record<string, string>,
  maxWidth = 1200,
  quality = 0.7
): Promise<Record<string, string>> => {
  const compressedImages: Record<string, string> = {};
  
  // Process each image
  for (const [key, dataUrl] of Object.entries(images)) {
    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
      try {
        compressedImages[key] = await compressImage(dataUrl, maxWidth, quality);
      } catch (error) {
        console.error(`Error compressing image ${key}:`, error);
        // Fall back to original image if compression fails
        compressedImages[key] = dataUrl;
      }
    } else {
      // Not an image data URL, keep as is
      compressedImages[key] = dataUrl;
    }
  }
  
  return compressedImages;
};
