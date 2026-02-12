/**
 * ComparisonChartコンポーネントのテスト
 * 
 * **検証: 要件 7.1、7.3、7.4**
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonChart } from './ComparisonChart';
import type { ComparisonData } from '@/types';

// Chart.jsのモック
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="chart-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

/**
 * テスト用の比較データ
 */
const mockComparparisonData = {
  bodyPart: 'chest',
  exerciseName: 'ベンチプレス',
  statistics: {
    mean: 75.5,
    median: 72.0,
    percentile25: 60.0,
    percentile75: 85.0,
    percentile90: 95.0,
  },
  sampleSize: 50,
  timeRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31'),
  },
};

describe('ComparisonChart', () => {
  describe('要件7.1: 比較データの表示', () => {
    it('比較データが正しく表示される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
        />
      );

      // タイトルが表示される
      expect(screen.getByText(/ベンチプレス/)).toBeInTheDocument();
      expect(screen.getByText(/chest/)).toBeInTheDocument();

      // サンプル数が表示される
      expect(screen.getByText(/サンプル数: 50人/)).toBeInTheDocument();

      // チャートが表示される
      expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
    });

    it('期間情報が表示される', () => {
      render(
        <ComparisonChart
          onData={mockComparisonData}
          userValue={80}
        />
      );

      // 期間が表示される
      expect(screen.getByText(/期間:/)).toBeInTheDocument();
      expect(screen.getByText(/2024\/1\/1/)).toBeInTheDocument();
      expect(screen.getByText(/2024\/12\/31/)).toBeInTheDocument();
    });
  });

  describe('要件7.3: 統計情報の表示', () => {
    it('平均値が表示される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
        />
      );

      expect(screen.getByText('平均')).toBeInTheDocument();
      expect(screen.getByText('75.5 kg')).toBeInTheDocument();
    });

    it('中央値が表示される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
        />
      );

      expect(screen.getByText('中央値')).toBeInTheDocument();
      expect(screen.getByText('72.0 kg')).toBeInTheDocument();
    });

    it('ユーザーの値が表示される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
 userValue={80}
        />
      );

      expect(screen.getByText('あなた')).toBeInTheDocument();
      expect(screen.getByText('80.0 kg')).toBeInTheDocument();
    });

    it('チャートデータにすべての統計値が含まれる', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
        />
      );

      const chartDataElement = screen.getByTestId('chart-data');
      const chartData = JSON.parse(chartDataElement.textContent || '{}');

      // すべての統計値が含まれることを確認
      expect(rtData.datasets[0].data).toEqual([
        60.0,  // 25%ile
        72.0,  // 中央値
        75.5,  // 平均
        85.0,  // 75%ile
        95.0,  // 90%ile
        80,    // ユーザーの値
      ]);
    });
  });

  describe('要件7.4: データ不足時のメッセージ表示', () => {
    it('サンプル数が10人未満の場合、データ不足メッセージが表示される', () => {
      const insufficientData: ComparisonData = {
        ...mockComparisonData,
        sampleSize: 5,
      };

      render(
        <ComparisonChart
          comparisonData={insufficientData}
          userValue={80}
        />
      );

      // データ不足メッセージが表示される
      expet('データ不足')).toBeInTheDocument();
      expect(screen.getByText(/類似したユーザーのデータが不足しています/)).toBeInTheDocument();
      expect(screen.getByText(/10人以上のデータが必要です/)).toBeInTheDocument();

      // 現在のサンプル数が表示される
      expect(screen.getByText(/現在のサンプル数: 5人/)).toBeInTheDocument();

      // チャートは表示されない
      expect(screen.queryByTestId('chart-mock')).not.toBeInTheDocument();
    });

    it('サンプル数がちょうど10人の場合、チャートが表示される', () => {
      const sufficientData: ComparisonData = {
        ...mockComparisonData,
        sampleSize: 10,
      };

      render(
        <ComparisonChart
          comparisonData={sufficientData}
          userValue={80}
        />
      );

      // チャートが表示される
      expect(screen.getByTestId('chart-mock')).toBeInTheDocument();

      // データ不足メッセージは表示されない
      expect(screen.queryByText('データ不足')).not.toBeInTheDocument();
    });

    it('データがnullの場合、データ不足メッセージが表示される', () => {
      render(
        <ComparisonChart
          comparisonData={null}
          userValue={80}
        />
      );

      // データ不足メッセージが表示される
      expect(screen.getByText('データ不足')).toBeInTheDocument();
describe('アクセシビリティ', () => {
    it('適切なセマンティックHTMLが使用される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
        />
      );

      // h3タグが使用される
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });
});
データがない場合、空の状態メッセージが表示される', () => {
      render(
        <ComparisonChart
          comparisonData={null}
          userValue={0}
        />
      );

      expect(screen.getByText('データ不足')).toBeInTheDocument();
    });
  });

  describe('説明テキスト', () => {
    it('類似ユーザーの条件が説明される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
        />
      );

      expect(screen.getByText(/身長±5cm、体重±5kg、週頻度±1回/)).toBeInTheDocument();
    });
  });

      });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーが表示される', () => {
      render(
        <ComparisonChart
          comparisonData={mockComparisonData}
          userValue={80}
          loading={true}
        />
      );

      expect(screen.getByText(/比較データを読み込み中/)).toBeInTheDocument();
      expect(screen.queryByTestId('chart-mock')).not.toBeInTheDocument();
    });
  });

  describe('空の状態', () => {
    it('