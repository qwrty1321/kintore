import { describe, it, expect } from 'vitest';
import {
  calculateOneRM,
  calculatePercentage,
  calculateRM,
  calculatePercentagesFromOneRM,
  RMCalculationError,
} from '../rmCalculator';

describe('rmCalculator', () => {
  describe('calculateOneRM', () => {
    it('Epley式で正しく1RMを計算する', () => {
      // 100kg × 10回 = 100 × (1 + 10/30) = 100 × 1.333... = 133.3
      expect(calculateOneRM(100, 10)).toBe(133.3);
      
      // 80kg × 5回 = 80 × (1 + 5/30) = 80 × 1.166... = 93.3
      expect(calculateOneRM(80, 5)).toBe(93.3);
      
      // 60kg × 1回 = 60 × (1 + 1/30) = 60 × 1.033... = 62.0
      expect(calculateOneRM(60, 1)).toBe(62.0);
    });

    it('小数点第1位まで丸める', () => {
      // 100kg × 8回 = 100 × (1 + 8/30) = 100 × 1.266... = 126.666... → 126.7
      expect(calculateOneRM(100, 8)).toBe(126.7);
      
      // 75kg × 12回 = 75 × (1 + 12/30) = 75 × 1.4 = 105.0
      expect(calculateOneRM(75, 12)).toBe(105.0);
    });

    it('重量が0以下の場合はエラーをスローする', () => {
      expect(() => calculateOneRM(0, 10)).toThrow(RMCalculationError);
      expect(() => calculateOneRM(-10, 10)).toThrow(RMCalculationError);
      expect(() => calculateOneRM(0, 10)).toThrow('重量は0より大きい値である必要があります');
    });

    it('回数が0以下の場合はエラーをスローする', () => {
      expect(() => calculateOneRM(100, 0)).toThrow(RMCalculationError);
      expect(() => calculateOneRM(100, -5)).toThrow(RMCalculationError);
      expect(() => calculateOneRM(100, 0)).toThrow('回数は0より大きい値である必要があります');
    });

    it('回数が30を超える場合はエラーをスローする', () => {
      expect(() => calculateOneRM(100, 31)).toThrow(RMCalculationError);
      expect(() => calculateOneRM(100, 50)).toThrow(RMCalculationError);
      expect(() => calculateOneRM(100, 31)).toThrow('回数は30回以下である必要があります');
    });

    it('境界値（30回）は正常に計算する', () => {
      // 100kg × 30回 = 100 × (1 + 30/30) = 100 × 2 = 200.0
      expect(calculateOneRM(100, 30)).toBe(200.0);
    });
  });

  describe('calculatePercentage', () => {
    it('指定されたパーセンテージを正しく計算する', () => {
      expect(calculatePercentage(100, 50)).toBe(50.0);
      expect(calculatePercentage(100, 60)).toBe(60.0);
      expect(calculatePercentage(100, 70)).toBe(70.0);
      expect(calculatePercentage(100, 80)).toBe(80.0);
      expect(calculatePercentage(100, 90)).toBe(90.0);
    });

    it('小数点第1位まで丸める', () => {
      // 133.3の50% = 66.65 → 66.7
      expect(calculatePercentage(133.3, 50)).toBe(66.7);
      
      // 133.3の80% = 106.64 → 106.6
      expect(calculatePercentage(133.3, 80)).toBe(106.6);
    });

    it('1RMが0以下の場合はエラーをスローする', () => {
      expect(() => calculatePercentage(0, 50)).toThrow(RMCalculationError);
      expect(() => calculatePercentage(-100, 50)).toThrow(RMCalculationError);
    });

    it('パーセンテージが範囲外の場合はエラーをスローする', () => {
      expect(() => calculatePercentage(100, -10)).toThrow(RMCalculationError);
      expect(() => calculatePercentage(100, 101)).toThrow(RMCalculationError);
    });

    it('境界値（0%と100%）は正常に計算する', () => {
      expect(calculatePercentage(100, 0)).toBe(0.0);
      expect(calculatePercentage(100, 100)).toBe(100.0);
    });
  });

  describe('calculateRM', () => {
    it('1RMと全パーセンテージを正しく計算する', () => {
      const result = calculateRM(100, 10);
      
      expect(result.oneRM).toBe(133.3);
      expect(result.percentages.fifty).toBe(66.7);
      expect(result.percentages.sixty).toBe(80.0);
      expect(result.percentages.seventy).toBe(93.3);
      expect(result.percentages.eighty).toBe(106.6);
      expect(result.percentages.ninety).toBe(120.0);
    });

    it('異なる重量と回数で正しく計算する', () => {
      const result = calculateRM(80, 5);
      
      expect(result.oneRM).toBe(93.3);
      expect(result.percentages.fifty).toBe(46.7);
      expect(result.percentages.sixty).toBe(56.0);
      expect(result.percentages.seventy).toBe(65.3);
      expect(result.percentages.eighty).toBe(74.6);
      expect(result.percentages.ninety).toBe(84.0);
    });

    it('無効な入力の場合はエラーをスローする', () => {
      expect(() => calculateRM(0, 10)).toThrow(RMCalculationError);
      expect(() => calculateRM(100, 0)).toThrow(RMCalculationError);
      expect(() => calculateRM(100, 31)).toThrow(RMCalculationError);
    });
  });

  describe('calculatePercentagesFromOneRM', () => {
    it('既知の1RMから全パーセンテージを正しく計算する', () => {
      const result = calculatePercentagesFromOneRM(150);
      
      expect(result.oneRM).toBe(150);
      expect(result.percentages.fifty).toBe(75.0);
      expect(result.percentages.sixty).toBe(90.0);
      expect(result.percentages.seventy).toBe(105.0);
      expect(result.percentages.eighty).toBe(120.0);
      expect(result.percentages.ninety).toBe(135.0);
    });

    it('1RMが0以下の場合はエラーをスローする', () => {
      expect(() => calculatePercentagesFromOneRM(0)).toThrow(RMCalculationError);
      expect(() => calculatePercentagesFromOneRM(-100)).toThrow(RMCalculationError);
    });
  });

  describe('エッジケース', () => {
    it('非常に小さい重量でも正しく計算する', () => {
      const result = calculateRM(2.5, 10);
      expect(result.oneRM).toBe(3.3);
      expect(result.percentages.fifty).toBe(1.7);
    });

    it('非常に大きい重量でも正しく計算する', () => {
      const result = calculateRM(500, 1);
      expect(result.oneRM).toBe(516.7);
      expect(result.percentages.ninety).toBe(465.0);
    });

    it('1回の場合は1RMが元の重量より少し大きくなる', () => {
      const result = calculateRM(100, 1);
      // 100 × (1 + 1/30) = 103.333... → 103.3
      expect(result.oneRM).toBe(103.3);
    });
  });
});
