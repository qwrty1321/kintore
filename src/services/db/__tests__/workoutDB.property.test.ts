/**
 * トレーニング記録データベースのプロパティベーステスト
 * Feature: workout-tracker
 */

import { describe, it, beforeEach, expect } from 'vitest';
import fc from 'fast-check';
import { saveWorkout, getWorkout } from '../workoutDB';
import { db } from '../schema';
import type { WorkoutRecord, BodyPart } from '@/types';

// テスト前にデータベースをクリア
beforeEach(async () => {
  await db.workouts.clear();
});

/**
 * Property 1: トレーニング記録のラウンドトリップ
 * **検証: 要件 1.2**
 * 
 * 任意の有効なトレーニング記録について、IndexedDBに保存してから取得した場合、
 * 元の記録と同等のデータが得られる
 */
describe('Feature: workout-tracker, Property 1: トレーニング記録のラウンドトリップ', () => {
  it('任意の有効なトレーニング記録について、保存してから取得した場合、元の記録と同等のデータが得られる', async () => {
    await fc.assert(
      fc.asyncProperty(
        // ランダムなトレーニング記録を生成
        fc.record({
          id: fc.uuid(),
          userId: fc.uuid(),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          bodyPart: fc.constantFrom<BodyPart>(
            'chest',
            'back',
            'shoulders',
            'arms',
            'legs',
            'core',
            'other'
          ),
          exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
          sets: fc.array(
            fc.record({
              setNumber: fc.integer({ min: 1, max: 10 }),
              weight: fc.float({ min: 0.1, max: 500, noNaN: true }),
              reps: fc.integer({ min: 1, max: 100 }),
              completed: fc.boolean(),
              rm1: fc.option(fc.float({ min: 0.1, max: 1000, noNaN: true }), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          images: fc.option(
            fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
            { nil: undefined }
          ),
          notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
          createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          syncStatus: fc.constantFrom<'synced' | 'pending' | 'failed'>(
            'synced',
            'pending',
            'failed'
          ),
        }),
        async (workout: WorkoutRecord) => {
          // 保存
          await saveWorkout(workout);

          // 取得
          const retrieved = await getWorkout(workout.id);

          // 検証: 取得したデータが元のデータと同等であること
          expect(retrieved).toBeDefined();
          expect(retrieved?.id).toBe(workout.id);
          expect(retrieved?.userId).toBe(workout.userId);
          expect(retrieved?.date.getTime()).toBe(workout.date.getTime());
          expect(retrieved?.bodyPart).toBe(workout.bodyPart);
          expect(retrieved?.exerciseName).toBe(workout.exerciseName);
          expect(retrieved?.sets).toEqual(workout.sets);
          expect(retrieved?.images).toEqual(workout.images);
          expect(retrieved?.notes).toBe(workout.notes);
          expect(retrieved?.createdAt.getTime()).toBe(workout.createdAt.getTime());
          expect(retrieved?.updatedAt.getTime()).toBe(workout.updatedAt.getTime());
          expect(retrieved?.syncStatus).toBe(workout.syncStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});
