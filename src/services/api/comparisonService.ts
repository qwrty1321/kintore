/**
 * 比較サービス - 類似ユーザーの判定と比較データの取得
 */

import { BodyProfile } from '@/types';

/**
 * 類似ユーザー判定の範囲定数
 */
export const SIMILARITY_THRESHOLDS = {
  HEIGHT_RANGE: 5,      // ±5cm
  WEIGHT_RANGE: 5,      // ±5kg
  FREQUENCY_RANGE: 1,   // ±1回/週
} as const;

/**
 * 2つの身体プロファイルが類似しているかを判定する
 * 
 * 判定基準:
 * - 身長: ±5cm以内
 * - 体重: ±5kg以内
 * - 週頻度: ±1回以内
 * 
 * @param profile1 - 比較元のプロファイル
 * @param profile2 - 比較先のプロファイル
 * @returns 類似している場合はtrue、そうでない場合はfalse
 * 
 * **検証: 要件 7.2**
 */
export function isSimilarProfile(
  profile1: BodyProfile,
  profile2: BodyProfile
): boolean {
  // 身長の差分を計算
  const heightDiff = Math.abs(profile1.height - profile2.height);
  
  // 体重の差分を計算
  const weightDiff = Math.abs(profile1.weight - profile2.weight);
  
  // 週頻度の差分を計算
  const frequencyDiff = Math.abs(profile1.weeklyFrequency - profile2.weeklyFrequency);
  
  // すべての条件を満たす場合のみtrueを返す
  return (
    heightDiff <= SIMILARITY_THRESHOLDS.HEIGHT_RANGE &&
    weightDiff <= SIMILARITY_THRESHOLDS.WEIGHT_RANGE &&
    frequencyDiff <= SIMILARITY_THRESHOLDS.FREQUENCY_RANGE
  );
}

/**
 * プロファイルのリストから類似ユーザーをフィルタリングする
 * 
 * @param targetProfile - 基準となるプロファイル
 * @param profiles - 比較対象のプロファイルリスト
 * @returns 類似しているプロファイルのリスト
 */
export function filterSimilarProfiles(
  targetProfile: BodyProfile,
  profiles: BodyProfile[]
): BodyProfile[] {
  return profiles.filter(profile => 
    // 自分自身は除外
    profile.userId !== targetProfile.userId &&
    // 類似判定
    isSimilarProfile(targetProfile, profile)
  );
}

/**
 * 類似ユーザーの数を取得する
 * 
 * @param targetProfile - 基準となるプロファイル
 * @param profiles - 比較対象のプロファイルリスト
 * @returns 類似ユーザーの数
 */
export function getSimilarProfileCount(
  targetProfile: BodyProfile,
  profiles: BodyProfile[]
): number {
  return filterSimilarProfiles(targetProfile, profiles).length;
}

/**
 * 類似ユーザーが十分に存在するかを判定する
 * プライバシー保護のため、最低10人以上必要
 * 
 * @param targetProfile - 基準となるプロファイル
 * @param profiles - 比較対象のプロファイルリスト
 * @returns 十分な数の類似ユーザーが存在する場合はtrue
 * 
 * **検証: 要件 7.4**
 */
export function hasSufficientSimilarUsers(
  targetProfile: BodyProfile,
  profiles: BodyProfile[]
): boolean {
  const MIN_USERS = 10;
  return getSimilarProfileCount(targetProfile, profiles) >= MIN_USERS;
}
