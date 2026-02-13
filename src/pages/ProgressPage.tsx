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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-3 tracking-tight">
            進捗グラフ
          </h1>
          <p className="text-lg text-gray-600">
            トレーニングの進捗を可視化して、成長を実感しましょう
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 animate-slide-up">
          <ProgressChart
            workouts={workouts}
            axis={axis}
            onAxisChange={setAxis}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-5xl font-display font-bold text-gray-900 mb-2">{workouts.length}</div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">総トレーニング数</div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="text-5xl font-display font-bold text-gray-900 mb-2">
              {new Set(workouts.map(w => w.bodyPart)).size}
            </div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">トレーニング部位</div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-5xl font-display font-bold text-gray-900 mb-2">
              {new Set(workouts.map(w => 
                new Date(w.date).toLocaleDateString()
              )).size}
            </div>
            <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">トレーニング日数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
