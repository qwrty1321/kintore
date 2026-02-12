/**
 * データベーススキーマのテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../schema';

describe('WorkoutDatabase', () => {
  beforeEach(async () => {
    // テスト前にデータベースをクリア
    await db.workouts.clear();
    await db.presets.clear();
    await db.profile.clear();
    await db.images.clear();
    await db.syncQueue.clear();
  });

  it('データベースインスタンスが正しく作成される', () => {
    expect(db).toBeDefined();
    expect(db.name).toBe('WorkoutTrackerDB');
  });

  it('すべてのテーブルが定義されている', () => {
    expect(db.workouts).toBeDefined();
    expect(db.presets).toBeDefined();
    expect(db.profile).toBeDefined();
    expect(db.images).toBeDefined();
    expect(db.syncQueue).toBeDefined();
  });

  it('workoutsテーブルにデータを追加できる', async () => {
    const workout = {
      id: 'test-1',
      userId: 'user-1',
      date: new Date(),
      bodyPart: 'chest' as const,
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 60, reps: 10, completed: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending' as const,
    };

    await db.workouts.add(workout);
    const retrieved = await db.workouts.get('test-1');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.exerciseName).toBe('ベンチプレス');
  });

  it('presetsテーブルにデータを追加できる', async () => {
    const preset = {
      id: 'preset-1',
      name: '胸トレA',
      bodyPart: 'chest' as const,
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 60, reps: 10 },
      ],
      createdAt: new Date(),
    };

    await db.presets.add(preset);
    const retrieved = await db.presets.get('preset-1');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('胸トレA');
  });

  it('profileテーブルにデータを追加できる', async () => {
    const profile = {
      userId: 'user-1',
      height: 175,
      weight: 70,
      weeklyFrequency: 3,
      updatedAt: new Date(),
    };

    await db.profile.add(profile);
    const retrieved = await db.profile.get('user-1');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.height).toBe(175);
  });

  it('syncQueueテーブルにデータを追加できる', async () => {
    const queueItem = {
      timestamp: new Date(),
      status: 'pending' as const,
      payload: {
        profileHash: 'hash123',
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        workouts: [],
      },
      retryCount: 0,
    };

    const id = await db.syncQueue.add(queueItem);
    const retrieved = await db.syncQueue.get(id);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.status).toBe('pending');
  });
});
