/**
 * 統計計算サービス
 * 
 * 平均値、中央値、パーセンタイルなどの統計値を計算します。
 * 
 * **要件: 7.3**
 */

/**
 * 数値配列の平均値を計算
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * 数値配列の中央値を計算
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * 数値配列の指定パーセンタイルを計算
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new Error('パーセンタイルは0〜100の範囲で指定してください');
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * 統計サマリーを計算
 */
export interface StatisticsSummary {
  mean: number;
  median: number;
  p25: number;
  p75: number;
  p90: number;
  min: number;
  max: number;
  count: number;
}

export function calculateStatistics(values: number[]): StatisticsSummary {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      p25: 0,
      p75: 0,
      p90: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  
  return {
    mean: calculateMean(values),
    median: calculateMedian(values),
    p25: calculatePercentile(values, 25),
    p75: calculatePercentile(values, 75),
    p90: calculatePercentile(values, 90),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    count: values.length,
  };
}
