/**
 * WorkoutList - 使用例
 * 
 * このファイルは、WorkoutListコンポーネントの使用方法を示すサンプルです。
 */

import React, { useState } from 'react';
import { WorkoutList } from './WorkoutList';
import { WorkoutForm } from './WorkoutForm';
import type { WorkoutRecord } from '@/types';

/**
 * 基本的な使用例
 */
export const BasicWorkoutListExample: React.FC = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedWorkout, setCopiedWorkout] = useState<WorkoutRecord | null>(null);

  const handleSelectWorkout = (workout: WorkoutRecord) => {
    setSelectedWorkout(workout);
    console.log('選択された記録:', workout);
  };

  const handleCopyWorkout = (workout: WorkoutRecord) => {
    setCopiedWorkout(workout);
    setShowForm(true);
    console.log('コピーされた記録:', workout);
  };

  const handleDeleteWorkout = (id: string) => {
    console.log('削除する記録ID:', id);
    // 実際の削除処理はworkoutStoreで行われます
  };

  const handleCreateNew = () => {
    setCopiedWorkout(null);
    setShowForm(true);
  };

  const handleFormSuccess = (workout: WorkoutRecord) => {
    console.log('保存された記録:', workout);
    setShowForm(false);
    setCopiedWorkout(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCopiedWorkout(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      {!showForm ? (
        <WorkoutList
          onSelectWorkout={handleSelectWorkout}
          onCopyWorkout={handleCopyWorkout}
          onDeleteWorkout={handleDeleteWorkout}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <WorkoutForm
          initialData={copiedWorkout || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* 選択された記録の詳細表示（オプション） */}
      {selectedWorkout && !showForm && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '300px',
          }}
        >
          <h3>選択中の記録</h3>
          <p>{selectedWorkout.exerciseName}</p>
          <button onClick={() => setSelectedWorkout(null)}>閉じる</button>
        </div>
      )}
    </div>
  );
};

/**
 * フィルター機能を活用した使用例
 */
export const FilteredWorkoutListExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>トレーニング記録管理</h1>
      <p>フィルター機能を使って、特定の部位やトレーニング方法の記録を絞り込めます。</p>
      
      <WorkoutList
        onSelectWorkout={(workout) => {
          alert(`選択: ${workout.exerciseName}`);
        }}
        onCopyWorkout={(workout) => {
          alert(`コピー: ${workout.exerciseName}`);
        }}
        onDeleteWorkout={(id) => {
          if (confirm('本当に削除しますか？')) {
            console.log('削除:', id);
          }
        }}
        onCreateNew={() => {
          console.log('新規作成');
        }}
      />
    </div>
  );
};

/**
 * シンプルな読み取り専用の使用例
 */
export const ReadOnlyWorkoutListExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>トレーニング履歴</h1>
      
      <WorkoutList
        onSelectWorkout={(workout) => {
          console.log('詳細表示:', workout);
        }}
        // コピーと削除のコールバックを省略すると、ボタンは表示されますが
        // 実際の処理は行われません
      />
    </div>
  );
};

/**
 * カスタムアクションを持つ使用例
 */
export const CustomActionsWorkoutListExample: React.FC = () => {
  const handleCopyToClipboard = (workout: WorkoutRecord) => {
    const text = `${workout.exerciseName}\n${workout.sets
      .map((s) => `${s.weight}kg × ${s.reps}回`)
      .join('\n')}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('クリップボードにコピーしました！');
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>記録をクリップボードにコピー</h1>
      
      <WorkoutList
        onSelectWorkout={(workout) => {
          console.log('選択:', workout);
        }}
        onCopyWorkout={handleCopyToClipboard}
        onDeleteWorkout={(id) => {
          console.log('削除:', id);
        }}
      />
    </div>
  );
};

/**
 * デフォルトエクスポート
 */
export default BasicWorkoutListExample;
