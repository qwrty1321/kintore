/**
 * WorkoutForm 使用例
 * 
 * このファイルは開発時の参考用です。
 */

import React, { useState } from 'react';
import { WorkoutForm } from './WorkoutForm';
import type { WorkoutRecord } from '@/types';

/**
 * 基本的な使用例
 */
export const BasicExample: React.FC = () => {
  const [savedWorkout, setSavedWorkout] = useState<WorkoutRecord | null>(null);

  const handleSuccess = (workout: WorkoutRecord) => {
    console.log('トレーニング記録が保存されました:', workout);
    setSavedWorkout(workout);
    alert('トレーニング記録を保存しました！');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>トレーニング記録フォーム - 基本例</h1>
      
      <WorkoutForm onSuccess={handleSuccess} />

      {savedWorkout && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
          <h2>保存された記録</h2>
          <pre>{JSON.stringify(savedWorkout, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * 編集モードの使用例
 */
export const EditExample: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  // サンプルデータ
  const sampleWorkout: WorkoutRecord = {
    id: 'sample-1',
    userId: 'user-1',
    date: new Date('2024-01-15'),
    bodyPart: 'chest',
    exerciseName: 'ベンチプレス',
    sets: [
      { setNumber: 1, weight: 60, reps: 10, completed: true },
      { setNumber: 2, weight: 65, reps: 8, completed: true },
      { setNumber: 3, weight: 70, reps: 6, completed: true },
    ],
    notes: '調子が良かった。次回は75kgに挑戦。',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    syncStatus: 'synced',
  };

  const handleSuccess = (workout: WorkoutRecord) => {
    console.log('トレーニング記録が更新されました:', workout);
    setIsEditing(false);
    alert('トレーニング記録を更新しました！');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>トレーニング記録フォーム - 編集例</h1>
      
      {!isEditing ? (
        <div>
          <button onClick={() => setIsEditing(true)}>記録を編集</button>
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
            <h2>現在の記録</h2>
            <pre>{JSON.stringify(sampleWorkout, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <WorkoutForm
          initialData={sampleWorkout}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

/**
 * モーダル内での使用例
 */
export const ModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (workout: WorkoutRecord) => {
    console.log('トレーニング記録が保存されました:', workout);
    setIsOpen(false);
    alert('トレーニング記録を保存しました！');
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>トレーニング記録フォーム - モーダル例</h1>
      
      <button onClick={() => setIsOpen(true)}>新しい記録を追加</button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <WorkoutForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      )}
    </div>
  );
};
