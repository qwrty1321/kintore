/**
 * 画像処理サービス
 * 
 * 画像のアップロード、圧縮、リサイズ、サムネイル生成を行います。
 * 要件: 3A.2、3A.3、3A.4
 */

import imageCompression from 'browser-image-compression';
// import type { WorkoutImage } from '@/types';

// ============================================
// 定数
// ============================================

const MAX_WIDTH = 1920; // 最大幅（px）
const THUMBNAIL_WIDTH = 300; // サムネイル幅（px）
const COMPRESSION_QUALITY = 0.8; // 圧縮品質（0-1）
const MAX_FILE_SIZE_MB = 2; // 最大ファイルサイズ（MB）

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AcceptedFormat = typeof ACCEPTED_FORMATS[number];

// ============================================
// 型定義
// ============================================

export interface ProcessImageOptions {
  maxWidth?: number;
  quality?: number;
  maxSizeMB?: number;
}

export interface ProcessImageResult {
  original: Blob;
  thumbnail: Blob;
  mimeType: string;
  size: number;
}

// ============================================
// バリデーション
// ============================================

/**
 * 画像ファイルの形式を検証
 * 要件: 3A.2 - JPEG、PNG、WebP形式の画像を受け入れる
 */
export function isValidImageFormat(file: File): boolean {
  return ACCEPTED_FORMATS.includes(file.type as AcceptedFormat);
}

/**
 * 画像ファイルのバリデーション
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!isValidImageFormat(file)) {
    return {
      valid: false,
      error: `サポートされていない画像形式です。JPEG、PNG、WebPのみ対応しています。`,
    };
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024 * 2) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE_MB * 2}MBまでです。`,
    };
  }

  return { valid: true };
}

// ============================================
// 画像処理
// ============================================

/**
 * 画像を圧縮してリサイズ
 * 要件: 3A.3 - 画像を最大1920px幅にリサイズし、ファイルサイズを最適化
 */
async function compressImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<Blob> {
  const {
    maxWidth = MAX_WIDTH,
    quality = COMPRESSION_QUALITY,
    maxSizeMB = MAX_FILE_SIZE_MB,
  } = options;

  const compressionOptions = {
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
    maxSizeMB,
    initialQuality: quality,
    fileType: file.type as AcceptedFormat,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error('画像圧縮エラー:', error);
    throw new Error('画像の圧縮に失敗しました');
  }
}

/**
 * サムネイル画像を生成
 * 要件: 3A.4 - サムネイル生成
 */
async function generateThumbnail(file: File): Promise<Blob> {
  const thumbnailOptions = {
    maxWidthOrHeight: THUMBNAIL_WIDTH,
    useWebWorker: true,
    maxSizeMB: 0.5,
    initialQuality: 0.7,
    fileType: file.type as AcceptedFormat,
  };

  try {
    const thumbnail = await imageCompression(file, thumbnailOptions);
    return thumbnail;
  } catch (error) {
    console.error('サムネイル生成エラー:', error);
    throw new Error('サムネイルの生成に失敗しました');
  }
}

/**
 * 画像ファイルを処理（圧縮 + サムネイル生成）
 * 
 * @param file - 処理する画像ファイル
 * @param options - 処理オプション
 * @returns 処理結果（圧縮画像、サムネイル、メタデータ）
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<ProcessImageResult> {
  // バリデーション
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    // 並列処理で圧縮とサムネイル生成を実行
    const [compressedBlob, thumbnailBlob] = await Promise.all([
      compressImage(file, options),
      generateThumbnail(file),
    ]);

    return {
      original: compressedBlob,
      thumbnail: thumbnailBlob,
      mimeType: file.type,
      size: compressedBlob.size,
    };
  } catch (error) {
    console.error('画像処理エラー:', error);
    throw error instanceof Error ? error : new Error('画像の処理に失敗しました');
  }
}

/**
 * 複数の画像を処理
 * 
 * @param files - 処理する画像ファイルの配列
 * @param options - 処理オプション
 * @returns 処理結果の配列
 */
export async function processImages(
  files: File[],
  options: ProcessImageOptions = {}
): Promise<ProcessImageResult[]> {
  const results: ProcessImageResult[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      const result = await processImage(file, options);
      results.push(result);
    } catch (error) {
      errors.push({
        file: file.name,
        error: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  if (errors.length > 0) {
    console.warn('一部の画像の処理に失敗しました:', errors);
  }

  return results;
}

// ============================================
// ユーティリティ
// ============================================

/**
 * BlobをData URLに変換
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Data URLをBlobに変換
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * 画像のサイズ（幅と高さ）を取得
 */
export function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };
    
    img.src = url;
  });
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
