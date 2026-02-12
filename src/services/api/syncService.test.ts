/**
 * 同期サービスのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isDataSharingEnabled,
  setDataSharingEnabled,
  queueWorkoutData,
  processSyncItem,
  processSyncQueue,
  retryFailedItems,
} from './syncService';
import * as apiClient from './apiClient';
import * as syncQueueDB from '@/services/db/syncQueueDB';
import type { BodyProfile, WorkoutRecord } from '@/types';

// モック
vi.mock('./apiClient');
vi.mock('@/services/db/syncQueueDB');

describe('syncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('データ共有設定', () => {
    it('デフォルトでデータ共有が有効', () => {
      expect(isDataSharingEnabled()).toBe(true);
    });

    it('データ共有を無効にできる', () => {
      setDataSharingEnabled(false);
      expect(isDataSharingEnabled()).toBe(false);
    });

    it('データ共有を有効にできる', () => {
      setDataSharingEnabled(false);
      setDataSharingEnabled(true);
      expect(isDataSharingEnabled()).toBe(true);
    });
  });

  describe('queueWorkoutData', () => {
    const mockProfile: BodyProfile = {
      userId: 'user-123',
      height: 170,
      weight: 70,
      weeklyFrequency: 3,
      updatedAt: new Date(),
    };

    const mockWorkout: WorkoutRecord = {
      id: 'workout-1',
      userId: 'user-123',
      date: new Date(),
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 60, reps: 10, completed: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
    };

    it('データ共有が有効な場合、キューに追加される', async () => {
      setDataSharingEnabled(true);
      vi.mocked(syncQueueDB.addToSyncQueue).mockResolvedValue(1);

      const result = await queueWorkoutData('user-123', mockProfile, [mockWorkout]);

      expect(result).toBe(1);
      expect(syncQueueDB.addToSyncQueue).toHaveBeenCalledOnce();
    });

    it('データ共有が無効な場合、キューに追加されない', async () => {
      setDataSharingEnabled(false);

      const result = await queueWorkoutData('user-123', mockProfile, [mockWorkout]);

      expect(result).toBeNull();
      expect(syncQueueDB.addToSyncQueue).not.toHaveBeenCalled();
    });
  });

  describe('processSyncItem', () => {
    it('成功した場合、キューから削除される', async () => {
      const mockItem = {
        id: 1,
        timestamp: new Date(),
        status: 'pending' as const,
        payload: {
          profileHash: 'hash123',
          height: 170,
          weight: 70,
          weeklyFrequency: 3,
          workouts: [],
        },
        retryCount: 0,
      };

      vi.mocked(syncQueueDB.getSyncQueueByStatus).mockResolvedValue([mockItem]);
      vi.mocked(apiClient.sendAnonymousData).mockResolvedValue({
        success: true,
        message: 'OK',
      });

      const result = await processSyncItem(1);

      expect(result).toBe(true);
      expect(syncQueueDB.updateSyncQueueItem).toHaveBeenCalledWith(1, { status: 'processing' });
      expect(apiClient.sendAnonymousData).toHaveBeenCalledWith(mockItem.payload);
      expect(syncQueueDB.deleteSyncQueueItem).toHaveBeenCalledWith(1);
    });

    it('失敗した場合、リトライカウントが増える', async () => {
      const mockItem = {
        id: 1,
        timestamp: new Date(),
        status: 'pending' as const,
        payload: {
          profileHash: 'hash123',
          height: 170,
          weight: 70,
          weeklyFrequency: 3,
          workouts: [],
        },
        retryCount: 0,
      };

      vi.mocked(syncQueueDB.getSyncQueueByStatus)
        .mockResolvedValueOnce([mockItem])
        .mockResolvedValueOnce([{ ...mockItem, status: 'processing' as const }]);
      vi.mocked(apiClient.sendAnonymousData).mockRejectedValue(new Error('Network error'));

      const result = await processSyncItem(1);

      expect(result).toBe(false);
      expect(syncQueueDB.updateSyncQueueItem).toHaveBeenCalledWith(1, {
        status: 'pending',
        retryCount: 1,
        lastError: 'Network error',
      });
    });

    it('最大リトライ回数に達した場合、失敗ステータスになる', async () => {
      const mockItem = {
        id: 1,
        timestamp: new Date(),
        status: 'pending' as const,
        payload: {
          profileHash: 'hash123',
          height: 170,
          weight: 70,
          weeklyFrequency: 3,
          workouts: [],
        },
        retryCount: 2,
      };

      vi.mocked(syncQueueDB.getSyncQueueByStatus)
        .mockResolvedValueOnce([mockItem])
        .mockResolvedValueOnce([{ ...mockItem, status: 'processing' as const }]);
      vi.mocked(apiClient.sendAnonymousData).mockRejectedValue(new Error('Network error'));

      const result = await processSyncItem(1);

      expect(result).toBe(false);
      expect(syncQueueDB.updateSyncQueueItem).toHaveBeenCalledWith(1, {
        status: 'failed',
        retryCount: 3,
        lastError: 'Network error',
      });
    });
  });

  describe('processSyncQueue', () => {
    it('データ共有が無効な場合、何もしない', async () => {
      setDataSharingEnabled(false);

      const result = await processSyncQueue();

      expect(result).toEqual({ processed: 0, succeeded: 0 });
      expect(syncQueueDB.getSyncQueueByStatus).not.toHaveBeenCalled();
    });

    it('保留中のアイテムがない場合、何もしない', async () => {
      setDataSharingEnabled(true);
      vi.mocked(syncQueueDB.getSyncQueueByStatus).mockResolvedValue([]);

      const result = await processSyncQueue();

      expect(result).toEqual({ processed: 0, succeeded: 0 });
    });

    it('複数のアイテムを処理できる', async () => {
      setDataSharingEnabled(true);
      const mockItems = [
        {
          id: 1,
          timestamp: new Date(),
          status: 'pending' as const,
          payload: {
            profileHash: 'hash1',
            height: 170,
            weight: 70,
            weeklyFrequency: 3,
            workouts: [],
          },
          retryCount: 0,
        },
        {
          id: 2,
          timestamp: new Date(),
          status: 'pending' as const,
          payload: {
            profileHash: 'hash2',
            height: 175,
            weight: 75,
            weeklyFrequency: 4,
            workouts: [],
          },
          retryCount: 0,
        },
      ];

      vi.mocked(syncQueueDB.getSyncQueueByStatus).mockResolvedValue(mockItems);
      vi.mocked(apiClient.sendAnonymousData).mockResolvedValue({
        success: true,
        message: 'OK',
      });

      const result = await processSyncQueue();

      expect(result.processed).toBe(2);
      expect(result.succeeded).toBe(2);
    });
  });

  describe('retryFailedItems', () => {
    it('失敗したアイテムをペンディングに戻す', async () => {
      const mockFailedItems = [
        {
          id: 1,
          timestamp: new Date(),
          status: 'failed' as const,
          payload: {
            profileHash: 'hash1',
            height: 170,
            weight: 70,
            weeklyFrequency: 3,
            workouts: [],
          },
          retryCount: 3,
          lastError: 'Network error',
        },
      ];

      vi.mocked(syncQueueDB.getSyncQueueByStatus).mockResolvedValue(mockFailedItems);

      const result = await retryFailedItems();

      expect(result).toBe(1);
      expect(syncQueueDB.updateSyncQueueItem).toHaveBeenCalledWith(1, {
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
      });
    });
  });
});
