/**
 * PresetManager テスト
 * 
 * 要件: 2.1、2.3、2.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetManager } from './PresetManager';
import { usePresetStore } from '@/stores/presetStore';
import type { Preset } from '@/types';

// モックデータ
const mockPresets: Preset[] = [
  {
    id: '1',
    name: '胸トレA',
    bodyPart: 'chest',
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 60, reps: 10 },
      { setNumber: 2, weight: 60, reps: 10 },
      { setNumber: 3, weight: 60, reps: 8 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '脚トレA',
    bodyPart: 'legs',
    exerciseName: 'スクワット',
    sets: [
      { setNumber: 1, weight: 80, reps: 12 },
      { setNumber: 2, weight: 80, reps: 12 },
    ],
    createdAt: new Date('2024-01-02'),
  },
];

// Zustandストアのモック
vi.mock('@/stores/presetStore', () => ({
  usePresetStore: vi.fn(),
}));

describe('PresetManager', () => {
  const mockLoadPresets = vi.fn();
  const mockCreatePreset = vi.fn();
  const mockUpdatePresetById = vi.fn();
  const mockDeletePresetById = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトのストア状態
    (usePresetStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      presets: mockPresets,
      isLoading: false,
      error: null,
      loadPresets: mockLoadPresets,
      createPreset: mockCreatePreset,
      updatePresetById: mockUpdatePresetById,
      deletePresetById: mockDeletePresetById,
      clearError: mockClearError,
    });
  });

  describe('レンダリング', () => {
    it('プリセット一覧が表示される', async () => {
      render(<PresetManager />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
        expect(screen.getByText('脚トレA')).toBeInTheDocument();
      });
    });

    it('プリセットがない場合、空状態が表示される', () => {
      (usePresetStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        presets: [],
        isLoading: false,
        error: null,
        loadPresets: mockLoadPresets,
        createPreset: mockCreatePreset,
        updatePresetById: mockUpdatePresetById,
        deletePresetById: mockDeletePresetById,
        clearError: mockClearError,
      });

      render(<PresetManager />);

      expect(screen.getByText('プリセットがまだ保存されていません')).toBeInTheDocument();
    });

    it('ローディング中はスピナーが表示される', () => {
      (usePresetStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        presets: [],
        isLoading: true,
        error: null,
        loadPresets: mockLoadPresets,
        createPreset: mockCreatePreset,
        updatePresetById: mockUpdatePresetById,
        deletePresetById: mockDeletePresetById,
        clearError: mockClearError,
      });

      render(<PresetManager />);

      expect(screen.getByText('プリセットを読み込んでいます...')).toBeInTheDocument();
    });

    it('エラーがある場合、エラーメッセージが表示される', () => {
      (usePresetStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        presets: [],
        isLoading: false,
        error: 'プリセットの読み込みに失敗しました',
        loadPresets: mockLoadPresets,
        createPreset: mockCreatePreset,
        updatePresetById: mockUpdatePresetById,
        deletePresetById: mockDeletePresetById,
        clearError: mockClearError,
      });

      render(<PresetManager />);

      expect(screen.getByText('プリセットの読み込みに失敗しました')).toBeInTheDocument();
    });
  });

  describe('プリセット作成', () => {
    it('新規作成ボタンをクリックすると作成モーダルが開く', async () => {
      const user = userEvent.setup();
      render(<PresetManager />);

      const createButton = screen.getByText('+ 新規作成');
      await user.click(createButton);

      expect(screen.getByText('プリセット作成')).toBeInTheDocument();
    });

    it('フォームに入力して作成できる', async () => {
      const user = userEvent.setup();
      mockCreatePreset.mockResolvedValue('new-id');

      render(<PresetManager />);

      // モーダルを開く
      const createButton = screen.getByText('+ 新規作成');
      await user.click(createButton);

      // フォームに入力
      const nameInput = screen.getByLabelText(/プリセット名/);
      await user.type(nameInput, '背中トレA');

      const exerciseInput = screen.getByLabelText(/トレーニング方法/);
      await user.type(exerciseInput, 'デッドリフト');

      // セット情報を入力
      const weightInputs = screen.getAllByLabelText(/重量/);
      await user.clear(weightInputs[0]);
      await user.type(weightInputs[0], '100');

      const repsInputs = screen.getAllByLabelText(/回数/);
      await user.clear(repsInputs[0]);
      await user.type(repsInputs[0], '8');

      // 作成ボタンをクリック
      const submitButton = screen.getByRole('button', { name: '作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreatePreset).toHaveBeenCalled();
      });
    });
  });

  describe('プリセット編集', () => {
    it('編集ボタンをクリックすると編集モーダルが開く', async () => {
      const user = userEvent.setup();
      render(<PresetManager />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('編集');
      await user.click(editButtons[0]);

      expect(screen.getByText('プリセット編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('胸トレA')).toBeInTheDocument();
    });

    it('フォームを編集して更新できる', async () => {
      const user = userEvent.setup();
      mockUpdatePresetById.mockResolvedValue(undefined);

      render(<PresetManager />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
      });

      // 編集モーダルを開く
      const editButtons = screen.getAllByText('編集');
      await user.click(editButtons[0]);

      // 名前を変更
      const nameInput = screen.getByDisplayValue('胸トレA');
      await user.clear(nameInput);
      await user.type(nameInput, '胸トレB');

      // 更新ボタンをクリック
      const submitButton = screen.getByRole('button', { name: '更新' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdatePresetById).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ name: '胸トレB' })
        );
      });
    });
  });

  describe('プリセット削除', () => {
    it('削除ボタンをクリックすると確認モーダルが開く', async () => {
      const user = userEvent.setup();
      render(<PresetManager />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);

      expect(screen.getByText('プリセットを削除')).toBeInTheDocument();
      expect(screen.getByText(/本当に「胸トレA」を削除しますか/)).toBeInTheDocument();
    });

    it('確認後にプリセットを削除できる', async () => {
      const user = userEvent.setup();
      mockDeletePresetById.mockResolvedValue(undefined);

      render(<PresetManager />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
      });

      // 削除モーダルを開く
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);

      // 削除を確認
      const confirmButton = screen.getByRole('button', { name: '削除' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeletePresetById).toHaveBeenCalledWith('1');
      });
    });

    it('キャンセルボタンで削除をキャンセルできる', async () => {
      const user = userEvent.setup();
      render(<PresetManager />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
      });

      // 削除モーダルを開く
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);

      // キャンセル
      const cancelButton = screen.getAllByText('キャンセル')[0];
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockDeletePresetById).not.toHaveBeenCalled();
      });
    });
  });

  describe('プリセット選択', () => {
    it('onSelectコールバックが提供されている場合、使用ボタンが表示される', async () => {
      const mockOnSelect = vi.fn();
      render(<PresetManager onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getAllByText('使用')).toHaveLength(2);
      });
    });

    it('使用ボタンをクリックするとonSelectが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();
      render(<PresetManager onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('胸トレA')).toBeInTheDocument();
      });

      const useButtons = screen.getAllByText('使用');
      await user.click(useButtons[0]);

      expect(mockOnSelect).toHaveBeenCalledWith(mockPresets[0]);
    });
  });
});
