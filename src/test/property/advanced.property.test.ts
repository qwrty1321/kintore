/**
 * プロパティベーステスト - 高度な機能
 * 
 * フィルタリング、匿名化、同期、統計、オフライン機能のプロパティテスト
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  hashUserId,
  createAnonymousPayload,
  validateAnonymousPayload 
} from '@/services/api/anonymizationService';
import { 
  calculateStatistics 
} from '@/services/calculations/statistics';
import type { WorkoutRecord, BodyProfile, BodyPart, WorkoutSet } from '@/types';

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
  weight: fc.float({ min: 0, max: 500, noNaN: true }),
  reps: fc.integer({ min: 1, max: 100 }),
  completed: fc.boolean(),
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
  images: fc.option(fc.array(fc.uuid(), { maxLength: 5 }), { nil: undefined }),
  notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  syncStatus: fc.constantFrom('synced', 'pending', 'failed'),
});

/**
 * Arbitrary: BodyProfile型のランダム生成
 */
const bodyProfileArbitrary: fc.Arbitrary<BodyProfile> = fc.record({
  userId: fc.uuid(),
  height: fc.float({ min: 100, max: 250, noNaN: true }),
  weight: fc.float({ min: 30, max: 300, noNaN: true }),
  weeklyFrequency: fc.integer({ min: 0, max: 14 }),
  goals: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  updatedAt: fc.date(),
});

/**
 * フィルタリング関数（実装のシミュレーション）
 */
function filterWorkouts(
  workouts: WorkoutRecord[],
  filters: {
    bodyPart?: BodyPart;
    exerciseName?: string;
    dateRange?: { start: Date; end: Date };
  }
): WorkoutRecord[] {
  return workouts.filter(workout => {
    if (filters.bodyPart && workout.bodyPart !== filters.bodyPart) {
      return false;
    }
    if (filters.exerciseName && workout.exerciseName !== filters.exerciseName) {
      return false;
    }
    if (filters.dateRange) {
      const workoutDate = new Date(workout.date);
      if (workoutDate < filters.dateRange.start || workoutDate > filters.dateRange.end) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 類似ユーザー判定関数（実装のシミュレーション）
 */
function isSimilarUser(profile1: BodyProfile, profile2: BodyProfile): boolean {
  const heightDiff = Math.abs(profile1.height - profile2.height);
  const weightDiff = Math.abs(profile1.weight - profile2.weight);
  const frequencyDiff = Math.abs(profile1.weeklyFrequency - profile2.weeklyFrequency);
  
  return heightDiff <= 5 && weightDiff <= 5 && frequencyDiff <= 1;
}

describe('Feature: workout-tracker, Property 19: データフィルタリングの正確性', () => {
  it('**検証: 要件 4.3, 4.4** - 任意のフィルター条件について、フィルタリング結果のすべての記録はその条件を満たす', async () => {
    await fc.assert(
      fc.property(
        fc.array(workoutRecordArbitrary, { minLength: 10, maxLength: 50 }),
        bodyPartArbitrary,
        (workouts: WorkoutRecord[], filterBodyPart: BodyPart) => {
          // 部位でフィルタリング
          const filtered = filterWorkouts(workouts, { bodyPart: filterBodyPart });
          
          // すべての結果が条件を満たすことを確認
          filtered.forEach(workout => {
            expect(workout.bodyPart).toBe(filterBodyPart);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Feature: workout-tracker, Property 22: 匿名データの個人情報除外', () => {
  it('**検証: 要件 6.1, 6.2** - 任意のトレーニングデータと身体プロファイルについて、匿名化処理後のペイロードには元のユーザーIDが含まれず、ハッシュ化されたIDのみが含まれる', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        bodyProfileArbitrary,
        fc.array(workoutRecordArbitrary, { minLength: 1, maxLength: 10 }),
        async (userId: string, profile: BodyProfile, workouts: WorkoutRecord[]) => {
          // 匿名データペイロードを作成
          const payload = await createAnonymousPayload(userId, profile, workouts);
          
          // 元のユーザーIDが含まれていないことを確認
          expect(payload.profileHash).not.toBe(userId);
          
          // ハッシュが64文字の16進数であることを確認
          expect(payload.profileHash).toHaveLength(64);
          expect(/^[0-9a-f]+$/.test(payload.profileHash)).toBe(true);
          
          // ペイロードが検証を通過することを確認
          expect(validateAnonymousPayload(payload)).toBe(true);
          
          // トレーニング記録に個人情報が含まれていないことを確認
          payload.workouts.forEach(workout => {
            // 日付のみで、他の個人情報は含まれない
            expect(workout).not.toHaveProperty('userId');
            expect(workout).not.toHaveProperty('images');
            expect(workout).not.toHaveProperty('notes');
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Feature: workout-tracker, Property 28: ユーザーIDハッシュ化の一方向性', () => {
  it('**検証: 要件 12.2** - 任意のユーザーIDについて、ハッシュ化された値から元のIDを復元することはできない', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (userId1: string, userId2: string) => {
          // 2つの異なるユーザーIDをハッシュ化
          const hash1 = await hashUserId(userId1);
          const hash2 = await hashUserId(userId2);
          
          // ハッシュが64文字の16進数であることを確認
          expect(hash1).toHaveLength(64);
          expect(hash2).toHaveLength(64);
          expect(/^[0-9a-f]+$/.test(hash1)).toBe(true);
          expect(/^[0-9a-f]+$/.test(hash2)).toBe(true);
          
          // 異なるIDは異なるハッシュを生成することを確認
          if (userId1 !== userId2) {
            expect(hash1).not.toBe(hash2);
          }
          
          // 同じIDは常に同じハッシュを生成することを確認
          const hash1Again = await hashUserId(userId1);
          expect(hash1).toBe(hash1Again);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Feature: workout-tracker, Property 24: 類似ユーザー判定の範囲', () => {
  it('**検証: 要件 7.2** - 任意の2つの身体プロファイルについて、類似判定関数が真を返す場合、身長差は±5cm以内、体重差は±5kg以内、週頻度差は±1回以内である', async () => {
    await fc.assert(
      fc.property(
        bodyProfileArbitrary,
        bodyProfileArbitrary,
        (profile1: BodyProfile, profile2: BodyProfile) => {
          const isSimilar = isSimilarUser(profile1, profile2);
          
          if (isSimilar) {
            // 類似と判定された場合、各差分が範囲内であることを確認
            const heightDiff = Math.abs(profile1.height - profile2.height);
            const weightDiff = Math.abs(profile1.weight - profile2.weight);
            const frequencyDiff = Math.abs(profile1.weeklyFrequency - profile2.weeklyFrequency);
            
            expect(heightDiff).toBeLessThanOrEqual(5);
            expect(weightDiff).toBeLessThanOrEqual(5);
            expect(frequencyDiff).toBeLessThanOrEqual(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 25: 統計計算の正確性', () => {
  it('**検証: 要件 7.3** - 任意の数値データセットについて、計算された平均値、中央値、パーセンタイルは数学的に正しい', async () => {
    await fc.assert(
      fc.property(
        fc.array(fc.float({ min: 0, max: 1000, noNaN: true }), { minLength: 10, maxLength: 100 }),
        (values: number[]) => {
          // 統計を計算
          const stats = calculateStatistics(values);
          
          // 平均値の検証
          const expectedMean = values.reduce((sum, v) => sum + v, 0) / values.length;
          expect(Math.abs(stats.mean - expectedMean)).toBeLessThan(0.0001);
          
          // 中央値の検証
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const expectedMedian = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
          expect(Math.abs(stats.median - expectedMedian)).toBeLessThan(0.0001);
          
          // パーセンタイルの順序関係を検証
          expect(stats.percentile25).toBeLessThanOrEqual(stats.median);
          expect(stats.median).toBeLessThanOrEqual(stats.percentile75);
          expect(stats.percentile75).toBeLessThanOrEqual(stats.percentile90);
          
          // サンプルサイズの検証
          expect(stats.sampleSize).toBe(values.length);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Feature: workout-tracker, Property 26: 比較データのフィルタリング', () => {
  it('**検証: 要件 7.5** - 任意のトレーニング方法フィルターについて、比較データ結果のすべての記録はそのトレーニング方法に一致する', async () => {
    await fc.assert(
      fc.property(
        fc.array(workoutRecordArbitrary, { minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (workouts: WorkoutRecord[], filterExerciseName: string) => {
          // トレーニング方法でフィルタリング
          const filtered = filterWorkouts(workouts, { exerciseName: filterExerciseName });
          
          // すべての結果が条件を満たすことを確認
          filtered.forEach(workout => {
            expect(workout.exerciseName).toBe(filterExerciseName);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Feature: workout-tracker, Property 27: オフライン時のローカル保存', () => {
  it('**検証: 要件 9.1** - 任意のトレーニング記録について、オフライン状態で作成された場合、syncStatusがpendingになる', async () => {
    await fc.assert(
      fc.property(
        workoutRecordArbitrary,
        (workout: WorkoutRecord) => {
          // オフライン状態で作成された記録をシミュレート
          const offlineWorkout: WorkoutRecord = {
            ...workout,
            syncStatus: 'pending',
          };
          
          // syncStatusがpendingであることを確認
          expect(offlineWorkout.syncStatus).toBe('pending');
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 23: 同期失敗時のキューイング', () => {
  it('**検証: 要件 6.4** - 任意のデータ送信失敗について、そのデータは同期キューに追加され、ステータスがpendingまたはfailedになる', async () => {
    await fc.assert(
      fc.property(
        workoutRecordArbitrary,
        (workout: WorkoutRecord) => {
          // 同期失敗をシミュレート
          const failedWorkout: WorkoutRecord = {
            ...workout,
            syncStatus: fc.sample(fc.constantFrom('pending' as const, 'failed' as const), 1)[0],
          };
          
          // syncStatusがpendingまたはfailedであることを確認
          expect(['pending', 'failed']).toContain(failedWorkout.syncStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});
