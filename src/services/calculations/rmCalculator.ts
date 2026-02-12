/**
 * RM (Repetition Maximum) 計算サービス
 * 
 * Epley式を使用して1RMを計算し、各パーセンテージの重量を算出します。
 * 要件: 3C.2, 3C.3, 3C.4, 3C.5
 */

/**
 * RM計算の結果
 */
export interface RMCalculationResult {
  /** 計算された1RM（小数点第1位まで） */
  oneRM: number;
  /** 各パーセンテージの重量 */
  percentages: {
    fifty: number;    // 50%
    sixty: number;    // 60%
    seventy: number;  // 70%
    eighty: number;   // 80%
    ninety: number;   // 90%
  };
}

/**
 * RM計算のエラー
 */
export class RMCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RMCalculationError';
  }
}

/**
 * Epley式を使用して1RMを計算
 * 
 * 公式: 1RM = w × (1 + r / 30)
 * ここで、w = 重量（kg）、r = 回数
 * 
 * @param weight - 挙上した重量（kg）
 * @param reps - 実施した回数
 * @returns 計算された1RM（小数点第1位まで）
 * @throws {RMCalculationError} 無効な入力の場合
 * 
 * 要件: 3C.2 - Epley式による1RM計算
 */
export function calculateOneRM(weight: number, reps: number): number {
  // 入力バリデーション（要件: 3C.5）
  if (weight <= 0) {
    throw new RMCalculationError('重量は0より大きい値である必要があります');
  }
  
  if (reps <= 0) {
    throw new RMCalculationError('回数は0より大きい値である必要があります');
  }
  
  if (reps > 30) {
    throw new RMCalculationError('回数は30回以下である必要があります');
  }
  
  // Epley式による計算
  const oneRM = weight * (1 + reps / 30);
  
  // 小数点第1位まで丸める（要件: 3C.3）
  return Math.round(oneRM * 10) / 10;
}

/**
 * 1RMの指定パーセンテージを計算
 * 
 * @param oneRM - 1RM値
 * @param percentage - パーセンテージ（0-100）
 * @returns 計算された重量（小数点第1位まで）
 * 
 * 要件: 3C.4 - パーセンテージ計算
 */
export function calculatePercentage(oneRM: number, percentage: number): number {
  if (oneRM <= 0) {
    throw new RMCalculationError('1RMは0より大きい値である必要があります');
  }
  
  if (percentage < 0 || percentage > 100) {
    throw new RMCalculationError('パーセンテージは0から100の範囲である必要があります');
  }
  
  const result = oneRM * (percentage / 100);
  
  // 小数点第1位まで丸める
  return Math.round(result * 10) / 10;
}

/**
 * 重量と回数から1RMと各パーセンテージを計算
 * 
 * @param weight - 挙上した重量（kg）
 * @param reps - 実施した回数
 * @returns RM計算結果（1RMと各パーセンテージ）
 * @throws {RMCalculationError} 無効な入力の場合
 * 
 * 要件: 3C.2, 3C.3, 3C.4
 */
export function calculateRM(weight: number, reps: number): RMCalculationResult {
  // 1RMを計算
  const oneRM = calculateOneRM(weight, reps);
  
  // 各パーセンテージを計算（要件: 3C.4）
  return {
    oneRM,
    percentages: {
      fifty: calculatePercentage(oneRM, 50),
      sixty: calculatePercentage(oneRM, 60),
      seventy: calculatePercentage(oneRM, 70),
      eighty: calculatePercentage(oneRM, 80),
      ninety: calculatePercentage(oneRM, 90),
    },
  };
}

/**
 * 1RMから各パーセンテージを計算（既に1RMが分かっている場合）
 * 
 * @param oneRM - 1RM値
 * @returns RM計算結果
 * @throws {RMCalculationError} 無効な入力の場合
 */
export function calculatePercentagesFromOneRM(oneRM: number): RMCalculationResult {
  if (oneRM <= 0) {
    throw new RMCalculationError('1RMは0より大きい値である必要があります');
  }
  
  return {
    oneRM,
    percentages: {
      fifty: calculatePercentage(oneRM, 50),
      sixty: calculatePercentage(oneRM, 60),
      seventy: calculatePercentage(oneRM, 70),
      eighty: calculatePercentage(oneRM, 80),
      ninety: calculatePercentage(oneRM, 90),
    },
  };
}
