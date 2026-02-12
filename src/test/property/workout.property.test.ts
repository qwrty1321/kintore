/**
 * プロパティベーステスト - トレーニング記録
 * 
 * fast-checkを使用して、任意の有効な入力に対して成り立つ
 * 普遍的なプロパティを検証します。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { saveWorkout, getWorkout } from '@/services/db/workoutDB';
import { db } from '@/services/db/schema';
import type { WorkoutRecord, BodyPart, WorkoutSet } from '@/types';

// テスト前にデータベースをクリア
beforeEach(async () => {
  await db.workouts.clear();
});

/**
 * Arbitrary: BodyPart型のランダム生成
 */
const bodyPartArbitrary = fc.constantFrom<BodyPart>(
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
  'other'
);

/**
 * Arbitrary: WorkoutSet型のランダム生成
 */
const workoutSetArbitrary: fc.Arbitrary<WorkoutSet> = fc.record({
  setNumber: fc.integer({ min: 1, max: 10 }),
  weight: fc.float({ min: 0.1, max: 500, noNaN: true }),
  reps: fc.integer({ min: 1, max: 100 }),
  completed: fc.boolean(),
  rm1: fc.option(fc.float({ min: 0.1, max: 600, noNaN: true }), { nil: undefined }),
});

/**
 * Arbitrary: WorkoutRecord型のランダム生成
 */
const workoutRecordArbitrary: fc.Arbitrary<WorkoutRecord> = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  bodyPart: bodyPartArbitrary,
  exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
  sets: fc.array(workoutSetArbitrary, { minLength: 1, maxLength: 10 }),
  images: fc.option(fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }), { nil: undefined }),
  notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  syncStatus: fc.constantFrom('synced', 'pending', 'failed'),
});

describe('Feature: workout-tracker, Property 1: トレーニング記録のラウンドトリップ', () => {
  it('**検証: 要件 1.2** - 任意の有効なトレーニング記録について、IndexedDBに保存してから取得した場合、元の記録と同等のデータが得られる', async () => {
    await fc.assert(
      fc.asyncProperty(
        workoutRecordArbitrary,
        async (workout: WorkoutRecord) => {
          // 保存
          const savedId = await saveWorkout(workout);
          
          // 保存されたIDが元のIDと一致することを確認
          expect(savedId).toBe(workout.id);
          
          // 取得
          const retrieved = await getWorkout(workout.id);
          
          // 取得できたことを確認
          expect(retrieved).toBeDefined();
          
          if (retrieved) {
            // すべてのフィールドが一致することを確認
            expect(retrieved.id).toBe(workout.id);
            expect(retrieved.userId).toBe(workout.userId);
            
            // 日付は同じタイムスタンプであることを確認
            expect(retrieved.date.getTime()).toBe(workout.date.getTime());
            expect(retrieved.createdAt.getTime()).toBe(workout.createdAt.getTime());
            expect(retrieved.updatedAt.getTime()).toBe(workout.updatedAt.getTime());
            
            expect(retrieved.bodyPart).toBe(workout.bodyPart);
            expect(retrieved.exerciseName).toBe(workout.exerciseName);
            expect(retrieved.syncStatus).toBe(workout.syncStatus);
            
            // オプショナルフィールド
            expect(retrieved.notes).toBe(workout.notes);
            expect(retrieved.images).toEqual(workout.images);
            
            // セット情報の検証
            expect(retrieved.sets).toHaveLength(workout.sets.length);
            retrieved.sets.forEach((set, index) => {
              expect(set.setNumber).toBe(workout.sets[index].setNumber);
              expect(set.weight).toBe(workout.sets[index].weight);
              expect(set.reps).toBe(workout.sets[index].reps);
              expect(set.completed).toBe(workout.sets[index].completed);
              expect(set.rm1).toBe(workout.sets[index].rm1);
            });
          }
        }
      ),
      { numRuns: 100 } // 最低100回の反復で検証
    );
  });
});
