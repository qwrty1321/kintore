/**
 * PresetSelector - ユニットテスト
 * 
 * テスト対象:
 * - プリセット一覧の表示
 * - プリセット選択機能
 * - フィルタリング機能
 * - 検索機能
 * - エラーハンドリング
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetSelector } from './PresetSelector';
import { usePresetStore } from '@/stores/presetStore';
import type { Preset } from '@/types';

// ============================================
// モック
// ============================================

vi.mock('@/stores/presetStore');

const mockPresets: Preset[] = [
  {
    id: '1',
    name: 'ベンチプレス基本',
    bodyPart: 'chest',
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 60, reps: 10 },
      { setNumber: 2, weight: 70, reps: 8 },
      { setNumber: 3, weight: 80, reps: 6 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'スクワット基本',
    bodyPart: 'legs',
    exerciseName: 'スクワット',
    sets: [
      { setNumber: 1, weight: 80, reps: 10 },
      { setNumber: 2, weight: 90, reps: 8 },
      { setNumber: 3, weight: 100, reps: 6 },
    ],
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'デッドリフト基本',
    bodyPart: 'back',
    exerciseName: 'デッドリフト',
    sets: [
      { setNumber: 1, weight: 100, reps: 8 },
      { setNumber: 2, weight: 110, reps: 6 },
      { setNumber: 3, weight: 120, reps: 4 },
    ],
    createdAt: new Date('2024-01-03'),
  },
];

// ============================================
// テスト
// ============================================

describe('PresetSelector', () => {
  const mockOnSelect = vi.fn();
  const mockLoadPresets = vi.fn();
  const mockLoadPresetsByBodyPart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    vi.mocked(usePresetStore).mockReturnValue({
      presets: mockPresets,
      currentPreset: null,
      isLoading: false,
      error: null,
      loadPresets: mockLoadPresets,
      loadPreset: vi.fn(),
      loadPresetsByBodyPart: mockLoadPresetsByBodyPart,
      createPreset: vi.fn(),
      createPresetFromWorkout: vi.fn(),
      updatePresetById: vi.fn(),
      deletePresetById: vi.fn(),
      searchPresets: vi.fn(),
      setCurrentPreset: vi.fn(),
      clearError: vi.fn(),
    });
  });

  describe('基本表示', () => {
    it('プリセット一覧が表示される', async () => {
      render(<PresetSelector onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('ベンチプレス基本')).toBeInTheDocument();
        expect(screen.getByText('スクワット基本')).toBeInTheDocument();
        expect(screen.getByText('デッドリフト基本')).toBeInTheDocument();
      });
    });

    it('初回読み込み時にloadPresetsが呼ばれる', () => {
      render(<PresetSelector onSelect={mockOnSelect} />);

      expect(mockLoadPresets).toHaveBeenCalledTimes(1);
    });

    it('currentBodyPartが指定されている場合、そのフィルターで読み込む', () => {
      render(<PresetSelector onSelect={mockOnSelect} currentBodyPart="chest" />);

      expect(mockLoadPresetsByBodyPart).toHaveBeenCalledWith('chest');
    });

    it('プリセット数が表示される', async () => {
      render(<PresetSelector onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('3件のプリセット')).toBeInTheDocument();
      });
    });
  });

  describe('プリセット選択', () => {
    it('プリセットをクリックするとonSelectが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const presetButton = await screen.findByRole('button', {
        name: /ベンチプレス基本/,
      });
      await user.click(presetButton);

      expect(mockOnSelect).toHaveBeenCalledWith(mockPresets[0]);
    });

    it('選択されたプリセットに選択マークが表示される', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const presetButton = await screen.findByRole('button', {
        name: /ベンチプレス基本/,
      });
      await user.click(presetButton);

      await waitFor(() => {
        expect(within(presetButton).getByLabelText('選択中')).toBeInTheDocument();
      });
    });

    it('選択されたプリセットのaria-pressedがtrueになる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const presetButton = await screen.findByRole('button', {
        name: /ベンチプレス基本/,
      });
      await user.click(presetButton);

      await waitFor(() => {
        expect(presetButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('フィルタリング', () => {
    it('部位フィルターでプリセットが絞り込まれる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const bodyPartSelect = screen.getByLabelText('部位で絞り込み');
      await user.selectOptions(bodyPartSelect, 'chest');

      await waitFor(() => {
        expect(screen.getByText('ベンチプレス基本')).toBeInTheDocument();
        expect(screen.queryByText('スクワット基本')).not.toBeInTheDocument();
        expect(screen.queryByText('デッドリフト基本')).not.toBeInTheDocument();
      });
    });

    it('部位フィルター変更時にloadPresetsByBodyPartが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const bodyPartSelect = screen.getByLabelText('部位で絞り込み');
      await user.selectOptions(bodyPartSelect, 'legs');

      expect(mockLoadPresetsByBodyPart).toHaveBeenCalledWith('legs');
    });

    it('「すべての部位」を選択するとloadPresetsが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const bodyPartSelect = screen.getByLabelText('部位で絞り込み');
      await user.selectOptions(bodyPartSelect, 'chest');
      await user.selectOptions(bodyPartSelect, '');

      expect(mockLoadPresets).toHaveBeenCalledTimes(2); // 初回 + フィルタークリア
    });
  });

  describe('検索機能', () => {
    it('プリセット名で検索できる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      await user.type(searchInput, 'ベンチ');

      await waitFor(() => {
        expect(screen.getByText('ベンチプレス基本')).toBeInTheDocument();
        expect(screen.queryByText('スクワット基本')).not.toBeInTheDocument();
        expect(screen.queryByText('デッドリフト基本')).not.toBeInTheDocument();
      });
    });

    it('トレーニング方法名で検索できる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      await user.type(searchInput, 'スクワット');

      await waitFor(() => {
        expect(screen.getByText('スクワット基本')).toBeInTheDocument();
        expect(screen.queryByText('ベンチプレス基本')).not.toBeInTheDocument();
        expect(screen.queryByText('デッドリフト基本')).not.toBeInTheDocument();
      });
    });

    it('大文字小文字を区別せずに検索できる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      await user.type(searchInput, 'べんち');

      await waitFor(() => {
        expect(screen.getByText('ベンチプレス基本')).toBeInTheDocument();
      });
    });
  });

  describe('空の状態', () => {
    it('プリセットがない場合、空の状態メッセージが表示される', () => {
      vi.mocked(usePresetStore).mockReturnValue({
        presets: [],
        currentPreset: null,
        isLoading: false,
        error: null,
        loadPresets: mockLoadPresets,
        loadPreset: vi.fn(),
        loadPresetsByBodyPart: mockLoadPresetsByBodyPart,
        createPreset: vi.fn(),
        createPresetFromWorkout: vi.fn(),
        updatePresetById: vi.fn(),
        deletePresetById: vi.fn(),
        searchPresets: vi.fn(),
        setCurrentPreset: vi.fn(),
        clearError: vi.fn(),
      });

      render(<PresetSelector onSelect={mockOnSelect} />);

      expect(
        screen.getByText('プリセットがまだ保存されていません')
      ).toBeInTheDocument();
    });

    it('検索結果が0件の場合、適切なメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      await user.type(searchInput, '存在しないプリセット');

      await waitFor(() => {
        expect(
          screen.getByText('条件に一致するプリセットが見つかりません')
        ).toBeInTheDocument();
      });
    });

    it('フィルタークリアボタンが表示される', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      await user.type(searchInput, '存在しないプリセット');

      await waitFor(() => {
        expect(screen.getByText('フィルターをクリア')).toBeInTheDocument();
      });
    });

    it('フィルタークリアボタンをクリックすると検索とフィルターがリセットされる', async () => {
      const user = userEvent.setup();
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      await user.type(searchInput, '存在しないプリセット');

      const clearButton = await screen.findByText('フィルターをクリア');
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('ベンチプレス基本')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーが表示される', () => {
      vi.mocked(usePresetStore).mockReturnValue({
        presets: [],
        currentPreset: null,
        isLoading: true,
        error: null,
        loadPresets: mockLoadPresets,
        loadPreset: vi.fn(),
        loadPresetsByBodyPart: mockLoadPresetsByBodyPart,
        createPreset: vi.fn(),
        createPresetFromWorkout: vi.fn(),
        updatePresetById: vi.fn(),
        deletePresetById: vi.fn(),
        searchPresets: vi.fn(),
        setCurrentPreset: vi.fn(),
        clearError: vi.fn(),
      });

      render(<PresetSelector onSelect={mockOnSelect} />);

      expect(screen.getByLabelText('読み込み中')).toBeInTheDocument();
      expect(screen.getByText('プリセットを読み込んでいます...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('エラーがある場合、エラーメッセージが表示される', () => {
      const errorMessage = 'プリセットの読み込みに失敗しました';
      vi.mocked(usePresetStore).mockReturnValue({
        presets: [],
        currentPreset: null,
        isLoading: false,
        error: errorMessage,
        loadPresets: mockLoadPresets,
        loadPreset: vi.fn(),
        loadPresetsByBodyPart: mockLoadPresetsByBodyPart,
        createPreset: vi.fn(),
        createPresetFromWorkout: vi.fn(),
        updatePresetById: vi.fn(),
        deletePresetById: vi.fn(),
        searchPresets: vi.fn(),
        setCurrentPreset: vi.fn(),
        clearError: vi.fn(),
      });

      render(<PresetSelector onSelect={mockOnSelect} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('再読み込み')).toBeInTheDocument();
    });

    it('再読み込みボタンをクリックするとloadPresetsが呼ばれる', async () => {
      const user = userEvent.setup();
      vi.mocked(usePresetStore).mockReturnValue({
        presets: [],
        currentPreset: null,
        isLoading: false,
        error: 'エラー',
        loadPresets: mockLoadPresets,
        loadPreset: vi.fn(),
        loadPresetsByBodyPart: mockLoadPresetsByBodyPart,
        createPreset: vi.fn(),
        createPresetFromWorkout: vi.fn(),
        updatePresetById: vi.fn(),
        deletePresetById: vi.fn(),
        searchPresets: vi.fn(),
        setCurrentPreset: vi.fn(),
        clearError: vi.fn(),
      });

      render(<PresetSelector onSelect={mockOnSelect} />);

      const reloadButton = screen.getByText('再読み込み');
      await user.click(reloadButton);

      expect(mockLoadPresets).toHaveBeenCalled();
    });
  });

  describe('コンパクトモード', () => {
    it('compactモードではヘッダーが表示されない', () => {
      render(<PresetSelector onSelect={mockOnSelect} compact />);

      expect(screen.queryByText('プリセットから選択')).not.toBeInTheDocument();
    });

    it('compactモードではセット詳細が表示されない', async () => {
      render(<PresetSelector onSelect={mockOnSelect} compact />);

      await waitFor(() => {
        expect(screen.queryByText('60kg × 10回')).not.toBeInTheDocument();
      });
    });

    it('compactモードではフッターが表示されない', () => {
      render(<PresetSelector onSelect={mockOnSelect} compact />);

      expect(screen.queryByText(/件のプリセット/)).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('プリセットカードがボタンとして認識される', async () => {
      render(<PresetSelector onSelect={mockOnSelect} />);

      const buttons = await screen.findAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('検索入力にaria-labelが設定されている', () => {
      render(<PresetSelector onSelect={mockOnSelect} />);

      const searchInput = screen.getByLabelText('プリセット名で検索');
      expect(searchInput).toBeInTheDocument();
    });

    it('エラーメッセージにrole="alert"が設定されている', () => {
      vi.mocked(usePresetStore).mockReturnValue({
        presets: [],
        currentPreset: null,
        isLoading: false,
        error: 'エラー',
        loadPresets: mockLoadPresets,
        loadPreset: vi.fn(),
        loadPresetsByBodyPart: mockLoadPresetsByBodyPart,
        createPreset: vi.fn(),
        createPresetFromWorkout: vi.fn(),
        updatePresetById: vi.fn(),
        deletePresetById: vi.fn(),
        searchPresets: vi.fn(),
        setCurrentPreset: vi.fn(),
        clearError: vi.fn(),
      });

      render(<PresetSelector onSelect={mockOnSelect} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });
});
