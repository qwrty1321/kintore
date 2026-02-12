/**
 * ChartFiltersコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartFilters } from './ChartFilters';
import type { WorkoutFilter } from '@/types';

describe('ChartFilters', () => {
  const mockOnFilterChange = vi.fn();
  const availableExercises = ['ベンチプレス', 'スクワット', 'デッドリフト'];

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('初期状態で正しくレンダリングされる', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    expect(screen.getByText('フィルター')).toBeInTheDocument();
    expect(screen.getByLabelText('部位')).toBeInTheDocument();
    expect(screen.getByLabelText('トレーニング方法')).toBeInTheDocument();
    expect(screen.getByLabelText('開始日')).toBeInTheDocument();
    expect(screen.getByLabelText('終了日')).toBeInTheDocument();
  });

  it('部位フィルターを選択できる', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    const bodyPartSelect = screen.getByLabelText('部位') as HTMLSelectElement;
    fireEvent.change(bodyPartSelect, { target: { value: 'chest' } });

    expect(bodyPartSelect.value).toBe('chest');
  });

  it('トレーニング方法フィルターを選択できる', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    const exerciseSelect = screen.getByLabelText('トレーニング方法') as HTMLSelectElement;
    fireEvent.change(exerciseSelect, { target: { value: 'ベンチプレス' } });

    expect(exerciseSelect.value).toBe('ベンチプレス');
  });

  it('日付範囲を入力できる', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

    expect(startDateInput.value).toBe('2024-01-01');
    expect(endDateInput.value).toBe('2024-12-31');
  });

  it('フィルターを適用するとコールバックが呼ばれる', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    // 部位を選択
    const bodyPartSelect = screen.getByLabelText('部位');
    fireEvent.change(bodyPartSelect, { target: { value: 'chest' } });

    // 適用ボタンをクリック
    const applyButton = screen.getByText('フィルターを適用');
    fireEvent.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      bodyPart: 'chest',
    });
  });

  it('複数のフィルターを同時に適用できる', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    // 部位を選択
    fireEvent.change(screen.getByLabelText('部位'), {
      target: { value: 'chest' },
    });

    // トレーニング方法を選択
    fireEvent.change(screen.getByLabelText('トレーニング方法'), {
      target: { value: 'ベンチプレス' },
    });

    // 日付範囲を入力
    fireEvent.change(screen.getByLabelText('開始日'), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText('終了日'), {
      target: { value: '2024-12-31' },
    });

    // 適用ボタンをクリック
    fireEvent.click(screen.getByText('フィルターを適用'));

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
    });
  });

  it('フィルターをクリアできる', () => {
    const initialFilter: WorkoutFilter = {
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
    };

    render(
      <ChartFilters
        filter={initialFilter}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    // クリアボタンをクリック
    const clearButton = screen.getByText('クリア');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });

  it('フィルターが適用されていない場合、クリアボタンは表示されない', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    expect(screen.queryByText('クリア')).not.toBeInTheDocument();
  });

  it('利用可能なトレーニング方法がない場合、トレーニング方法フィルターは表示されない', () => {
    render(
      <ChartFilters
        filter={{}}
        onFilterChange={mockOnFilterChange}
        availableExercises={[]}
      />
    );

    expect(screen.queryByLabelText('トレーニング方法')).not.toBeInTheDocument();
  });

  it('初期フィルター値が正しく反映される', () => {
    const initialFilter: WorkoutFilter = {
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
    };

    render(
      <ChartFilters
        filter={initialFilter}
        onFilterChange={mockOnFilterChange}
        availableExercises={availableExercises}
      />
    );

    expect((screen.getByLabelText('部位') as HTMLSelectElement).value).toBe('chest');
    expect((screen.getByLabelText('トレーニング方法') as HTMLSelectElement).value).toBe('ベンチプレス');
    expect((screen.getByLabelText('開始日') as HTMLInputElement).value).toBe('2024-01-01');
    expect((screen.getByLabelText('終了日') as HTMLInputElement).value).toBe('2024-12-31');
  });
});
