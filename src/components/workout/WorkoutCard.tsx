/**
 * WorkoutCard - 個別トレーニング記録カード
 * 
 * 要件: 3A.6、3B.1
 * 
 * 機能:
 * - 個別記録の詳細表示
 * - 画像ギャラリー（サムネイル表示、タップ/クリックで拡大）
 * - シェアボタン（Web Share API統合）
 * - 洗練されたビジュアルデザイン
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useImageStore } from '@/stores/imageStore';
import { shareWorkoutImage, shareWorkoutText, isShareSupported, downloadImage } from '@/services/image/shareService';
import type { WorkoutRecord, WorkoutImage } from '@/types';
import styles from './WorkoutCard.module.css';

// ============================================
// 型定義
// ============================================

export interface WorkoutCardProps {
  /** トレーニング記録 */
  workout: WorkoutRecord;
  /** 編集ボタンのコールバック */
  onEdit?: () => void;
  /** 削除ボタンのコールバック */
  onDelete?: () => void;
  /** コピーボタンのコールバック */
  onCopy?: () => void;
  /** プライバシー設定（個人情報を含めるか） */
  includePersonalInfo?: boolean;
}

// ============================================
// 定数
// ============================================

const BODY_PART_LABELS: Record<string, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
  other: 'その他',
};

const BODY_PART_EMOJIS: Record<string, string> = {
  chest: '💪',
  back: '🦾',
  shoulders: '🏋️',
  arms: '💪',
  legs: '🦵',
  core: '🧘',
  other: '⚡',
};

// ============================================
// コンポーネント
// ============================================

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onEdit,
  onDelete,
  onCopy,
  includePersonalInfo = false,
}) => {
  // ============================================
  // State
  // ============================================

  const [images, setImages] = useState<WorkoutImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { loadImagesByWorkoutId } = useImageStore();

  // ============================================
  // 画像読み込み
  // ============================================

  useEffect(() => {
    if (workout.images && workout.images.length > 0) {
      setIsLoadingImages(true);
      loadImagesByWorkoutId(workout.id)
        .then(setImages)
        .catch(error => {
          console.error('画像の読み込みに失敗しました:', error);
        })
        .finally(() => {
          setIsLoadingImages(false);
        });
    }
  }, [workout.id, workout.images, loadImagesByWorkoutId]);

  // ============================================
  // 計算
  // ============================================

  const bodyPartLabel = BODY_PART_LABELS[workout.bodyPart] || workout.bodyPart;
  const bodyPartEmoji = BODY_PART_EMOJIS[workout.bodyPart] || '💪';

  const totalWeight = workout.sets.reduce(
    (sum, set) => sum + set.weight * set.reps,
    0
  );
  const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);
  const maxWeight = Math.max(...workout.sets.map(s => s.weight));
  const avgWeight = workout.sets.reduce((sum, set) => sum + set.weight, 0) / workout.sets.length;

  const formattedDate = new Date(workout.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  // ============================================
  // シェア機能
  // ============================================

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      if (images.length > 0) {
        // 画像付きでシェア
        await shareWorkoutImage(workout, images[0], { includePersonalInfo });
      } else {
        // テキストのみシェア
        await shareWorkoutText(workout, { includePersonalInfo });
      }
    } catch (error) {
      console.error('シェアに失敗しました:', error);
      alert('シェアに失敗しました。もう一度お試しください。');
    } finally {
      setIsSharing(false);
    }
  }, [workout, images, includePersonalInfo]);

  const handleDownloadImage = useCallback((image: WorkoutImage) => {
    const filename = `workout-${new Date(workout.date).toISOString().split('T')[0]}.jpg`;
    downloadImage(image, filename);
  }, [workout.date]);

  // ============================================
  // 画像ギャラリー
  // ============================================

  const openImageGallery = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const closeImageGallery = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === null ? null : prev > 0 ? prev - 1 : images.length - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === null ? null : prev < images.length - 1 ? prev + 1 : 0
      );
    }
  }, [selectedImageIndex, images.length]);

  // ============================================
  // レンダリング
  // ============================================

  return (
    <>
      <article className={styles.card}>
        {/* ヘッダー */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.bodyPartBadge}>
              <span className={styles.bodyPartEmoji}>{bodyPartEmoji}</span>
              <span className={styles.bodyPartLabel}>{bodyPartLabel}</span>
            </div>
            <time className={styles.date} dateTime={workout.date.toISOString()}>
              {formattedDate}
            </time>
          </div>
          <h3 className={styles.exerciseName}>{workout.exerciseName}</h3>
        </div>

        {/* 統計情報 */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{workout.sets.length}</div>
            <div className={styles.statLabel}>セット</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalReps}</div>
            <div className={styles.statLabel}>合計回数</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{maxWeight}</div>
            <div className={styles.statLabel}>最大重量 (kg)</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalWeight.toFixed(0)}</div>
            <div className={styles.statLabel}>総負荷 (kg)</div>
          </div>
        </div>

        {/* セット詳細 */}
        <div className={styles.setsSection}>
          <h4 className={styles.sectionTitle}>セット詳細</h4>
          <div className={styles.sets}>
            {workout.sets.map((set) => (
              <div key={set.setNumber} className={styles.setRow}>
                <span className={styles.setNumber}>#{set.setNumber}</span>
                <div className={styles.setDetails}>
                  <span className={styles.setWeight}>{set.weight} kg</span>
                  <span className={styles.setSeparator}>×</span>
                  <span className={styles.setReps}>{set.reps} 回</span>
                </div>
                {set.rm1 && (
                  <span className={styles.setRM}>1RM: {set.rm1} kg</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* メモ */}
        {workout.notes && (
          <div className={styles.notesSection}>
            <h4 className={styles.sectionTitle}>メモ</h4>
            <p className={styles.notesText}>{workout.notes}</p>
          </div>
        )}

        {/* 画像ギャラリー */}
        {images.length > 0 && (
          <div className={styles.gallerySection}>
            <h4 className={styles.sectionTitle}>
              画像 ({images.length}枚)
            </h4>
            <div className={styles.gallery}>
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={styles.thumbnail}
                  onClick={() => openImageGallery(index)}
                  aria-label={`画像 ${index + 1} を拡大表示`}
                >
                  <img
                    src={URL.createObjectURL(image.thumbnail)}
                    alt={`トレーニング画像 ${index + 1}`}
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className={styles.actions}>
          <div className={styles.primaryActions}>
            {(images.length > 0 || isShareSupported()) && (
              <Button
                variant="primary"
                size="md"
                onClick={handleShare}
                loading={isSharing}
                fullWidth
              >
                {images.length > 0 ? '📤 シェア' : '📤 テキストをシェア'}
              </Button>
            )}
          </div>

          <div className={styles.secondaryActions}>
            {onCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCopy}
                title="この記録をコピー"
              >
                📋 コピー
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                title="編集"
              >
                ✏️ 編集
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                title="削除"
              >
                🗑️ 削除
              </Button>
            )}
          </div>
        </div>
      </article>

      {/* 画像拡大表示モーダル */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <Modal
          isOpen={true}
          onClose={closeImageGallery}
          size="full"
          closeOnBackdropClick={true}
          closeOnEsc={true}
        >
          <div className={styles.imageModal}>
            <div className={styles.imageModalHeader}>
              <span className={styles.imageCounter}>
                {selectedImageIndex + 1} / {images.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadImage(images[selectedImageIndex])}
              >
                💾 ダウンロード
              </Button>
            </div>

            <div className={styles.imageModalContent}>
              <img
                src={URL.createObjectURL(images[selectedImageIndex].blob)}
                alt={`トレーニング画像 ${selectedImageIndex + 1}`}
                className={styles.fullImage}
              />
            </div>

            {images.length > 1 && (
              <div className={styles.imageModalNav}>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigateImage('prev')}
                  aria-label="前の画像"
                >
                  ← 前へ
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigateImage('next')}
                  aria-label="次の画像"
                >
                  次へ →
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
