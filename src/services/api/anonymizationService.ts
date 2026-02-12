/**
 * データ匿名化サービス
 * 
 * ユーザーデータを匿名化し、個人を特定できない形式に変換します。
 * 
 * 要件:
 * - 6.1: 個人を特定できる情報を含まない
 * - 6.2: ユーザーIDをハッシュ化し、元のIDを復元不可能にする
 * - 12.2: ハッシュ化の一方向性を保証
 */

import type { WorkoutRecord, BodyProfile, AnonymousDataPayload, AnonymousWorkout } from '@/types';

/**
 * SHA-256ハッシュ関数
 * Web Crypto APIを使用してユーザーIDをハッシュ化
 * 
 * @param input - ハッシュ化する文字列
 * @returns ハッシュ化された16進数文字列
 */
async function sha256Hash(input: string): Promise<string> {
  // 文字列をUint8Arrayに変換
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // SHA-256ハッシュを計算
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // ArrayBufferを16進数文字列に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * ユーザーIDをハッシュ化
 * 
 * 一方向ハッシュ関数を使用し、元のIDを復元不可能にします。
 * 
 * @param userId - 元のユーザーID
 * @returns ハッシュ化されたユーザーID
 */
export async function hashUserId(userId: string): Promise<string> {
  if (!userId || userId.trim() === '') {
    throw new Error('ユーザーIDが空です');
  }
  
  return await sha256Hash(userId);
}

/**
 * トレーニング記録を匿名化
 * 
 * 個人を特定できる情報（ユーザーID、画像、メモなど）を除外し、
 * 統計に必要な情報のみを抽出します。
 * 
 * @param workout - 元のトレーニング記録
 * @returns 匿名化されたトレーニングデータ
 */
export function anonymizeWorkout(workout: WorkoutRecord): AnonymousWorkout {
  // セット情報から統計値を計算
  const maxWeight = Math.max(...workout.sets.map(s => s.weight));
  const totalReps = workout.sets.reduce((sum, s) => sum + s.reps, 0);
  const totalSets = workout.sets.length;
  
  return {
    date: workout.date.toISOString(),
    bodyPart: workout.bodyPart,
    exerciseName: workout.exerciseName,
    maxWeight,
    totalReps,
    totalSets,
  };
}

/**
 * 身体プロファイルを匿名化
 * 
 * 個人を特定できる情報（ユーザーID、目標など）を除外し、
 * 比較に必要な情報のみを抽出します。
 * 
 * @param profile - 元の身体プロファイル
 * @returns 匿名化されたプロファイルデータ
 */
export function anonymizeProfile(profile: BodyProfile): {
  height: number;
  weight: number;
  weeklyFrequency: number;
} {
  return {
    height: profile.height,
    weight: profile.weight,
    weeklyFrequency: profile.weeklyFrequency,
  };
}

/**
 * 完全な匿名データペイロードを作成
 * 
 * ユーザーIDをハッシュ化し、トレーニング記録と身体プロファイルを
 * 匿名化してペイロードを生成します。
 * 
 * @param userId - 元のユーザーID
 * @param profile - 身体プロファイル
 * @param workouts - トレーニング記録の配列
 * @returns 匿名化されたデータペイロード
 */
export async function createAnonymousPayload(
  userId: string,
  profile: BodyProfile,
  workouts: WorkoutRecord[]
): Promise<AnonymousDataPayload> {
  // ユーザーIDをハッシュ化
  const profileHash = await hashUserId(userId);
  
  // プロファイルを匿名化
  const anonymizedProfile = anonymizeProfile(profile);
  
  // トレーニング記録を匿名化
  const anonymizedWorkouts = workouts.map(anonymizeWorkout);
  
  return {
    profileHash,
    ...anonymizedProfile,
    workouts: anonymizedWorkouts,
  };
}

/**
 * 匿名データペイロードに個人情報が含まれていないか検証
 * 
 * @param payload - 検証するペイロード
 * @returns 個人情報が含まれていない場合true
 */
export function validateAnonymousPayload(payload: AnonymousDataPayload): boolean {
  // profileHashが元のユーザーIDではないことを確認（ハッシュは64文字の16進数）
  if (payload.profileHash.length !== 64 || !/^[0-9a-f]+$/.test(payload.profileHash)) {
    return false;
  }
  
  // 各トレーニング記録に個人情報が含まれていないことを確認
  for (const workout of payload.workouts) {
    // 日付がISO 8601形式であることを確認
    if (isNaN(Date.parse(workout.date))) {
      return false;
    }
    
    // 数値フィールドが有効であることを確認
    if (workout.maxWeight < 0 || workout.totalReps < 0 || workout.totalSets < 0) {
      return false;
    }
  }
  
  return true;
}
