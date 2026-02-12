/**
 * 身体プロファイルのデータベース操作
 */

import { db } from './schema';
import type { BodyProfile } from '@/types';

/**
 * プロファイルを保存または更新
 * 
 * **検証: 要件 5.1、5.2**
 * 
 * @param profile - 保存するプロファイル
 * @returns 保存されたプロファイルのユーザーID
 */
export async function saveProfile(profile: BodyProfile): Promise<string> {
  try {
    await db.profile.put({
      ...profile,
      updatedAt: new Date(),
    });
    return profile.userId;
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'saveProfile',
      cause: error as Error,
    };
  }
}

/**
 * プロファイルを取得
 * 
 * @param userId - ユーザーID
 * @returns プロファイル、見つからない場合はundefined
 */
export async function getProfile(userId: string): Promise<BodyProfile | undefined> {
  try {
    return await db.profile.get(userId);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getProfile',
      cause: error as Error,
    };
  }
}

/**
 * プロファイルを更新
 * 
 * **検証: 要件 5.2**
 * 
 * @param userId - ユーザーID
 * @param updates - 更新する内容
 */
export async function updateProfile(
  userId: string,
  updates: Partial<BodyProfile>
): Promise<void> {
  try {
    await db.profile.update(userId, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'updateProfile',
      cause: error as Error,
    };
  }
}

/**
 * プロファイルを削除
 * 
 * @param userId - ユーザーID
 */
export async function deleteProfile(userId: string): Promise<void> {
  try {
    await db.profile.delete(userId);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'deleteProfile',
      cause: error as Error,
    };
  }
}
