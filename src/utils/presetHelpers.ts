/**
 * プリセット関連のヘルパー関数
 * 
 * **検証: 要件 2.2**
 */

import type { Preset, WorkoutRecord, WorkoutSet } from '@/types';

/**
 * プリセットからトレーニング記録のフォームデータを生成
 * 
 * **検証: 要件 2.2**
 * 
 * プリセットに保存された値を入力フォームに自動入力するための
 * 部分的なトレーニング記録オブジェクトを生成します。
 * 
 * @param preset - プリセット
 * @param userId - ユーザーID
 * @returns 部分的なトレーニング記録（フォーム用）
 */
export function createWorkoutFromPreset(
  preset: Preset,
  userId: string
): Partial<WorkoutRecord> {
  // プリセットセットをワークアウトセットに変換
  const workoutSets: WorkoutSet[] = preset.sets.map(set => ({
    setNumber: set.setNumber,
    weight: set.weight,
    reps: set.reps,
    completed: false, // 新しい記録なので未完了
    rm1: undefined,   // RM計算は後で行う
  }));

  // 部分的なトレーニング記録を返す
  return {
    bodyPart: preset.bodyPart,
    exerciseName: preset.exerciseName,
    sets: workoutSets,
    date: new Date(), // 現在日時を設定
    userId,
  };
}

/**
 * プリセットが有効かどうかを検証
 * 
 * @param preset - プリセット
 * @returns 有効な場合はtrue
 */
export function isValidPreset(preset: Preset): boolean {
  // 必須フィールドのチェック
  if (!preset.id || !preset.name || !preset.bodyPart || !preset.exerciseName) {
    return false;
  }

  // セットが存在するかチェック
  if (!preset.sets || preset.sets.length === 0) {
    return false;
  }

  // 各セットの妥当性をチェック
  for (const set of preset.sets) {
    if (set.weight <= 0 || set.reps <= 0 || set.setNumber <= 0) {
      return false;
    }
  }

  return true;
}

/**
 * プリセット名が重複しているかチェック
 * 
 * @param name - チェックするプリセット名
 * @param existingPresets - 既存のプリセット一覧
 * @param excludeId - 除外するプリセットID（編集時に使用）
 * @returns 重複している場合はtrue
 */
export function isDuplicatePresetName(
  name: string,
  existingPresets: Preset[],
  excludeId?: string
): boolean {
  return existingPresets.some(
    preset => preset.name === name && preset.id !== excludeId
  );
}

/**
 * プリセットを名前でソート
 * 
 * @param presets - プリセット配列
 * @returns ソートされたプリセット配列
 */
export function sortPresetsByName(presets: Preset[]): Preset[] {
  return [...presets].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
}

/**
 * プリセットを作成日時でソート（新しい順）
 * 
 * @param presets - プリセット配列
 * @returns ソートされたプリセット配列
 */
export function sortPresetsByDate(presets: Preset[]): Preset[] {
  return [...presets].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
