/**
 * workoutStoreのユニットテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from '../workoutStore';
import type { WorkoutRecord } from '@/types';

// モックデータ
const mockWorkout: WorkoutRecord = {
  id: 'test-1',
  userId: 'user-1',
  date: new Date('2024-01-15'),
  bodyPart: 'chest',
  exerciseName: 'ベンチプレス',
  sets: [
    { setNumber: 1, weight: 60, reps: 10, completed: true },
    { setNumber: 2, weight: 60, reps: 8, completed: true },
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  syncStatus: 'pending',
};

describe('workoutStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    const store = useWorkoutStore.getState();
    store.workouts = [];
    store.currentWorkout = null;
    store.filter = {};
    store.error = null;
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const state = useWorkoutStore.getState();
      expect(state.workouts).toEqual([]);
      expect(state.currentWorkout).toBeNull();
      expect(state.filter).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setCurrentWorkout', () => {
    it('現在のトレーニング記録を設定できる', () => {
      const store = useWorkoutStore.getState();
      store.setCurrentWorkout(mockWorkout);
      
      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toEqual(mockWorkout);
    });

    it('nullを設定できる', () => {
      const store = useWorkoutStore.getState();
      store.setCurrentWorkout(mockWorkout);
      store.setCurrentWorkout(null);
      
      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toBeNull();
    });
  });

  describe('setFilter', () => {
    it('フィルター条件を設定できる', () => {
      const store = useWorkoutStore.getState();
      const filter = { bodyPart: 'chest' as const };
      store.setFilter(filter);
      
      const state = useWorkoutStore.getState();
      expect(state.filter).toEqual(filter);
    });

    it('複数のフィルター条件を設定できる', () => {
      const store = useWorkoutStore.getState();
      const filter = {
        bodyPart: 'chest' as const,
        exerciseName: 'ベンチプレス',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      };
      store.setFilter(filter);
      
      const state = useWorkoutStore.getState();
      expect(state.filter).toEqual(filter);
    });
  });

  describe('clearError', () => {
    it('エラーをクリアできる', () => {
      const store = useWorkoutStore.getState();
      // エラーを設定
      useWorkoutStore.setState({ error: 'テストエラー' });
      
      // エラーをクリア
      store.clearError();
      
      const state = useWorkoutStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('バリデーション', () => {
    it('無効なトレーニング記録を拒否する', async () => {
      const store = useWorkoutStore.getState();
      const invalidWorkout: WorkoutRecord = {
        ...mockWorkout,
        exerciseName: '', // 空のトレーニング方法
      };

      await expect(store.createWorkout(invalidWorkout)).rejects.toThrow();
      
      const state = useWorkoutStore.getState();
      expect(state.error).toBeTruthy();
    });

    it('負の重量を拒否する', async () => {
      const store = useWorkoutStore.getState();
      const invalidWorkout: WorkoutRecord = {
        ...mockWorkout,
        sets: [
          { setNumber: 1, weight: -10, reps: 10, completed: true },
        ],
      };

      await expect(store.createWorkout(invalidWorkout)).rejects.toThrow();
      
      const state = useWorkoutStore.getState();
      expect(state.error).toBeTruthy();
    });

    it('0以下の回数を拒否する', async () => {
      const store = useWorkoutStore.getState();
      const invalidWorkout: WorkoutRecord = {
        ...mockWorkout,
        sets: [
          { setNumber: 1, weight: 60, reps: 0, completed: true },
        ],
      };

      await expect(store.createWorkout(invalidWorkout)).rejects.toThrow();
      
      const state = useWorkoutStore.getState();
      expect(state.error).toBeTruthy();
    });
  });
});
