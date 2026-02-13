/**
 * ComparisonChartコンポーネント
 * 
 * 類似ユーザーとの比較データを可視化
 * 統計情報（平均、中央値、パーセンタイル）を表示
 * 
 * **要件: 7.1、7.3、7.4**
 */

import { useMemo, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ComparisonData } from '@/types';
import styles from './ComparisonChart.module.css';

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 最小サンプルサイズ（プライバシー保護）
const MIN_SAMPLE_SIZE = 10;

interface ComparisonChartProps {
  comparisonData: ComparisonData | null;
  userValue: number;
  loading?: boolean;
}

/**
 * ComparisonChartコンポーネント
 * 
 * **検証: 要件 7.1、7.3、7.4**
 */
function ComparisonChartComponent({ 
  comparisonData, 
  userValue,
  loading = false 
}: ComparisonChartProps) {
  /**
   * データ不足チェック
   * 要件7.4: 類似ユーザーが10人未満の場合はデータ不足メッセージを表示
   */
  const isInsufficientData = useMemo(() => {
    return !comparisonData || comparisonData.sampleSize < MIN_SAMPLE_SIZE;
  }, [comparisonData]);

  /**
   * チャートデータを計算
   */
  const chartData = useMemo(() => {
    if (!comparisonData) {
      return null;
    }

    const { statistics } = comparisonData;

    return {
      labels: ['25%ile', '中央値', '平均', '75%ile', '90%ile', 'あなた'],
      datasets: [
        {
          label: '重量 (kg)',
          data: [
            statistics.percentile25,
            statistics.median,
            statistics.mean,
            statistics.percentile75,
            statistics.percentile90,
            userValue,
          ],
          backgroundColor: [
            'rgba(8, 145, 194, 0.6)',
            'rgba(8, 145, 194, 0.7)',
            'rgba(8, 145, 194, 0.8)',
            'rgba(8, 145, 194, 0.9)',
            'rgba(8, 145, 194, 1)',
            'rgba(255, 152, 0, 0.9)', // あなたの値はアクセントカラー
          ],
          borderColor: [
            'rgb(8, 145, 194)',
            'rgb(8, 145, 194)',
            'rgb(8, 145, 194)',
            'rgb(8, 145, 194)',
            'rgb(8, 145, 194)',
            'rgb(255, 152, 0)',
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [comparisonData, userValue]);

  /**
   * チャートオプション
   */
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
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
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${value.toFixed(1)} kg`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
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
          callback: (value: any) => `${value} kg`,
        },
      },
    },
  }), []);

  // ローディング状態
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>比較データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // データ不足の場合（要件7.4）
  if (isInsufficientData) {
    return (
      <div className={styles.container}>
        <div className={styles.insufficientData}>
          <div className={styles.icon}>📊</div>
          <h3>データ不足</h3>
          <p>
            類似したユーザーのデータが不足しています。
            <br />
            プライバシー保護のため、10人以上のデータが必要です。
          </p>
          {comparisonData && (
            <p className={styles.sampleInfo}>
              現在のサンプル数: {comparisonData.sampleSize}人
            </p>
          )}
        </div>
      </div>
    );
  }

  // データがない場合
  if (!chartData || !comparisonData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>比較データがありません</p>
          <p className={styles.emptyHint}>
            プロファイルを設定して、類似ユーザーと比較しましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ヘッダー情報 */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          {comparisonData.exerciseName} - {comparisonData.bodyPart}
        </h3>
        <div className={styles.metadata}>
          <span className={styles.sampleSize}>
            サンプル数: {comparisonData.sampleSize}人
          </span>
          <span className={styles.period}>
            期間: {new Date(comparisonData.timeRange.start).toLocaleDateString('ja-JP')} 〜{' '}
            {new Date(comparisonData.timeRange.end).toLocaleDateString('ja-JP')}
          </span>
        </div>
      </div>

      {/* 統計情報カード（要件7.3） */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>平均</div>
          <div className={styles.statValue}>
            {comparisonData.statistics.mean.toFixed(1)} kg
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>中央値</div>
          <div className={styles.statValue}>
            {comparisonData.statistics.median.toFixed(1)} kg
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>あなた</div>
          <div className={`${styles.statValue} ${styles.userValue}`}>
            {userValue.toFixed(1)} kg
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className={styles.chartWrapper}>
        <Bar data={chartData} options={options} />
      </div>

      {/* 説明 */}
      <div className={styles.explanation}>
        <p>
          あなたと似た体型のユーザー（身長±5cm、体重±5kg、週頻度±1回）との比較です。
        </p>
      </div>
    </div>
  );
}

// React.memoでコンポーネントをメモ化
export const ComparisonChart = memo(ComparisonChartComponent);
