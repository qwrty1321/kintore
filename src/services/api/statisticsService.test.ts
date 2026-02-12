/**
 * 統計計算サービスのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMean,
  calculateMedian,
  calculatePercentile,
  calculateStatistics,
} from './statisticsService';

describe('statisticsService', () => {
  describe('calculateMean', () => {
    it('平均値を正しく計算する', () => {
      expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateMean([10, 20, 30])).toBe(20);
    });

    it('空配列の場合は0を返す', () => {
      expect(calculateMean([])).toBe(0);
    });
  });

  describe('calculateMedian', () => {
    it('奇数個の値の中央値を正しく計算する', () => {
      expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateMedian([5, 1, 3])).toBe(3);
    });

    it('偶数個の値の中央値を正しく計算する', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
      expect(calculateMedian([10, 20])).toBe(15);
    });

    it('空配列の場合は0を返す', () => {
      expect(calculateMedian([])).toBe(0);
    });
  });

  describe('calculatePercentile', () => {
    it('25パーセンタイルを正しく計算する', () => {
      const result = calculatePercentile([1, 2, 3, 4, 5], 25);
      expect(result).toBeCloseTo(2, 1);
    });

    it('50パーセンタイル（中央値）を正しく計算する', () => {
      expect(calculatePercentile([1, 2, 3, 4, 5], 50)).toBe(3);
    });

    it('75パーセンタイルを正しく計算する', () => {
      const result = calculatePercentile([1, 2, 3, 4, 5], 75);
      expect(result).toBeCloseTo(4, 1);
    });

    it('90パーセンタイルを正しく計算する', () => {
      const result = calculatePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90);
      expect(result).toBeCloseTo(9.1, 1);
    });

    it('範囲外のパーセンタイルでエラーをスローする', () => {
      expect(() => calculatePercentile([1, 2, 3], -1)).toThrow();
      expect(() => calculatePercentile([1, 2, 3], 101)).toThrow();
    });
  });

  describe('calculateStatistics', () => {
    it('統計サマリーを正しく計算する', () => {
      const stats = calculateStatistics([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      expect(stats.mean).toBe(5.5);
      expect(stats.median).toBe(5.5);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(10);
      expect(stats.count).toBe(10);
    });

    it('空配列の場合はすべて0を返す', () => {
      const stats = calculateStatistics([]);
      
      expect(stats.mean).toBe(0);
      expect(stats.median).toBe(0);
      expect(stats.count).toBe(0);
    });
  });
});
