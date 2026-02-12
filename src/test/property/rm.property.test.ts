/**
 * プロパティベーステスト - RM計算
 * 
 * fast-checkを使用して、任意の有効な入力に対して成り立つ
 * 普遍的なプロパティを検証します。
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  calculateOneRM, 
  calculatePercentage, 
  calculateRM,
  RMCalculationError 
} from '@/services/calculations/rmCalculator';

describe('Feature: workout-tracker, Property 15: RM計算の数学的正確性', () => {
  it('**検証: 要件 3C.2** - 任意の有効な重量と回数について、Epley式による1RM計算結果は w * (1 + r / 30) に等しい', async () => {
    await fc.assert(
      fc.property(
        fc.float({ min: 0.1, max: 500, noNaN: true }),  // 重量
        fc.integer({ min: 1, max: 30 }),                 // 回数
        (weight: number, reps: number) => {
          // 1RMを計算
          const oneRM = calculateOneRM(weight, reps);
          
          // Epley式の期待値を計算
          const expected = weight * (1 + reps / 30);
          
          // 小数点第1位まで丸めた値と比較
          const expectedRounded = Math.round(expected * 10) / 10;
          
          // 計算結果が期待値と一致することを確認
          expect(oneRM).toBe(expectedRounded);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 16: RM計算結果のフォーマット', () => {
  it('**検証: 要件 3C.3** - 任意の1RM計算結果について、表示される値は小数点第1位まで丸められている', async () => {
    await fc.assert(
      fc.property(
        fc.float({ min: 0.1, max: 500, noNaN: true }),
        fc.integer({ min: 1, max: 30 }),
        (weight: number, reps: number) => {
          // 1RMを計算
          const oneRM = calculateOneRM(weight, reps);
          
          // 小数点第1位まで丸められていることを確認
          // 小数点第2位以降が存在しないことを確認
          const decimalPart = oneRM.toString().split('.')[1];
          if (decimalPart) {
            expect(decimalPart.length).toBeLessThanOrEqual(1);
          }
          
          // 再度丸めても値が変わらないことを確認
          const reRounded = Math.round(oneRM * 10) / 10;
          expect(oneRM).toBe(reRounded);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 17: RMパーセンテージ計算の正確性', () => {
  it('**検証: 要件 3C.4** - 任意の1RM値について、50%、60%、70%、80%、90%の計算結果は、それぞれ1RM値に対応するパーセンテージを乗じた値に等しい', async () => {
    await fc.assert(
      fc.property(
        fc.float({ min: 10, max: 500, noNaN: true }),  // 1RM値
        (oneRM: number) => {
          // 各パーセンテージを計算
          const fifty = calculatePercentage(oneRM, 50);
          const sixty = calculatePercentage(oneRM, 60);
          const seventy = calculatePercentage(oneRM, 70);
          const eighty = calculatePercentage(oneRM, 80);
          const ninety = calculatePercentage(oneRM, 90);
          
          // 期待値を計算（小数点第1位まで丸める）
          const expectedFifty = Math.round(oneRM * 0.5 * 10) / 10;
          const expectedSixty = Math.round(oneRM * 0.6 * 10) / 10;
          const expectedSeventy = Math.round(oneRM * 0.7 * 10) / 10;
          const expectedEighty = Math.round(oneRM * 0.8 * 10) / 10;
          const expectedNinety = Math.round(oneRM * 0.9 * 10) / 10;
          
          // 計算結果が期待値と一致することを確認
          expect(fifty).toBe(expectedFifty);
          expect(sixty).toBe(expectedSixty);
          expect(seventy).toBe(expectedSeventy);
          expect(eighty).toBe(expectedEighty);
          expect(ninety).toBe(expectedNinety);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('**検証: 要件 3C.4** - calculateRM関数が返すパーセンテージも正確である', async () => {
    await fc.assert(
      fc.property(
        fc.float({ min: 0.1, max: 500, noNaN: true }),
        fc.integer({ min: 1, max: 30 }),
        (weight: number, reps: number) => {
          // RM計算を実行
          const result = calculateRM(weight, reps);
          
          // 各パーセンテージが1RMから正確に計算されていることを確認
          const expectedFifty = Math.round(result.oneRM * 0.5 * 10) / 10;
          const expectedSixty = Math.round(result.oneRM * 0.6 * 10) / 10;
          const expectedSeventy = Math.round(result.oneRM * 0.7 * 10) / 10;
          const expectedEighty = Math.round(result.oneRM * 0.8 * 10) / 10;
          const expectedNinety = Math.round(result.oneRM * 0.9 * 10) / 10;
          
          expect(result.percentages.fifty).toBe(expectedFifty);
          expect(result.percentages.sixty).toBe(expectedSixty);
          expect(result.percentages.seventy).toBe(expectedSeventy);
          expect(result.percentages.eighty).toBe(expectedEighty);
          expect(result.percentages.ninety).toBe(expectedNinety);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 18: RM計算の無効入力拒否', () => {
  it('**検証: 要件 3C.5** - 任意の無効な入力（重量 ≤ 0、回数 > 30、回数 ≤ 0）について、RM計算関数はエラーを返す', async () => {
    await fc.assert(
      fc.property(
        fc.oneof(
          // 重量が0以下
          fc.record({
            weight: fc.float({ min: -100, max: 0 }),
            reps: fc.integer({ min: 1, max: 30 }),
          }),
          // 回数が0以下
          fc.record({
            weight: fc.float({ min: 0.1, max: 500 }),
            reps: fc.integer({ min: -100, max: 0 }),
          }),
          // 回数が30を超える
          fc.record({
            weight: fc.float({ min: 0.1, max: 500 }),
            reps: fc.integer({ min: 31, max: 100 }),
          })
        ),
        (invalidInput: { weight: number; reps: number }) => {
          // エラーがスローされることを確認
          expect(() => {
            calculateOneRM(invalidInput.weight, invalidInput.reps);
          }).toThrow(RMCalculationError);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('**検証: 要件 3C.5** - エラーメッセージが適切に設定されている', async () => {
    // 重量が0以下の場合
    expect(() => calculateOneRM(0, 5)).toThrow('重量は0より大きい値である必要があります');
    expect(() => calculateOneRM(-10, 5)).toThrow('重量は0より大きい値である必要があります');
    
    // 回数が0以下の場合
    expect(() => calculateOneRM(100, 0)).toThrow('回数は0より大きい値である必要があります');
    expect(() => calculateOneRM(100, -5)).toThrow('回数は0より大きい値である必要があります');
    
    // 回数が30を超える場合
    expect(() => calculateOneRM(100, 31)).toThrow('回数は30回以下である必要があります');
    expect(() => calculateOneRM(100, 50)).toThrow('回数は30回以下である必要があります');
  });
});
