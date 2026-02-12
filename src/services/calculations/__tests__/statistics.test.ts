/**
 * 統計計算サービスのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMean,
  calculateMedian,
  calculatePercentile,
  calculateStatistics,
  StatisticsError,
} from '../statistics';

describe('統計計算サービス', () => {
  describe('calculateMean', () => {
    it('正の数値の平均を計算できる', () => {
      expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('小数を含む平均を計算できる', () => {
      expect(calculateMean([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });

    it('単一の値の平均はその値自身', () => {
      expect(calculateMean([42])).toBe(42);
    });

    it('負の数値を含む平均を計算できる', () => {
      expect(calculateMean([-5, 0, 5])).toBe(0);
    });

    it('空の配列でエラーをスローする', () => {
      expect(() => calculateMean([])).toThrow(StatisticsError);
      expect(() => calculateMean([])).toThrow('配列が空です');
    });
  });

  describe('calculateMedian', () => {
    it('奇数個の値の中央値を計算できる', () => {
      expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    });

    it('偶数個の値の中央値を計算できる', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    });

    it('ソートされていない配列でも正しく計算できる', () => {
      expect(calculateMedian([5, 1, 3, 2, 4])).toBe(3);
    });

    it('単一の値の中央値はその値自身', () => {
      expect(calculateMedian([42])).toBe(42);
    });

    it('重複する値を含む配列で正しく計算できる', () => {
      expect(calculateMedian([1, 2, 2, 3])).toBe(2);
    });

    it('空の配列でエラーをスローする', () => {
      expect(() => calculateMedian([])).toThrow(StatisticsError);
    });
  });

  describe('calculatePercentile', () => {
    it('25パーセンタイルを計算できる', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(calculatePercentile(values, 25)).toBeCloseTo(3.25);
    });

    it('50パーセンタイル（中央値）を計算できる', () => {
      const values = [1, 2, 3, 4, 5];
      expect(calculatePercentile(values, 50)).toBe(3);
    });

    it('75パーセンタイルを計算できる', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(calculatePercentile(values, 75)).toBeCloseTo(7.75);
    });

    it('90パーセンタイルを計算できる', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(calculatePercentile(values, 90)).toBeCloseTo(9.1);
    });

    it('0パーセンタイル（最小値）を計算できる', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5], 0)).toBe(1);
    });

    it('100パーセンタイル（最大値）を計算できる', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5], 100)).toBe(5);
    });

    it('ソートされていない配列でも正しく計算できる', () => {
      const values = [10, 1, 5, 3, 8, 2, 7, 4, 9, 6];
      expect(calculatePercentile(values, 50)).toBeCloseTo(5.5);
    });

    it('空の配列でエラーをスローする', () => {
      expect(() => calculatePercentile([], 50)).toThrow(StatisticsError);
    });

    it('範囲外のパーセンタイルでエラーをスローする', () => {
      expect(() => calculatePercentile([1, 2, 3], -1)).toThrow(StatisticsError);
      expect(() => calculatePercentile([1, 2, 3], 101)).toThrow(StatisticsError);
    });
  });

  describe('calculateStatistics', () => {
    it('すべての統計指標を一括計算できる', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = calculateStatistics(values);

      expect(result.mean).toBe(5.5);
      expect(result.median).toBe(5.5);
      expect(result.percentile25).toBeCloseTo(3.25);
      expect(result.percentile75).toBeCloseTo(7.75);
      expect(result.percentile90).toBeCloseTo(9.1);
      expect(result.sampleSize).toBe(10);
    });

    it('小さなデータセットでも正しく計算できる', () => {
      const values = [1, 2, 3];
      const result = calculateStatistics(values);

      expect(result.mean).toBe(2);
      expect(result.median).toBe(2);
      expect(result.sampleSize).toBe(3);
    });

    it('単一の値でも計算できる', () => {
      const values = [42];
      const result = calculateStatistics(values);

      expect(result.mean).toBe(42);
      expect(result.median).toBe(42);
      expect(result.percentile25).toBe(42);
      expect(result.percentile75).toBe(42);
      expect(result.percentile90).toBe(42);
      expect(result.sampleSize).toBe(1);
    });

    it('実際のトレーニングデータで正しく計算できる', () => {
      // ベンチプレスの最大重量データ（kg）
      const weights = [60, 65, 70, 75, 80, 85, 90, 95, 100, 105];
      const result = calculateStatistics(weights);

      expect(result.mean).toBe(82.5);
      expect(result.median).toBe(82.5);
      expect(result.percentile25).toBeCloseTo(71.25);
      expect(result.percentile75).toBeCloseTo(93.75);
      expect(result.percentile90).toBeCloseTo(100.5);
    });

    it('空の配列でエラーをスローする', () => {
      expect(() => calculateStatistics([])).toThrow(StatisticsError);
    });
  });

  describe('エッジケース', () => {
    it('すべて同じ値の場合、すべての統計値が同じになる', () => {
      const values = [5, 5, 5, 5, 5];
      const result = calculateStatistics(values);

      expect(result.mean).toBe(5);
      expect(result.median).toBe(5);
      expect(result.percentile25).toBe(5);
      expect(result.percentile75).toBe(5);
      expect(result.percentile90).toBe(5);
    });

    it('非常に大きな値でも正しく計算できる', () => {
      const values = [1000000, 2000000, 3000000];
      const result = calculateStatistics(values);

      expect(result.mean).toBe(2000000);
      expect(result.median).toBe(2000000);
    });

    it('非常に小さな値でも正しく計算できる', () => {
      const values = [0.001, 0.002, 0.003];
      const result = calculateStatistics(values);

      expect(result.mean).toBeCloseTo(0.002);
      expect(result.median).toBeCloseTo(0.002);
    });
  });
});
