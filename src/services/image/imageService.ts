/**
 * 画像サービス - 画像処理とストレージの統合
 * 
 * 画像のアップロード、処理、保存、取得を統合的に管理します。
 * 要件: 3A.1、3A.2、3A.3、3A.4、3A.5、3A.6
 */

import { processImage } from './imageProcessor';
import {
  saveImage,
  getImage,
  getImagesByWorkoutId,
  deleteImage,
  deleteImagesByWorkoutId,
} from '@/services/db/imageDB';
import type { WorkoutImage } from '@/types';

// ============================================
// 定数
// ============================================

const MAX_IMAGES_PER_WORKOUT = 5; // 1つの記録に添付できる最大画像数

// ============================================
// 画像アップロードと保存
// ============================================

/**
 * 画像をアップロードして処理し、IndexedDBに保存
 * 
 * 要件: 3A.1、3A.2、3A.3、3A.4、3A.5
 * 
 * @param file - アップロードする画像ファイル
 * @param workoutId - 関連するトレーニング記録のID
 * @returns 保存された画像のID
 */
export async function uploadAndSaveImage(
  file: File,
  workoutId: string
): Promise<string> {
  try {
    // 画像を処理（圧縮 + サムネイル生成）
    const processed = await processImage(file);

    // WorkoutImageオブジェクトを作成
    const imageId = crypto.randomUUID();
    const workoutImage: WorkoutImage = {
      id: imageId,
      workoutId,
      blob: processed.original,
      thumbnail: processed.thumbnail,
      mimeType: processed.mimeType,
      size: processed.size,
      createdAt: new Date(),
    };

    // IndexedDBに保存
    await saveImage(workoutImage);

    return imageId;
  } catch (error) {
    console.error('画像のアップロードと保存に失敗しました:', error);
    throw error;
  }
}

/**
 * 複数の画像をアップロードして保存
 * 
 * 要件: 3A.4 - 最大5枚まで保存
 * 
 * @param files - アップロードする画像ファイルの配列
 * @param workoutId - 関連するトレーニング記録のID
 * @returns 保存された画像IDの配列
 */
export async function uploadAndSaveImages(
  files: File[],
  workoutId: string
): Promise<string[]> {
  // 既存の画像数を確認
  const existingImages = await getImagesByWorkoutId(workoutId);
  const remainingSlots = MAX_IMAGES_PER_WORKOUT - existingImages.length;

  if (remainingSlots <= 0) {
    throw new Error(`1つの記録には最大${MAX_IMAGES_PER_WORKOUT}枚まで画像を添付できます`);
  }

  // 制限内のファイルのみ処理
  const filesToProcess = files.slice(0, remainingSlots);
  
  if (filesToProcess.length < files.length) {
    console.warn(
      `${files.length}枚の画像が選択されましたが、制限により${filesToProcess.length}枚のみアップロードします`
    );
  }

  const imageIds: string[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of filesToProcess) {
    try {
      const imageId = await uploadAndSaveImage(file, workoutId);
      imageIds.push(imageId);
    } catch (error) {
      errors.push({
        file: file.name,
        error: error instanceof Error ? error.message : '不明なエラー',
      });
    }
  }

  if (errors.length > 0) {
    console.warn('一部の画像のアップロードに失敗しました:', errors);
  }

  return imageIds;
}

// ============================================
// 画像の取得
// ============================================

/**
 * 画像を取得
 * 
 * @param imageId - 画像のID
 * @returns 画像、見つからない場合はundefined
 */
export async function getImageById(imageId: string): Promise<WorkoutImage | undefined> {
  try {
    return await getImage(imageId);
  } catch (error) {
    console.error('画像の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * トレーニング記録に関連するすべての画像を取得
 * 
 * 要件: 3A.6 - 添付された画像をサムネイルで表示
 * 
 * @param workoutId - トレーニング記録のID
 * @returns 画像の配列
 */
export async function getWorkoutImages(workoutId: string): Promise<WorkoutImage[]> {
  try {
    return await getImagesByWorkoutId(workoutId);
  } catch (error) {
    console.error('トレーニング記録の画像取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 画像のサムネイルURLを取得
 * 
 * @param image - 画像オブジェクト
 * @returns サムネイルのObject URL
 */
export function getThumbnailURL(image: WorkoutImage): string {
  return URL.createObjectURL(image.thumbnail);
}

/**
 * 画像のフルサイズURLを取得
 * 
 * @param image - 画像オブジェクト
 * @returns フルサイズ画像のObject URL
 */
export function getImageURL(image: WorkoutImage): string {
  return URL.createObjectURL(image.blob);
}

// ============================================
// 画像の削除
// ============================================

/**
 * 画像を削除
 * 
 * @param imageId - 画像のID
 */
export async function removeImage(imageId: string): Promise<void> {
  try {
    await deleteImage(imageId);
  } catch (error) {
    console.error('画像の削除に失敗しました:', error);
    throw error;
  }
}

/**
 * トレーニング記録に関連するすべての画像を削除
 * 
 * @param workoutId - トレーニング記録のID
 */
export async function removeWorkoutImages(workoutId: string): Promise<void> {
  try {
    await deleteImagesByWorkoutId(workoutId);
  } catch (error) {
    console.error('トレーニング記録の画像削除に失敗しました:', error);
    throw error;
  }
}

// ============================================
// ユーティリティ
// ============================================

/**
 * トレーニング記録に添付できる残りの画像数を取得
 * 
 * @param workoutId - トレーニング記録のID
 * @returns 残りの添付可能枚数
 */
export async function getRemainingImageSlots(workoutId: string): Promise<number> {
  const existingImages = await getImagesByWorkoutId(workoutId);
  return Math.max(0, MAX_IMAGES_PER_WORKOUT - existingImages.length);
}

/**
 * Object URLをクリーンアップ
 * メモリリークを防ぐため、使用後は必ず呼び出す
 * 
 * @param url - クリーンアップするObject URL
 */
export function revokeImageURL(url: string): void {
  URL.revokeObjectURL(url);
}
