/**
 * 同期キューのデータベース操作
 */

import { db } from './schema';
import type { SyncQueueItem } from '@/types';

/**
 * 同期キューにアイテムを追加
 * 
 * **検証: 要件 6.4**
 * 
 * @param item - 追加する同期キューアイテム
 * @returns 追加されたアイテムのID
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
  try {
    const id = await db.syncQueue.add({
      ...item,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    } as SyncQueueItem);
    return id;
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'addToSyncQueue',
      cause: error as Error,
    };
  }
}

/**
 * 同期キューアイテムを取得
 * 
 * @param id - アイテムのID
 * @returns 同期キューアイテム、見つからない場合はundefined
 */
export async function getSyncQueueItem(id: number): Promise<SyncQueueItem | undefined> {
  try {
    return await db.syncQueue.get(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getSyncQueueItem',
      cause: error as Error,
    };
  }
}

/**
 * ステータスに基づいて同期キューアイテムを取得
 * 
 * @param status - 同期ステータス
 * @returns 指定されたステータスの同期キューアイテムの配列
 */
export async function getSyncQueueByStatus(
  status: 'pending' | 'processing' | 'failed'
): Promise<SyncQueueItem[]> {
  try {
    return await db.syncQueue.where('status').equals(status).toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getSyncQueueByStatus',
      cause: error as Error,
    };
  }
}

/**
 * 同期キューアイテムを更新
 * 
 * @param id - アイテムのID
 * @param updates - 更新する内容
 */
export async function updateSyncQueueItem(
  id: number,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  try {
    await db.syncQueue.update(id, updates);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'updateSyncQueueItem',
      cause: error as Error,
    };
  }
}

/**
 * 同期キューアイテムを削除
 * 
 * @param id - アイテムのID
 */
export async function deleteSyncQueueItem(id: number): Promise<void> {
  try {
    await db.syncQueue.delete(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'deleteSyncQueueItem',
      cause: error as Error,
    };
  }
}

/**
 * 成功した同期キューアイテムをクリア
 */
export async function clearSuccessfulSyncQueue(): Promise<void> {
  try {
    // 'pending'と'failed'以外のアイテムを削除
    const allItems = await db.syncQueue.toArray();
    const itemsToDelete = allItems.filter(
      item => item.status !== 'pending' && item.status !== 'failed'
    );
    const deletePromises = itemsToDelete.map(item => deleteSyncQueueItem(item.id!));
    await Promise.all(deletePromises);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'clearSuccessfulSyncQueue',
      cause: error as Error,
    };
  }
}
