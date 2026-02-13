/**
 * データ同期サービス
 * 
 * オフライン時のキューイングとバックグラウンド再送信を管理します。
 * 
 * 要件:
 * - 6.3: データ共有を無効にした場合、以降のデータ送信を停止
 * - 6.4: データ送信が失敗した場合、ローカルにキューイングし、次回接続時に再送信
 * - 9.2: ネットワーク接続が回復した場合、未送信のデータを自動的にサーバーに同期
 */

import type { WorkoutRecord, BodyProfile } from '@/types';
import { sendAnonymousData, ApiError } from './apiClient';
import { createAnonymousPayload } from './anonymizationService';
import {
  addToSyncQueue,
  getSyncQueueByStatus,
  updateSyncQueueItem,
  deleteSyncQueueItem,
} from '@/services/db/syncQueueDB';

/**
 * 同期設定
 */
interface SyncSettings {
  enabled: boolean;
  autoSync: boolean;
  maxRetries: number;
  retryDelay: number; // ミリ秒
}

/**
 * デフォルト設定
 */
const DEFAULT_SETTINGS: SyncSettings = {
  enabled: true,
  autoSync: true,
  maxRetries: 3,
  retryDelay: 5000, // 5秒
};

/**
 * 同期設定をローカルストレージから取得
 */
function getSyncSettings(): SyncSettings {
  try {
    const stored = localStorage.getItem('syncSettings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load sync settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * 同期設定をローカルストレージに保存
 */
export function setSyncSettings(settings: Partial<SyncSettings>): void {
  try {
    const current = getSyncSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('syncSettings', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save sync settings:', error);
  }
}

/**
 * データ共有が有効かどうかを確認
 * 
 * @returns データ共有が有効な場合true
 */
export function isDataSharingEnabled(): boolean {
  const settings = getSyncSettings();
  return settings.enabled;
}

/**
 * データ共有を有効/無効にする
 * 
 * @param enabled - 有効にする場合true
 */
export function setDataSharingEnabled(enabled: boolean): void {
  setSyncSettings({ enabled });
}

/**
 * トレーニングデータを同期キューに追加
 * 
 * データ共有が無効な場合は何もしません。
 * 
 * @param userId - ユーザーID
 * @param profile - 身体プロファイル
 * @param workouts - トレーニング記録の配列
 * @returns キューアイテムのID（追加された場合）
 */
export async function queueWorkoutData(
  userId: string,
  profile: BodyProfile,
  workouts: WorkoutRecord[]
): Promise<number | null> {
  // データ共有が無効な場合は何もしない
  if (!isDataSharingEnabled()) {
    console.log('Data sharing is disabled. Skipping queue.');
    return null;
  }

  try {
    // 匿名データペイロードを作成
    const payload = await createAnonymousPayload(userId, profile, workouts);

    // 同期キューに追加
    const id = await addToSyncQueue({
      timestamp: new Date(),
      status: 'pending',
      payload,
      retryCount: 0,
    });

    return id;
  } catch (error) {
    console.error('Failed to queue workout data:', error);
    throw error;
  }
}

/**
 * 単一の同期キューアイテムを処理
 * 
 * @param itemId - 同期キューアイテムのID
 * @returns 成功した場合true
 */
export async function processSyncItem(itemId: number): Promise<boolean> {
  try {
    // キューアイテムを取得
    const items = await getSyncQueueByStatus('pending');
    const item = items.find(i => i.id === itemId);

    if (!item) {
      console.warn(`Sync item ${itemId} not found`);
      return false;
    }

    // ステータスを処理中に更新
    await updateSyncQueueItem(itemId, { status: 'processing' });

    // データを送信
    await sendAnonymousData(item.payload);

    // 成功したらキューから削除
    await deleteSyncQueueItem(itemId);

    return true;
  } catch (error) {
    // エラーハンドリング
    const settings = getSyncSettings();
    const items = await getSyncQueueByStatus('processing');
    const item = items.find(i => i.id === itemId);

    if (!item) {
      console.error(`Failed to find item ${itemId} for error handling`);
      return false;
    }

    const retryCount = (item.retryCount || 0) + 1;
    const errorMessage = error instanceof ApiError ? error.message : '不明なエラー';

    if (retryCount >= settings.maxRetries) {
      // 最大リトライ回数に達した場合は失敗として記録
      await updateSyncQueueItem(itemId, {
        status: 'failed',
        retryCount,
        lastError: errorMessage,
      });
      console.error(`Sync item ${itemId} failed after ${retryCount} retries:`, error);
    } else {
      // リトライ可能な場合はペンディングに戻す
      await updateSyncQueueItem(itemId, {
        status: 'pending',
        retryCount,
        lastError: errorMessage,
      });
      console.warn(`Sync item ${itemId} failed, will retry (${retryCount}/${settings.maxRetries}):`, error);
    }

    return false;
  }
}

/**
 * すべての保留中の同期キューアイテムを処理
 * 
 * @returns 処理された件数と成功件数
 */
export async function processSyncQueue(): Promise<{ processed: number; succeeded: number }> {
  // データ共有が無効な場合は何もしない
  if (!isDataSharingEnabled()) {
    console.log('Data sharing is disabled. Skipping sync.');
    return { processed: 0, succeeded: 0 };
  }

  try {
    // 保留中のアイテムを取得
    const pendingItems = await getSyncQueueByStatus('pending');

    if (pendingItems.length === 0) {
      return { processed: 0, succeeded: 0 };
    }

    let succeeded = 0;

    // 各アイテムを順次処理
    for (const item of pendingItems) {
      if (item.id !== undefined) {
        const success = await processSyncItem(item.id);
        if (success) {
          succeeded++;
        }

        // リトライ間隔を待つ
        if (item !== pendingItems[pendingItems.length - 1]) {
          const settings = getSyncSettings();
          await new Promise(resolve => setTimeout(resolve, settings.retryDelay));
        }
      }
    }

    return { processed: pendingItems.length, succeeded };
  } catch (error) {
    console.error('Failed to process sync queue:', error);
    throw error;
  }
}

/**
 * 失敗したアイテムを再試行
 * 
 * @returns 再試行対象の件数
 */
export async function retryFailedItems(): Promise<number> {
  try {
    const failedItems = await getSyncQueueByStatus('failed');

    // 失敗したアイテムをペンディングに戻す
    for (const item of failedItems) {
      if (item.id !== undefined) {
        await updateSyncQueueItem(item.id, {
          status: 'pending',
          retryCount: 0,
          lastError: undefined,
        });
      }
    }

    return failedItems.length;
  } catch (error) {
    console.error('Failed to retry failed items:', error);
    throw error;
  }
}

/**
 * バックグラウンド同期を開始
 * 
 * 定期的に同期キューを処理します。
 * 
 * @param intervalMs - 同期間隔（ミリ秒）
 * @returns 停止関数
 */
export function startBackgroundSync(intervalMs: number = 60000): () => void {
  const settings = getSyncSettings();

  if (!settings.autoSync) {
    console.log('Auto sync is disabled');
    return () => {};
  }

  // 初回実行
  processSyncQueue().catch(error => {
    console.error('Background sync failed:', error);
  });

  // 定期実行
  const intervalId = setInterval(() => {
    processSyncQueue().catch(error => {
      console.error('Background sync failed:', error);
    });
  }, intervalMs);

  // 停止関数を返す
  return () => {
    clearInterval(intervalId);
  };
}
