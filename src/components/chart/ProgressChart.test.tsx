/**
 * ProgressChartコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressChart } from './ProgressChart';
import type { WorkoutRecord } from '@/types';

describe('ProgressChart', () => {
  const mockWorkouts: WorkoutRecord[] = [
    {
      id: '1',
      userId: 'user1',
      date: new Date('2024-01-01'),
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 60, reps: 10, completed: true },
        { setNumber: 2, weight: 70, reps: 8, completed: true },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      syncStatus: 'synced',
    },
    {
      id: '2',
      userId: 'user1',
      date: new Date('2024-01-03'),
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 65, reps: 10, completed: true },
        { setNumber: 2, weight: 75, reps: 8, completed: true },
      ],
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      syncStatus: 'synced',
    },
  ];

  const mockOnAxisChange = vi.fn();

  it('空のデータで空の状態を表示する', () => {
    render(
      <ProgressChart
        workouts={[]}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
    expect(screen.getByText('トレーニング記録を追加してください')).toBeInTheDocument();
  });

  it('軸選択ボタンを表示する', () => {
    render(
      <ProgressChart
        workouts={mockWorkouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    expect(screen.getByRole('button', { name: '重量 (kg)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '回数' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'セット数' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'トレーニング頻度' })).toBeInTheDocument();
  });

  it('選択された軸のボタンがアクティブになる', () => {
    render(
      <ProgressChart
        workouts={mockWorkouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    const weightButton = screen.getByRole('button', { name: '重量 (kg)' });
    expect(weightButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('データがある場合はチャートを表示する', () => {
    const { container } = render(
      <ProgressChart
        workouts={mockWorkouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    // Chart.jsのcanvas要素が存在することを確認
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
