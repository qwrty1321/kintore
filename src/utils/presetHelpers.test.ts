/**
 * presetHelpersのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  createWorkoutFromPreset,
  isValidPreset,
  isDuplicatePresetName,
  sortPresetsByName,
  sortPresetsByDate,
} from './presetHelpers';
import type { Preset, BodyPart } from '@/types';

describe('presetHelpers', () => {
  const mockPreset: Preset = {
    id: 'preset-1',
    name: 'ベンチプレス標準',
    bodyPart: 'chest' as BodyPart,
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 60, reps: 10 },
      { setNumber: 2, weight: 70, reps: 8 },
      { setNumber: 3, weight: 80, reps: 6 },
    ],
    createdAt: new Date('2024-01-01'),
  };

  describe('createWorkoutFromPreset', () => {
    it('プリセットから部分的なトレーニング記録を生成', () => {
      const userId = 'user-1';
      const result = createWorkoutFromPreset(mockPreset, userId);

      expect(result.bodyPart).toBe(mockPreset.bodyPart);
      expect(result.exerciseName).toBe(mockPreset.exerciseName);
      expect(result.userId).toBe(userId);
      expect(result.sets).toHaveLength(3);
      expect(result.date).toBeInstanceOf(Date);
    });

    it('セットが正しく変換される', () => {
      const userId = 'user-1';
      const result = createWorkoutFromPreset(mockPreset, userId);

      expect(result.sets![0].setNumber).toBe(1);
      expect(result.sets![0].weight).toBe(60);
      expect(result.sets![0].reps).toBe(10);
      expect(result.sets![0].completed).toBe(false);
      expect(result.sets![0].rm1).toBeUndefined();
    });
  });

  describe('isValidPreset', () => {
    it('有効なプリセットの場合はtrueを返す', () => {
      expect(isValidPreset(mockPreset)).toBe(true);
    });

    it('IDが欠けている場合はfalseを返す', () => {
      const invalid = { ...mockPreset, id: '' };
      expect(isValidPreset(invalid)).toBe(false);
    });

    it('名前が欠けている場合はfalseを返す', () => {
      const invalid = { ...mockPreset, name: '' };
      expect(isValidPreset(invalid)).toBe(false);
    });

    it('セットが空の場合はfalseを返す', () => {
      const invalid = { ...mockPreset, sets: [] };
      expect(isValidPreset(invalid)).toBe(false);
    });

    it('重量が0以下の場合はfalseを返す', () => {
      const invalid = {
        ...mockPreset,
        sets: [{ setNumber: 1, weight: 0, reps: 10 }],
      };
      expect(isValidPreset(invalid)).toBe(false);
    });

    it('回数が0以下の場合はfalseを返す', () => {
      const invalid = {
        ...mockPreset,
        sets: [{ setNumber: 1, weight: 60, reps: 0 }],
      };
      expect(isValidPreset(invalid)).toBe(false);
    });
  });

  describe('isDuplicatePresetName', () => {
    const existingPresets: Preset[] = [
      mockPreset,
      {
        id: 'preset-2',
        name: 'スクワット標準',
        bodyPart: 'legs' as BodyPart,
        exerciseName: 'スクワット',
        sets: [{ setNumber: 1, weight: 100, reps: 10 }],
        createdAt: new Date('2024-01-02'),
      },
    ];

    it('重複している場合はtrueを返す', () => {
      expect(isDuplicatePresetName('ベンチプレス標準', existingPresets)).toBe(true);
    });

    it('重複していない場合はfalseを返す', () => {
      expect(isDuplicatePresetName('デッドリフト標準', existingPresets)).toBe(false);
    });

    it('除外IDが指定された場合、そのIDは無視する', () => {
      expect(
        isDuplicatePresetName('ベンチプレス標準', existingPresets, 'preset-1')
      ).toBe(false);
    });
  });

  describe('sortPresetsByName', () => {
    it('プリセットを名前でソート', () => {
      const presets: Preset[] = [
        { ...mockPreset, name: 'デッドリフト' },
        { ...mockPreset, name: 'ベンチプレス' },
        { ...mockPreset, name: 'スクワット' },
      ];

      const sorted = sortPresetsByName(presets);

      expect(sorted[0].name).toBe('スクワット');
      expect(sorted[1].name).toBe('デッドリフト');
      expect(sorted[2].name).toBe('ベンチプレス');
    });

    it('元の配列を変更しない', () => {
      const presets: Preset[] = [
        { ...mockPreset, name: 'デッドリフト' },
        { ...mockPreset, name: 'ベンチプレス' },
      ];

      const original = [...presets];
      sortPresetsByName(presets);

      expect(presets).toEqual(original);
    });
  });

  describe('sortPresetsByDate', () => {
    it('プリセットを作成日時でソート（新しい順）', () => {
      const presets: Preset[] = [
        { ...mockPreset, createdAt: new Date('2024-01-01') },
        { ...mockPreset, createdAt: new Date('2024-01-03') },
        { ...mockPreset, createdAt: new Date('2024-01-02') },
      ];

      const sorted = sortPresetsByDate(presets);

      expect(sorted[0].createdAt).toEqual(new Date('2024-01-03'));
      expect(sorted[1].createdAt).toEqual(new Date('2024-01-02'));
      expect(sorted[2].createdAt).toEqual(new Date('2024-01-01'));
    });

    it('元の配列を変更しない', () => {
      const presets: Preset[] = [
        { ...mockPreset, createdAt: new Date('2024-01-01') },
        { ...mockPreset, createdAt: new Date('2024-01-02') },
      ];

      const original = [...presets];
      sortPresetsByDate(presets);

      expect(presets).toEqual(original);
    });
  });
});
