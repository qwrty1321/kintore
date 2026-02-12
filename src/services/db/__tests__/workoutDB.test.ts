/**
 * トレーニング記録データベース操作のテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../schema';
import {
  saveWorkout,
  getWorkout,
  getAllWorkouts,
  getFilteredWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutsBySyncStatus,
} from '../workoutDB';
import type { WorkoutRecord } from '@/types';

describe('workoutDB', () => {
  beforeEach(async () => {
    await db.workouts.clear();
  });

  const createTestWorkout = (id: string): WorkoutRecord => ({
    id,
    userId: 'user-1',
    date: new Date('2024-01-15'),
    bodyPart: 'chest',
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: 60, reps: 8, completed: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    syncStatus: 'pending',
  });

  describe('saveWorkout', () => {
    it('トレーニング記録を保存できる', async () => {
      const workout = createTestWorkout('workout-1');
      const id = await saveWorkout(workout);
      
      expect(id).toBe('workout-1');
      
      const retrieved = await getWorkout(id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.exerciseName).toBe('ベンチプレス');
    });
  });

  describe('getWorkout', () => {
    it('IDでトレーニング記録を取得できる', async () => {
      const workout = createTestWorkout('workout-1');
      await saveWorkout(workout);
      
      const retrieved = await getWorkout('workout-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('workout-1');
    });

    it('存在しないIDの場合はundefinedを返す', async () => {
      const retrieved = await getWorkout('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllWorkouts', () => {
    it('すべてのトレーニング記録を取得できる', async () => {
      await saveWorkout(createTestWorkout('workout-1'));
      await saveWorkout(createTestWorkout('workout-2'));
      
      const workouts = await getAllWorkouts();
      expect(workouts).toHaveLength(2);
    });

    it('記録がない場合は空配列を返す', async () => {
      const workouts = await getAllWorkouts();
      expect(workouts).toEqual([]);
    });
  });

  describe('getFilteredWorkouts', () => {
    beforeEach(async () => {
      await saveWorkout({
        ...createTestWorkout('workout-1'),
        bodyPart: 'chest',
        exerciseName: 'ベンチプレス',
        date: new Date('2024-01-15'),
      });
      await saveWorkout({
        ...createTestWorkout('workout-2'),
        bodyPart: 'back',
        exerciseName: 'デッドリフト',
        date: new Date('2024-01-20'),
      });
      await saveWorkout({
        ...createTestWorkout('workout-3'),
        bodyPart: 'chest',
        exerciseName: 'ダンベルフライ',
        date: new Date('2024-01-25'),
      });
    });

    it('部位でフィルタリングできる', async () => {
      const workouts = await getFilteredWorkouts({ bodyPart: 'chest' });
      expect(workouts).toHaveLength(2);
      expect(workouts.every(w => w.bodyPart === 'chest')).toBe(true);
    });

    it('トレーニング方法でフィルタリングできる', async () => {
      const workouts = await getFilteredWorkouts({ exerciseName: 'ベンチプレス' });
      expect(workouts).toHaveLength(1);
      expect(workouts[0].exerciseName).toBe('ベンチプレス');
    });

    it('日付範囲でフィルタリングできる', async () => {
      const workouts = await getFilteredWorkouts({
        dateRange: {
          start: new Date('2024-01-18'),
          end: new Date('2024-01-31'),
        },
      });
      expect(workouts).toHaveLength(2);
    });

    it('複数の条件でフィルタリングできる', async () => {
      const workouts = await getFilteredWorkouts({
        bodyPart: 'chest',
        dateRange: {
          start: new Date('2024-01-20'),
          end: new Date('2024-01-31'),
        },
      });
      expect(workouts).toHaveLength(1);
      expect(workouts[0].exerciseName).toBe('ダンベルフライ');
    });
  });

  describe('updateWorkout', () => {
    it('トレーニング記録を更新できる', async () => {
      const workout = createTestWorkout('workout-1');
      await saveWorkout(workout);
      
      await updateWorkout('workout-1', {
        exerciseName: '更新されたベンチプレス',
      });
      
      const updated = await getWorkout('workout-1');
      expect(updated?.exerciseName).toBe('更新されたベンチプレス');
    });
  });

  describe('deleteWorkout', () => {
    it('トレーニング記録を削除できる', async () => {
      const workout = createTestWorkout('workout-1');
      await saveWorkout(workout);
      
      await deleteWorkout('workout-1');
      
      const retrieved = await getWorkout('workout-1');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getWorkoutsBySyncStatus', () => {
    beforeEach(async () => {
      await saveWorkout({
        ...createTestWorkout('workout-1'),
        syncStatus: 'pending',
      });
      await saveWorkout({
        ...createTestWorkout('workout-2'),
        syncStatus: 'synced',
      });
      await saveWorkout({
        ...createTestWorkout('workout-3'),
        syncStatus: 'pending',
      });
    });

    it('同期ステータスでフィルタリングできる', async () => {
      const pendingWorkouts = await getWorkoutsBySyncStatus('pending');
      expect(pendingWorkouts).toHaveLength(2);
      expect(pendingWorkouts.every(w => w.syncStatus === 'pending')).toBe(true);
    });
  });
});
