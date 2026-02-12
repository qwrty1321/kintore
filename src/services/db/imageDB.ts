/**
 * 画像のデータベース操作
 */

import { db } from './schema';
import type { WorkoutImage } from '@/types';

/**
 * 画像を保存
 * 
 * **検証: 要件 3A.5**
 * 
 * @param image - 保存する画像
 * @returns 保存された画像のID
 */
export async function saveImage(image: WorkoutImage): Promise<string> {
  try {
    await db.images.put(image);
    return image.id;
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'saveImage',
      cause: error as Error,
    };
  }
}

/**
 * 画像を取得
 * 
 * @param id - 画像のID
 * @returns 画像、見つからない場合はundefined
 */
export async function getImage(id: string): Promise<WorkoutImage | undefined> {
  try {
    return await db.images.get(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getImage',
      cause: error as Error,
    };
  }
}

/**
 * トレーニング記録に関連する画像を取得
 * 
 * @param workoutId - トレーニング記録のID
 * @returns 関連する画像の配列
 */
export async function getImagesByWorkoutId(workoutId: string): Promise<WorkoutImage[]> {
  try {
    return await db.images.where('workoutId').equals(workoutId).toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getImagesByWorkoutId',
      cause: error as Error,
    };
  }
}

/**
 * 画像を削除
 * 
 * @param id - 画像のID
 */
export async function deleteImage(id: string): Promise<void> {
  try {
    await db.images.delete(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'deleteImage',
      cause: error as Error,
    };
  }
}

/**
 * トレーニング記録に関連するすべての画像を削除
 * 
 * @param workoutId - トレーニング記録のID
 */
export async function deleteImagesByWorkoutId(workoutId: string): Promise<void> {
  try {
    const images = await getImagesByWorkoutId(workoutId);
    const deletePromises = images.map(img => deleteImage(img.id));
    await Promise.all(deletePromises);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'deleteImagesByWorkoutId',
      cause: error as Error,
    };
  }
}
