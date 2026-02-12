/**
 * バリデーション関数 - Workout Tracker
 * 
 * 要件1.3: トレーニング記録のバリデーション
 * 要件5.3: プロファイルのバリデーション
 */

import type { 
  WorkoutRecord, 
  WorkoutSet, 
  BodyProfile, 
  Preset,
  PresetSet,
  ValidationResult,
  BodyPart 
} from '../types';

// ============================================
// 定数定義
// ============================================

const BODY_PARTS: BodyPart[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'other'];

// プロファイルの妥当な範囲
const PROFILE_CONSTRAINTS = {
  height: { min: 100, max: 250 },      // cm
  weight: { min: 30, max: 300 },       // kg
  weeklyFrequency: { min: 0, max: 14 } // 回/週
};

// トレーニング記録の妥当な範囲
const WORKOUT_CONSTRAINTS = {
  weight: { min: 0, max: 1000 },       // kg (0は自重トレーニング)
  reps: { min: 1, max: 1000 },         // 回
  sets: { min: 1, max: 100 },          // セット数
  exerciseName: { minLength: 1, maxLength: 100 }
};

// ============================================
// トレーニング記録のバリデーション
// ============================================

/**
 * トレーニング記録全体のバリデーション
 * 要件1.3: 無効なデータ（負の数、空欄など）を入力する場合、エラーメッセージを表示し、保存を拒否する
 */
export function validateWorkoutRecord(record: Partial<WorkoutRecord>): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // 必須フィールドのチェック
  if (!record.date) {
    errors.push({ field: 'date', message: '日付は必須です' });
  }

  if (!record.bodyPart) {
    errors.push({ field: 'bodyPart', message: '部位は必須です' });
  } else if (!BODY_PARTS.includes(record.bodyPart)) {
    errors.push({ field: 'bodyPart', message: '無効な部位が指定されています' });
  }

  if (!record.exerciseName || record.exerciseName.trim() === '') {
    errors.push({ field: 'exerciseName', message: 'トレーニング方法は必須です' });
  } else if (record.exerciseName.length < WORKOUT_CONSTRAINTS.exerciseName.minLength) {
    errors.push({ field: 'exerciseName', message: 'トレーニング方法を入力してください' });
  } else if (record.exerciseName.length > WORKOUT_CONSTRAINTS.exerciseName.maxLength) {
    errors.push({ 
      field: 'exerciseName', 
      message: `トレーニング方法は${WORKOUT_CONSTRAINTS.exerciseName.maxLength}文字以内で入力してください` 
    });
  }

  if (!record.sets || record.sets.length === 0) {
    errors.push({ field: 'sets', message: '少なくとも1セットは必要です' });
  } else {
    // 各セットのバリデーション
    record.sets.forEach((set, index) => {
      const setErrors = validateWorkoutSet(set);
      if (!setErrors.valid) {
        setErrors.errors.forEach(error => {
          errors.push({
            field: `sets[${index}].${error.field}`,
            message: `セット${index + 1}: ${error.message}`
          });
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 個別セットのバリデーション
 */
export function validateWorkoutSet(set: Partial<WorkoutSet>): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // 重量のバリデーション
  if (set.weight === undefined || set.weight === null) {
    errors.push({ field: 'weight', message: '重量は必須です' });
  } else if (set.weight < WORKOUT_CONSTRAINTS.weight.min) {
    errors.push({ field: 'weight', message: '重量は0以上である必要があります' });
  } else if (set.weight > WORKOUT_CONSTRAINTS.weight.max) {
    errors.push({ 
      field: 'weight', 
      message: `重量は${WORKOUT_CONSTRAINTS.weight.max}kg以下である必要があります` 
    });
  }

  // 回数のバリデーション
  if (set.reps === undefined || set.reps === null) {
    errors.push({ field: 'reps', message: '回数は必須です' });
  } else if (set.reps < WORKOUT_CONSTRAINTS.reps.min) {
    errors.push({ field: 'reps', message: '回数は1以上である必要があります' });
  } else if (set.reps > WORKOUT_CONSTRAINTS.reps.max) {
    errors.push({ 
      field: 'reps', 
      message: `回数は${WORKOUT_CONSTRAINTS.reps.max}回以下である必要があります` 
    });
  } else if (!Number.isInteger(set.reps)) {
    errors.push({ field: 'reps', message: '回数は整数である必要があります' });
  }

  // セット番号のバリデーション
  if (set.setNumber === undefined || set.setNumber === null) {
    errors.push({ field: 'setNumber', message: 'セット番号は必須です' });
  } else if (set.setNumber < 1) {
    errors.push({ field: 'setNumber', message: 'セット番号は1以上である必要があります' });
  } else if (!Number.isInteger(set.setNumber)) {
    errors.push({ field: 'setNumber', message: 'セット番号は整数である必要があります' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// プロファイルのバリデーション
// ============================================

/**
 * 身体プロファイルのバリデーション
 * 要件5.3: 無効な値（負の数、極端な値など）を入力する場合、妥当な範囲を示すエラーメッセージを表示する
 */
export function validateBodyProfile(profile: Partial<BodyProfile>): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // 身長のバリデーション
  if (profile.height === undefined || profile.height === null) {
    errors.push({ field: 'height', message: '身長は必須です' });
  } else if (profile.height < PROFILE_CONSTRAINTS.height.min) {
    errors.push({ 
      field: 'height', 
      message: `身長は${PROFILE_CONSTRAINTS.height.min}cm以上である必要があります` 
    });
  } else if (profile.height > PROFILE_CONSTRAINTS.height.max) {
    errors.push({ 
      field: 'height', 
      message: `身長は${PROFILE_CONSTRAINTS.height.max}cm以下である必要があります` 
    });
  }

  // 体重のバリデーション
  if (profile.weight === undefined || profile.weight === null) {
    errors.push({ field: 'weight', message: '体重は必須です' });
  } else if (profile.weight < PROFILE_CONSTRAINTS.weight.min) {
    errors.push({ 
      field: 'weight', 
      message: `体重は${PROFILE_CONSTRAINTS.weight.min}kg以上である必要があります` 
    });
  } else if (profile.weight > PROFILE_CONSTRAINTS.weight.max) {
    errors.push({ 
      field: 'weight', 
      message: `体重は${PROFILE_CONSTRAINTS.weight.max}kg以下である必要があります` 
    });
  }

  // 週頻度のバリデーション
  if (profile.weeklyFrequency === undefined || profile.weeklyFrequency === null) {
    errors.push({ field: 'weeklyFrequency', message: '週あたりのトレーニング頻度は必須です' });
  } else if (profile.weeklyFrequency < PROFILE_CONSTRAINTS.weeklyFrequency.min) {
    errors.push({ 
      field: 'weeklyFrequency', 
      message: `週あたりのトレーニング頻度は${PROFILE_CONSTRAINTS.weeklyFrequency.min}回以上である必要があります` 
    });
  } else if (profile.weeklyFrequency > PROFILE_CONSTRAINTS.weeklyFrequency.max) {
    errors.push({ 
      field: 'weeklyFrequency', 
      message: `週あたりのトレーニング頻度は${PROFILE_CONSTRAINTS.weeklyFrequency.max}回以下である必要があります` 
    });
  } else if (!Number.isInteger(profile.weeklyFrequency)) {
    errors.push({ field: 'weeklyFrequency', message: '週あたりのトレーニング頻度は整数である必要があります' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// ヘルパー関数
// ============================================

/**
 * プリセットのバリデーション
 * 要件2.1、2.3: プリセットの作成・編集時のバリデーション
 */
export function validatePreset(preset: Partial<Preset>): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // プリセット名のバリデーション
  if (!preset.name || preset.name.trim() === '') {
    errors.push({ field: 'name', message: 'プリセット名は必須です' });
  } else if (preset.name.length > 50) {
    errors.push({ field: 'name', message: 'プリセット名は50文字以内で入力してください' });
  }

  // 部位のバリデーション
  if (!preset.bodyPart) {
    errors.push({ field: 'bodyPart', message: '部位は必須です' });
  } else if (!BODY_PARTS.includes(preset.bodyPart)) {
    errors.push({ field: 'bodyPart', message: '無効な部位が指定されています' });
  }

  // トレーニング方法のバリデーション
  if (!preset.exerciseName || preset.exerciseName.trim() === '') {
    errors.push({ field: 'exerciseName', message: 'トレーニング方法は必須です' });
  } else if (preset.exerciseName.length > WORKOUT_CONSTRAINTS.exerciseName.maxLength) {
    errors.push({ 
      field: 'exerciseName', 
      message: `トレーニング方法は${WORKOUT_CONSTRAINTS.exerciseName.maxLength}文字以内で入力してください` 
    });
  }

  // セット情報のバリデーション
  if (!preset.sets || preset.sets.length === 0) {
    errors.push({ field: 'sets', message: '少なくとも1セットは必要です' });
  } else {
    preset.sets.forEach((set, index) => {
      const setErrors = validatePresetSet(set);
      if (!setErrors.valid) {
        setErrors.errors.forEach(error => {
          errors.push({
            field: `sets[${index}].${error.field}`,
            message: `セット${index + 1}: ${error.message}`
          });
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * プリセットセットのバリデーション
 */
export function validatePresetSet(set: Partial<PresetSet>): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // 重量のバリデーション
  if (set.weight === undefined || set.weight === null) {
    errors.push({ field: 'weight', message: '重量は必須です' });
  } else if (set.weight < WORKOUT_CONSTRAINTS.weight.min) {
    errors.push({ field: 'weight', message: '重量は0以上である必要があります' });
  } else if (set.weight > WORKOUT_CONSTRAINTS.weight.max) {
    errors.push({ 
      field: 'weight', 
      message: `重量は${WORKOUT_CONSTRAINTS.weight.max}kg以下である必要があります` 
    });
  }

  // 回数のバリデーション
  if (set.reps === undefined || set.reps === null) {
    errors.push({ field: 'reps', message: '回数は必須です' });
  } else if (set.reps < WORKOUT_CONSTRAINTS.reps.min) {
    errors.push({ field: 'reps', message: '回数は1以上である必要があります' });
  } else if (set.reps > WORKOUT_CONSTRAINTS.reps.max) {
    errors.push({ 
      field: 'reps', 
      message: `回数は${WORKOUT_CONSTRAINTS.reps.max}回以下である必要があります` 
    });
  } else if (!Number.isInteger(set.reps)) {
    errors.push({ field: 'reps', message: '回数は整数である必要があります' });
  }

  // セット番号のバリデーション
  if (set.setNumber === undefined || set.setNumber === null) {
    errors.push({ field: 'setNumber', message: 'セット番号は必須です' });
  } else if (set.setNumber < 1) {
    errors.push({ field: 'setNumber', message: 'セット番号は1以上である必要があります' });
  } else if (!Number.isInteger(set.setNumber)) {
    errors.push({ field: 'setNumber', message: 'セット番号は整数である必要があります' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 数値が有効な範囲内かチェック
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 文字列が空でないかチェック
 */
export function isNonEmptyString(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * バリデーション制約をエクスポート（テスト用）
 */
export const VALIDATION_CONSTRAINTS = {
  PROFILE_CONSTRAINTS,
  WORKOUT_CONSTRAINTS,
  BODY_PARTS
};
