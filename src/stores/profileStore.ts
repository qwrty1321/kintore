/**
 * プロファイルの状態管理 - Zustand Store
 * 
 * **要件: 5.1、5.2**
 */

import { create } from 'zustand';
import type { BodyProfile } from '@/types';
import {
  saveProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} from '@/services/db/profileDB';
import { validateBodyProfile } from '@/utils/validation';

interface ProfileState {
  // 状態
  profile: BodyProfile | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  loadProfile: (userId: string) => Promise<void>;
  createProfile: (profile: BodyProfile) => Promise<string>;
  updateProfileById: (userId: string, updates: Partial<BodyProfile>) => Promise<void>;
  deleteProfileById: (userId: string) => Promise<void>;
  setProfile: (profile: BodyProfile | null) => void;
  clearError: () => void;
}

/**
 * プロファイルのZustand Store
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  // 初期状態
  profile: null,
  isLoading: false,
  error: null,

  /**
   * プロファイルを読み込む
   */
  loadProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getProfile(userId);
      set({ profile: profile || null, isLoading: false });
    } catch (error) {
      set({
        error: 'プロファイルの読み込みに失敗しました',
        isLoading: false,
      });
      console.error('Failed to load profile:', error);
    }
  },

  /**
   * 新しいプロファイルを作成
   * 
   * **検証: 要件 5.1、5.3**
   */
  createProfile: async (profile: BodyProfile) => {
    set({ isLoading: true, error: null });
    
    // バリデーション
    const validation = validateBodyProfile(profile);
    if (!validation.valid) {
      const errorMessage = validation.errors.map(e => e.message).join(', ');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
    
    try {
      const userId = await saveProfile(profile);
      
      // ローカル状態を更新
      set({ profile, isLoading: false });
      
      return userId;
    } catch (error) {
      set({
        error: 'プロファイルの保存に失敗しました',
        isLoading: false,
      });
      console.error('Failed to create profile:', error);
      throw error;
    }
  },

  /**
   * プロファイルを更新
   * 
   * **検証: 要件 5.2、5.3**
   */
  updateProfileById: async (userId: string, updates: Partial<BodyProfile>) => {
    set({ isLoading: true, error: null });
    
    // 更新後のプロファイルを構築してバリデーション
    const currentProfile = get().profile;
    const updatedProfile = currentProfile 
      ? { ...currentProfile, ...updates }
      : updates as BodyProfile;
    
    const validation = validateBodyProfile(updatedProfile);
    if (!validation.valid) {
      const errorMessage = validation.errors.map(e => e.message).join(', ');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
    
    try {
      await updateProfile(userId, updates);
      
      // ローカル状態を更新
      if (currentProfile) {
        set({
          profile: {
            ...currentProfile,
            ...updates,
            updatedAt: new Date(),
          },
          isLoading: false,
        });
      } else {
        // プロファイルが存在しない場合は再読み込み
        const profile = await getProfile(userId);
        set({ profile: profile || null, isLoading: false });
      }
    } catch (error) {
      set({
        error: 'プロファイルの更新に失敗しました',
        isLoading: false,
      });
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * プロファイルを削除
   */
  deleteProfileById: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProfile(userId);
      
      // ローカル状態をクリア
      set({ profile: null, isLoading: false });
    } catch (error) {
      set({
        error: 'プロファイルの削除に失敗しました',
        isLoading: false,
      });
      console.error('Failed to delete profile:', error);
      throw error;
    }
  },

  /**
   * プロファイルを設定
   */
  setProfile: (profile: BodyProfile | null) => {
    set({ profile });
  },

  /**
   * エラーをクリア
   */
  clearError: () => {
    set({ error: null });
  },
}));
