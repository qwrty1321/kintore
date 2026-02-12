/**
 * syncStoreのユニットテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSyncStore } from '../syncStore';
import type { AnonymousDataPayload } from '@/types';
import * as syncQueueDB from '@/services/db/syncQueueDB';

// モック
vi.mock('@/services/db/syncQueueDB');

describe('syncStore', () => {
  beforeEach(() => {
    // ストアをリセット
    const store = useSyncStore.getState();
    store.clearQueue();
    store.clearError();
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('正しい初期値を持つ', () => {
      const state = useSyncStore.getState();
      expect(state.isSyncing).toBe(false);
      expect(state.syncQueue).toEqual([]);
      expect(state.lastSyncTime).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('setOnlineStatus', () => {
    it('オンライン状態を更新する', () => {
      const { setOnlineStatus } = useSyncStore.getState();
      
      setOnlineStatus(false);
      expect(useSyncStore.getState().isOnline).toBe(false);
      
      setOnlineStatus(true);
      expect(useSyncStore.getState().isOnline).toBe(true);
    });
  });

  describe('addToQueue', () => {
    it('キューにアイテムを追加する', async () => {
      const mockPayload: AnonymousDataPayload = {
        profileHash: 'test-hash',
        height: 170,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [],
      };

      vi.mocked(syncQueueDB.addToSyncQueue).mockResolvedValue(1);
      vi.mocked(syncQueueDB.getSyncQueueByStatus).mockResolvedValue([]);

      const { addToQueue } = useSyncStore.getState();
      const id = await addToQueue(mockPayload);

      expect(id).toBe(1);
      expect(syncQueueDB.addToSyncQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          payload: mockPayload,
          retryCount: 0,
        })
      );
    });

    it('エラー時にエラーメッセージを設定する', async () => {
      const mockPayload: AnonymousDataPayload = {
        profileHash: 'test-hash',
        height: 170,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [],
      };

      vi.mocked(syncQueueDB.addToSyncQueue).mockRejectedValue(
        new Error('Database error')
      );

      const { addToQueue } = useSyncStore.getState();

      await expect(addToQueue(mockPayload)).rejects.toThrow();
      expect(useSyncStore.getState().error).toBe('同期キューへの追加に失敗しました');
    });
  });

  describe('loadQueue', () => {
    it('ペンディングと失敗したアイテムを読み込む', async () => {
      const mockPendingItems = [
        {
          id: 1,
          timestamp: new Date('2024-01-01'),
          status: 'pending' as const,
          payload: {} as AnonymousDataPayload,
          retryCount: 0,
        },
      ];

      const mockFailedItems = [
        {
          id: 2,
          timestamp: new Date('2024-01-02'),
          status: 'failed' as const,
          payload: {} as AnonymousDataPayload,
          retryCount: 3,
          lastError: 'Network error',
        },
      ];

      vi.mocked(syncQueueDB.getSyncQueueByStatus)
        .mockResolvedValueOnce(mockPendingItems)
        .mockResolvedValueOnce(mockFailedItems);

      const { loadQueue } = useSyncStore.getState();
      await loadQueue();

      const state = useSyncStore.getState();
      expect(state.syncQueue).toHaveLength(2);
      expect(state.syncQueue[0].id).toBe(1);
      expect(state.syncQueue[1].id).toBe(2);
    });
  });

  describe('processSyncQueue', () => {
    it('オフライン時は処理をスキップする', async () => {
      const { setOnlineStatus, processSyncQueue } = useSyncStore.getState();
      setOnlineStatus(false);

      await processSyncQueue();

      expect(syncQueueDB.getSyncQueueByStatus).not.toHaveBeenCalled();
    });

    it('既に同期中の場合は処理をスキップする', async () => {
      const store = useSyncStore.getState();
      store.setOnlineStatus(true);
      
      // isSyncingを手動で設定
      useSyncStore.setState({ isSyncing: true });

      await store.processSyncQueue();

      expect(syncQueueDB.getSyncQueueByStatus).not.toHaveBeenCalled();
    });

    it('ペンディングアイテムがない場合は即座に完了する', async () => {
      vi.mocked(syncQueueDB.getSyncQueueByStatus).mockResolvedValue([]);

      const { setOnlineStatus, processSyncQueue } = useSyncStore.getState();
      setOnlineStatus(true);

      await processSyncQueue();

      const state = useSyncStore.getState();
      expect(state.isSyncing).toBe(false);
      expect(state.lastSyncTime).not.toBeNull();
    });
  });

  describe('retryFailedItems', () => {
    it('失敗したアイテムをペンディングに戻す', async () => {
      const mockFailedItems = [
        {
          id: 1,
          timestamp: new Date(),
          status: 'failed' as const,
          payload: {} as AnonymousDataPayload,
          retryCount: 3,
          lastError: 'Network error',
        },
      ];

      vi.mocked(syncQueueDB.getSyncQueueByStatus)
        .mockResolvedValueOnce(mockFailedItems)
        .mockResolvedValue([]);

      const { retryFailedItems } = useSyncStore.getState();
      await retryFailedItems();

      expect(syncQueueDB.updateSyncQueueItem).toHaveBeenCalledWith(1, {
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
      });
    });
  });

  describe('clearQueue', () => {
    it('すべてのキューアイテムを削除する', async () => {
      const mockItems = [
        {
          id: 1,
          timestamp: new Date(),
          status: 'pending' as const,
          payload: {} as AnonymousDataPayload,
          retryCount: 0,
        },
        {
          id: 2,
          timestamp: new Date(),
          status: 'failed' as const,
          payload: {} as AnonymousDataPayload,
          retryCount: 3,
        },
      ];

      useSyncStore.setState({ syncQueue: mockItems });

      const { clearQueue } = useSyncStore.getState();
      await clearQueue();

      expect(syncQueueDB.deleteSyncQueueItem).toHaveBeenCalledTimes(2);
      expect(syncQueueDB.deleteSyncQueueItem).toHaveBeenCalledWith(1);
      expect(syncQueueDB.deleteSyncQueueItem).toHaveBeenCalledWith(2);
      expect(useSyncStore.getState().syncQueue).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('エラーをクリアする', () => {
      useSyncStore.setState({ error: 'テストエラー' });
      
      const { clearError } = useSyncStore.getState();
      clearError();

      expect(useSyncStore.getState().error).toBeNull();
    });
  });
});

