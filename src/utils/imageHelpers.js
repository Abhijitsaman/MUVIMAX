/**
 * Image URL Helper Utilities
 * 
 * This file provides utility functions for normalizing image URLs
 * from various sources including Google Drive.
 */

/**
 * Checks if a URL is a Google Drive sharing URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is a Google Drive sharing URL
 */
export const isGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com/file/d/') || 
         url.includes('drive.google.com/uc?') ||
         url.includes('drive.google.com/uc?id=');
};

/**
 * Extracts the file ID from a Google Drive URL
 * @param {string} url - The Google Drive URL
 * @returns {string|null} - The extracted file ID or null if not found
 */
export const extractGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Pattern for: https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return fileIdMatch[1];
  }
  
  // Pattern for: https://drive.google.com/uc?export=view&id=FILE_ID
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1]) {
    return ucMatch[1];
  }
  
  // Pattern for: https://drive.google.com/uc?id=FILE_ID
  const simpleMatch = url.match(/uc\?id=([a-zA-Z0-9_-]+)/);
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1];
  }
  
  return null;
};

/**
 * Normalizes an image URL to be browser-displayable
 * Supports:
 * - Direct image URLs (returned as-is)
 * - Google Drive sharing URLs (converted to direct image URL)
 * 
 * @param {string} url - The image URL to normalize
 * @returns {string|null} - The normalized URL or null if invalid
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Trim whitespace
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;
  
  // If it's a Google Drive URL, try to normalize it
  if (isGoogleDriveUrl(trimmedUrl)) {
    const fileId = extractGoogleDriveFileId(trimmedUrl);
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    // If we can't extract the ID, return the original URL
    // (it will likely fail, but we'll let the browser handle it)
    return trimmedUrl;
  }
  
  // For non-Google-Drive URLs, return as-is
  return trimmedUrl;
};

/**
 * Gets the best available image URL from a banner or movie object
 * with priority order: image > imageUrl > backdrop
 * @param {Object} item - The banner or movie object
 * @param {string} item.image - Primary image field
 * @param {string} item.imageUrl - Secondary image field
 * @param {string} item.backdrop - Tertiary image field
 * @returns {string|null} - The normalized image URL or null
 */
export const getBestImageUrl = (item) => {
  if (!item || typeof item !== 'object') return null;
  
  // Priority: image > imageUrl > backdrop
  const rawUrl = item.image || item.imageUrl || item.backdrop || null;
  
  if (!rawUrl) return null;
  
  return normalizeImageUrl(rawUrl);
};
