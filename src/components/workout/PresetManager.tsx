/**
 * PresetManager - プリセット管理コンポーネント
 * 
 * 要件: 2.1、2.3、2.4
 * 
 * 機能:
 * - プリセット作成
 * - プリセット編集
 * - プリセット削除（確認ダイアログ付き）
 * - プリセット一覧表示
 */

import React, { useEffect, useState, useCallback } from 'react';
import { usePresetStore } from '@/stores/presetStore';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import type { Preset, BodyPart, PresetSet } from '@/types';
import { validatePreset } from '@/utils/validation';
import styles from './PresetManager.module.css';

// ============================================
// 型定義
// ============================================

export interface PresetManagerProps {
  /** プリセット選択時のコールバック（オプション） */
  onSelect?: (preset: Preset) => void;
}

interface PresetFormData {
  name: string;
  bodyPart: BodyPart;
  exerciseName: string;
  sets: PresetSet[];
}

type ModalMode = 'create' | 'edit' | 'delete' | null;

// ============================================
// 定数
// ============================================

const BODY_PART_OPTIONS: Array<{ value: BodyPart; label: string }> = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'shoulders', label: '肩' },
  { value: 'arms', label: '腕' },
  { value: 'legs', label: '脚' },
  { value: 'core', label: '体幹' },
  { value: 'other', label: 'その他' },
];

const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
  other: 'その他',
};

const INITIAL_FORM_DATA: PresetFormData = {
  name: '',
  bodyPart: 'chest',
  exerciseName: '',
  sets: [{ setNumber: 1, weight: 0, reps: 0 }],
};

// ============================================
// コンポーネント
// ============================================

export const PresetManager: React.FC<PresetManagerProps> = ({ onSelect }) => {
  // ============================================
  // State
  // ============================================

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [formData, setFormData] = useState<PresetFormData>(INITIAL_FORM_DATA);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [deletingPreset, setDeletingPreset] = useState<Preset | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    presets,
    isLoading,
    error,
    loadPresets,
    createPreset,
    updatePresetById,
    deletePresetById,
    clearError,
  } = usePresetStore();

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // ============================================
  // ハンドラー - モーダル制御
  // ============================================

  const handleOpenCreateModal = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setModalMode('create');
  }, []);

  const handleOpenEditModal = useCallback((preset: Preset) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      bodyPart: preset.bodyPart,
      exerciseName: preset.exerciseName,
      sets: [...preset.sets],
    });
    setFormErrors({});
    setModalMode('edit');
  }, []);

  const handleOpenDeleteModal = useCallback((preset: Preset) => {
    setDeletingPreset(preset);
    setModalMode('delete');
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setEditingPreset(null);
    setDeletingPreset(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    clearError();
  }, [clearError]);

  // ============================================
  // ハンドラー - フォーム入力
  // ============================================

  const handleInputChange = useCallback(
    (field: keyof Omit<PresetFormData, 'sets'>, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // エラーをクリア
      if (formErrors[field]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [formErrors]
  );

  const handleSetChange = useCallback(
    (index: number, field: keyof PresetSet, value: number) => {
      setFormData((prev) => ({
        ...prev,
        sets: prev.sets.map((set, i) =>
          i === index ? { ...set, [field]: value } : set
        ),
      }));
    },
    []
  );

  const handleAddSet = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      sets: [
        ...prev.sets,
        {
          setNumber: prev.sets.length + 1,
          weight: prev.sets[prev.sets.length - 1]?.weight || 0,
          reps: prev.sets[prev.sets.length - 1]?.reps || 0,
        },
      ],
    }));
  }, []);

  const handleRemoveSet = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      sets: prev.sets
        .filter((_, i) => i !== index)
        .map((set, i) => ({ ...set, setNumber: i + 1 })),
    }));
  }, []);

  // ============================================
  // ハンドラー - 送信
  // ============================================

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // バリデーション
      const preset: Preset = {
        id: editingPreset?.id || crypto.randomUUID(),
        ...formData,
        createdAt: editingPreset?.createdAt || new Date(),
      };

      const validation = validatePreset(preset);
      if (!validation.valid) {
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setFormErrors(errors);
        return;
      }

      setIsSubmitting(true);

      try {
        if (modalMode === 'create') {
          await createPreset(preset);
        } else if (modalMode === 'edit' && editingPreset) {
          await updatePresetById(editingPreset.id, formData);
        }
        handleCloseModal();
      } catch (error) {
        console.error('Failed to save preset:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, editingPreset, modalMode, createPreset, updatePresetById, handleCloseModal]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingPreset) return;

    setIsSubmitting(true);

    try {
      await deletePresetById(deletingPreset.id);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to delete preset:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [deletingPreset, deletePresetById, handleCloseModal]);

  // ============================================
  // レンダリング
  // ============================================

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>プリセット管理</h2>
          <p className={styles.description}>
            よく使うトレーニングセットを保存して、素早く入力できます
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} variant="primary">
          + 新規作成
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={clearError}>
            閉じる
          </Button>
        </div>
      )}

      {/* プリセット一覧 */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} aria-label="読み込み中" />
          <p>プリセットを読み込んでいます...</p>
        </div>
      ) : presets.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            📋
          </span>
          <p className={styles.emptyText}>プリセットがまだ保存されていません</p>
          <p className={styles.emptyHint}>
            「新規作成」ボタンから最初のプリセットを作成しましょう
          </p>
        </div>
      ) : (
        <div className={styles.presetGrid}>
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {/* 作成/編集モーダル */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'プリセット作成' : 'プリセット編集'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* プリセット名 */}
          <div className={styles.formGroup}>
            <label htmlFor="preset-name" className={styles.label}>
              プリセット名 <span className={styles.required}>*</span>
            </label>
            <input
              id="preset-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.input}
              placeholder="例: 胸トレA"
              aria-invalid={!!formErrors.name}
              aria-describedby={formErrors.name ? 'name-error' : undefined}
            />
            {formErrors.name && (
              <p id="name-error" className={styles.errorText} role="alert">
                {formErrors.name}
              </p>
            )}
          </div>

          {/* 部位 */}
          <div className={styles.formGroup}>
            <label htmlFor="preset-bodypart" className={styles.label}>
              部位 <span className={styles.required}>*</span>
            </label>
            <select
              id="preset-bodypart"
              value={formData.bodyPart}
              onChange={(e) => handleInputChange('bodyPart', e.target.value)}
              className={styles.select}
            >
              {BODY_PART_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* トレーニング方法 */}
          <div className={styles.formGroup}>
            <label htmlFor="preset-exercise" className={styles.label}>
              トレーニング方法 <span className={styles.required}>*</span>
            </label>
            <input
              id="preset-exercise"
              type="text"
              value={formData.exerciseName}
              onChange={(e) => handleInputChange('exerciseName', e.target.value)}
              className={styles.input}
              placeholder="例: ベンチプレス"
              aria-invalid={!!formErrors.exerciseName}
              aria-describedby={formErrors.exerciseName ? 'exercise-error' : undefined}
            />
            {formErrors.exerciseName && (
              <p id="exercise-error" className={styles.errorText} role="alert">
                {formErrors.exerciseName}
              </p>
            )}
          </div>

          {/* セット情報 */}
          <div className={styles.formGroup}>
            <div className={styles.setsHeader}>
              <label className={styles.label}>
                セット情報 <span className={styles.required}>*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSet}
              >
                + セット追加
              </Button>
            </div>

            <div className={styles.setsList}>
              {formData.sets.map((set, index) => (
                <div key={index} className={styles.setRow}>
                  <span className={styles.setNumber}>{index + 1}</span>
                  
                  <div className={styles.setInputs}>
                    <div className={styles.setInput}>
                      <label htmlFor={`weight-${index}`} className={styles.setLabel}>
                        重量(kg)
                      </label>
                      <input
                        id={`weight-${index}`}
                        type="number"
                        value={set.weight}
                        onChange={(e) =>
                          handleSetChange(index, 'weight', parseFloat(e.target.value) || 0)
                        }
                        className={styles.input}
                        min="0"
                        step="0.5"
                      />
                    </div>

                    <div className={styles.setInput}>
                      <label htmlFor={`reps-${index}`} className={styles.setLabel}>
                        回数
                      </label>
                      <input
                        id={`reps-${index}`}
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          handleSetChange(index, 'reps', parseInt(e.target.value) || 0)
                        }
                        className={styles.input}
                        min="0"
                      />
                    </div>
                  </div>

                  {formData.sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(index)}
                      className={styles.removeButton}
                      aria-label={`セット${index + 1}を削除`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* フッター */}
          <div className={styles.formFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? '保存中...'
                : modalMode === 'create'
                ? '作成'
                : '更新'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={modalMode === 'delete'}
        onClose={handleCloseModal}
        title="プリセットを削除"
        size="sm"
      >
        <div className={styles.deleteConfirm}>
          <p className={styles.deleteMessage}>
            本当に「<strong>{deletingPreset?.name}</strong>」を削除しますか？
          </p>
          <p className={styles.deleteWarning}>この操作は取り消せません。</p>

          <div className={styles.deleteFooter}>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? '削除中...' : '削除'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================
// PresetCard サブコンポーネント
// ============================================

interface PresetCardProps {
  preset: Preset;
  onEdit: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
  onSelect?: (preset: Preset) => void;
}

const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const totalWeight = preset.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
  const totalReps = preset.sets.reduce((sum, set) => sum + set.reps, 0);

  return (
    <div className={styles.presetCard}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>{preset.name}</h3>
          <span className={styles.bodyPartBadge}>
            {BODY_PART_LABELS[preset.bodyPart]}
          </span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.exerciseName}>{preset.exerciseName}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>セット数</span>
            <span className={styles.statValue}>{preset.sets.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>合計回数</span>
            <span className={styles.statValue}>{totalReps}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>総重量</span>
            <span className={styles.statValue}>{totalWeight.toFixed(1)}kg</span>
          </div>
        </div>

        <div className={styles.setDetails}>
          {preset.sets.map((set, index) => (
            <span key={index} className={styles.setInfo}>
              {set.weight}kg × {set.reps}回
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.createdAt}>
          {new Date(preset.createdAt).toLocaleDateString('ja-JP')}
        </span>
        <div className={styles.cardActions}>
          {onSelect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(preset)}
            >
              使用
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(preset)}
          >
            編集
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(preset)}
          >
            削除
          </Button>
        </div>
      </div>
    </div>
  );
};
