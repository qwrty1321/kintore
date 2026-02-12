/**
 * トレーニング記録のデータベース操作
 */

import { db } from './schema';
import type { WorkoutRecord, WorkoutFilter } from '@/types';

/**
 * トレーニング記録を保存
 * 
 * **検証: 要件 1.2**
 * 
 * @param workout - 保存するトレーニング記録
 * @returns 保存された記録のID
 */
export async function saveWorkout(workout: WorkoutRecord): Promise<string> {
  try {
    await db.workouts.put(workout);
    return workout.id;
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'saveWorkout',
      cause: error as Error,
    };
  }
}

/**
 * トレーニング記録を取得
 * 
 * @param id - 記録のID
 * @returns トレーニング記録、見つからない場合はundefined
 */
export async function getWorkout(id: string): Promise<WorkoutRecord | undefined> {
  try {
    return await db.workouts.get(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getWorkout',
      cause: error as Error,
    };
  }
}

/**
 * すべてのトレーニング記録を取得
 * 
 * @returns すべてのトレーニング記録の配列
 */
export async function getAllWorkouts(): Promise<WorkoutRecord[]> {
  try {
    return await db.workouts.toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getAllWorkouts',
      cause: error as Error,
    };
  }
}

/**
 * フィルター条件に基づいてトレーニング記録を取得
 * 
 * **検証: 要件 4.3、4.4**
 * 
 * @param filter - フィルター条件
 * @returns フィルターされたトレーニング記録の配列
 */
export async function getFilteredWorkouts(filter: WorkoutFilter): Promise<WorkoutRecord[]> {
  try {
    let collection = db.workouts.toCollection();

    // 部位でフィルター
    if (filter.bodyPart) {
      collection = db.workouts.where('bodyPart').equals(filter.bodyPart);
    }

    // トレーニング方法でフィルター
    if (filter.exerciseName) {
      collection = collection.filter(w => w.exerciseName === filter.exerciseName);
    }

    // 日付範囲でフィルター
    if (filter.dateRange) {
      collection = collection.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= filter.dateRange!.start && workoutDate <= filter.dateRange!.end;
      });
    }

    return await collection.toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getFilteredWorkouts',
      cause: error as Error,
    };
  }
}

/**
 * トレーニング記録を更新
 * 
 * @param id - 記録のID
 * @param updates - 更新する内容
 */
export async function updateWorkout(
  id: string,
  updates: Partial<WorkoutRecord>
): Promise<void> {
  try {
    await db.workouts.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'updateWorkout',
      cause: error as Error,
    };
  }
}

/**
 * トレーニング記録を削除
 * 
 * @param id - 記録のID
 */
export async function deleteWorkout(id: string): Promise<void> {
  try {
    await db.workouts.delete(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'deleteWorkout',
      cause: error as Error,
    };
  }
}

/**
 * ユーザーIDに基づいてトレーニング記録を取得
 * 
 * @param userId - ユーザーID
 * @returns ユーザーのトレーニング記録の配列
 */
export async function getWorkoutsByUserId(userId: string): Promise<WorkoutRecord[]> {
  try {
    return await db.workouts.where('userId').equals(userId).toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getWorkoutsByUserId',
      cause: error as Error,
    };
  }
}

/**
 * 同期ステータスに基づいてトレーニング記録を取得
 * 
 * **検証: 要件 6.4、9.1**
 * 
 * @param status - 同期ステータス
 * @returns 指定されたステータスのトレーニング記録の配列
 */
export async function getWorkoutsBySyncStatus(
  status: 'synced' | 'pending' | 'failed'
): Promise<WorkoutRecord[]> {
  try {
    return await db.workouts.where('syncStatus').equals(status).toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getWorkoutsBySyncStatus',
      cause: error as Error,
    };
  }
}
