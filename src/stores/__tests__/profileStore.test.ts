/**
 * profileStoreのユニットテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from '../profileStore';
import type { BodyProfile } from '@/types';
import * as profileDB from '@/services/db/profileDB';

// profileDBモジュールをモック
vi.mock('@/services/db/profileDB');

describe('profileStore', () => {
  const mockUserId = 'test-user-123';
  const mockProfile: BodyProfile = {
    userId: mockUserId,
    height: 175,
    weight: 70,
    weeklyFrequency: 3,
    goals: 'Build muscle',
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    // 各テスト前にストアをリセット
    useProfileStore.setState({
      profile: null,
      isLoading: false,
      error: null,
    });
    
    // モックをクリア
    vi.clearAllMocks();
  });

  describe('loadProfile', () => {
    it('プロファイルを正常に読み込む', async () => {
      vi.mocked(profileDB.getProfile).mockResolvedValue(mockProfile);

      const store = useProfileStore.getState();
      await store.loadProfile(mockUserId);

      expect(store.profile).toEqual(mockProfile);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(profileDB.getProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('プロファイルが存在しない場合はnullを設定', async () => {
      vi.mocked(profileDB.getProfile).mockResolvedValue(undefined);

      const store = useProfileStore.getState();
      await store.loadProfile(mockUserId);

      expect(useProfileStore.getState().profile).toBeNull();
      expect(useProfileStore.getState().isLoading).toBe(false);
    });

    it('読み込みエラーを処理', async () => {
      const error = new Error('Database error');
      vi.mocked(profileDB.getProfile).mockRejectedValue(error);

      const store = useProfileStore.getState();
      await store.loadProfile(mockUserId);

      expect(useProfileStore.getState().error).toBe('プロファイルの読み込みに失敗しました');
      expect(useProfileStore.getState().isLoading).toBe(false);
    });
  });

  describe('createProfile', () => {
    it('有効なプロファイルを作成', async () => {
      vi.mocked(profileDB.saveProfile).mockResolvedValue(mockUserId);

      const store = useProfileStore.getState();
      const userId = await store.createProfile(mockProfile);

      expect(userId).toBe(mockUserId);
      expect(useProfileStore.getState().profile).toEqual(mockProfile);
      expect(useProfileStore.getState().isLoading).toBe(false);
      expect(profileDB.saveProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('無効な身長でバリデーションエラー', async () => {
      const invalidProfile: BodyProfile = {
        ...mockProfile,
        height: 50, // 100cm未満
      };

      const store = useProfileStore.getState();
      
      await expect(store.createProfile(invalidProfile)).rejects.toThrow();
      expect(useProfileStore.getState().error).toContain('身長');
      expect(profileDB.saveProfile).not.toHaveBeenCalled();
    });

    it('無効な体重でバリデーションエラー', async () => {
      const invalidProfile: BodyProfile = {
        ...mockProfile,
        weight: 350, // 300kgを超える
      };

      const store = useProfileStore.getState();
      
      await expect(store.createProfile(invalidProfile)).rejects.toThrow();
      expect(useProfileStore.getState().error).toContain('体重');
      expect(profileDB.saveProfile).not.toHaveBeenCalled();
    });

    it('無効な週頻度でバリデーションエラー', async () => {
      const invalidProfile: BodyProfile = {
        ...mockProfile,
        weeklyFrequency: -1, // 負の数
      };

      const store = useProfileStore.getState();
      
      await expect(store.createProfile(invalidProfile)).rejects.toThrow();
      expect(useProfileStore.getState().error).toContain('週あたりのトレーニング頻度');
      expect(profileDB.saveProfile).not.toHaveBeenCalled();
    });

    it('保存エラーを処理', async () => {
      const error = new Error('Storage error');
      vi.mocked(profileDB.saveProfile).mockRejectedValue(error);

      const store = useProfileStore.getState();
      
      await expect(store.createProfile(mockProfile)).rejects.toThrow();
      expect(useProfileStore.getState().error).toBe('プロファイルの保存に失敗しました');
    });
  });

  describe('updateProfileById', () => {
    beforeEach(() => {
      // 既存のプロファイルを設定
      useProfileStore.setState({ profile: mockProfile });
    });

    it('プロファイルを正常に更新', async () => {
      const updates = { weight: 72, weeklyFrequency: 4 };
      vi.mocked(profileDB.updateProfile).mockResolvedValue();

      const store = useProfileStore.getState();
      await store.updateProfileById(mockUserId, updates);

      const updatedProfile = useProfileStore.getState().profile;
      expect(updatedProfile?.weight).toBe(72);
      expect(updatedProfile?.weeklyFrequency).toBe(4);
      expect(updatedProfile?.height).toBe(mockProfile.height); // 他のフィールドは保持
      expect(profileDB.updateProfile).toHaveBeenCalledWith(mockUserId, updates);
    });

    it('無効な更新でバリデーションエラー', async () => {
      const invalidUpdates = { height: 300 }; // 250cmを超える

      const store = useProfileStore.getState();
      
      await expect(store.updateProfileById(mockUserId, invalidUpdates)).rejects.toThrow();
      expect(useProfileStore.getState().error).toContain('身長');
      expect(profileDB.updateProfile).not.toHaveBeenCalled();
    });

    it('プロファイルが存在しない場合は再読み込み', async () => {
      useProfileStore.setState({ profile: null });
      
      const updates = { weight: 72 };
      vi.mocked(profileDB.updateProfile).mockResolvedValue();
      vi.mocked(profileDB.getProfile).mockResolvedValue({
        ...mockProfile,
        ...updates,
      });

      const store = useProfileStore.getState();
      await store.updateProfileById(mockUserId, updates);

      expect(profileDB.getProfile).toHaveBeenCalledWith(mockUserId);
      expect(useProfileStore.getState().profile?.weight).toBe(72);
    });

    it('更新エラーを処理', async () => {
      const error = new Error('Update error');
      vi.mocked(profileDB.updateProfile).mockRejectedValue(error);

      const store = useProfileStore.getState();
      
      await expect(store.updateProfileById(mockUserId, { weight: 72 })).rejects.toThrow();
      expect(useProfileStore.getState().error).toBe('プロファイルの更新に失敗しました');
    });
  });

  describe('deleteProfileById', () => {
    beforeEach(() => {
      useProfileStore.setState({ profile: mockProfile });
    });

    it('プロファイルを正常に削除', async () => {
      vi.mocked(profileDB.deleteProfile).mockResolvedValue();

      const store = useProfileStore.getState();
      await store.deleteProfileById(mockUserId);

      expect(useProfileStore.getState().profile).toBeNull();
      expect(useProfileStore.getState().isLoading).toBe(false);
      expect(profileDB.deleteProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('削除エラーを処理', async () => {
      const error = new Error('Delete error');
      vi.mocked(profileDB.deleteProfile).mockRejectedValue(error);

      const store = useProfileStore.getState();
      
      await expect(store.deleteProfileById(mockUserId)).rejects.toThrow();
      expect(useProfileStore.getState().error).toBe('プロファイルの削除に失敗しました');
    });
  });

  describe('setProfile', () => {
    it('プロファイルを直接設定', () => {
      const store = useProfileStore.getState();
      store.setProfile(mockProfile);

      expect(useProfileStore.getState().profile).toEqual(mockProfile);
    });

    it('プロファイルをnullに設定', () => {
      useProfileStore.setState({ profile: mockProfile });
      
      const store = useProfileStore.getState();
      store.setProfile(null);

      expect(useProfileStore.getState().profile).toBeNull();
    });
  });

  describe('clearError', () => {
    it('エラーをクリア', () => {
      useProfileStore.setState({ error: 'Some error' });
      
      const store = useProfileStore.getState();
      store.clearError();

      expect(useProfileStore.getState().error).toBeNull();
    });
  });
});
