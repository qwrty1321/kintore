/**
 * imageStoreのユニットテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useImageStore } from '../imageStore';
import type { WorkoutImage } from '@/types';
import * as imageDB from '@/services/db/imageDB';

// imageDBモジュールをモック
vi.mock('@/services/db/imageDB');

describe('imageStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useImageStore.setState({
      images: new Map(),
      workoutImages: new Map(),
      isLoading: false,
      error: null,
    });
    
    // モックをリセット
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('有効な画像をアップロードできる', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.saveImage).mockResolvedValue('img-1');

      const store = useImageStore.getState();
      const id = await store.uploadImage(mockImage);

      expect(id).toBe('img-1');
      expect(imageDB.saveImage).toHaveBeenCalledWith(mockImage);
      
      const state = useImageStore.getState();
      expect(state.images.get('img-1')).toEqual(mockImage);
      expect(state.workoutImages.get('workout-1')).toEqual(['img-1']);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('JPEG形式の画像を受け入れる', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.saveImage).mockResolvedValue('img-1');

      const store = useImageStore.getState();
      await expect(store.uploadImage(mockImage)).resolves.toBe('img-1');
    });

    it('PNG形式の画像を受け入れる', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-2',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/png' }),
        thumbnail: new Blob(['thumb'], { type: 'image/png' }),
        mimeType: 'image/png',
        size: 2048,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.saveImage).mockResolvedValue('img-2');

      const store = useImageStore.getState();
      await expect(store.uploadImage(mockImage)).resolves.toBe('img-2');
    });

    it('WebP形式の画像を受け入れる', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-3',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/webp' }),
        thumbnail: new Blob(['thumb'], { type: 'image/webp' }),
        mimeType: 'image/webp',
        size: 512,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.saveImage).mockResolvedValue('img-3');

      const store = useImageStore.getState();
      await expect(store.uploadImage(mockImage)).resolves.toBe('img-3');
    });

    it('サポートされていない画像形式を拒否する', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-4',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/gif' }),
        thumbnail: new Blob(['thumb'], { type: 'image/gif' }),
        mimeType: 'image/gif',
        size: 1024,
        createdAt: new Date(),
      };

      const store = useImageStore.getState();
      
      await expect(store.uploadImage(mockImage)).rejects.toThrow(
        'サポートされていない画像形式です'
      );
      
      expect(imageDB.saveImage).not.toHaveBeenCalled();
      
      const state = useImageStore.getState();
      expect(state.error).toContain('サポートされていない画像形式');
    });

    it('同じworkoutIdに複数の画像を追加できる', async () => {
      const mockImage1: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test1'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb1'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      const mockImage2: WorkoutImage = {
        id: 'img-2',
        workoutId: 'workout-1',
        blob: new Blob(['test2'], { type: 'image/png' }),
        thumbnail: new Blob(['thumb2'], { type: 'image/png' }),
        mimeType: 'image/png',
        size: 2048,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.saveImage)
        .mockResolvedValueOnce('img-1')
        .mockResolvedValueOnce('img-2');

      const store = useImageStore.getState();
      await store.uploadImage(mockImage1);
      await store.uploadImage(mockImage2);

      const state = useImageStore.getState();
      expect(state.workoutImages.get('workout-1')).toEqual(['img-1', 'img-2']);
    });

    it('保存エラー時にエラーメッセージを設定する', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.saveImage).mockRejectedValue(new Error('Storage error'));

      const store = useImageStore.getState();
      
      await expect(store.uploadImage(mockImage)).rejects.toThrow();
      
      const state = useImageStore.getState();
      expect(state.error).toBe('Storage error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadImage', () => {
    it('画像を読み込める', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      vi.mocked(imageDB.getImage).mockResolvedValue(mockImage);

      const store = useImageStore.getState();
      const image = await store.loadImage('img-1');

      expect(image).toEqual(mockImage);
      expect(imageDB.getImage).toHaveBeenCalledWith('img-1');
      
      const state = useImageStore.getState();
      expect(state.images.get('img-1')).toEqual(mockImage);
    });

    it('キャッシュされた画像を返す', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      // キャッシュに画像を設定
      useImageStore.setState({
        images: new Map([['img-1', mockImage]]),
      });

      const store = useImageStore.getState();
      const image = await store.loadImage('img-1');

      expect(image).toEqual(mockImage);
      // キャッシュから取得するのでDBアクセスは不要
      expect(imageDB.getImage).not.toHaveBeenCalled();
    });

    it('存在しない画像の場合undefinedを返す', async () => {
      vi.mocked(imageDB.getImage).mockResolvedValue(undefined);

      const store = useImageStore.getState();
      const image = await store.loadImage('non-existent');

      expect(image).toBeUndefined();
    });
  });

  describe('loadImagesByWorkoutId', () => {
    it('トレーニング記録に関連する画像を読み込める', async () => {
      const mockImages: WorkoutImage[] = [
        {
          id: 'img-1',
          workoutId: 'workout-1',
          blob: new Blob(['test1'], { type: 'image/jpeg' }),
          thumbnail: new Blob(['thumb1'], { type: 'image/jpeg' }),
          mimeType: 'image/jpeg',
          size: 1024,
          createdAt: new Date(),
        },
        {
          id: 'img-2',
          workoutId: 'workout-1',
          blob: new Blob(['test2'], { type: 'image/png' }),
          thumbnail: new Blob(['thumb2'], { type: 'image/png' }),
          mimeType: 'image/png',
          size: 2048,
          createdAt: new Date(),
        },
      ];

      vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue(mockImages);

      const store = useImageStore.getState();
      const images = await store.loadImagesByWorkoutId('workout-1');

      expect(images).toEqual(mockImages);
      expect(imageDB.getImagesByWorkoutId).toHaveBeenCalledWith('workout-1');
      
      const state = useImageStore.getState();
      expect(state.images.get('img-1')).toEqual(mockImages[0]);
      expect(state.images.get('img-2')).toEqual(mockImages[1]);
      expect(state.workoutImages.get('workout-1')).toEqual(['img-1', 'img-2']);
    });

    it('画像がない場合は空配列を返す', async () => {
      vi.mocked(imageDB.getImagesByWorkoutId).mockResolvedValue([]);

      const store = useImageStore.getState();
      const images = await store.loadImagesByWorkoutId('workout-1');

      expect(images).toEqual([]);
    });
  });

  describe('deleteImageById', () => {
    it('画像を削除できる', async () => {
      const mockImage: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      // 初期状態を設定
      useImageStore.setState({
        images: new Map([['img-1', mockImage]]),
        workoutImages: new Map([['workout-1', ['img-1']]]),
      });

      vi.mocked(imageDB.deleteImage).mockResolvedValue();

      const store = useImageStore.getState();
      await store.deleteImageById('img-1');

      expect(imageDB.deleteImage).toHaveBeenCalledWith('img-1');
      
      const state = useImageStore.getState();
      expect(state.images.has('img-1')).toBe(false);
      expect(state.workoutImages.has('workout-1')).toBe(false);
    });

    it('複数画像のうち1つを削除しても他は残る', async () => {
      const mockImage1: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test1'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb1'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      const mockImage2: WorkoutImage = {
        id: 'img-2',
        workoutId: 'workout-1',
        blob: new Blob(['test2'], { type: 'image/png' }),
        thumbnail: new Blob(['thumb2'], { type: 'image/png' }),
        mimeType: 'image/png',
        size: 2048,
        createdAt: new Date(),
      };

      // 初期状態を設定
      useImageStore.setState({
        images: new Map([
          ['img-1', mockImage1],
          ['img-2', mockImage2],
        ]),
        workoutImages: new Map([['workout-1', ['img-1', 'img-2']]]),
      });

      vi.mocked(imageDB.deleteImage).mockResolvedValue();

      const store = useImageStore.getState();
      await store.deleteImageById('img-1');

      const state = useImageStore.getState();
      expect(state.images.has('img-1')).toBe(false);
      expect(state.images.has('img-2')).toBe(true);
      expect(state.workoutImages.get('workout-1')).toEqual(['img-2']);
    });
  });

  describe('deleteImagesByWorkoutId', () => {
    it('トレーニング記録に関連するすべての画像を削除できる', async () => {
      const mockImage1: WorkoutImage = {
        id: 'img-1',
        workoutId: 'workout-1',
        blob: new Blob(['test1'], { type: 'image/jpeg' }),
        thumbnail: new Blob(['thumb1'], { type: 'image/jpeg' }),
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
      };

      const mockImage2: WorkoutImage = {
        id: 'img-2',
        workoutId: 'workout-1',
        blob: new Blob(['test2'], { type: 'image/png' }),
        thumbnail: new Blob(['thumb2'], { type: 'image/png' }),
        mimeType: 'image/png',
        size: 2048,
        createdAt: new Date(),
      };

      // 初期状態を設定
      useImageStore.setState({
        images: new Map([
          ['img-1', mockImage1],
          ['img-2', mockImage2],
        ]),
        workoutImages: new Map([['workout-1', ['img-1', 'img-2']]]),
      });

      vi.mocked(imageDB.deleteImagesByWorkoutId).mockResolvedValue();

      const store = useImageStore.getState();
      await store.deleteImagesByWorkoutId('workout-1');

      expect(imageDB.deleteImagesByWorkoutId).toHaveBeenCalledWith('workout-1');
      
      const state = useImageStore.getState();
      expect(state.images.has('img-1')).toBe(false);
      expect(state.images.has('img-2')).toBe(false);
      expect(state.workoutImages.has('workout-1')).toBe(false);
    });
  });

  describe('clearError', () => {
    it('エラーをクリアできる', () => {
      useImageStore.setState({ error: 'Test error' });

      const store = useImageStore.getState();
      store.clearError();

      const state = useImageStore.getState();
      expect(state.error).toBeNull();
    });
  });
});
