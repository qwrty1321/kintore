/**
 * WorkoutCard - テスト
 * 
 * WorkoutCardコンポーネントの基本的な動作を検証
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkoutCard } from './WorkoutCard';
import type { WorkoutRecord } from '@/types';

// モックデータ
const mockWorkout: WorkoutRecord = {
  id: 'workout-1',
  userId: 'user-123',
  date: new Date('2024-01-15'),
  bodyPart: 'chest',
  exerciseName: 'ベンチプレス',
  sets: [
    { setNumber: 1, weight: 60, reps: 10, completed: true },
    { setNumber: 2, weight: 70, reps: 8, completed: true },
    { setNumber: 3, weight: 75, reps: 6, completed: true },
  ],
  notes: 'テストメモ',
  createdAt: new Date('2024-01-15T10:00:00'),
  updatedAt: new Date('2024-01-15T10:00:00'),
  syncStatus: 'synced',
};

describe('WorkoutCard', () => {
  it('トレーニング記録の基本情報を表示する', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    // トレーニング名
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument();

    // 部位
    expect(screen.getByText('胸')).toBeInTheDocument();

    // セット数
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('セット')).toBeInTheDocument();
  });

  it('セット詳細を表示する', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    // 各セットの情報
    expect(screen.getByText('60 kg')).toBeInTheDocument();
    expect(screen.getByText('10 回')).toBeInTheDocument();
    expect(screen.getByText('70 kg')).toBeInTheDocument();
    expect(screen.getByText('8 回')).toBeInTheDocument();
    expect(screen.getByText('75 kg')).toBeInTheDocument();
    expect(screen.getByText('6 回')).toBeInTheDocument();
  });

  it('メモを表示する', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    expect(screen.getByText('テストメモ')).toBeInTheDocument();
  });

  it('メモがない場合は表示しない', () => {
    const workoutWithoutNotes = { ...mockWorkout, notes: undefined };
    render(<WorkoutCard workout={workoutWithoutNotes} />);

    expect(screen.queryByText('メモ')).not.toBeInTheDocument();
  });

  it('統計情報を正しく計算して表示する', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    // 合計回数: 10 + 8 + 6 = 24
    expect(screen.getByText('24')).toBeInTheDocument();

    // 最大重量: 75kg
    expect(screen.getByText('75')).toBeInTheDocument();

    // 総負荷: 60*10 + 70*8 + 75*6 = 600 + 560 + 450 = 1610
    expect(screen.getByText('1610')).toBeInTheDocument();
  });

  it('編集ボタンがクリックされたときにコールバックを呼び出す', () => {
    const handleEdit = vi.fn();
    render(<WorkoutCard workout={mockWorkout} onEdit={handleEdit} />);

    const editButton = screen.getByTitle('編集');
    editButton.click();

    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('削除ボタンがクリックされたときにコールバックを呼び出す', () => {
    const handleDelete = vi.fn();
    render(<WorkoutCard workout={mockWorkout} onDelete={handleDelete} />);

    const deleteButton = screen.getByTitle('削除');
    deleteButton.click();

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('コピーボタンがクリックされたときにコールバックを呼び出す', () => {
    const handleCopy = vi.fn();
    render(<WorkoutCard workout={mockWorkout} onCopy={handleCopy} />);

    const copyButton = screen.getByTitle('この記録をコピー');
    copyButton.click();

    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  it('アクションボタンが提供されない場合は表示しない', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    expect(screen.queryByTitle('編集')).not.toBeInTheDocument();
    expect(screen.queryByTitle('削除')).not.toBeInTheDocument();
    expect(screen.queryByTitle('この記録をコピー')).not.toBeInTheDocument();
  });

  it('画像がない場合はギャラリーセクションを表示しない', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    expect(screen.queryByText(/画像/)).not.toBeInTheDocument();
  });

  it('日付を正しくフォーマットして表示する', () => {
    render(<WorkoutCard workout={mockWorkout} />);

    // 日本語の日付フォーマット
    expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument();
  });
});
