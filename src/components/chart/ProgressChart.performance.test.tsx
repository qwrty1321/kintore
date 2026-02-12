/**
 * ProgressChartコンポーネントのパフォーマンステスト
 * 
 * **検証: 要件 4.5**
 * グラフは1秒以内にレンダリングを完了する必要がある
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressChart } from './ProgressChart';
import type { WorkoutRecord, ChartAxis } from '@/types';

// Chart.jsのモック
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="chart-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

/**
 * テスト用のワークアウトデータを生成
 */
function generateWorkoutData(count: number): WorkoutRecord[] {
  const workouts: WorkoutRecord[] = [];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    workouts.push({
      id: `workout-${i}`,
      userId: 'test-user',
      date,
      bodyPart: 'chest',
      exerciseName: 'ベンチプレス',
      sets: [
        { setNumber: 1, weight: 60 + (i % 20), reps: 10, completed: true },
        { setNumber: 2, weight: 65 + (i % 20), reps: 8, completed: true },
        { setNumber: 3, weight: 70 + (i % 20), reps: 6, completed: true },
      ],
      createdAt: date,
      updatedAt: date,
      syncStatus: 'synced',
    });
  }

  return workouts;
}

describe('ProgressChart - パフォーマンステスト', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // コンソール出力をキャプチャ
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('小規模データセット（50件）のレンダリングが1秒以内に完了する', () => {
    const workouts = generateWorkoutData(50);
    const mockOnAxisChange = vi.fn();

    const startTime = performance.now();
    
    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 1秒以内にレンダリングが完了することを確認
    expect(renderTime).toBeLessThan(1000);
    
    // チャートが表示されることを確認
    expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
  });

  it('中規模データセット（200件）のレンダリングが1秒以内に完了する', () => {
    const workouts = generateWorkoutData(200);
    const mockOnAxisChange = vi.fn();

    const startTime = performance.now();
    
    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 1秒以内にレンダリングが完了することを確認
    expect(renderTime).toBeLessThan(1000);
    
    // 最適化モードの情報が表示されることを確認
    expect(screen.getByText(/最適化モード/)).toBeInTheDocument();
    expect(screen.getByText(/200件のデータを表示中/)).toBeInTheDocument();
  });

  it('大規模データセット（500件）のレンダリングが1秒以内に完了する', () => {
    const workouts = generateWorkoutData(500);
    const mockOnAxisChange = vi.fn();

    const startTime = performance.now();
    
    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 1秒以内にレンダリングが完了することを確認
    expect(renderTime).toBeLessThan(1000);
    
    // 最適化モードの情報が表示されることを確認
    expect(screen.getByText(/最適化モード/)).toBeInTheDocument();
    expect(screen.getByText(/500件のデータを表示中/)).toBeInTheDocument();
  });

  it('超大規模データセット（1000件）のレンダリングが1秒以内に完了する', () => {
    const workouts = generateWorkoutData(1000);
    const mockOnAxisChange = vi.fn();

    const startTime = performance.now();
    
    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 1秒以内にレンダリングが完了することを確認
    expect(renderTime).toBeLessThan(1000);
    
    // 最適化モードの情報が表示されることを確認
    expect(screen.getByText(/最適化モード/)).toBeInTheDocument();
    expect(screen.getByText(/1000件のデータを表示中/)).toBeInTheDocument();
  });

  it('大規模データセット時にデータが間引かれる', () => {
    const workouts = generateWorkoutData(500);
    const mockOnAxisChange = vi.fn();

    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    // チャートデータを取得
    const chartDataElement = screen.getByTestId('chart-data');
    const chartData = JSON.parse(chartDataElement.textContent || '{}');

    // データポイント数が最大表示数以下であることを確認
    expect(chartData.datasets[0].data.length).toBeLessThanOrEqual(200);
    
    // 元のデータより少ないことを確認（間引きが行われている）
    expect(chartData.datasets[0].data.length).toBeLessThan(500);
  });

  it('大規模データセット時にアニメーションが無効化される', () => {
    const workouts = generateWorkoutData(200);
    const mockOnAxisChange = vi.fn();

    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    // チャートオプションを取得
    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    // アニメーションが無効化されていることを確認
    expect(chartOptions.animation).toBe(false);
  });

  it('小規模データセット時にアニメーションが有効である', () => {
    const workouts = generateWorkoutData(50);
    const mockOnAxisChange = vi.fn();

    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    // チャートオプションを取得
    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    // アニメーションが有効であることを確認
    expect(chartOptions.animation).toBeTruthy();
    expect(chartOptions.animation).not.toBe(false);
  });

  it('大規模データセット時にデシメーション機能が有効化される', () => {
    const workouts = generateWorkoutData(200);
    const mockOnAxisChange = vi.fn();

    render(
      <ProgressChart
        workouts={workouts}
        axis="weight"
        onAxisChange={mockOnAxisChange}
      />
    );

    // チャートオプションを取得
    const chartOptionsElement = screen.getByTestId('chart-options');
    const chartOptions = JSON.parse(chartOptionsElement.textContent || '{}');

    // デシメーション機能が有効であることを確認
    expect(chartOptions.plugins.decimation).toBeDefined();
    expect(chartOptions.plugins.decimation.enabled).toBe(true);
    expect(chartOptions.plugins.decimation.algorithm).toBe('lttb');
  });

  it('異なる軸でのレンダリングが1秒以内に完了する', () => {
    const workouts = generateWorkoutData(300);
    const mockOnAxisChange = vi.fn();
    const axes: ChartAxis[] = ['weight', 'reps', 'sets', 'frequency'];

    axes.forEach((axis) => {
      const startTime = performance.now();
      
      const { unmount } = render(
        <ProgressChart
          workouts={workouts}
          axis={axis}
          onAxisChange={mockOnAxisChange}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 1秒以内にレンダリングが完了することを確認
      expect(renderTime).toBeLessThan(1000);
      
      unmount();
    });
  });
});
