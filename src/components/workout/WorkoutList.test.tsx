/**
 * WorkoutList - ユニットテスト
 * 
 * 要件: 3.1、3.2、4.3、4.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkoutList } from './WorkoutList';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutRecord } from '@/types';

// モック
vi.mock('@/stores/workoutStore');

describe('WorkoutList', () => {
  const mockWorkouts: WorkoutRecord[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-15'),
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 80, reps: 10, completed: true },
        { setNumber: 2, weight: 80, reps: 8, completed: true },
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      syncStatus: 'synced',
    },
    {
      id: '2',
      userId: 'user1',
      date: new Date('2024-01-16'),
      bodyPart: 'back',
      exerciseName: 'デッドリフト',
      sets: [
        { setNumber: 1, weight: 100, reps: 5, completed: true },
      ],
      notes: 'フォームに注意',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      syncStatus: 'synced',
    },
  ];

  const mockStore = {
    workouts: mockWorkouts,
    filter: {},
    isLoading: false,
    error: null,
    loadWorkouts: vi.fn(),
    setFilter: vi.fn(),
    applyFilter: vi.fn(),
    clearFilter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStore);
  });

  describe('基本表示', () => {
    it('記録一覧が表示される', () => {
      render(<WorkoutList />);

      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
      expect(screen.getByText('デッドリフト')).toBeInTheDocument();
    });

    it('初回読み込み時にloadWorkoutsが呼ばれる', () => {
      render(<WorkoutList />);

      expect(mockStore.loadWorkouts).toHaveBeenCalledTimes(1);
    });

    it('記録がない場合、空の状態が表示される', () => {
      (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockStore,
        workouts: [],
      });

      render(<WorkoutList />);

      expect(screen.getByText('記録がありません')).toBeInTheDocument();
    });

    it('ローディング中はスピナーが表示される', () => {
      (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockStore,
        isLoading: true,
      });

      render(<WorkoutList />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('エラーがある場合、エラーメッセージが表示される', () => {
      const errorMessage = 'データの読み込みに失敗しました';
      (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockStore,
        error: errorMessage,
      });

      render(<WorkoutList />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('フィルタリング機能', () => {
    it('部位フィルターが変更できる', async () => {
      render(<WorkoutList />);

      const bodyPartSelect = screen.getByLabelText('部位');
      fireEvent.change(bodyPartSelect, { target: { value: 'chest' } });

      expect(bodyPartSelect).toHaveValue('chest');
    });

    it('トレーニング方法フィルターが変更できる', () => {
      render(<WorkoutList />);

      const exerciseInput = screen.getByLabelText('トレーニング方法');
      fireEvent.change(exerciseInput, { target: { value: 'ベンチプレス' } });

      expect(exerciseInput).toHaveValue('ベンチプレス');
    });

    it('フィルター適用ボタンをクリックするとapplyFilterが呼ばれる', () => {
      render(<WorkoutList />);

      const applyButton = screen.getByText('フィルター適用');
      fireEvent.click(applyButton);

      expect(mockStore.setFilter).toHaveBeenCalled();
      expect(mockStore.applyFilter).toHaveBeenCalled();
    });

    it('クリアボタンをクリックするとclearFilterが呼ばれる', () => {
      render(<WorkoutList />);

      const clearButton = screen.getByText('クリア');
      fireEvent.click(clearButton);

      expect(mockStore.clearFilter).toHaveBeenCalled();
    });
  });

  describe('記録操作', () => {
    it('詳細ボタンをクリックするとonSelectWorkoutが呼ばれる', () => {
      const onSelectWorkout = vi.fn();
      render(<WorkoutList onSelectWorkout={onSelectWorkout} />);

      const detailButtons = screen.getAllByText('詳細');
      fireEvent.click(detailButtons[0]);

      expect(onSelectWorkout).toHaveBeenCalledWith(mockWorkouts[0]);
    });

    it('コピーボタンをクリックするとonCopyWorkoutが呼ばれる', () => {
      const onCopyWorkout = vi.fn();
      render(<WorkoutList onCopyWorkout={onCopyWorkout} />);

      const copyButtons = screen.getAllByTitle('この記録をコピー');
      fireEvent.click(copyButtons[0]);

      expect(onCopyWorkout).toHaveBeenCalled();
      const copiedWorkout = onCopyWorkout.mock.calls[0][0];
      
      // コピーされた記録は新しいIDを持つ
      expect(copiedWorkout.id).not.toBe(mockWorkouts[0].id);
      
      // 日付は現在日時に設定される（要件 3.2）
      expect(copiedWorkout.date).toBeInstanceOf(Date);
      
      // 他のフィールドは元の記録と同じ
      expect(copiedWorkout.exerciseName).toBe(mockWorkouts[0].exerciseName);
      expect(copiedWorkout.bodyPart).toBe(mockWorkouts[0].bodyPart);
      expect(copiedWorkout.sets).toEqual(mockWorkouts[0].sets);
    });

    it('削除ボタンをクリックすると確認ダイアログが表示される', () => {
      const onDeleteWorkout = vi.fn();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<WorkoutList onDeleteWorkout={onDeleteWorkout} />);

      const deleteButtons = screen.getAllByTitle('削除');
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(onDeleteWorkout).toHaveBeenCalledWith('1');

      confirmSpy.mockRestore();
    });

    it('削除確認でキャンセルした場合、onDeleteWorkoutは呼ばれない', () => {
      const onDeleteWorkout = vi.fn();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(<WorkoutList onDeleteWorkout={onDeleteWorkout} />);

      const deleteButtons = screen.getAllByTitle('削除');
      fireEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(onDeleteWorkout).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('新規作成ボタンをクリックするとonCreateNewが呼ばれる', () => {
      const onCreateNew = vi.fn();
      render(<WorkoutList onCreateNew={onCreateNew} />);

      const createButton = screen.getByText('+ 新規作成');
      fireEvent.click(createButton);

      expect(onCreateNew).toHaveBeenCalled();
    });
  });

  describe('記録カードの表示', () => {
    it('セット数が正しく表示される', () => {
      render(<WorkoutList />);

      const setCountElements = screen.getAllByText('2');
      expect(setCountElements.length).toBeGreaterThan(0);
    });

    it('合計回数が正しく計算される', () => {
      render(<WorkoutList />);

      // ベンチプレス: 10 + 8 = 18回
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('合計重量が正しく計算される', () => {
      render(<WorkoutList />);

      // ベンチプレス: 80*10 + 80*8 = 1440kg
      expect(screen.getByText('1440.0 kg')).toBeInTheDocument();
    });

    it('メモがある場合、メモが表示される', () => {
      render(<WorkoutList />);

      expect(screen.getByText('フォームに注意')).toBeInTheDocument();
    });

    it('画像がある場合、画像インジケーターが表示される', () => {
      const workoutWithImages: WorkoutRecord = {
        ...mockWorkouts[0],
        images: ['img1', 'img2', 'img3'],
      };

      (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockStore,
        workouts: [workoutWithImages],
      });

      render(<WorkoutList />);

      expect(screen.getByText('3枚')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('エラーメッセージにrole="alert"が設定されている', () => {
      (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockStore,
        error: 'エラーが発生しました',
      });

      render(<WorkoutList />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
    });

    it('ローディングスピナーにaria-labelが設定されている', () => {
      (useWorkoutStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockStore,
        isLoading: true,
      });

      render(<WorkoutList />);

      const spinner = screen.getByLabelText('読み込み中');
      expect(spinner).toBeInTheDocument();
    });
  });
});
