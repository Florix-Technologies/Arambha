/**
 * Convert Google Drive share links to direct image access URLs
 * Google Drive has strict embedding policies, so we provide multiple format options
 */
export function convertGoogleDriveLink(url: string): string {
  try {
    // Check if it's a Google Drive link
    if (!url.includes('drive.google.com')) {
      return url; // Return as-is if not a Drive link
    }

    // Extract file ID from the URL
    // Pattern: /file/d/{FILE_ID}/
    const fileIdMatch = url.match(/\/file\/d\/([^/?]+)/);
    if (!fileIdMatch || !fileIdMatch[1]) {
      console.warn('Could not extract Google Drive file ID from URL:', url);
      return url; // Return as-is if can't extract ID
    }

    const fileId = fileIdMatch[1];
    console.log('Converted Google Drive link - File ID:', fileId);
    
    // Return the direct view URL for images
    // This format works for publicly shared files
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  } catch (error) {
    console.error('Error converting Google Drive link:', error);
    return url; // Return original URL if conversion fails
  }
}

/**
 * Convert ImgBB share links to direct image URLs
 * ImgBB gives you share pages (ibb.co) but we need direct image URLs (i.ibb.co)
 */
export function convertImgBBLink(url: string): string {
  try {
    // Check if it's an ImgBB link
    if (!url.includes('ibb.co')) {
      return url;
    }

    // Pattern: https://ibb.co/IMAGEID or https://ibb.co/IMAGEID/SLUG
    const imageIdMatch = url.match(/ibb\.co\/([a-zA-Z0-9]+)/);
    if (!imageIdMatch || !imageIdMatch[1]) {
      return url;
    }

    const imageId = imageIdMatch[1];
    console.log('Detected ImgBB image ID:', imageId);
    
    // Return the direct image URL
    // Format: https://i.ibb.co/IMAGEID/image.jpg
    return `https://i.ibb.co/${imageId}/image.jpg`;
  } catch (error) {
    console.error('Error converting ImgBB link:', error);
    return url;
  }
}

/**
 * Smart URL converter - handles multiple image hosting services
 */
export function convertImageUrl(url: string): string {
  if (url.includes('ibb.co')) {
    return convertImgBBLink(url);
  }
  if (url.includes('drive.google.com')) {
    return convertGoogleDriveLink(url);
  }
  return url;
}

/**
 * Get alternative Google Drive embed URL (sometimes works when export=view fails)
 */
export function getAlternativeGoogleDriveUrl(url: string): string {
  try {
    const fileIdMatch = url.match(/\/file\/d\/([^/?]+)/);
    if (!fileIdMatch || !fileIdMatch[1]) {
      return url;
    }
    const fileId = fileIdMatch[1];
    // Alternative format with download parameter
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  } catch {
    return url;
  }
}

/**
 * Validate if a URL is accessible as an image
 */
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url); // Check if it's a valid URL
    return url.toLowerCase().includes('http://') || url.toLowerCase().includes('https://');
  } catch {
    return false;
  }
}

/**
 * Extract Google Drive file ID for instructions
 */
export function extractGoogleDriveFileId(url: string): string | null {
  try {
    const match = url.match(/\/file\/d\/([^/?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Detect image hosting service
 */
export function detectImageService(url: string): string {
  if (url.includes('ibb.co') || url.includes('i.ibb.co')) {
    return 'ImgBB';
  }
  if (url.includes('drive.google.com')) {
    return 'Google Drive';
  }
  if (url.includes('imgur')) {
    return 'Imgur';
  }
  if (url.includes('cloudinary')) {
    return 'Cloudinary';
  }
  return 'Other';
}
