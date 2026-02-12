/**
 * 計算サービスのエクスポート
 */

export {
  calculateOneRM,
  calculatePercentage,
  calculateRM,
  calculatePercentagesFromOneRM,
  RMCalculationError,
  type RMCalculationResult,
} from './rmCalculator';

export {
  calculateMean,
  calculateMedian,
  calculatePercentile,
  calculateStatistics,
  StatisticsError,
  type StatisticsResult,
} from './statistics';
