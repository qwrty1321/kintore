/**
 * データ匿名化サービスのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  hashUserId,
  anonymizeWorkout,
  anonymizeProfile,
  createAnonymousPayload,
  validateAnonymousPayload,
} from './anonymizationService';
import type { WorkoutRecord, BodyProfile } from '@/types';

describe('anonymizationService', () => {
  describe('hashUserId', () => {
    it('ユーザーIDを64文字の16進数ハッシュに変換する', async () => {
      const userId = 'user-123';
      const hash = await hashUserId(userId);
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
    
    it('同じユーザーIDは常に同じハッシュを生成する', async () => {
      const userId = 'user-456';
      const hash1 = await hashUserId(userId);
      const hash2 = await hashUserId(userId);
      
      expect(hash1).toBe(hash2);
    });
    
    it('異なるユーザーIDは異なるハッシュを生成する', async () => {
      const hash1 = await hashUserId('user-1');
      const hash2 = await hashUserId('user-2');
      
      expect(hash1).not.toBe(hash2);
    });
    
    it('空のユーザーIDでエラーをスローする', async () => {
      await expect(hashUserId('')).rejects.toThrow('ユーザーIDが空です');
      await expect(hashUserId('   ')).rejects.toThrow('ユーザーIDが空です');
    });
  });
  
  describe('anonymizeWorkout', () => {
    it('トレーニング記録から統計情報のみを抽出する', () => {
      const workout: WorkoutRecord = {
        id: 'workout-1',
        userId: 'user-123',
        date: new Date('2024-01-15'),
        bodyPart: 'chest',
        exerciseName: 'ベンチプレス',
        sets: [
          { setNumber: 1, weight: 60, reps: 10, completed: true },
          { setNumber: 2, weight: 70, reps: 8, completed: true },
          { setNumber: 3, weight: 80, reps: 6, completed: true },
        ],
        images: ['image-1', 'image-2'],
        notes: '調子が良かった',
        createdAt: new Date('2024-01-15T10:00:00'),
        updatedAt: new Date('2024-01-15T10:30:00'),
        syncStatus: 'synced',
      };
      
      const anonymized = anonymizeWorkout(workout);
      
      expect(anonymized).toEqual({
        date: '2024-01-15T00:00:00.000Z',
        bodyPart: 'chest',
        exerciseName: 'ベンチプレス',
        maxWeight: 80,
        totalReps: 24,
        totalSets: 3,
      });
      
      // 個人情報が含まれていないことを確認
      expect(anonymized).not.toHaveProperty('id');
      expect(anonymized).not.toHaveProperty('userId');
      expect(anonymized).not.toHaveProperty('images');
      expect(anonymized).not.toHaveProperty('notes');
    });
    
    it('最大重量を正しく計算する', () => {
      const workout: WorkoutRecord = {
        id: 'workout-2',
        userId: 'user-123',
        date: new Date('2024-01-16'),
        bodyPart: 'legs',
        exerciseName: 'スクワット',
        sets: [
          { setNumber: 1, weight: 100, reps: 5, completed: true },
          { setNumber: 2, weight: 120, reps: 3, completed: true },
          { setNumber: 3, weight: 110, reps: 4, completed: true },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending',
      };
      
      const anonymized = anonymizeWorkout(workout);
      
      expect(anonymized.maxWeight).toBe(120);
    });
  });
  
  describe('anonymizeProfile', () => {
    it('身体プロファイルから統計に必要な情報のみを抽出する', () => {
      const profile: BodyProfile = {
        userId: 'user-123',
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        goals: '筋力アップ',
        updatedAt: new Date('2024-01-15'),
      };
      
      const anonymized = anonymizeProfile(profile);
      
      expect(anonymized).toEqual({
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
      });
      
      // 個人情報が含まれていないことを確認
      expect(anonymized).not.toHaveProperty('userId');
      expect(anonymized).not.toHaveProperty('goals');
      expect(anonymized).not.toHaveProperty('updatedAt');
    });
  });
  
  describe('createAnonymousPayload', () => {
    it('完全な匿名データペイロードを作成する', async () => {
      const userId = 'user-123';
      const profile: BodyProfile = {
        userId,
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        updatedAt: new Date(),
      };
      const workouts: WorkoutRecord[] = [
        {
          id: 'workout-1',
          userId,
          date: new Date('2024-01-15'),
          bodyPart: 'chest',
          exerciseName: 'ベンチプレス',
          sets: [
            { setNumber: 1, weight: 60, reps: 10, completed: true },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced',
        },
      ];
      
      const payload = await createAnonymousPayload(userId, profile, workouts);
      
      // ハッシュ化されたIDが含まれている
      expect(payload.profileHash).toHaveLength(64);
      expect(payload.profileHash).toMatch(/^[0-9a-f]+$/);
      
      // プロファイル情報が含まれている
      expect(payload.height).toBe(175);
      expect(payload.weight).toBe(70);
      expect(payload.weeklyFrequency).toBe(3);
      
      // 匿名化されたトレーニング記録が含まれている
      expect(payload.workouts).toHaveLength(1);
      expect(payload.workouts[0]).toEqual({
        date: '2024-01-15T00:00:00.000Z',
        bodyPart: 'chest',
        exerciseName: 'ベンチプレス',
        maxWeight: 60,
        totalReps: 10,
        totalSets: 1,
      });
    });
    
    it('複数のトレーニング記録を匿名化する', async () => {
      const userId = 'user-456';
      const profile: BodyProfile = {
        userId,
        height: 180,
        weight: 75,
        weeklyFrequency: 4,
        updatedAt: new Date(),
      };
      const workouts: WorkoutRecord[] = [
        {
          id: 'workout-1',
          userId,
          date: new Date('2024-01-15'),
          bodyPart: 'chest',
          exerciseName: 'ベンチプレス',
          sets: [{ setNumber: 1, weight: 60, reps: 10, completed: true }],
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced',
        },
        {
          id: 'workout-2',
          userId,
          date: new Date('2024-01-16'),
          bodyPart: 'back',
          exerciseName: 'デッドリフト',
          sets: [{ setNumber: 1, weight: 100, reps: 5, completed: true }],
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced',
        },
      ];
      
      const payload = await createAnonymousPayload(userId, profile, workouts);
      
      expect(payload.workouts).toHaveLength(2);
      expect(payload.workouts[0].exerciseName).toBe('ベンチプレス');
      expect(payload.workouts[1].exerciseName).toBe('デッドリフト');
    });
  });
  
  describe('validateAnonymousPayload', () => {
    it('有効な匿名データペイロードを検証する', async () => {
      const payload = await createAnonymousPayload(
        'user-123',
        {
          userId: 'user-123',
          height: 175,
          weight: 70,
          weeklyFrequency: 3,
          updatedAt: new Date(),
        },
        [
          {
            id: 'workout-1',
            userId: 'user-123',
            date: new Date('2024-01-15'),
            bodyPart: 'chest',
            exerciseName: 'ベンチプレス',
            sets: [{ setNumber: 1, weight: 60, reps: 10, completed: true }],
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: 'synced',
          },
        ]
      );
      
      expect(validateAnonymousPayload(payload)).toBe(true);
    });
    
    it('無効なハッシュを持つペイロードを拒否する', () => {
      const payload = {
        profileHash: 'invalid-hash',
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [],
      };
      
      expect(validateAnonymousPayload(payload)).toBe(false);
    });
    
    it('元のユーザーIDを含むペイロードを拒否する', () => {
      const payload = {
        profileHash: 'user-123',
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [],
      };
      
      expect(validateAnonymousPayload(payload)).toBe(false);
    });
    
    it('無効な日付を持つトレーニング記録を拒否する', () => {
      const payload = {
        profileHash: 'a'.repeat(64),
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [
          {
            date: 'invalid-date',
            bodyPart: 'chest' as const,
            exerciseName: 'ベンチプレス',
            maxWeight: 60,
            totalReps: 10,
            totalSets: 1,
          },
        ],
      };
      
      expect(validateAnonymousPayload(payload)).toBe(false);
    });
    
    it('負の数値を持つトレーニング記録を拒否する', () => {
      const payload = {
        profileHash: 'a'.repeat(64),
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [
          {
            date: new Date().toISOString(),
            bodyPart: 'chest' as const,
            exerciseName: 'ベンチプレス',
            maxWeight: -60,
            totalReps: 10,
            totalSets: 1,
          },
        ],
      };
      
      expect(validateAnonymousPayload(payload)).toBe(false);
    });
  });
});
