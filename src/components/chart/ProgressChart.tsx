/**
 * ProgressChartコンポーネント
 * 
 * トレーニング記録を時系列グラフで可視化
 * Chart.jsを使用し、軸選択（重量、回数、セット数、頻度）に対応
 * 
 * **要件: 4.1、4.2、4.5**
 * 
 * パフォーマンス最適化:
 * - データポイントが多い場合の自動間引き
 * - アニメーション制御
 * - レンダリング時間の計測
 */

import { useMemo, memo, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { WorkoutRecord, ChartAxis } from '@/types';
import styles from './ProgressChart.module.css';

// パフォーマンス閾値
const LARGE_DATASET_THRESHOLD = 100; // この数を超えたら最適化を適用
const MAX_VISIBLE_POINTS = 200; // 表示する最大ポイント数

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation // データ間引き機能
);

interface ProgressChartProps {
  workouts: WorkoutRecord[];
  axis: ChartAxis;
  onAxisChange: (axis: ChartAxis) => void;
}

/**
 * 軸ラベルのマッピング
 */
const AXIS_LABELS: Record<ChartAxis, string> = {
  weight: '重量 (kg)',
  reps: '回数',
  sets: 'セット数',
  frequency: 'トレーニング頻度',
};

/**
 * ProgressChartコンポーネント
 * 
 * **検証: 要件 4.1、4.2、4.5**
 */
function ProgressChartComponent({ workouts, axis, onAxisChange }: ProgressChartProps) {
  const renderStartTime = useRef<number>(0);
  const isLargeDataset = workouts.length > LARGE_DATASET_THRESHOLD;

  // レンダリング開始時刻を記録
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // レンダリング完了時刻を記録
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    if (renderTime > 0) {
      console.log(`[ProgressChart] レンダリング時間: ${renderTime.toFixed(2)}ms (データポイント: ${workouts.length})`);
      
      // 1秒を超えた場合は警告
      if (renderTime > 1000) {
        console.warn(`[ProgressChart] レンダリング時間が1秒を超えました: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  /**
   * データポイントを間引く関数
   * 大量のデータがある場合、一定間隔でサンプリング
   */
  const decimateData = useMemo(() => {
    return <T,>(data: T[], maxPoints: number): T[] => {
      if (data.length <= maxPoints) {
        return data;
      }

      const step = Math.ceil(data.length / maxPoints);
      const decimated: T[] = [];

      for (let i = 0; i < data.length; i += step) {
        decimated.push(data[i]);
      }

      // 最後のポイントを必ず含める
      if (decimated[decimated.length - 1] !== data[data.length - 1]) {
        decimated.push(data[data.length - 1]);
      }

      return decimated;
    };
  }, []);

  /**
   * チャートデータを計算
   */
  const chartData = useMemo(() => {
    // 日付でソート
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 大量データの場合は間引き
    const processedWorkouts = isLargeDataset 
      ? decimateData(sortedWorkouts, MAX_VISIBLE_POINTS)
      : sortedWorkouts;

    // 軸に応じてデータを集計
    const labels: string[] = [];
    const dataPoints: number[] = [];

    if (axis === 'frequency') {
      // 頻度: 日付ごとのトレーニング回数
      const frequencyMap = new Map<string, number>();
      
      processedWorkouts.forEach(workout => {
        const dateKey = new Date(workout.date).toLocaleDateString('ja-JP');
        frequencyMap.set(dateKey, (frequencyMap.get(dateKey) || 0) + 1);
      });

      frequencyMap.forEach((count, date) => {
        labels.push(date);
        dataPoints.push(count);
      });
    } else {
      // 重量、回数、セット数
      processedWorkouts.forEach(workout => {
        const dateLabel = new Date(workout.date).toLocaleDateString('ja-JP');
        
        let value = 0;
        switch (axis) {
          case 'weight':
            // 最大重量を取得
            value = Math.max(...workout.sets.map(s => s.weight));
            break;
          case 'reps':
            // 合計回数を取得
            value = workout.sets.reduce((sum, s) => sum + s.reps, 0);
            break;
          case 'sets':
            // セット数を取得
            value = workout.sets.length;
            break;
        }

        labels.push(dateLabel);
        dataPoints.push(value);
      });
    }

    return {
      labels,
      datasets: [
        {
          label: AXIS_LABELS[axis],
          data: dataPoints,
          borderColor: 'rgb(8, 145, 194)',
          backgroundColor: 'rgba(8, 145, 194, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: isLargeDataset ? 2 : 4, // 大量データ時はポイントを小さく
          pointHoverRadius: isLargeDataset ? 4 : 6,
          pointBackgroundColor: 'rgb(8, 145, 194)',
          pointBorderColor: '#fff',
          pointBorderWidth: isLargeDataset ? 1 : 2,
        },
      ],
    };
  }, [workouts, axis, isLargeDataset, decimateData]);

  /**
   * チャートオプション
   */
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    // パフォーマンス最適化: 大量データ時はアニメーションを無効化
    animation: isLargeDataset ? false : {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    },
    // パフォーマンス最適化: レスポンシブ更新の遅延
    resizeDelay: isLargeDataset ? 100 : 0,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        // パフォーマンス最適化: ツールチップのアニメーション制御
        animation: isLargeDataset ? false : {
          duration: 200,
        },
      },
      // データ間引き設定（Chart.js組み込み機能）
      decimation: isLargeDataset ? {
        enabled: true,
        algorithm: 'lttb' as const, // Largest-Triangle-Three-Buckets アルゴリズム
        samples: MAX_VISIBLE_POINTS,
      } : undefined,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 0,
          // パフォーマンス最適化: 大量データ時はラベルを間引き
          maxTicksLimit: isLargeDataset ? 20 : undefined,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    // パフォーマンス最適化: レンダリング設定
    parsing: isLargeDataset ? false : true, // 大量データ時はパース処理をスキップ
  }), [isLargeDataset]);

  return (
    <div className={styles.container}>
      {/* 軸選択ボタン */}
      <div className={styles.controls}>
        <div className={styles.axisButtons}>
          {(['weight', 'reps', 'sets', 'frequency'] as ChartAxis[]).map((axisOption) => (
            <button
              key={axisOption}
              className={`${styles.axisButton} ${axis === axisOption ? styles.active : ''}`}
              onClick={() => onAxisChange(axisOption)}
              aria-pressed={axis === axisOption}
            >
              {AXIS_LABELS[axisOption]}
            </button>
          ))}
        </div>
        
        {/* パフォーマンス情報表示（大量データ時） */}
        {isLargeDataset && (
          <div className={styles.performanceInfo}>
            <span className={styles.infoIcon}>⚡</span>
            <span className={styles.infoText}>
              最適化モード: {workouts.length}件のデータを表示中
            </span>
          </div>
        )}
      </div>

      {/* チャート */}
      <div className={styles.chartWrapper}>
        {workouts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>表示するデータがありません</p>
            <p className={styles.emptyHint}>トレーニング記録を追加してください</p>
          </div>
        ) : (
          <Line data={chartData} options={options as any} />
        )}
      </div>
    </div>
  );
}

// React.memoでコンポーネントをメモ化してパフォーマンス向上
export const ProgressChart = memo(ProgressChartComponent);
