/**
 * WorkoutList - トレーニング記録一覧コンポーネント
 * 
 * 要件: 3.1、3.2、4.3、4.4
 * 
 * 機能:
 * - 記録一覧表示
 * - フィルタリングUI（部位、トレーニング方法、日付範囲）
 * - コピー機能（過去の記録を新しい記録として複製）
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutRecord, BodyPart, WorkoutFilter } from '@/types';
import styles from './WorkoutList.module.css';

// ============================================
// 型定義
// ============================================

export interface WorkoutListProps {
  /** 記録選択時のコールバック */
  onSelectWorkout?: (workout: WorkoutRecord) => void;
  /** 記録コピー時のコールバック */
  onCopyWorkout?: (workout: WorkoutRecord) => void;
  /** 記録削除時のコールバック */
  onDeleteWorkout?: (id: string) => void;
  /** 新規作成ボタンのコールバック */
  onCreateNew?: () => void;
}

// ============================================
// 定数
// ============================================

const BODY_PART_OPTIONS = [
  { value: '', label: 'すべての部位' },
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'shoulders', label: '肩' },
  { value: 'arms', label: '腕' },
  { value: 'legs', label: '脚' },
  { value: 'core', label: '体幹' },
  { value: 'other', label: 'その他' },
];

// ============================================
// コンポーネント
// ============================================

export const WorkoutList: React.FC<WorkoutListProps> = ({
  onSelectWorkout,
  onCopyWorkout,
  onDeleteWorkout,
  onCreateNew,
}) => {
  // ============================================
  // State
  // ============================================

  const {
    workouts,
    isLoading,
    error,
    loadWorkouts,
    setFilter,
    applyFilter,
    clearFilter,
  } = useWorkoutStore();

  const [localFilter, setLocalFilter] = useState<WorkoutFilter>({});
  const [exerciseNameInput, setExerciseNameInput] = useState('');

  // ============================================
  // Effects
  // ============================================

  // 初回読み込み
  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // ============================================
  // フィルター操作
  // ============================================

  const handleBodyPartChange = useCallback((value: string) => {
    setLocalFilter((prev) => ({
      ...prev,
      bodyPart: value ? (value as BodyPart) : undefined,
    }));
  }, []);

  const handleExerciseNameChange = useCallback((value: string) => {
    setExerciseNameInput(value);
    setLocalFilter((prev) => ({
      ...prev,
      exerciseName: value.trim() || undefined,
    }));
  }, []);

  const handleDateRangeChange = useCallback(
    (field: 'start' | 'end', value: string) => {
      setLocalFilter((prev) => {
        const dateRange = prev.dateRange || { start: new Date(), end: new Date() };
        return {
          ...prev,
          dateRange: {
            ...dateRange,
            [field]: value ? new Date(value) : undefined,
          },
        };
      });
    },
    []
  );

  const handleApplyFilter = useCallback(() => {
    setFilter(localFilter);
    applyFilter();
  }, [localFilter, setFilter, applyFilter]);

  const handleClearFilter = useCallback(() => {
    setLocalFilter({});
    setExerciseNameInput('');
    clearFilter();
  }, [clearFilter]);

  // ============================================
  // 記録操作
  // ============================================

  /**
   * 記録をコピーして新しい記録を作成
   * 
   * **検証: 要件 3.1、3.2**
   * - すべてのフィールドをコピー
   * - 日付を現在日時に設定
   */
  const handleCopy = useCallback(
    (workout: WorkoutRecord) => {
      const copiedWorkout: WorkoutRecord = {
        ...workout,
        id: crypto.randomUUID(),
        date: new Date(), // 日付を現在日時に設定（要件 3.2）
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending',
      };

      onCopyWorkout?.(copiedWorkout);
    },
    [onCopyWorkout]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('この記録を削除してもよろしいですか？')) {
        onDeleteWorkout?.(id);
      }
    },
    [onDeleteWorkout]
  );

  // ============================================
  // レンダリング
  // ============================================

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h2 className={styles.title}>トレーニング記録</h2>
        {onCreateNew && (
          <Button variant="primary" size="md" onClick={onCreateNew}>
            + 新規作成
          </Button>
        )}
      </div>

      {/* フィルター */}
      <div className={styles.filters}>
        <h3 className={styles.filterTitle}>フィルター</h3>

        <div className={styles.filterGrid}>
          {/* 部位フィルター */}
          <Select
            label="部位"
            options={BODY_PART_OPTIONS}
            value={localFilter.bodyPart || ''}
            onChange={(e) => handleBodyPartChange(e.target.value)}
            fullWidth
          />

          {/* トレーニング方法フィルター */}
          <Input
            type="text"
            label="トレーニング方法"
            value={exerciseNameInput}
            onChange={(e) => handleExerciseNameChange(e.target.value)}
            placeholder="例: ベンチプレス"
            fullWidth
          />

          {/* 日付範囲フィルター */}
          <Input
            type="date"
            label="開始日"
            value={
              localFilter.dateRange?.start
                ? new Date(localFilter.dateRange.start).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            fullWidth
          />

          <Input
            type="date"
            label="終了日"
            value={
              localFilter.dateRange?.end
                ? new Date(localFilter.dateRange.end).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            fullWidth
          />
        </div>

        <div className={styles.filterActions}>
          <Button variant="primary" size="sm" onClick={handleApplyFilter}>
            フィルター適用
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearFilter}>
            クリア
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} aria-label="読み込み中" />
          <p>読み込み中...</p>
        </div>
      )}

      {/* 記録一覧 */}
      {!isLoading && workouts.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>記録がありません</p>
          {onCreateNew && (
            <Button variant="primary" size="md" onClick={onCreateNew}>
              最初の記録を作成
            </Button>
          )}
        </div>
      )}

      {!isLoading && workouts.length > 0 && (
        <div className={styles.list}>
          {workouts.map((workout, index) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSelect={() => onSelectWorkout?.(workout)}
              onCopy={() => handleCopy(workout)}
              onDelete={() => handleDelete(workout.id)}
              animationDelay={index * 50}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// WorkoutCard - 個別記録カード
// ============================================

interface WorkoutCardProps {
  workout: WorkoutRecord;
  onSelect?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  animationDelay?: number;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onSelect,
  onCopy,
  onDelete,
  animationDelay = 0,
}) => {
  // 部位の日本語表示
  const bodyPartLabel = BODY_PART_OPTIONS.find(
    (opt) => opt.value === workout.bodyPart
  )?.label || workout.bodyPart;

  // 合計重量と回数を計算
  const totalWeight = workout.sets.reduce(
    (sum, set) => sum + set.weight * set.reps,
    0
  );
  const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);

  // 日付フォーマット
  const formattedDate = new Date(workout.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <h3 className={styles.exerciseName}>{workout.exerciseName}</h3>
          <span className={styles.bodyPart}>{bodyPartLabel}</span>
        </div>
        <span className={styles.date}>{formattedDate}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>セット数</span>
            <span className={styles.statValue}>{workout.sets.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>合計回数</span>
            <span className={styles.statValue}>{totalReps}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>合計重量</span>
            <span className={styles.statValue}>{totalWeight.toFixed(1)} kg</span>
          </div>
        </div>

        {/* セット詳細 */}
        <div className={styles.sets}>
          {workout.sets.map((set) => (
            <div key={set.setNumber} className={styles.set}>
              <span className={styles.setNumber}>#{set.setNumber}</span>
              <span className={styles.setValue}>
                {set.weight} kg × {set.reps} 回
              </span>
            </div>
          ))}
        </div>

        {/* メモ */}
        {workout.notes && (
          <div className={styles.notes}>
            <p className={styles.notesText}>{workout.notes}</p>
          </div>
        )}

        {/* 画像インジケーター */}
        {workout.images && workout.images.length > 0 && (
          <div className={styles.imageIndicator}>
            <span className={styles.imageIcon}>📷</span>
            <span className={styles.imageCount}>{workout.images.length}枚</span>
          </div>
        )}
      </div>

      <div className={styles.cardActions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelect}
          title="詳細を表示"
        >
          詳細
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          title="この記録をコピー"
        >
          📋 コピー
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          title="削除"
        >
          🗑️
        </Button>
      </div>
    </div>
  );
};
