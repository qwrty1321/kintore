/**
 * バリデーション関数のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  validateWorkoutRecord,
  validateWorkoutSet,
  validateBodyProfile,
  isInRange,
  isNonEmptyString,
  VALIDATION_CONSTRAINTS
} from './validation';
import type { WorkoutRecord, WorkoutSet, BodyProfile } from '../types';

describe('validateWorkoutSet', () => {
  it('有効なセットデータを受け入れる', () => {
    const validSet: WorkoutSet = {
      setNumber: 1,
      weight: 50,
      reps: 10,
      completed: true
    };

    const result = validateWorkoutSet(validSet);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('重量が負の場合にエラーを返す', () => {
    const invalidSet: Partial<WorkoutSet> = {
      setNumber: 1,
      weight: -10,
      reps: 10,
      completed: false
    };

    const result = validateWorkoutSet(invalidSet);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weight')).toBe(true);
  });

  it('回数が0以下の場合にエラーを返す', () => {
    const invalidSet: Partial<WorkoutSet> = {
      setNumber: 1,
      weight: 50,
      reps: 0,
      completed: false
    };

    const result = validateWorkoutSet(invalidSet);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'reps')).toBe(true);
  });

  it('回数が整数でない場合にエラーを返す', () => {
    const invalidSet: Partial<WorkoutSet> = {
      setNumber: 1,
      weight: 50,
      reps: 10.5,
      completed: false
    };

    const result = validateWorkoutSet(invalidSet);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'reps' && e.message.includes('整数'))).toBe(true);
  });

  it('必須フィールドが欠けている場合にエラーを返す', () => {
    const invalidSet: Partial<WorkoutSet> = {
      setNumber: 1
    };

    const result = validateWorkoutSet(invalidSet);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('重量0（自重トレーニング）を受け入れる', () => {
    const validSet: WorkoutSet = {
      setNumber: 1,
      weight: 0,
      reps: 15,
      completed: true
    };

    const result = validateWorkoutSet(validSet);
    expect(result.valid).toBe(true);
  });

  it('極端に大きい重量を拒否する', () => {
    const invalidSet: Partial<WorkoutSet> = {
      setNumber: 1,
      weight: 1001,
      reps: 10,
      completed: false
    };

    const result = validateWorkoutSet(invalidSet);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weight')).toBe(true);
  });
});

describe('validateWorkoutRecord', () => {
  const createValidRecord = (): Partial<WorkoutRecord> => ({
    date: new Date(),
    bodyPart: 'chest',
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: 60, reps: 8, completed: true }
    ]
  });

  it('有効なトレーニング記録を受け入れる', () => {
    const validRecord = createValidRecord();
    const result = validateWorkoutRecord(validRecord);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('日付が欠けている場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    delete invalidRecord.date;

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'date')).toBe(true);
  });

  it('部位が欠けている場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    delete invalidRecord.bodyPart;

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'bodyPart')).toBe(true);
  });

  it('トレーニング方法が空の場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    invalidRecord.exerciseName = '';

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'exerciseName')).toBe(true);
  });

  it('トレーニング方法が空白のみの場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    invalidRecord.exerciseName = '   ';

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'exerciseName')).toBe(true);
  });

  it('セットが空の場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    invalidRecord.sets = [];

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'sets')).toBe(true);
  });

  it('無効なセットが含まれる場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    invalidRecord.sets = [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: -10, reps: 8, completed: true } // 無効な重量
    ];

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field.includes('sets[1]'))).toBe(true);
  });

  it('無効な部位を拒否する', () => {
    const invalidRecord = createValidRecord();
    // @ts-expect-error - テストのため無効な値を設定
    invalidRecord.bodyPart = 'invalid_part';

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'bodyPart')).toBe(true);
  });

  it('トレーニング方法が長すぎる場合にエラーを返す', () => {
    const invalidRecord = createValidRecord();
    invalidRecord.exerciseName = 'a'.repeat(101);

    const result = validateWorkoutRecord(invalidRecord);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'exerciseName')).toBe(true);
  });
});

describe('validateBodyProfile', () => {
  const createValidProfile = (): Partial<BodyProfile> => ({
    height: 170,
    weight: 70,
    weeklyFrequency: 3
  });

  it('有効なプロファイルを受け入れる', () => {
    const validProfile = createValidProfile();
    const result = validateBodyProfile(validProfile);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('身長が範囲外（小さすぎる）の場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.height = 99;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'height')).toBe(true);
    expect(result.errors.some(e => e.message.includes('100cm'))).toBe(true);
  });

  it('身長が範囲外（大きすぎる）の場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.height = 251;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'height')).toBe(true);
    expect(result.errors.some(e => e.message.includes('250cm'))).toBe(true);
  });

  it('体重が範囲外（小さすぎる）の場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.weight = 29;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weight')).toBe(true);
    expect(result.errors.some(e => e.message.includes('30kg'))).toBe(true);
  });

  it('体重が範囲外（大きすぎる）の場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.weight = 301;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weight')).toBe(true);
    expect(result.errors.some(e => e.message.includes('300kg'))).toBe(true);
  });

  it('週頻度が負の場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.weeklyFrequency = -1;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weeklyFrequency')).toBe(true);
  });

  it('週頻度が範囲外（大きすぎる）の場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.weeklyFrequency = 15;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weeklyFrequency')).toBe(true);
    expect(result.errors.some(e => e.message.includes('14回'))).toBe(true);
  });

  it('週頻度が整数でない場合にエラーを返す', () => {
    const invalidProfile = createValidProfile();
    invalidProfile.weeklyFrequency = 3.5;

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'weeklyFrequency' && e.message.includes('整数'))).toBe(true);
  });

  it('必須フィールドが欠けている場合にエラーを返す', () => {
    const invalidProfile: Partial<BodyProfile> = {};

    const result = validateBodyProfile(invalidProfile);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(3); // height, weight, weeklyFrequency
  });

  it('境界値（最小値）を受け入れる', () => {
    const boundaryProfile: Partial<BodyProfile> = {
      height: 100,
      weight: 30,
      weeklyFrequency: 0
    };

    const result = validateBodyProfile(boundaryProfile);
    expect(result.valid).toBe(true);
  });

  it('境界値（最大値）を受け入れる', () => {
    const boundaryProfile: Partial<BodyProfile> = {
      height: 250,
      weight: 300,
      weeklyFrequency: 14
    };

    const result = validateBodyProfile(boundaryProfile);
    expect(result.valid).toBe(true);
  });
});

describe('ヘルパー関数', () => {
  describe('isInRange', () => {
    it('範囲内の値に対してtrueを返す', () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true);
      expect(isInRange(10, 0, 10)).toBe(true);
    });

    it('範囲外の値に対してfalseを返す', () => {
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(11, 0, 10)).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('空でない文字列に対してtrueを返す', () => {
      expect(isNonEmptyString('test')).toBe(true);
      expect(isNonEmptyString('  test  ')).toBe(true);
    });

    it('空文字列に対してfalseを返す', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
    });

    it('undefined/nullに対してfalseを返す', () => {
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
    });
  });
});
