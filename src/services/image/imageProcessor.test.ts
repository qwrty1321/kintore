/**
 * 画像処理サービスのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidImageFormat,
  validateImageFile,
  processImage,
  blobToDataURL,
  dataURLToBlob,
  formatFileSize,
} from './imageProcessor';

// ============================================
// テストヘルパー
// ============================================

/**
 * テスト用の画像ファイルを作成
 */
function createTestImageFile(
  type: string = 'image/jpeg',
  size: number = 1024
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], 'test-image.jpg', { type });
}

/**
 * 実際の画像データを持つテスト用ファイルを作成
 */
async function createRealImageFile(
  width: number = 100,
  height: number = 100,
  type: string = 'image/jpeg'
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  
  // グラデーション背景を描画
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff0000');
  gradient.addColorStop(1, '#0000ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to create blob');
      const file = new File([blob], 'test-image.jpg', { type });
      resolve(file);
    }, type);
  });
}

// ============================================
// バリデーションテスト
// ============================================

describe('isValidImageFormat', () => {
  it('JPEG形式を受け入れる', () => {
    const file = createTestImageFile('image/jpeg');
    expect(isValidImageFormat(file)).toBe(true);
  });

  it('PNG形式を受け入れる', () => {
    const file = createTestImageFile('image/png');
    expect(isValidImageFormat(file)).toBe(true);
  });

  it('WebP形式を受け入れる', () => {
    const file = createTestImageFile('image/webp');
    expect(isValidImageFormat(file)).toBe(true);
  });

  it('GIF形式を拒否する', () => {
    const file = createTestImageFile('image/gif');
    expect(isValidImageFormat(file)).toBe(false);
  });

  it('SVG形式を拒否する', () => {
    const file = createTestImageFile('image/svg+xml');
    expect(isValidImageFormat(file)).toBe(false);
  });

  it('非画像形式を拒否する', () => {
    const file = createTestImageFile('application/pdf');
    expect(isValidImageFormat(file)).toBe(false);
  });
});

describe('validateImageFile', () => {
  it('有効な画像ファイルを受け入れる', () => {
    const file = createTestImageFile('image/jpeg', 1024 * 1024); // 1MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('サポートされていない形式を拒否する', () => {
    const file = createTestImageFile('image/gif', 1024);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('サポートされていない画像形式');
  });

  it('大きすぎるファイルを拒否する', () => {
    const file = createTestImageFile('image/jpeg', 10 * 1024 * 1024); // 10MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('ファイルサイズが大きすぎます');
  });
});

// ============================================
// 画像処理テスト
// ============================================

describe('processImage', () => {
  it('有効な画像を処理できる', async () => {
    const file = await createRealImageFile(2000, 1500, 'image/jpeg');
    const result = await processImage(file);

    expect(result).toBeDefined();
    expect(result.original).toBeInstanceOf(Blob);
    expect(result.thumbnail).toBeInstanceOf(Blob);
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.size).toBeGreaterThan(0);
  });

  it('サムネイルは元画像より小さい', async () => {
    const file = await createRealImageFile(2000, 1500, 'image/jpeg');
    const result = await processImage(file);

    expect(result.thumbnail.size).toBeLessThan(result.original.size);
  });

  it('無効な形式の画像を拒否する', async () => {
    const file = createTestImageFile('image/gif', 1024);
    
    await expect(processImage(file)).rejects.toThrow();
  });

  it('PNG形式の画像を処理できる', async () => {
    const file = await createRealImageFile(1000, 1000, 'image/png');
    const result = await processImage(file);

    expect(result.mimeType).toBe('image/png');
    expect(result.original).toBeInstanceOf(Blob);
    expect(result.thumbnail).toBeInstanceOf(Blob);
  });
});

// ============================================
// ユーティリティテスト
// ============================================

describe('blobToDataURL', () => {
  it('BlobをData URLに変換できる', async () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const dataURL = await blobToDataURL(blob);

    expect(dataURL).toMatch(/^data:text\/plain;base64,/);
  });

  it('画像BlobをData URLに変換できる', async () => {
    const file = await createRealImageFile(100, 100, 'image/jpeg');
    const blob = new Blob([await file.arrayBuffer()], { type: 'image/jpeg' });
    const dataURL = await blobToDataURL(blob);

    expect(dataURL).toMatch(/^data:image\/jpeg;base64,/);
  });
});

describe('dataURLToBlob', () => {
  it('Data URLをBlobに変換できる', () => {
    const dataURL = 'data:text/plain;base64,dGVzdA==';
    const blob = dataURLToBlob(dataURL);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/plain');
  });

  it('画像Data URLをBlobに変換できる', async () => {
    const file = await createRealImageFile(100, 100, 'image/jpeg');
    const blob = new Blob([await file.arrayBuffer()], { type: 'image/jpeg' });
    const dataURL = await blobToDataURL(blob);
    const convertedBlob = dataURLToBlob(dataURL);

    expect(convertedBlob).toBeInstanceOf(Blob);
    expect(convertedBlob.type).toBe('image/jpeg');
  });
});

describe('formatFileSize', () => {
  it('0バイトを正しくフォーマットする', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('バイトを正しくフォーマットする', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('キロバイトを正しくフォーマットする', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('メガバイトを正しくフォーマットする', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  it('ギガバイトを正しくフォーマットする', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

// ============================================
// エッジケーステスト
// ============================================

describe('エッジケース', () => {
  it('空のファイルを処理しようとするとエラーになる', async () => {
    const file = createTestImageFile('image/jpeg', 0);
    
    await expect(processImage(file)).rejects.toThrow();
  });

  it('非常に小さい画像を処理できる', async () => {
    const file = await createRealImageFile(10, 10, 'image/jpeg');
    const result = await processImage(file);

    expect(result.original).toBeInstanceOf(Blob);
    expect(result.thumbnail).toBeInstanceOf(Blob);
  });
});
