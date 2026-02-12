/**
 * WorkoutCard - 使用例
 * 
 * WorkoutCardコンポーネントの使用方法を示すサンプルコード
 */

import React from 'react';
import { WorkoutCard } from './WorkoutCard';
import type { WorkoutRecord } from '@/types';

/**
 * サンプルデータ
 */
const sampleWorkout: WorkoutRecord = {
  id: 'workout-1',
  userId: 'user-123',
  date: new Date('2024-01-15'),
  bodyPart: 'chest',
  exerciseName: 'ベンチプレス',
  sets: [
    { setNumber: 1, weight: 60, reps: 10, completed: true, rm1: 80 },
    { setNumber: 2, weight: 70, reps: 8, completed: true, rm1: 87.3 },
    { setNumber: 3, weight: 75, reps: 6, completed: true, rm1: 90 },
    { setNumber: 4, weight: 80, reps: 5, completed: true, rm1: 93.3 },
  ],
  notes: '今日は調子が良かった！フォームも安定していた。次回は80kgで6回を目指す。',
  images: ['image-1', 'image-2'], // 画像IDの配列
  createdAt: new Date('2024-01-15T10:00:00'),
  updatedAt: new Date('2024-01-15T10:00:00'),
  syncStatus: 'synced',
};

const sampleWorkoutWithoutImages: WorkoutRecord = {
  id: 'workout-2',
  userId: 'user-123',
  date: new Date('2024-01-16'),
  bodyPart: 'back',
  exerciseName: 'デッドリフト',
  sets: [
    { setNumber: 1, weight: 100, reps: 8, completed: true },
    { setNumber: 2, weight: 110, reps: 6, completed: true },
    { setNumber: 3, weight: 120, reps: 5, completed: true },
  ],
  createdAt: new Date('2024-01-16T10:00:00'),
  updatedAt: new Date('2024-01-16T10:00:00'),
  syncStatus: 'pending',
};

/**
 * 基本的な使用例
 */
export const BasicExample: React.FC = () => {
  const handleEdit = () => {
    console.log('編集ボタンがクリックされました');
  };

  const handleDelete = () => {
    console.log('削除ボタンがクリックされました');
  };

  const handleCopy = () => {
    console.log('コピーボタンがクリックされました');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>WorkoutCard - 基本的な使用例</h1>
      
      <h2>画像付き記録</h2>
      <WorkoutCard
        workout={sampleWorkout}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopy={handleCopy}
        includePersonalInfo={false}
      />

      <h2 style={{ marginTop: '3rem' }}>画像なし記録</h2>
      <WorkoutCard
        workout={sampleWorkoutWithoutImages}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopy={handleCopy}
      />
    </div>
  );
};

/**
 * 読み取り専用モード（アクションボタンなし）
 */
export const ReadOnlyExample: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>WorkoutCard - 読み取り専用モード</h1>
      
      <WorkoutCard workout={sampleWorkout} />
    </div>
  );
};

/**
 * 複数のカードを表示
 */
export const MultipleCardsExample: React.FC = () => {
  const workouts: WorkoutRecord[] = [
    sampleWorkout,
    sampleWorkoutWithoutImages,
    {
      id: 'workout-3',
      userId: 'user-123',
      date: new Date('2024-01-17'),
      bodyPart: 'legs',
      exerciseName: 'スクワット',
      sets: [
        { setNumber: 1, weight: 80, reps: 12, completed: true },
        { setNumber: 2, weight: 90, reps: 10, completed: true },
        { setNumber: 3, weight: 100, reps: 8, completed: true },
        { setNumber: 4, weight: 100, reps: 8, completed: true },
      ],
      notes: '脚の日。しっかり追い込めた。',
      createdAt: new Date('2024-01-17T10:00:00'),
      updatedAt: new Date('2024-01-17T10:00:00'),
      syncStatus: 'synced',
    },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>WorkoutCard - 複数のカード</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onEdit={() => console.log('編集:', workout.id)}
            onDelete={() => console.log('削除:', workout.id)}
            onCopy={() => console.log('コピー:', workout.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * プライバシー設定あり（個人情報を含める）
 */
export const WithPersonalInfoExample: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>WorkoutCard - プライバシー設定あり</h1>
      <p>シェア時に個人情報（ユーザーID）を含めます</p>
      
      <WorkoutCard
        workout={sampleWorkout}
        includePersonalInfo={true}
      />
    </div>
  );
};

export default BasicExample;
