/**
 * PresetSelector - プリセット選択コンポーネント
 * 
 * 要件: 2.2
 * 
 * 機能:
 * - プリセット一覧表示
 * - プリセット選択とフォーム自動入力
 * - 部位によるフィルタリング
 * - プリセットの検索
 */

import React, { useEffect, useState, useCallback } from 'react';
import { usePresetStore } from '@/stores/presetStore';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import type { Preset, BodyPart } from '@/types';
import styles from './PresetSelector.module.css';

// ============================================
// 型定義
// ============================================

export interface PresetSelectorProps {
  /** プリセット選択時のコールバック */
  onSelect: (preset: Preset) => void;
  /** 現在選択されている部位（フィルタリング用） */
  currentBodyPart?: BodyPart;
  /** コンパクト表示モード */
  compact?: boolean;
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

const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
  other: 'その他',
};

// ============================================
// コンポーネント
// ============================================

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelect,
  currentBodyPart,
  compact = false,
}) => {
  // ============================================
  // State
  // ============================================

  const [filterBodyPart, setFilterBodyPart] = useState<BodyPart | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const { presets, isLoading, error, loadPresets, loadPresetsByBodyPart } = usePresetStore();

  // ============================================
  // Effects
  // ============================================

  // 初回読み込み
  useEffect(() => {
    if (currentBodyPart) {
      setFilterBodyPart(currentBodyPart);
      loadPresetsByBodyPart(currentBodyPart);
    } else {
      loadPresets();
    }
  }, [currentBodyPart, loadPresets, loadPresetsByBodyPart]);

  // ============================================
  // フィルタリング
  // ============================================

  const filteredPresets = presets.filter((preset) => {
    // 部位フィルター
    if (filterBodyPart && preset.bodyPart !== filterBodyPart) {
      return false;
    }

    // 検索クエリフィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        preset.name.toLowerCase().includes(query) ||
        preset.exerciseName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // ============================================
  // ハンドラー
  // ============================================

  const handleBodyPartChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as BodyPart | '';
      setFilterBodyPart(value);
      
      if (value) {
        loadPresetsByBodyPart(value);
      } else {
        loadPresets();
      }
    },
    [loadPresets, loadPresetsByBodyPart]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handlePresetSelect = useCallback(
    (preset: Preset) => {
      setSelectedPresetId(preset.id);
      onSelect(preset);
    },
    [onSelect]
  );

  // ============================================
  // レンダリング
  // ============================================

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={() => loadPresets()}>
          再読み込み
        </Button>
      </div>
    );
  }

  return (
    <div className={compact ? styles.containerCompact : styles.container}>
      {/* ヘッダー */}
      {!compact && (
        <div className={styles.header}>
          <h3 className={styles.title}>プリセットから選択</h3>
          <p className={styles.description}>
            保存済みのトレーニングセットを選択して、フォームに自動入力できます
          </p>
        </div>
      )}

      {/* フィルターと検索 */}
      <div className={styles.filters}>
        <Select
          options={BODY_PART_OPTIONS}
          value={filterBodyPart}
          onChange={handleBodyPartChange}
          placeholder="部位で絞り込み"
          aria-label="部位で絞り込み"
          fullWidth={compact}
        />

        <div className={styles.searchWrapper}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="プリセット名で検索..."
            className={styles.searchInput}
            aria-label="プリセット名で検索"
          />
          <span className={styles.searchIcon} aria-hidden="true">
            🔍
          </span>
        </div>
      </div>

      {/* プリセット一覧 */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} aria-label="読み込み中" />
          <p>プリセットを読み込んでいます...</p>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            📋
          </span>
          <p className={styles.emptyText}>
            {searchQuery || filterBodyPart
              ? '条件に一致するプリセットが見つかりません'
              : 'プリセットがまだ保存されていません'}
          </p>
          {(searchQuery || filterBodyPart) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterBodyPart('');
                loadPresets();
              }}
            >
              フィルターをクリア
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.presetList} role="list">
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={selectedPresetId === preset.id}
              onSelect={handlePresetSelect}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* プリセット数の表示 */}
      {!compact && filteredPresets.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.count}>
            {filteredPresets.length}件のプリセット
            {(searchQuery || filterBodyPart) && ` (全${presets.length}件中)`}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// PresetCard サブコンポーネント
// ============================================

interface PresetCardProps {
  preset: Preset;
  isSelected: boolean;
  onSelect: (preset: Preset) => void;
  compact?: boolean;
}

const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  isSelected,
  onSelect,
  compact = false,
}) => {
  const totalWeight = preset.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
  const totalReps = preset.sets.reduce((sum, set) => sum + set.reps, 0);

  return (
    <button
      type="button"
      className={`${styles.presetCard} ${isSelected ? styles.selected : ''} ${
        compact ? styles.compact : ''
      }`}
      onClick={() => onSelect(preset)}
      role="listitem"
      aria-pressed={isSelected}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span className={styles.presetName}>{preset.name}</span>
          <span className={styles.bodyPartBadge}>
            {BODY_PART_LABELS[preset.bodyPart]}
          </span>
        </div>
        {isSelected && (
          <span className={styles.selectedIcon} aria-label="選択中">
            ✓
          </span>
        )}
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

        {!compact && (
          <div className={styles.setDetails}>
            {preset.sets.map((set, index) => (
              <span key={index} className={styles.setInfo}>
                {set.weight}kg × {set.reps}回
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.createdAt}>
          作成日: {new Date(preset.createdAt).toLocaleDateString('ja-JP')}
        </span>
      </div>
    </button>
  );
};
