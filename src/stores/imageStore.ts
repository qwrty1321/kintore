/**
 * 画像の状態管理 - Zustand Store
 * 
 * **要件: 3A.1、3A.2、3A.5**
 */

import { create } from 'zustand';
import type { WorkoutImage } from '@/types';
import {
  saveImage,
  getImage,
  getImagesByWorkoutId,
  deleteImage,
  deleteImagesByWorkoutId,
} from '@/services/db/imageDB';

interface ImageState {
  // 状態
  images: Map<string, WorkoutImage>; // キー: 画像ID
  workoutImages: Map<string, string[]>; // キー: workoutId、値: 画像IDの配列
  isLoading: boolean;
  error: string | null;

  // アクション
  uploadImage: (image: WorkoutImage) => Promise<string>;
  loadImage: (id: string) => Promise<WorkoutImage | undefined>;
  loadImagesByWorkoutId: (workoutId: string) => Promise<WorkoutImage[]>;
  deleteImageById: (id: string) => Promise<void>;
  deleteImagesByWorkoutId: (workoutId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * 画像のZustand Store
 * 
 * 画像のアップロード、保存、取得を管理
 * IndexedDBを使用してBlobデータを永続化
 */
export const useImageStore = create<ImageState>((set, get) => ({
  // 初期状態
  images: new Map(),
  workoutImages: new Map(),
  isLoading: false,
  error: null,

  /**
   * 画像をアップロード（保存）
   * 
   * **検証: 要件 3A.1、3A.2、3A.5**
   * 
   * @param image - アップロードする画像
   * @returns 保存された画像のID
   */
  uploadImage: async (image: WorkoutImage) => {
    set({ isLoading: true, error: null });
    
    try {
      // 画像形式の検証（JPEG、PNG、WebP）
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validMimeTypes.includes(image.mimeType)) {
        throw new Error('サポートされていない画像形式です。JPEG、PNG、WebPのみ対応しています。');
      }

      // IndexedDBに保存
      const id = await saveImage(image);
      
      // ローカル状態を更新
      const images = new Map(get().images);
      images.set(id, image);
      
      const workoutImages = new Map(get().workoutImages);
      const existingImages = workoutImages.get(image.workoutId) || [];
      workoutImages.set(image.workoutId, [...existingImages, id]);
      
      set({ images, workoutImages, isLoading: false });
      
      return id;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '画像のアップロードに失敗しました';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      console.error('Failed to upload image:', error);
      throw error;
    }
  },

  /**
   * 画像を読み込む
   * 
   * @param id - 画像のID
   * @returns 画像、見つからない場合はundefined
   */
  loadImage: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // キャッシュをチェック
      const cached = get().images.get(id);
      if (cached) {
        set({ isLoading: false });
        return cached;
      }
      
      // IndexedDBから取得
      const image = await getImage(id);
      
      if (image) {
        // ローカル状態を更新
        const images = new Map(get().images);
        images.set(id, image);
        set({ images, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      
      return image;
    } catch (error) {
      set({
        error: '画像の読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load image:', error);
      throw error;
    }
  },

  /**
   * トレーニング記録に関連する画像を読み込む
   * 
   * @param workoutId - トレーニング記録のID
   * @returns 関連する画像の配列
   */
  loadImagesByWorkoutId: async (workoutId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // IndexedDBから取得
      const images = await getImagesByWorkoutId(workoutId);
      
      // ローカル状態を更新
      const imagesMap = new Map(get().images);
      const imageIds: string[] = [];
      
      images.forEach(image => {
        imagesMap.set(image.id, image);
        imageIds.push(image.id);
      });
      
      const workoutImages = new Map(get().workoutImages);
      workoutImages.set(workoutId, imageIds);
      
      set({ images: imagesMap, workoutImages, isLoading: false });
      
      return images;
    } catch (error) {
      set({
        error: '画像の読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load images by workout ID:', error);
      throw error;
    }
  },

  /**
   * 画像を削除
   * 
   * @param id - 画像のID
   */
  deleteImageById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // 削除前に画像情報を取得
      const image = get().images.get(id);
      
      // IndexedDBから削除
      await deleteImage(id);
      
      // ローカル状態を更新
      const images = new Map(get().images);
      images.delete(id);
      
      // workoutImagesからも削除
      if (image) {
        const workoutImages = new Map(get().workoutImages);
        const imageIds = workoutImages.get(image.workoutId) || [];
        const updatedIds = imageIds.filter(imgId => imgId !== id);
        
        if (updatedIds.length > 0) {
          workoutImages.set(image.workoutId, updatedIds);
        } else {
          workoutImages.delete(image.workoutId);
        }
        
        set({ images, workoutImages, isLoading: false });
      } else {
        set({ images, isLoading: false });
      }
    } catch (error) {
      set({
        error: '画像の削除に失敗しました',
        isLoading: false,
      });
      console.error('Failed to delete image:', error);
      throw error;
    }
  },

  /**
   * トレーニング記録に関連するすべての画像を削除
   * 
   * @param workoutId - トレーニング記録のID
   */
  deleteImagesByWorkoutId: async (workoutId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // IndexedDBから削除
      await deleteImagesByWorkoutId(workoutId);
      
      // ローカル状態を更新
      const imageIds = get().workoutImages.get(workoutId) || [];
      const images = new Map(get().images);
      
      imageIds.forEach(id => {
        images.delete(id);
      });
      
      const workoutImages = new Map(get().workoutImages);
      workoutImages.delete(workoutId);
      
      set({ images, workoutImages, isLoading: false });
    } catch (error) {
      set({
        error: '画像の削除に失敗しました',
        isLoading: false,
      });
      console.error('Failed to delete images by workout ID:', error);
      throw error;
    }
  },

  /**
   * エラーをクリア
   */
  clearError: () => {
    set({ error: null });
  },
}));
