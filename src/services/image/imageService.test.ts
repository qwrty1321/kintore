/**
 * 画像サービスのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  uploadAndSaveImage,
  uploadAndSaveImages,
  getImageById,
  getWorkoutImages,
  getThumbnailURL,
  getImageURL,
  removeImage,
  getRemainingImageSlots,
  revokeImageURL,
} from './imageService';
import * as imageDB from '@/services/db/imageDB';
import type { WorkoutImage } from '@/types';

// ============================================
// モック
// ============================================

vi.mock('@/services/db/imageDB', () => ({
  saveImage: vi.fn(),
  getImage: vi.fn(),
  getImagesByWorkoutId: vi.fn(),
  deleteImage: vi.fn(),
  deleteImagesByWorkoutId: vi.fn(),
}));

// ============================================
// テストヘルパー
// ============================================

/**
 * テスト用の画像ファイルを作成
 */
async function createTestImageFile(
  width: number = 100,
  height: number = 100,
  type: string = 'image/jpeg'
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  
  // 単色背景を描画
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, width, height);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to create blob');
      const file = new File([blob], 'test-image.jpg', { type });
      resolve(file);
    }, type);
  });
}

/**
 * テスト用のWorkoutImageを作成
 */
function createTestWorkoutImage(
  id: string = crypto.randomUUID(),
  workoutId: string = crypto.randomUUID()
): WorkoutImage {
  const blob = new Blob(['test'], { type: 'image/jpeg' });
  const thumbnail = new Blob(['thumb'], { type: 'image/jpeg' });
  
  return {
    id,
    workoutId,
    blob,
    thumbnail,
    mimeType: 'image/jpeg',
    size: blob.size,
    createdAt: new Date(),
  };
}

// ============================================
// テスト
// ============================================

describe('uploadAndSaveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('画像をアップロードして保存できる', async () => {
    const file = await createTestImageFile();
    const workoutId = crypto.randomUUID();
    
    vi.mocked(imageDB.saveImage).mockResolvedValue('image-id');

    const imageId = await uploadAndSaveImage(file, workoutId);

    expect(imageId).toBeDefined();
    expect(imageDB.saveImage).toHaveBeenCalledTimes(1);
    
    const savedImage = vi.mocked(imageDB.saveImage).mock.calls[0][0];
    expect(savedImage.workoutId).toBe(workoutId);
    expect(savedImage.blob).toBeInstanceOf(Blob);
    expect(savedImage.thumbnail).toBeInstanceOf(Blob);
  });

  it('画像処理エラーを適切に処理する', async () => {
    const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });
    const workoutId = crypto.randomUUID();

    await expect(uploadAndSaveImage(invalidFile, workoutId)).rejects.toThrow();
  });
});

describe('uploadAndSaveImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('複数の画像をアップロードできる', async () => {
    const files = await Promise.all([
      createTestImageFile(),
      createTestImageFile(),
      createTestImageFile(),
    ]);
    const workoutId = crypto.randomUUID();
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue([]);
    vi.mocked(imageDB.saveImage).mockResolvedValue('image-id');

    const imageIds = await uploadAndSaveImages(files, workoutId);

    expect(imageIds).toHaveLength(3);
    expect(imageDB.saveImage).toHaveBeenCalledTimes(3);
  });

  it('最大5枚までの制限を適用する', async () => {
    const files = await Promise.all([
      createTestImageFile(),
      createTestImageFile(),
      createTestImageFile(),
      createTestImageFile(),
      createTestImageFile(),
      createTestImageFile(), // 6枚目は無視される
    ]);
    const workoutId = crypto.randomUUID();
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue([]);
    vi.mocked(imageDB.saveImage).mockResolvedValue('image-id');

    const imageIds = await uploadAndSaveImages(files, workoutId);

    expect(imageIds).toHaveLength(5);
    expect(imageDB.saveImage).toHaveBeenCalledTimes(5);
  });

  it('既存の画像がある場合、残りのスロットのみ使用する', async () => {
    const files = await Promise.all([
      createTestImageFile(),
      createTestImageFile(),
      createTestImageFile(),
    ]);
    const workoutId = crypto.randomUUID();
    
    // 既に3枚の画像が存在
    const existingImages = [
      createTestWorkoutImage('id1', workoutId),
      createTestWorkoutImage('id2', workoutId),
      createTestWorkoutImage('id3', workoutId),
    ];
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue(existingImages);
    vi.mocked(imageDB.saveImage).mockResolvedValue('image-id');

    const imageIds = await uploadAndSaveImages(files, workoutId);

    // 残り2枚のみアップロード
    expect(imageIds).toHaveLength(2);
    expect(imageDB.saveImage).toHaveBeenCalledTimes(2);
  });

  it('既に5枚の画像がある場合、エラーをスローする', async () => {
    const files = [await createTestImageFile()];
    const workoutId = crypto.randomUUID();
    
    // 既に5枚の画像が存在
    const existingImages = Array.from({ length: 5 }, (_, i) =>
      createTestWorkoutImage(`id${i}`, workoutId)
    );
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue(existingImages);

    await expect(uploadAndSaveImages(files, workoutId)).rejects.toThrow(
      '1つの記録には最大5枚まで画像を添付できます'
    );
  });
});

describe('getImageById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('画像を取得できる', async () => {
    const testImage = createTestWorkoutImage();
    vi.mocked(imageDB.getImage).mockResolvedValue(testImage);

    const image = await getImageById(testImage.id);

    expect(image).toEqual(testImage);
    expect(imageDB.getImage).toHaveBeenCalledWith(testImage.id);
  });

  it('存在しない画像の場合、undefinedを返す', async () => {
    vi.mocked(imageDB.getImage).mockResolvedValue(undefined);

    const image = await getImageById('non-existent-id');

    expect(image).toBeUndefined();
  });
});

describe('getWorkoutImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('トレーニング記録の画像を取得できる', async () => {
    const workoutId = crypto.randomUUID();
    const testImages = [
      createTestWorkoutImage('id1', workoutId),
      createTestWorkoutImage('id2', workoutId),
    ];
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue(testImages);

    const images = await getWorkoutImages(workoutId);

    expect(images).toEqual(testImages);
    expect(imageDB.getImagesByWorkoutId).toHaveBeenCalledWith(workoutId);
  });
});

describe('getThumbnailURL と getImageURL', () => {
  it('サムネイルURLを生成できる', () => {
    const testImage = createTestWorkoutImage();
    const url = getThumbnailURL(testImage);

    expect(url).toMatch(/^blob:/);
  });

  it('フルサイズ画像URLを生成できる', () => {
    const testImage = createTestWorkoutImage();
    const url = getImageURL(testImage);

    expect(url).toMatch(/^blob:/);
  });
});

describe('removeImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('画像を削除できる', async () => {
    const imageId = crypto.randomUUID();
    vi.mocked(imageDB.deleteImage).mockResolvedValue();

    await removeImage(imageId);

    expect(imageDB.deleteImage).toHaveBeenCalledWith(imageId);
  });
});

describe('getRemainingImageSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('残りのスロット数を計算できる', async () => {
    const workoutId = crypto.randomUUID();
    const existingImages = [
      createTestWorkoutImage('id1', workoutId),
      createTestWorkoutImage('id2', workoutId),
    ];
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue(existingImages);

    const remaining = await getRemainingImageSlots(workoutId);

    expect(remaining).toBe(3); // 5 - 2 = 3
  });

  it('既に5枚ある場合、0を返す', async () => {
    const workoutId = crypto.randomUUID();
    const existingImages = Array.from({ length: 5 }, (_, i) =>
      createTestWorkoutImage(`id${i}`, workoutId)
    );
    
    vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue(existingImages);

    const remaining = await getRemainingImageSlots(workoutId);

    expect(remaining).toBe(0);
  });
});

describe('revokeImageURL', () => {
  it('Object URLを解放できる', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);

    // エラーをスローしないことを確認
    expect(() => revokeImageURL(url)).not.toThrow();
  });
});
