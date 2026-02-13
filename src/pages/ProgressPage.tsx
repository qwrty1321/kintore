/**
 * 進捗表示ページ
 * ProgressChartコンポーネントのデモ
 */

import { useState, useEffect } from 'react';
import { ProgressChart } from '@/components/chart';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { ChartAxis } from '@/types';

export function ProgressPage() {
  const { workouts, loadWorkouts } = useWorkoutStore();
  const [axis, setAxis] = useState<ChartAxis>('weight');

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">進捗グラフ</h1>
          <p className="text-gray-600">
            トレーニングの進捗を可視化して、成長を実感しましょう
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <ProgressChart
            workouts={workouts}
            axis={axis}
            onAxisChange={setAxis}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{workouts.length}</div>
            <div className="text-sm text-gray-600">総トレーニング数</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {new Set(workouts.map(w => w.bodyPart)).size}
            </div>
            <div className="text-sm text-gray-600">トレーニング部位</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {new Set(workouts.map(w => 
                new Date(w.date).toLocaleDateString()
              )).size}
            </div>
            <div className="text-sm text-gray-600">トレーニング日数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
