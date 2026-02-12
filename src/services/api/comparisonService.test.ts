/**
 * 比較サービスのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  isSimilarProfile,
  filterSimilarProfiles,
  getSimilarProfileCount,
  hasSufficientSimilarUsers,
  SIMILARITY_THRESHOLDS,
} from './comparisonService';
import { BodyProfile } from '@/types';

describe('comparisonService', () => {
  // テスト用の基準プロファイル
  const baseProfile: BodyProfile = {
    userId: 'user-1',
    height: 170,
    weight: 70,
    weeklyFrequency: 3,
    updatedAt: new Date('2024-01-01'),
  };

  describe('isSimilarProfile', () => {
    it('同じプロファイルは類似していると判定される', () => {
      const profile2: BodyProfile = {
        userId: 'user-2',
        height: 170,
        weight: 70,
        weeklyFrequency: 3,
        updatedAt: new Date('2024-01-01'),
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(true);
    });

    it('身長が±5cm以内の場合は類似していると判定される', () => {
      const profile2: BodyProfile = {
        ...baseProfile,
        userId: 'user-2',
        height: 175, // +5cm
      };

      const profile3: BodyProfile = {
        ...baseProfile,
        userId: 'user-3',
        height: 165, // -5cm
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(true);
      expect(isSimilarProfile(baseProfile, profile3)).toBe(true);
    });

    it('身長が±5cmを超える場合は類似していないと判定される', () => {
      const profile2: BodyProfile = {
        ...baseProfile,
        userId: 'user-2',
        height: 176, // +6cm
      };

      const profile3: BodyProfile = {
        ...baseProfile,
        userId: 'user-3',
        height: 164, // -6cm
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(false);
      expect(isSimilarProfile(baseProfile, profile3)).toBe(false);
    });

    it('体重が±5kg以内の場合は類似していると判定される', () => {
      const profile2: BodyProfile = {
        ...baseProfile,
        userId: 'user-2',
        weight: 75, // +5kg
      };

      const profile3: BodyProfile = {
        ...baseProfile,
        userId: 'user-3',
        weight: 65, // -5kg
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(true);
      expect(isSimilarProfile(baseProfile, profile3)).toBe(true);
    });

    it('体重が±5kgを超える場合は類似していないと判定される', () => {
      const profile2: BodyProfile = {
        ...baseProfile,
        userId: 'user-2',
        weight: 76, // +6kg
      };

      const profile3: BodyProfile = {
        ...baseProfile,
        userId: 'user-3',
        weight: 64, // -6kg
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(false);
      expect(isSimilarProfile(baseProfile, profile3)).toBe(false);
    });

    it('週頻度が±1回以内の場合は類似していると判定される', () => {
      const profile2: BodyProfile = {
        ...baseProfile,
        userId: 'user-2',
        weeklyFrequency: 4, // +1回
      };

      const profile3: BodyProfile = {
        ...baseProfile,
        userId: 'user-3',
        weeklyFrequency: 2, // -1回
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(true);
      expect(isSimilarProfile(baseProfile, profile3)).toBe(true);
    });

    it('週頻度が±1回を超える場合は類似していないと判定される', () => {
      const profile2: BodyProfile = {
        ...baseProfile,
        userId: 'user-2',
        weeklyFrequency: 5, // +2回
      };

      const profile3: BodyProfile = {
        ...baseProfile,
        userId: 'user-3',
        weeklyFrequency: 1, // -2回
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(false);
      expect(isSimilarProfile(baseProfile, profile3)).toBe(false);
    });

    it('すべての条件が境界値の場合は類似していると判定される', () => {
      const profile2: BodyProfile = {
        userId: 'user-2',
        height: 175,  // +5cm
        weight: 75,   // +5kg
        weeklyFrequency: 4, // +1回
        updatedAt: new Date('2024-01-01'),
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(true);
    });

    it('1つでも条件を満たさない場合は類似していないと判定される', () => {
      const profile2: BodyProfile = {
        userId: 'user-2',
        height: 175,  // +5cm (OK)
        weight: 75,   // +5kg (OK)
        weeklyFrequency: 5, // +2回 (NG)
        updatedAt: new Date('2024-01-01'),
      };

      expect(isSimilarProfile(baseProfile, profile2)).toBe(false);
    });
  });

  describe('filterSimilarProfiles', () => {
    it('類似しているプロファイルのみをフィルタリングする', () => {
      const profiles: BodyProfile[] = [
        {
          userId: 'user-2',
          height: 172,
          weight: 72,
          weeklyFrequency: 3,
          updatedAt: new Date(),
        },
        {
          userId: 'user-3',
          height: 180,
          weight: 80,
          weeklyFrequency: 5,
          updatedAt: new Date(),
        },
        {
          userId: 'user-4',
          height: 168,
          weight: 68,
          weeklyFrequency: 2,
          updatedAt: new Date(),
        },
      ];

      const result = filterSimilarProfiles(baseProfile, profiles);

      expect(result).toHaveLength(2);
      expect(result.map(p => p.userId)).toEqual(['user-2', 'user-4']);
    });

    it('自分自身は除外される', () => {
      const profiles: BodyProfile[] = [
        baseProfile,
        {
          userId: 'user-2',
          height: 170,
          weight: 70,
          weeklyFrequency: 3,
          updatedAt: new Date(),
        },
      ];

      const result = filterSimilarProfiles(baseProfile, profiles);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-2');
    });

    it('類似ユーザーがいない場合は空配列を返す', () => {
      const profiles: BodyProfile[] = [
        {
          userId: 'user-2',
          height: 180,
          weight: 80,
          weeklyFrequency: 5,
          updatedAt: new Date(),
        },
      ];

      const result = filterSimilarProfiles(baseProfile, profiles);

      expect(result).toHaveLength(0);
    });
  });

  describe('getSimilarProfileCount', () => {
    it('類似ユーザーの数を正しく返す', () => {
      const profiles: BodyProfile[] = [
        {
          userId: 'user-2',
          height: 172,
          weight: 72,
          weeklyFrequency: 3,
          updatedAt: new Date(),
        },
        {
          userId: 'user-3',
          height: 168,
          weight: 68,
          weeklyFrequency: 2,
          updatedAt: new Date(),
        },
      ];

      const count = getSimilarProfileCount(baseProfile, profiles);

      expect(count).toBe(2);
    });
  });

  describe('hasSufficientSimilarUsers', () => {
    it('10人以上の類似ユーザーがいる場合はtrueを返す', () => {
      const profiles: BodyProfile[] = Array.from({ length: 10 }, (_, i) => ({
        userId: `user-${i + 2}`,
        height: 170,
        weight: 70,
        weeklyFrequency: 3,
        updatedAt: new Date(),
      }));

      expect(hasSufficientSimilarUsers(baseProfile, profiles)).toBe(true);
    });

    it('10人未満の類似ユーザーしかいない場合はfalseを返す', () => {
      const profiles: BodyProfile[] = Array.from({ length: 9 }, (_, i) => ({
        userId: `user-${i + 2}`,
        height: 170,
        weight: 70,
        weeklyFrequency: 3,
        updatedAt: new Date(),
      }));

      expect(hasSufficientSimilarUsers(baseProfile, profiles)).toBe(false);
    });
  });

  describe('SIMILARITY_THRESHOLDS', () => {
    it('正しい閾値が定義されている', () => {
      expect(SIMILARITY_THRESHOLDS.HEIGHT_RANGE).toBe(5);
      expect(SIMILARITY_THRESHOLDS.WEIGHT_RANGE).toBe(5);
      expect(SIMILARITY_THRESHOLDS.FREQUENCY_RANGE).toBe(1);
    });
  });
});
