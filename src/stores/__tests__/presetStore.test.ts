/**
 * presetStoreのユニットテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePresetStore } from '../presetStore';
import type { Preset, WorkoutRecord, BodyPart } from '@/types';
import * as presetDB from '@/services/db/presetDB';

// モック
vi.mock('@/services/db/presetDB');

describe('presetStore', () => {
  // テスト用のプリセット
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

  const mockWorkout: WorkoutRecord = {
    id: 'workout-1',
    userId: 'user-1',
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

  beforeEach(() => {
    // ストアをリセット
    usePresetStore.setState({
      presets: [],
      currentPreset: null,
      isLoading: false,
      error: null,
    });

    // モックをリセット
    vi.clearAllMocks();
  });

  describe('loadPresets', () => {
    it('すべてのプリセットを読み込む', async () => {
      const mockPresets = [mockPreset];
      vi.mocked(presetDB.getAllPresets).mockResolvedValue(mockPresets);

      const store = usePresetStore.getState();
      await store.loadPresets();

      expect(presetDB.getAllPresets).toHaveBeenCalled();
      expect(usePresetStore.getState().presets).toEqual(mockPresets);
      expect(usePresetStore.getState().isLoading).toBe(false);
    });

    it('読み込み失敗時にエラーを設定', async () => {
      vi.mocked(presetDB.getAllPresets).mockRejectedValue(new Error('DB Error'));

      const store = usePresetStore.getState();
      await store.loadPresets();

      expect(usePresetStore.getState().error).toBe('プリセットの読み込みに失敗しました');
      expect(usePresetStore.getState().isLoading).toBe(false);
    });
  });

  describe('loadPreset', () => {
    it('特定のプリセットを読み込む', async () => {
      vi.mocked(presetDB.getPreset).mockResolvedValue(mockPreset);

      const store = usePresetStore.getState();
      await store.loadPreset('preset-1');

      expect(presetDB.getPreset).toHaveBeenCalledWith('preset-1');
      expect(usePresetStore.getState().currentPreset).toEqual(mockPreset);
    });

    it('プリセットが見つからない場合はnullを設定', async () => {
      vi.mocked(presetDB.getPreset).mockResolvedValue(undefined);

      const store = usePresetStore.getState();
      await store.loadPreset('non-existent');

      expect(usePresetStore.getState().currentPreset).toBeNull();
    });
  });

  describe('loadPresetsByBodyPart', () => {
    it('部位に基づいてプリセットを読み込む', async () => {
      const mockPresets = [mockPreset];
      vi.mocked(presetDB.getPresetsByBodyPart).mockResolvedValue(mockPresets);

      const store = usePresetStore.getState();
      await store.loadPresetsByBodyPart('chest');

      expect(presetDB.getPresetsByBodyPart).toHaveBeenCalledWith('chest');
      expect(usePresetStore.getState().presets).toEqual(mockPresets);
    });
  });

  describe('createPreset', () => {
    it('新しいプリセットを作成', async () => {
      vi.mocked(presetDB.savePreset).mockResolvedValue('preset-1');

      const store = usePresetStore.getState();
      const id = await store.createPreset(mockPreset);

      expect(presetDB.savePreset).toHaveBeenCalledWith(mockPreset);
      expect(id).toBe('preset-1');
      expect(usePresetStore.getState().presets).toContainEqual(mockPreset);
    });

    it('作成失敗時にエラーをスロー', async () => {
      vi.mocked(presetDB.savePreset).mockRejectedValue(new Error('DB Error'));

      const store = usePresetStore.getState();
      await expect(store.createPreset(mockPreset)).rejects.toThrow();
      expect(usePresetStore.getState().error).toBe('プリセットの保存に失敗しました');
    });
  });

  describe('createPresetFromWorkout', () => {
    it('トレーニング記録からプリセットを作成', async () => {
      vi.mocked(presetDB.savePreset).mockResolvedValue('preset-2');

      const store = usePresetStore.getState();
      const id = await store.createPresetFromWorkout(mockWorkout, 'デッドリフト標準');

      expect(presetDB.savePreset).toHaveBeenCalled();
      expect(id).toBe('preset-2');

      const createdPreset = usePresetStore.getState().presets[0];
      expect(createdPreset.name).toBe('デッドリフト標準');
      expect(createdPreset.bodyPart).toBe(mockWorkout.bodyPart);
      expect(createdPreset.exerciseName).toBe(mockWorkout.exerciseName);
      expect(createdPreset.sets).toHaveLength(2);
      expect(createdPreset.sets[0].weight).toBe(100);
      expect(createdPreset.sets[0].reps).toBe(5);
    });
  });

  describe('updatePresetById', () => {
    it('プリセットを更新', async () => {
      usePresetStore.setState({ presets: [mockPreset] });
      vi.mocked(presetDB.updatePreset).mockResolvedValue();

      const store = usePresetStore.getState();
      const updates = { name: '新しい名前' };
      await store.updatePresetById('preset-1', updates);

      expect(presetDB.updatePreset).toHaveBeenCalledWith('preset-1', updates);
      expect(usePresetStore.getState().presets[0].name).toBe('新しい名前');
    });

    it('現在のプリセットも更新', async () => {
      usePresetStore.setState({
        presets: [mockPreset],
        currentPreset: mockPreset,
      });
      vi.mocked(presetDB.updatePreset).mockResolvedValue();

      const store = usePresetStore.getState();
      const updates = { name: '新しい名前' };
      await store.updatePresetById('preset-1', updates);

      expect(usePresetStore.getState().currentPreset?.name).toBe('新しい名前');
    });
  });

  describe('deletePresetById', () => {
    it('プリセットを削除', async () => {
      usePresetStore.setState({ presets: [mockPreset] });
      vi.mocked(presetDB.deletePreset).mockResolvedValue();

      const store = usePresetStore.getState();
      await store.deletePresetById('preset-1');

      expect(presetDB.deletePreset).toHaveBeenCalledWith('preset-1');
      expect(usePresetStore.getState().presets).toHaveLength(0);
    });

    it('現在のプリセットもクリア', async () => {
      usePresetStore.setState({
        presets: [mockPreset],
        currentPreset: mockPreset,
      });
      vi.mocked(presetDB.deletePreset).mockResolvedValue();

      const store = usePresetStore.getState();
      await store.deletePresetById('preset-1');

      expect(usePresetStore.getState().currentPreset).toBeNull();
    });
  });

  describe('searchPresets', () => {
    it('名前でプリセットを検索', async () => {
      const mockPresets = [mockPreset];
      vi.mocked(presetDB.searchPresetsByName).mockResolvedValue(mockPresets);

      const store = usePresetStore.getState();
      await store.searchPresets('ベンチ');

      expect(presetDB.searchPresetsByName).toHaveBeenCalledWith('ベンチ');
      expect(usePresetStore.getState().presets).toEqual(mockPresets);
    });
  });

  describe('setCurrentPreset', () => {
    it('現在のプリセットを設定', () => {
      const store = usePresetStore.getState();
      store.setCurrentPreset(mockPreset);

      expect(usePresetStore.getState().currentPreset).toEqual(mockPreset);
    });

    it('現在のプリセットをクリア', () => {
      usePresetStore.setState({ currentPreset: mockPreset });

      const store = usePresetStore.getState();
      store.setCurrentPreset(null);

      expect(usePresetStore.getState().currentPreset).toBeNull();
    });
  });

  describe('clearError', () => {
    it('エラーをクリア', () => {
      usePresetStore.setState({ error: 'エラーメッセージ' });

      const store = usePresetStore.getState();
      store.clearError();

      expect(usePresetStore.getState().error).toBeNull();
    });
  });
});
