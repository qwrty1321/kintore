/**
 * 同期状態管理 - Zustand Store
 * 
 * **要件: 6.4、9.1**
 */

import { create } from 'zustand';
import type { SyncQueueItem, AnonymousDataPayload } from '@/types';
import {
  addToSyncQueue,
  getSyncQueueByStatus,
  updateSyncQueueItem,
  deleteSyncQueueItem,
} from '@/services/db/syncQueueDB';
import { processSyncItem } from '@/services/api/syncService';

interface SyncState {
  // 状態
  isOnline: boolean;
  isSyncing: boolean;
  syncQueue: SyncQueueItem[];
  lastSyncTime: Date | null;
  error: string | null;

  // アクション
  setOnlineStatus: (isOnline: boolean) => void;
  addToQueue: (payload: AnonymousDataPayload) => Promise<number>;
  loadQueue: () => Promise<void>;
  processSyncQueue: () => Promise<void>;
  retryFailedItems: () => Promise<void>;
  clearQueue: () => Promise<void>;
  clearError: () => void;
}

/**
 * 同期のZustand Store
 * 
 * オフライン時のデータキューイングと
 * オンライン復帰時の自動同期を管理
 * 
 * **検証: 要件 6.4、9.1**
 */
export const useSyncStore = create<SyncState>((set, get) => ({
  // 初期状態
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  syncQueue: [],
  lastSyncTime: null,
  error: null,

  /**
   * オンライン状態を設定
   * 
   * @param isOnline - オンライン状態
   */
  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
    
    // オンラインに復帰した場合、自動的に同期を開始
    if (isOnline && !get().isSyncing) {
      get().processSyncQueue();
    }
  },

  /**
   * 同期キューにデータを追加
   * 
   * **検証: 要件 6.4**
   * 
   * @param payload - 匿名化されたデータペイロード
   * @returns キューアイテムのID
   */
  addToQueue: async (payload: AnonymousDataPayload) => {
    try {
      const id = await addToSyncQueue({
        timestamp: new Date(),
        status: 'pending',
        payload,
        retryCount: 0,
      });

      // ローカル状態を更新
      await get().loadQueue();

      // オンラインの場合は即座に同期を試みる
      if (get().isOnline && !get().isSyncing) {
        get().processSyncQueue();
      }

      return id;
    } catch (error) {
      const errorMessage = '同期キューへの追加に失敗しました';
      set({ error: errorMessage });
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  },

  /**
   * 同期キューを読み込む
   */
  loadQueue: async () => {
    try {
      const pending = await getSyncQueueByStatus('pending');
      const failed = await getSyncQueueByStatus('failed');
      const syncQueue = [...pending, ...failed].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      set({ syncQueue });
    } catch (error) {
      set({ error: '同期キューの読み込みに失敗しました' });
      console.error('Failed to load sync queue:', error);
    }
  },

  /**
   * 同期キューを処理
   * 
   * **検証: 要件 6.4、9.2**
   */
  processSyncQueue: async () => {
    // オフラインまたは既に同期中の場合はスキップ
    if (!get().isOnline || get().isSyncing) {
      return;
    }

    set({ isSyncing: true, error: null });

    try {
      // 保留中のアイテムを取得
      const pendingItems = await getSyncQueueByStatus('pending');

      if (pendingItems.length === 0) {
        set({ isSyncing: false, lastSyncTime: new Date() });
        return;
      }

      // 各アイテムを順次処理
      for (const item of pendingItems) {
        if (item.id === undefined) continue;

        try {
          // syncServiceを使用して処理
          await processSyncItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }

      // キューを再読み込み
      await get().loadQueue();

      set({ isSyncing: false, lastSyncTime: new Date() });
    } catch (error) {
      set({
        error: '同期処理に失敗しました',
        isSyncing: false,
      });
      console.error('Failed to process sync queue:', error);
    }
  },

  /**
   * 失敗したアイテムを再試行
   */
  retryFailedItems: async () => {
    try {
      const failedItems = await getSyncQueueByStatus('failed');

      // 失敗したアイテムをペンディングに戻す
      for (const item of failedItems) {
        await updateSyncQueueItem(item.id!, {
          status: 'pending',
          retryCount: 0,
          lastError: undefined,
        });
      }

      // キューを再読み込み
      await get().loadQueue();

      // 同期を開始
      if (get().isOnline) {
        get().processSyncQueue();
      }
    } catch (error) {
      set({ error: '再試行に失敗しました' });
      console.error('Failed to retry failed items:', error);
    }
  },

  /**
   * 同期キューをクリア（開発/テスト用）
   */
  clearQueue: async () => {
    try {
      const allItems = get().syncQueue;
      for (const item of allItems) {
        if (item.id) {
          await deleteSyncQueueItem(item.id);
        }
      }
      set({ syncQueue: [] });
    } catch (error) {
      set({ error: 'キューのクリアに失敗しました' });
      console.error('Failed to clear queue:', error);
    }
  },

  /**
   * エラーをクリア
   */
  clearError: () => {
    set({ error: null });
  },
}));

