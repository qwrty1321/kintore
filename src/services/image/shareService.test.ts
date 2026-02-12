/**
 * 画像シェアサービスのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isShareSupported,
  isFileShareSupported,
  generateShareText,
  shareWorkoutText,
} from './shareService';
import type { WorkoutRecord } from '@/types';

// ============================================
// テストヘルパー
// ============================================

function createTestWorkout(): WorkoutRecord {
  return {
    id: crypto.randomUUID(),
    userId: 'test-user-123',
    date: new Date('2024-01-15'),
    bodyPart: 'chest',
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 80, reps: 10, completed: true },
      { setNumber: 2, weight: 85, reps: 8, completed: true },
      { setNumber: 3, weight: 90, reps: 6, completed: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    syncStatus: 'synced',
  };
}

// ============================================
// テスト
// ============================================

describe('isShareSupported', () => {
  it('navigator.shareが存在する場合、trueを返す', () => {
    // jsdomではnavigator.shareは存在しないため、モックが必要
    const originalNavigator = global.navigator;
    
    Object.defineProperty(global, 'navigator', {
      value: { share: vi.fn() },
      writable: true,
      configurable: true,
    });

    expect(isShareSupported()).toBe(true);

    // 元に戻す
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });
});

describe('generateShareText', () => {
  it('トレーニング情報を含むテキストを生成する', () => {
    const workout = createTestWorkout();
    const text = generateShareText(workout);

    // 日付が含まれる
    expect(text).toContain('2024年1月15日');
    
    // 部位とトレーニング名が含まれる
    expect(text).toContain('胸');
    expect(text).toContain('ベンチプレス');
    
    // 最大重量が含まれる
    expect(text).toContain('90kg');
    
    // セット数が含まれる
    expect(text).toContain('3セット');
    
    // 合計回数が含まれる（10 + 8 + 6 = 24）
    expect(text).toContain('24回');
    
    // ハッシュタグが含まれる
    expect(text).toContain('#筋トレ');
    expect(text).toContain('#胸');
  });

  it('プライバシー設定が無効の場合、個人情報を除外する', () => {
    const workout = createTestWorkout();
    const text = generateShareText(workout, { includePersonalInfo: false });

    // ユーザーIDが含まれない
    expect(text).not.toContain('test-user-123');
    expect(text).not.toContain('ユーザー:');
  });

  it('プライバシー設定が有効の場合、個人情報を含める', () => {
    const workout = createTestWorkout();
    const text = generateShareText(workout, { includePersonalInfo: true });

    // ユーザーIDが含まれる
    expect(text).toContain('test-user-123');
    expect(text).toContain('ユーザー:');
  });

  it('異なる部位の日本語表示が正しい', () => {
    const bodyParts = [
      { en: 'chest', ja: '胸' },
      { en: 'back', ja: '背中' },
      { en: 'shoulders', ja: '肩' },
      { en: 'arms', ja: '腕' },
      { en: 'legs', ja: '脚' },
      { en: 'core', ja: '体幹' },
    ];

    bodyParts.forEach(({ en, ja }) => {
      const workout = { ...createTestWorkout(), bodyPart: en as any };
      const text = generateShareText(workout);
      expect(text).toContain(ja);
    });
  });

  it('1セットのみの場合も正しく表示される', () => {
    const workout = createTestWorkout();
    workout.sets = [
      { setNumber: 1, weight: 100, reps: 5, completed: true },
    ];

    const text = generateShareText(workout);

    expect(text).toContain('100kg');
    expect(text).toContain('1セット');
    expect(text).toContain('5回');
  });
});

describe('shareWorkoutText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Web Share APIが利用可能な場合、navigator.shareを呼び出す', async () => {
    const workout = createTestWorkout();
    const mockShare = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(global, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true,
    });

    await shareWorkoutText(workout);

    expect(mockShare).toHaveBeenCalledTimes(1);
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('ベンチプレス'),
        text: expect.stringContaining('胸'),
      })
    );
  });

  it('ユーザーがキャンセルした場合、エラーをスローしない', async () => {
    const workout = createTestWorkout();
    const abortError = new Error('User cancelled');
    abortError.name = 'AbortError';
    const mockShare = vi.fn().mockRejectedValue(abortError);

    Object.defineProperty(global, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true,
    });

    await expect(shareWorkoutText(workout)).resolves.not.toThrow();
  });

  it('Web Share APIが利用できない場合、クリップボードにコピーする', async () => {
    const workout = createTestWorkout();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: { writeText: mockWriteText },
      },
      writable: true,
      configurable: true,
    });

    await shareWorkoutText(workout);

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('ベンチプレス')
    );
  });
});
