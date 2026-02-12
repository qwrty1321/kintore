/**
 * ChartFiltersコンポーネントの使用例
 */

import { useState } from 'react';
import { ChartFilters } from './ChartFilters';
import type { WorkoutFilter } from '@/types';

export function ChartFiltersExample() {
  const [filter, setFilter] = useState<WorkoutFilter>({});

  const availableExercises = [
    'ベンチプレス',
    'スクワット',
    'デッドリフト',
    'ショルダープレス',
    'ラットプルダウン',
    'バーベルカール',
    'レッグプレス',
  ];

  const handleFilterChange = (newFilter: WorkoutFilter) => {
    setFilter(newFilter);
    console.log('フィルター変更:', newFilter);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>ChartFilters 使用例</h1>

      <ChartFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        availableExercises={availableExercises}
      />

      {/* 現在のフィルター状態を表示 */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3>現在のフィルター:</h3>
        <pre style={{ fontSize: '0.875rem' }}>
          {JSON.stringify(filter, null, 2)}
        </pre>
      </div>
    </div>
  );
}
