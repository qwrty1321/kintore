/**
 * ProfileForm コンポーネントのテスト
 * 
 * **要件: 5.1、5.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from './ProfileForm';
import { useProfileStore } from '@/stores/profileStore';
import type { BodyProfile } from '@/types';

// Zustand storeをモック
vi.mock('@/stores/profileStore');

describe('ProfileForm', () => {
  const mockCreateProfile = vi.fn();
  const mockUpdateProfileById = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // storeのモック設定
    (useProfileStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      createProfile: mockCreateProfile,
      updateProfileById: mockUpdateProfileById,
      clearError: mockClearError,
      isLoading: false,
      error: null,
    });
  });

  describe('レンダリング', () => {
    it('新規作成モードで正しくレンダリングされる', () => {
      render(<ProfileForm />);

      expect(screen.getByText('プロファイルを作成')).toBeInTheDocument();
      expect(screen.getByLabelText(/身長/)).toBeInTheDocument();
      expect(screen.getByLabelText(/体重/)).toBeInTheDocument();
      expect(screen.getByLabelText(/週あたりのトレーニング頻度/)).toBeInTheDocument();
      expect(screen.getByLabelText(/目標/)).toBeInTheDocument();
    });

    it('編集モードで既存のプロファイルが表示される', () => {
      const profile: BodyProfile = {
        userId: 'test-user',
        height: 175,
        weight: 70,
        weeklyFrequency: 3,
        goals: 'テスト目標',
        updatedAt: new Date(),
      };

      render(<ProfileForm profile={profile} />);

      expect(screen.getByText('プロファイルを編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('175')).toBeInTheDocument();
      expect(screen.getByDisplayValue('70')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('テスト目標')).toBeInTheDocument();
    });
  });

  describe('バリデーション - 要件5.3', () => {
    it('身長が範囲外の場合、エラーメッセージを表示する', async () => {
      render(<ProfileForm />);

      const heightInput = screen.getByLabelText(/身長/);
      fireEvent.change(heightInput, { target: { value: '50' } });

      await waitFor(() => {
        expect(screen.getByText(/身長は100cm以上である必要があります/)).toBeInTheDocument();
      });
    });

    it('体重が範囲外の場合、エラーメッセージを表示する', async () => {
      render(<ProfileForm />);

      const weightInput = screen.getByLabelText(/体重/);
      fireEvent.change(weightInput, { target: { value: '400' } });

      await waitFor(() => {
        expect(screen.getByText(/体重は300kg以下である必要があります/)).toBeInTheDocument();
      });
    });

    it('週頻度が範囲外の場合、エラーメッセージを表示する', async () => {
      render(<ProfileForm />);

      const frequencyInput = screen.getByLabelText(/週あたりのトレーニング頻度/);
      fireEvent.change(frequencyInput, { target: { value: '20' } });

      await waitFor(() => {
        expect(screen.getByText(/週あたりのトレーニング頻度は14回以下である必要があります/)).toBeInTheDocument();
      });
    });

    it('必須フィールドが空の場合、送信時にエラーを表示する', async () => {
      render(<ProfileForm />);

      const submitButton = screen.getByRole('button', { name: /保存/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/身長は必須です/)).toBeInTheDocument();
        expect(screen.getByText(/体重は必須です/)).toBeInTheDocument();
        expect(screen.getByText(/週あたりのトレーニング頻度は必須です/)).toBeInTheDocument();
      });

      expect(mockCreateProfile).not.toHaveBeenCalled();
    });
  });

  describe('フォーム送信 - 要件5.1', () => {
    it('有効なデータで新規プロファイルを作成できる', async () => {
      mockCreateProfile.mockResolvedValue('test-user-id');
      const onSuccess = vi.fn();

      render(<ProfileForm onSuccess={onSuccess} />);

      // フォームに入力
      fireEvent.change(screen.getByLabelText(/身長/), { target: { value: '175' } });
      fireEvent.change(screen.getByLabelText(/体重/), { target: { value: '70' } });
      fireEvent.change(screen.getByLabelText(/週あたりのトレーニング頻度/), { target: { value: '3' } });

      // 送信
      const submitButton = screen.getByRole('button', { name: /保存/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            height: 175,
            weight: 70,
            weeklyFrequency: 3,
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('既存のプロファイルを更新できる', async () => {
      mockUpdateProfileById.mockResolvedValue(undefined);
      const onSuccess = vi.fn();

      const profile: BodyProfile = {
        userId: 'test-user',
        height: 170,
        weight: 65,
        weeklyFrequency: 2,
        updatedAt: new Date(),
      };

      render(<ProfileForm profile={profile} onSuccess={onSuccess} />);

      // 値を変更
      fireEvent.change(screen.getByLabelText(/身長/), { target: { value: '175' } });
      fireEvent.change(screen.getByLabelText(/体重/), { target: { value: '70' } });

      // 送信
      const submitButton = screen.getByRole('button', { name: /保存/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProfileById).toHaveBeenCalledWith(
          'test-user',
          expect.objectContaining({
            height: 175,
            weight: 70,
            weeklyFrequency: 2,
          })
        );
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('キャンセル機能', () => {
    it('キャンセルボタンをクリックするとonCancelが呼ばれる', () => {
      const onCancel = vi.fn();

      render(<ProfileForm onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はボタンが無効化される', () => {
      (useProfileStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        createProfile: mockCreateProfile,
        updateProfileById: mockUpdateProfileById,
        clearError: mockClearError,
        isLoading: true,
        error: null,
      });

      render(<ProfileForm onCancel={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /保存/ });
      const cancelButton = screen.getByRole('button', { name: /キャンセル/ });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
});
