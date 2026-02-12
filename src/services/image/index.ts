/**
 * 画像サービス - エクスポート
 */

// 画像処理
export {
  processImage,
  processImages,
  isValidImageFormat,
  validateImageFile,
  blobToDataURL,
  dataURLToBlob,
  getImageDimensions,
  formatFileSize,
  type ProcessImageOptions,
  type ProcessImageResult,
} from './imageProcessor';

// 画像サービス
export {
  uploadAndSaveImage,
  uploadAndSaveImages,
  getImageById,
  getWorkoutImages,
  getThumbnailURL,
  getImageURL,
  removeImage,
  removeWorkoutImages,
  getRemainingImageSlots,
  revokeImageURL,
} from './imageService';

// シェアサービス
export {
  isShareSupported,
  isFileShareSupported,
  generateShareText,
  shareWorkoutImage,
  shareWorkoutText,
  downloadImage,
  downloadImages,
  type ShareOptions,
  type ShareData,
} from './shareService';
