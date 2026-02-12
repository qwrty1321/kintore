/**
 * presetStoreの統合テスト
 * 実際のIndexedDBを使用した動作確認
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePresetStore } from '../presetStore';
import { db } from '@/services/db/schema';
import type { Preset, WorkoutRecord, BodyPart } from '@/types';

describe('presetStore 統合テスト', () => {
  // テスト用のプリセット
  const testPreset: Preset = {
    id: 'test-preset-1',
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

  const testWorkout: WorkoutRecord = {
    id: 'test-workout-1',
    userId: 'test-user',
    date: new Date('2024-01-15'),
    bodyPart: 'back' as BodyPart,
    exerciseName: 'デッドリフト',
    sets: [
      { setNumber: 1, weight: 100, reps: 5, completed: true },
      { setNumber: 2, weight: 110, reps: 3, completed: true },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    syncStatus: 'pending',
  };

  beforeEach(async () => {
    // データベースをクリア
    await db.presets.clear();
    
    // ストアをリセット
    usePresetStore.setState({
      presets: [],
      currentPreset: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(async () => {
    // テスト後のクリーンアップ
    await db.presets.clear();
  });

  describe('CRUD操作', () => {
    it('プリセットを作成して取得できる', async () => {
      const store = usePresetStore.getState();
      
      // プリセットを作成
      const id = await store.createPreset(testPreset);
      expect(id).toBe(testPreset.id);
      
      // プリセットを読み込む
      await store.loadPresets();
      expect(store.presets).toHaveLength(1);
      expect(store.presets[0]).toMatchObject({
        id: testPreset.id,
        name: testPreset.name,
        bodyPart: testPreset.bodyPart,
      });
    });

    it('プリセットを更新できる', async () => {
      const store = usePresetStore.getState();
      
      // プリセットを作成
      await store.createPreset(testPreset);
      
      // プリセットを更新
      await store.updatePresetById(testPreset.id, { name: '更新された名前' });
      
      // 更新を確認
      await store.loadPresets();
      expect(store.presets[0].name).toBe('更新された名前');
    });

    it('プリセットを削除できる', async () => {
      const store = usePresetStore.getState();
      
      // プリセットを作成
      await store.createPreset(testPreset);
      await store.loadPresets();
      expect(store.presets).toHaveLength(1);
      
      // プリセットを削除
      await store.deletePresetById(testPreset.id);
      
      // 削除を確認
      expect(store.presets).toHaveLength(0);
    });
  });

  describe('トレーニング記録からプリセット作成', () => {
    it('トレーニング記録からプリセットを作成できる', async () => {
      const store = usePresetStore.getState();
      
      // トレーニング記録からプリセットを作成
      const id = await store.createPresetFromWorkout(testWorkout, 'デッドリフト標準');
      expect(id).toBeDefined();
      
      // プリセットを読み込む
      await store.loadPresets();
      expect(store.presets).toHaveLength(1);
      
      const preset = store.presets[0];
      expect(preset.name).toBe('デッドリフト標準');
      expect(preset.bodyPart).toBe(testWorkout.bodyPart);
      expect(preset.exerciseName).toBe(testWorkout.exerciseName);
      expect(preset.sets).toHaveLength(2);
      expect(preset.sets[0].weight).toBe(100);
      expect(preset.sets[0].reps).toBe(5);
    });
  });

  describe('部位でフィルタリング', () => {
    it('部位に基づいてプリセットを取得できる', async () => {
      const store = usePresetStore.getState();
      
      // 複数のプリセットを作成
      await store.createPreset(testPreset); // chest
      await store.createPreset({
        ...testPreset,
        id: 'test-preset-2',
        name: 'スクワット',
        bodyPart: 'legs' as BodyPart,
      });
      
      // 部位でフィルタリング
      await store.loadPresetsByBodyPart('chest');
      
      expect(store.presets).toHaveLength(1);
      expect(store.presets[0].bodyPart).toBe('chest');
    });
  });

  describe('検索機能', () => {
    it('名前でプリセットを検索できる', async () => {
      const store = usePresetStore.getState();
      
      // 複数のプリセットを作成
      await store.createPreset(testPreset);
      await store.createPreset({
        ...testPreset,
        id: 'test-preset-2',
        name: 'スクワット標準',
      });
      
      // 検索
      await store.searchPresets('ベンチ');
      
      expect(store.presets).toHaveLength(1);
      expect(store.presets[0].name).toContain('ベンチ');
    });
  });
});
