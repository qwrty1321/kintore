/**
 * プリセットの状態管理 - Zustand Store
 * 
 * **要件: 2.1、2.2、2.3、2.4**
 */

import { create } from 'zustand';
import type { Preset, BodyPart, PresetSet, WorkoutRecord } from '@/types';
import {
  savePreset,
  getPreset,
  getAllPresets,
  getPresetsByBodyPart,
  updatePreset,
  deletePreset,
  searchPresetsByName,
} from '@/services/db/presetDB';

interface PresetState {
  // 状態
  presets: Preset[];
  currentPreset: Preset | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  loadPresets: () => Promise<void>;
  loadPreset: (id: string) => Promise<void>;
  loadPresetsByBodyPart: (bodyPart: BodyPart) => Promise<void>;
  createPreset: (preset: Preset) => Promise<string>;
  createPresetFromWorkout: (workout: WorkoutRecord, name: string) => Promise<string>;
  updatePresetById: (id: string, updates: Partial<Preset>) => Promise<void>;
  deletePresetById: (id: string) => Promise<void>;
  searchPresets: (name: string) => Promise<void>;
  setCurrentPreset: (preset: Preset | null) => void;
  clearError: () => void;
}

/**
 * プリセットのZustand Store
 */
export const usePresetStore = create<PresetState>((set, get) => ({
  // 初期状態
  presets: [],
  currentPreset: null,
  isLoading: false,
  error: null,

  /**
   * すべてのプリセットを読み込む
   */
  loadPresets: async () => {
    set({ isLoading: true, error: null });
    try {
      const presets = await getAllPresets();
      set({ presets, isLoading: false });
    } catch (error) {
      set({
        error: 'プリセットの読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load presets:', error);
    }
  },

  /**
   * 特定のプリセットを読み込む
   */
  loadPreset: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const preset = await getPreset(id);
      set({ currentPreset: preset || null, isLoading: false });
    } catch (error) {
      set({
        error: 'プリセットの読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load preset:', error);
    }
  },

  /**
   * 部位に基づいてプリセットを読み込む
   */
  loadPresetsByBodyPart: async (bodyPart: BodyPart) => {
    set({ isLoading: true, error: null });
    try {
      const presets = await getPresetsByBodyPart(bodyPart);
      set({ presets, isLoading: false });
    } catch (error) {
      set({
        error: 'プリセットの読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load presets by body part:', error);
    }
  },

  /**
   * 新しいプリセットを作成
   * 
   * **検証: 要件 2.1**
   */
  createPreset: async (preset: Preset) => {
    set({ isLoading: true, error: null });
    
    try {
      const id = await savePreset(preset);
      
      // ローカル状態を更新
      const presets = [...get().presets, preset];
      set({ presets, isLoading: false });
      
      return id;
    } catch (error) {
      set({
        error: 'プリセットの保存に失敗しました',
        isLoading: false,
      });
      console.error('Failed to create preset:', error);
      throw error;
    }
  },

  /**
   * トレーニング記録からプリセットを作成
   * 
   * **検証: 要件 2.1**
   * 
   * トレーニング記録の部位、トレーニング方法、セット情報（重量、回数）を
   * プリセットとして保存します。
   * 
   * @param workout - 元となるトレーニング記録
   * @param name - プリセット名
   * @returns 作成されたプリセットのID
   */
  createPresetFromWorkout: async (workout: WorkoutRecord, name: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // トレーニング記録からプリセットセットを作成
      const presetSets: PresetSet[] = workout.sets.map(set => ({
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
      }));

      // プリセットオブジェクトを作成
      const preset: Preset = {
        id: crypto.randomUUID(),
        name,
        bodyPart: workout.bodyPart,
        exerciseName: workout.exerciseName,
        sets: presetSets,
        createdAt: new Date(),
      };

      const id = await savePreset(preset);
      
      // ローカル状態を更新
      const presets = [...get().presets, preset];
      set({ presets, isLoading: false });
      
      return id;
    } catch (error) {
      set({
        error: 'プリセットの作成に失敗しました',
        isLoading: false,
      });
      console.error('Failed to create preset from workout:', error);
      throw error;
    }
  },

  /**
   * プリセットを更新
   * 
   * **検証: 要件 2.3**
   */
  updatePresetById: async (id: string, updates: Partial<Preset>) => {
    set({ isLoading: true, error: null });
    try {
      await updatePreset(id, updates);
      
      // ローカル状態を更新
      const presets = get().presets.map(p =>
        p.id === id ? { ...p, ...updates } : p
      );
      set({ presets, isLoading: false });
      
      // 現在のプリセットも更新
      if (get().currentPreset?.id === id) {
        set({
          currentPreset: {
            ...get().currentPreset!,
            ...updates,
          },
        });
      }
    } catch (error) {
      set({
        error: 'プリセットの更新に失敗しました',
        isLoading: false,
      });
      console.error('Failed to update preset:', error);
      throw error;
    }
  },

  /**
   * プリセットを削除
   * 
   * **検証: 要件 2.4**
   */
  deletePresetById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePreset(id);
      
      // ローカル状態を更新
      const presets = get().presets.filter(p => p.id !== id);
      set({ presets, isLoading: false });
      
      // 現在のプリセットをクリア
      if (get().currentPreset?.id === id) {
        set({ currentPreset: null });
      }
    } catch (error) {
      set({
        error: 'プリセットの削除に失敗しました',
        isLoading: false,
      });
      console.error('Failed to delete preset:', error);
      throw error;
    }
  },

  /**
   * 名前でプリセットを検索
   */
  searchPresets: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const presets = await searchPresetsByName(name);
      set({ presets, isLoading: false });
    } catch (error) {
      set({
        error: 'プリセットの検索に失敗しました',
        isLoading: false,
      });
      console.error('Failed to search presets:', error);
    }
  },

  /**
   * 現在のプリセットを設定
   */
  setCurrentPreset: (preset: Preset | null) => {
    set({ currentPreset: preset });
  },

  /**
   * エラーをクリア
   */
  clearError: () => {
    set({ error: null });
  },
}));
