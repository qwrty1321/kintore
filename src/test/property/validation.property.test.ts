/**
 * プロパティベーステスト - バリデーション
 * 
 * fast-checkを使用して、任意の有効な入力に対して成り立つ
 * 普遍的なプロパティを検証します。
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  validateWorkoutRecord, 
  validateBodyProfile,
  VALIDATION_CONSTRAINTS 
} from '@/utils/validation';
import type { WorkoutRecord, BodyProfile, BodyPart } from '@/types';

const { PROFILE_CONSTRAINTS, BODY_PARTS } = VALIDATION_CONSTRAINTS;

/**
 * Arbitrary: 無効なトレーニングデータの生成
 */
const invalidWorkoutDataArbitrary = fc.oneof(
  // 負の重量
  fc.record({
    date: fc.date(),
    bodyPart: fc.constantFrom<BodyPart>(...BODY_PARTS),
    exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
    sets: fc.array(
      fc.record({
        setNumber: fc.integer({ min: 1, max: 10 }),
        weight: fc.float({ min: -1000, max: -0.1 }), // 負の重量
        reps: fc.integer({ min: 1, max: 30 }),
        completed: fc.boolean(),
      }),
      { minLength: 1, maxLength: 5 }
    ),
  }),
  // 0以下の回数
  fc.record({
    date: fc.date(),
    bodyPart: fc.constantFrom<BodyPart>(...BODY_PARTS),
    exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
    sets: fc.array(
      fc.record({
        setNumber: fc.integer({ min: 1, max: 10 }),
        weight: fc.float({ min: 0, max: 500 }),
        reps: fc.integer({ min: -100, max: 0 }), // 0以下の回数
        completed: fc.boolean(),
      }),
      { minLength: 1, maxLength: 5 }
    ),
  }),
  // 空のトレーニング方法
  fc.record({
    date: fc.date(),
    bodyPart: fc.constantFrom<BodyPart>(...BODY_PARTS),
    exerciseName: fc.constant(''), // 空の文字列
    sets: fc.array(
      fc.record({
        setNumber: fc.integer({ min: 1, max: 10 }),
        weight: fc.float({ min: 0, max: 500 }),
        reps: fc.integer({ min: 1, max: 30 }),
        completed: fc.boolean(),
      }),
      { minLength: 1, maxLength: 5 }
    ),
  }),
  // セットが空
  fc.record({
    date: fc.date(),
    bodyPart: fc.constantFrom<BodyPart>(...BODY_PARTS),
    exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
    sets: fc.constant([]), // 空の配列
  })
);

/**
 * Arbitrary: 無効なプロファイルデータの生成
 */
const invalidProfileDataArbitrary = fc.oneof(
  // 身長が範囲外（小さすぎる）
  fc.record({
    userId: fc.uuid(),
    height: fc.float({ min: 0, max: PROFILE_CONSTRAINTS.height.min - 1 }),
    weight: fc.float({ min: PROFILE_CONSTRAINTS.weight.min, max: PROFILE_CONSTRAINTS.weight.max }),
    weeklyFrequency: fc.integer({ min: PROFILE_CONSTRAINTS.weeklyFrequency.min, max: PROFILE_CONSTRAINTS.weeklyFrequency.max }),
    updatedAt: fc.date(),
  }),
  // 身長が範囲外（大きすぎる）
  fc.record({
    userId: fc.uuid(),
    height: fc.float({ min: PROFILE_CONSTRAINTS.height.max + 1, max: 500 }),
    weight: fc.float({ min: PROFILE_CONSTRAINTS.weight.min, max: PROFILE_CONSTRAINTS.weight.max }),
    weeklyFrequency: fc.integer({ min: PROFILE_CONSTRAINTS.weeklyFrequency.min, max: PROFILE_CONSTRAINTS.weeklyFrequency.max }),
    updatedAt: fc.date(),
  }),
  // 体重が範囲外（小さすぎる）
  fc.record({
    userId: fc.uuid(),
    height: fc.float({ min: PROFILE_CONSTRAINTS.height.min, max: PROFILE_CONSTRAINTS.height.max }),
    weight: fc.float({ min: 0, max: PROFILE_CONSTRAINTS.weight.min - 1 }),
    weeklyFrequency: fc.integer({ min: PROFILE_CONSTRAINTS.weeklyFrequency.min, max: PROFILE_CONSTRAINTS.weeklyFrequency.max }),
    updatedAt: fc.date(),
  }),
  // 体重が範囲外（大きすぎる）
  fc.record({
    userId: fc.uuid(),
    height: fc.float({ min: PROFILE_CONSTRAINTS.height.min, max: PROFILE_CONSTRAINTS.height.max }),
    weight: fc.float({ min: PROFILE_CONSTRAINTS.weight.max + 1, max: 1000 }),
    weeklyFrequency: fc.integer({ min: PROFILE_CONSTRAINTS.weeklyFrequency.min, max: PROFILE_CONSTRAINTS.weeklyFrequency.max }),
    updatedAt: fc.date(),
  }),
  // 週頻度が範囲外（負の数）
  fc.record({
    userId: fc.uuid(),
    height: fc.float({ min: PROFILE_CONSTRAINTS.height.min, max: PROFILE_CONSTRAINTS.height.max }),
    weight: fc.float({ min: PROFILE_CONSTRAINTS.weight.min, max: PROFILE_CONSTRAINTS.weight.max }),
    weeklyFrequency: fc.integer({ min: -10, max: -1 }),
    updatedAt: fc.date(),
  }),
  // 週頻度が範囲外（大きすぎる）
  fc.record({
    userId: fc.uuid(),
    height: fc.float({ min: PROFILE_CONSTRAINTS.height.min, max: PROFILE_CONSTRAINTS.height.max }),
    weight: fc.float({ min: PROFILE_CONSTRAINTS.weight.min, max: PROFILE_CONSTRAINTS.weight.max }),
    weeklyFrequency: fc.integer({ min: PROFILE_CONSTRAINTS.weeklyFrequency.max + 1, max: 100 }),
    updatedAt: fc.date(),
  })
);

describe('Feature: workout-tracker, Property 2: 無効な入力の拒否', () => {
  it('**検証: 要件 1.3** - 任意の無効なトレーニングデータについて、バリデーション関数はエラーを返し、保存を拒否する', async () => {
    await fc.assert(
      fc.property(
        invalidWorkoutDataArbitrary,
        (invalidData: Partial<WorkoutRecord>) => {
          // バリデーションを実行
          const result = validateWorkoutRecord(invalidData);
          
          // バリデーションが失敗することを確認
          expect(result.valid).toBe(false);
          
          // エラーメッセージが存在することを確認
          expect(result.errors.length).toBeGreaterThan(0);
          
          // 各エラーにfieldとmessageが含まれることを確認
          result.errors.forEach(error => {
            expect(error).toHaveProperty('field');
            expect(error).toHaveProperty('message');
            expect(typeof error.field).toBe('string');
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 21: プロファイル入力の妥当性検証', () => {
  it('**検証: 要件 5.3** - 任意の無効なプロファイル値について、バリデーション関数はエラーを返す', async () => {
    await fc.assert(
      fc.property(
        invalidProfileDataArbitrary,
        (invalidProfile: Partial<BodyProfile>) => {
          // バリデーションを実行
          const result = validateBodyProfile(invalidProfile);
          
          // バリデーションが失敗することを確認
          expect(result.valid).toBe(false);
          
          // エラーメッセージが存在することを確認
          expect(result.errors.length).toBeGreaterThan(0);
          
          // 各エラーにfieldとmessageが含まれることを確認
          result.errors.forEach(error => {
            expect(error).toHaveProperty('field');
            expect(error).toHaveProperty('message');
            expect(typeof error.field).toBe('string');
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
