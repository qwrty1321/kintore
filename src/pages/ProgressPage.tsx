/**
 * 進捗表示ページ
 * ProgressChartコンポーネントのデモ
 */

import { useState, useEffect } from 'react';
import { ProgressChart } from '@/components/chart';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { ChartAxis } from '@/types';
import styles from './ProgressPage.module.css';

export function ProgressPage() {
  const { workouts, loadWorkouts } = useWorkoutStore();
  const [axis, setAxis] = useState<ChartAxis>('weight');

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>進捗グラフ</h1>
        <p className={styles.subtitle}>
          トレーニングの進捗を可視化して、成長を実感しましょう
        </p>
      </header>

      <div className={styles.chartContainer}>
        <ProgressChart
          workouts={workouts}
          axis={axis}
          onAxisChange={setAxis}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{workouts.length}</span>
          <span className={styles.statLabel}>総トレーニング数</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {new Set(workouts.map(w => w.bodyPart)).size}
          </span>
          <span className={styles.statLabel}>トレーニング部位</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {new Set(workouts.map(w => 
              new Date(w.date).toLocaleDateString()
            )).size}
          </span>
          <span className={styles.statLabel}>トレーニング日数</span>
        </div>
      </div>
    </div>
  );
}
