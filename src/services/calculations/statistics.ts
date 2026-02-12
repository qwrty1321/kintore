/**
 * 統計計算サービス
 * 
 * 平均値、中央値、パーセンタイルなどの統計指標を計算します。
 * 要件7.3に対応。
 */

/**
 * 統計計算結果
 */
export interface StatisticsResult {
  /** 平均値 */
  mean: number;
  /** 中央値 */
  median: number;
  /** 25パーセンタイル */
  percentile25: number;
  /** 75パーセンタイル */
  percentile75: number;
  /** 90パーセンタイル */
  percentile90: number;
  /** サンプルサイズ */
  sampleSize: number;
}

/**
 * 統計計算エラー
 */
export class StatisticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StatisticsError';
  }
}

/**
 * 平均値を計算
 * 
 * @param values - 数値の配列
 * @returns 平均値
 * @throws {StatisticsError} 配列が空の場合
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) {
    throw new StatisticsError('配列が空です');
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * 中央値を計算
 * 
 * @param values - 数値の配列
 * @returns 中央値
 * @throws {StatisticsError} 配列が空の場合
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    throw new StatisticsError('配列が空です');
  }

  // ソート（元の配列を変更しない）
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  // 偶数個の場合は中央2つの平均
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // 奇数個の場合は中央の値
  return sorted[mid];
}

/**
 * パーセンタイルを計算（線形補間法）
 * 
 * @param values - 数値の配列
 * @param percentile - パーセンタイル（0-100）
 * @returns パーセンタイル値
 * @throws {StatisticsError} 配列が空の場合、またはパーセンタイルが範囲外の場合
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) {
    throw new StatisticsError('配列が空です');
  }

  if (percentile < 0 || percentile > 100) {
    throw new StatisticsError('パーセンタイルは0から100の範囲で指定してください');
  }

  // ソート（元の配列を変更しない）
  const sorted = [...values].sort((a, b) => a - b);

  // パーセンタイルの位置を計算（線形補間法）
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  // 境界値の場合
  if (lower === upper) {
    return sorted[lower];
  }

  // 線形補間
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * 統計情報を一括計算
 * 
 * @param values - 数値の配列
 * @returns 統計計算結果
 * @throws {StatisticsError} 配列が空の場合
 */
export function calculateStatistics(values: number[]): StatisticsResult {
  if (values.length === 0) {
    throw new StatisticsError('配列が空です');
  }

  return {
    mean: calculateMean(values),
    median: calculateMedian(values),
    percentile25: calculatePercentile(values, 25),
    percentile75: calculatePercentile(values, 75),
    percentile90: calculatePercentile(values, 90),
    sampleSize: values.length,
  };
}
