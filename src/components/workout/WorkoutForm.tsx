/**
 * WorkoutForm - トレーニング記録入力フォーム
 * 
 * 要件: 1.1、1.3、3A.1、3C.1
 * 
 * 機能:
 * - 日付、部位、トレーニング方法、セット情報の入力
 * - リアルタイムバリデーション
 * - 画像アップロード統合
 * - RM計算機能統合
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { RMCalculator } from './RMCalculator';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useImageStore } from '@/stores/imageStore';
// import { validateWorkoutRecord, validateWorkoutSet } from '@/utils/validation';
import { processImage } from '@/services/image/imageProcessor';
import type { WorkoutRecord, WorkoutSet, BodyPart } from '@/types';
import styles from './WorkoutForm.module.css';

// ============================================
// 型定義
// ============================================

export interface WorkoutFormProps {
  /** 編集モード時の初期データ */
  initialData?: WorkoutRecord;
  /** 保存成功時のコールバック */
  onSuccess?: (workout: WorkoutRecord) => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
}

interface SetFormData {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

// ============================================
// 定数
// ============================================

const BODY_PART_OPTIONS = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'shoulders', label: '肩' },
  { value: 'arms', label: '腕' },
  { value: 'legs', label: '脚' },
  { value: 'core', label: '体幹' },
  { value: 'other', label: 'その他' },
];

const MAX_IMAGES = 5;

// ============================================
// コンポーネント
// ============================================

export const WorkoutForm: React.FC<WorkoutFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  // ============================================
  // State
  // ============================================

  const [date, setDate] = useState<string>(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [bodyPart, setBodyPart] = useState<BodyPart | ''>(initialData?.bodyPart || '');
  const [exerciseName, setExerciseName] = useState<string>(initialData?.exerciseName || '');
  const [sets, setSets] = useState<SetFormData[]>(
    initialData?.sets.map((set) => ({
      setNumber: set.setNumber,
      weight: set.weight.toString(),
      reps: set.reps.toString(),
      completed: set.completed,
    })) || [{ setNumber: 1, weight: '', reps: '', completed: false }]
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRMCalculator, setShowRMCalculator] = useState(false);
  const [rmCalculatorSet, setRMCalculatorSet] = useState<number | null>(null);

  const { createWorkout, updateWorkoutById } = useWorkoutStore();
  const { uploadImage } = useImageStore();

  // ============================================
  // バリデーション
  // ============================================

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // 日付
    if (!date) {
      newErrors.date = '日付は必須です';
    }

    // 部位
    if (!bodyPart) {
      newErrors.bodyPart = '部位は必須です';
    }

    // トレーニング方法
    if (!exerciseName.trim()) {
      newErrors.exerciseName = 'トレーニング方法は必須です';
    }

    // セット
    if (sets.length === 0) {
      newErrors.sets = '少なくとも1セットは必要です';
    } else {
      sets.forEach((set, index) => {
        const weight = parseFloat(set.weight);
        const reps = parseInt(set.reps, 10);

        if (isNaN(weight) || weight < 0) {
          newErrors[`set${index}Weight`] = '有効な重量を入力してください';
        }

        if (isNaN(reps) || reps < 1) {
          newErrors[`set${index}Reps`] = '有効な回数を入力してください';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [date, bodyPart, exerciseName, sets]);

  // ============================================
  // セット操作
  // ============================================

  const addSet = useCallback(() => {
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weight: prev[prev.length - 1]?.weight || '',
        reps: prev[prev.length - 1]?.reps || '',
        completed: false,
      },
    ]);
  }, []);

  const removeSet = useCallback((index: number) => {
    setSets((prev) => {
      const newSets = prev.filter((_, i) => i !== index);
      return newSets.map((set, i) => ({ ...set, setNumber: i + 1 }));
    });
  }, []);

  const updateSet = useCallback((index: number, field: keyof SetFormData, value: string | boolean) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  }, []);

  // ============================================
  // 画像操作
  // ============================================

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_IMAGES - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setImages((prev) => [...prev, ...filesToAdd]);
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ============================================
  // RM計算
  // ============================================

  const openRMCalculator = useCallback((setIndex: number) => {
    setRMCalculatorSet(setIndex);
    setShowRMCalculator(true);
  }, []);

  const closeRMCalculator = useCallback(() => {
    setShowRMCalculator(false);
    setRMCalculatorSet(null);
  }, []);

  const applyRMCalculation = useCallback((weight: number) => {
    if (rmCalculatorSet !== null) {
      updateSet(rmCalculatorSet, 'weight', weight.toString());
      closeRMCalculator();
    }
  }, [rmCalculatorSet, updateSet, closeRMCalculator]);

  // ============================================
  // フォーム送信
  // ============================================

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        // セットデータを変換
        const workoutSets: WorkoutSet[] = sets.map((set) => ({
          setNumber: set.setNumber,
          weight: parseFloat(set.weight),
          reps: parseInt(set.reps, 10),
          completed: set.completed,
        }));

        // トレーニング記録を作成
        const workout: WorkoutRecord = {
          id: initialData?.id || crypto.randomUUID(),
          userId: initialData?.userId || 'default-user',
          date: new Date(date),
          bodyPart: bodyPart as BodyPart,
          exerciseName: exerciseName.trim(),
          sets: workoutSets,
          notes: notes.trim() || undefined,
          createdAt: initialData?.createdAt || new Date(),
          updatedAt: new Date(),
          syncStatus: 'pending',
        };

        // 画像を処理してアップロード
        const imageIds: string[] = [];
        for (const file of images) {
          const processed = await processImage(file);
          const imageId = await uploadImage({
            id: crypto.randomUUID(),
            workoutId: workout.id,
            blob: processed.original,
            thumbnail: processed.thumbnail,
            mimeType: processed.mimeType,
            size: processed.size,
            createdAt: new Date(),
          });
          imageIds.push(imageId);
        }

        workout.images = imageIds.length > 0 ? imageIds : undefined;

        // 保存
        if (initialData) {
          await updateWorkoutById(workout.id, workout);
        } else {
          await createWorkout(workout);
        }

        onSuccess?.(workout);
      } catch (error) {
        console.error('トレーニング記録の保存に失敗しました:', error);
        setErrors({
          submit: error instanceof Error ? error.message : '保存に失敗しました',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      sets,
      date,
      bodyPart,
      exerciseName,
      notes,
      images,
      initialData,
      createWorkout,
      updateWorkoutById,
      uploadImage,
      onSuccess,
    ]
  );

  // ============================================
  // レンダリング
  // ============================================

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {initialData ? 'トレーニング記録を編集' : '新しいトレーニング記録'}
        </h2>
      </div>

      {/* 基本情報 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>基本情報</h3>

        <Input
          type="date"
          label="日付"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
          fullWidth
        />

        <Select
          label="部位"
          options={BODY_PART_OPTIONS}
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value as BodyPart)}
          error={errors.bodyPart}
          placeholder="部位を選択"
          required
          fullWidth
        />

        <Input
          type="text"
          label="トレーニング方法"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          error={errors.exerciseName}
          placeholder="例: ベンチプレス"
          required
          fullWidth
        />
      </div>

      {/* セット情報 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>セット情報</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSet}>
            + セット追加
          </Button>
        </div>

        {errors.sets && <p className={styles.error}>{errors.sets}</p>}

        <div className={styles.sets}>
          {sets.map((set, index) => (
            <div key={index} className={styles.setRow}>
              <span className={styles.setNumber}>{set.setNumber}</span>

              <Input
                type="number"
                label="重量 (kg)"
                value={set.weight}
                onChange={(e) => updateSet(index, 'weight', e.target.value)}
                error={errors[`set${index}Weight`]}
                placeholder="0"
                step="0.5"
                min="0"
                fullWidth
              />

              <Input
                type="number"
                label="回数"
                value={set.reps}
                onChange={(e) => updateSet(index, 'reps', e.target.value)}
                error={errors[`set${index}Reps`]}
                placeholder="0"
                step="1"
                min="1"
                fullWidth
              />

              <div className={styles.setActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openRMCalculator(index)}
                  title="RM計算"
                >
                  📊
                </Button>
                {sets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSet(index)}
                    title="削除"
                  >
                    🗑️
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 画像アップロード */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>画像（任意）</h3>
        <p className={styles.helperText}>最大{MAX_IMAGES}枚まで添付できます</p>

        {images.length < MAX_IMAGES && (
          <div className={styles.imageUpload}>
            <input
              type="file"
              id="image-upload"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className={styles.imageInput}
            />
            <label htmlFor="image-upload" className={styles.imageLabel}>
              <span className={styles.uploadIcon}>📷</span>
              <span>画像を選択</span>
            </label>
          </div>
        )}

        {images.length > 0 && (
          <div className={styles.imagePreview}>
            {images.map((file, index) => (
              <div key={index} className={styles.imageItem}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`プレビュー ${index + 1}`}
                  className={styles.image}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={styles.imageRemove}
                  aria-label="画像を削除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* メモ */}
      <div className={styles.section}>
        <label htmlFor="notes" className={styles.label}>
          メモ（任意）
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="トレーニングの感想やメモを記録..."
          className={styles.textarea}
          rows={4}
        />
      </div>

      {/* エラーメッセージ */}
      {errors.submit && (
        <div className={styles.submitError} role="alert">
          {errors.submit}
        </div>
      )}

      {/* アクションボタン */}
      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} fullWidth>
            キャンセル
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting} fullWidth>
          {initialData ? '更新' : '保存'}
        </Button>
      </div>

      {/* RM計算機（モーダル） */}
      {showRMCalculator && rmCalculatorSet !== null && (
        <RMCalculator
          isModal
          initialWeight={parseFloat(sets[rmCalculatorSet].weight) || 0}
          initialReps={parseInt(sets[rmCalculatorSet].reps, 10) || 0}
          onApply={applyRMCalculation}
          onClose={closeRMCalculator}
        />
      )}
    </form>
  );
};
