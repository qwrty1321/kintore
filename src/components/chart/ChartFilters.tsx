/**
 * ChartFiltersコンポーネント
 * 
 * グラフデータのフィルタリング機能を提供
 * - 部位フィルター
 * - トレーニング方法フィルター
 * - 日付範囲フィルター
 * 
 * **要件: 4.3、4.4**
 */

import { useState } from 'react';
import type { WorkoutFilter, BodyPart } from '@/types';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import styles from './ChartFilters.module.css';

interface ChartFiltersProps {
  /** 現在のフィルター */
  filter: WorkoutFilter;
  /** フィルター変更時のコールバック */
  onFilterChange: (filter: WorkoutFilter) => void;
  /** 利用可能なトレーニング方法のリスト */
  availableExercises?: string[];
}

/**
 * 部位の選択肢
 */
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

/**
 * ChartFiltersコンポーネント
 * 
 * **検証: 要件 4.3、4.4**
 */
export function ChartFilters({
  filter,
  onFilterChange,
  availableExercises = [],
}: ChartFiltersProps) {
  // ローカル状態
  const [bodyPart, setBodyPart] = useState<string>(filter.bodyPart || '');
  const [exerciseName, setExerciseName] = useState<string>(filter.exerciseName || '');
  const [startDate, setStartDate] = useState<string>(
    filter.dateRange?.start ? formatDateForInput(filter.dateRange.start) : ''
  );
  const [endDate, setEndDate] = useState<string>(
    filter.dateRange?.end ? formatDateForInput(filter.dateRange.end) : ''
  );

  // トレーニング方法の選択肢を生成
  const exerciseOptions = [
    { value: '', label: 'すべてのトレーニング' },
    ...availableExercises.map(exercise => ({
      value: exercise,
      label: exercise,
    })),
  ];

  /**
   * フィルターを適用
   */
  const handleApplyFilter = () => {
    const newFilter: WorkoutFilter = {};

    if (bodyPart) {
      newFilter.bodyPart = bodyPart as BodyPart;
    }

    if (exerciseName) {
      newFilter.exerciseName = exerciseName;
    }

    if (startDate || endDate) {
      newFilter.dateRange = {
        start: startDate ? new Date(startDate) : new Date(0),
        end: endDate ? new Date(endDate) : new Date(),
      };
    }

    onFilterChange(newFilter);
  };

  /**
   * フィルターをクリア
   */
  const handleClearFilter = () => {
    setBodyPart('');
    setExerciseName('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };

  /**
   * フィルターが適用されているかチェック
   */
  const hasActiveFilter = bodyPart || exerciseName || startDate || endDate;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>フィルター</h3>
        {hasActiveFilter && (
          <button
            className={styles.clearButton}
            onClick={handleClearFilter}
            aria-label="フィルターをクリア"
          >
            クリア
          </button>
        )}
      </div>

      <div className={styles.filters}>
        {/* 部位フィルター */}
        <div className={styles.filterGroup}>
          <Select
            label="部位"
            options={BODY_PART_OPTIONS}
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            fullWidth
          />
        </div>

        {/* トレーニング方法フィルター */}
        {availableExercises.length > 0 && (
          <div className={styles.filterGroup}>
            <Select
              label="トレーニング方法"
              options={exerciseOptions}
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              fullWidth
            />
          </div>
        )}

        {/* 日付範囲フィルター */}
        <div className={styles.filterGroup}>
          <div className={styles.dateRange}>
            <Input
              type="date"
              label="開始日"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <span className={styles.dateSeparator} aria-hidden="true">
              〜
            </span>
            <Input
              type="date"
              label="終了日"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        {/* 適用ボタン */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleApplyFilter}
            fullWidth
          >
            フィルターを適用
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Date を input[type="date"] 用の文字列にフォーマット
 */
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
