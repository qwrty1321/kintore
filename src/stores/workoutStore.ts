/**
 * トレーニング記録の状態管理 - Zustand Store
 * 
 * **要件: 1.1、1.2、4.3、4.4**
 */

import { create } from 'zustand';
import type { WorkoutRecord, WorkoutFilter } from '@/types';
import {
  saveWorkout,
  getWorkout,
  getAllWorkouts,
  getFilteredWorkouts,
  updateWorkout,
  deleteWorkout,
} from '@/services/db/workoutDB';
import { validateWorkoutRecord } from '@/utils/validation';

interface WorkoutState {
  // 状態
  workouts: WorkoutRecord[];
  currentWorkout: WorkoutRecord | null;
  filter: WorkoutFilter;
  isLoading: boolean;
  error: string | null;

  // アクション
  loadWorkouts: () => Promise<void>;
  loadWorkout: (id: string) => Promise<void>;
  createWorkout: (workout: WorkoutRecord) => Promise<string>;
  updateWorkoutById: (id: string, updates: Partial<WorkoutRecord>) => Promise<void>;
  deleteWorkoutById: (id: string) => Promise<void>;
  setFilter: (filter: WorkoutFilter) => void;
  applyFilter: () => Promise<void>;
  clearFilter: () => Promise<void>;
  setCurrentWorkout: (workout: WorkoutRecord | null) => void;
  clearError: () => void;
}

/**
 * トレーニング記録のZustand Store
 */
export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // 初期状態
  workouts: [],
  currentWorkout: null,
  filter: {},
  isLoading: false,
  error: null,

  /**
   * すべてのトレーニング記録を読み込む
   */
  loadWorkouts: async () => {
    set({ isLoading: true, error: null });
    try {
      const workouts = await getAllWorkouts();
      set({ workouts, isLoading: false });
    } catch (error) {
      set({
        error: 'トレーニング記録の読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load workouts:', error);
    }
  },

  /**
   * 特定のトレーニング記録を読み込む
   */
  loadWorkout: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const workout = await getWorkout(id);
      set({ currentWorkout: workout || null, isLoading: false });
    } catch (error) {
      set({
        error: 'トレーニング記録の読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load workout:', error);
    }
  },

  /**
   * 新しいトレーニング記録を作成
   * 
   * **検証: 要件 1.1、1.2、1.3**
   */
  createWorkout: async (workout: WorkoutRecord) => {
    set({ isLoading: true, error: null });
    
    // バリデーション
    const validation = validateWorkoutRecord(workout);
    if (!validation.valid) {
      const errorMessage = validation.errors.map(e => e.message).join(', ');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
    
    try {
      const id = await saveWorkout(workout);
      
      // ローカル状態を更新
      const workouts = [...get().workouts, workout];
      set({ workouts, isLoading: false });
      
      return id;
    } catch (error) {
      set({
        error: 'トレーニング記録の保存に失敗しました',
        isLoading: false,
      });
      console.error('Failed to create workout:', error);
      throw error;
    }
  },

  /**
   * トレーニング記録を更新
   */
  updateWorkoutById: async (id: string, updates: Partial<WorkoutRecord>) => {
    set({ isLoading: true, error: null });
    try {
      await updateWorkout(id, updates);
      
      // ローカル状態を更新
      const workouts = get().workouts.map(w =>
        w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
      );
      set({ workouts, isLoading: false });
      
      // 現在の記録も更新
      if (get().currentWorkout?.id === id) {
        set({
          currentWorkout: {
            ...get().currentWorkout!,
            ...updates,
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      set({
        error: 'トレーニング記録の更新に失敗しました',
        isLoading: false,
      });
      console.error('Failed to update workout:', error);
      throw error;
    }
  },

  /**
   * トレーニング記録を削除
   */
  deleteWorkoutById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteWorkout(id);
      
      // ローカル状態を更新
      const workouts = get().workouts.filter(w => w.id !== id);
      set({ workouts, isLoading: false });
      
      // 現在の記録をクリア
      if (get().currentWorkout?.id === id) {
        set({ currentWorkout: null });
      }
    } catch (error) {
      set({
        error: 'トレーニング記録の削除に失敗しました',
        isLoading: false,
      });
      console.error('Failed to delete workout:', error);
      throw error;
    }
  },

  /**
   * フィルター条件を設定
   * 
   * **検証: 要件 4.3、4.4**
   */
  setFilter: (filter: WorkoutFilter) => {
    set({ filter });
  },

  /**
   * フィルターを適用してトレーニング記録を取得
   * 
   * **検証: 要件 4.3、4.4**
   */
  applyFilter: async () => {
    set({ isLoading: true, error: null });
    try {
      const filter = get().filter;
      const workouts = await getFilteredWorkouts(filter);
      set({ workouts, isLoading: false });
    } catch (error) {
      set({
        error: 'フィルタリングに失敗しました',
        isLoading: false,
      });
      console.error('Failed to apply filter:', error);
    }
  },

  /**
   * フィルターをクリアしてすべての記録を表示
   */
  clearFilter: async () => {
    set({ filter: {}, isLoading: true, error: null });
    try {
      const workouts = await getAllWorkouts();
      set({ workouts, isLoading: false });
    } catch (error) {
      set({
        error: 'トレーニング記録の読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to clear filter:', error);
    }
  },

  /**
   * 現在のトレーニング記録を設定
   */
  setCurrentWorkout: (workout: WorkoutRecord | null) => {
    set({ currentWorkout: workout });
  },

  /**
   * エラーをクリア
   */
  clearError: () => {
    set({ error: null });
  },
}));
