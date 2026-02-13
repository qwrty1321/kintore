import React from 'react';
import { Button } from '@/components/common/Button';
import type { BodyProfile } from '@/types';
import styles from './ProfileSummary.module.css';

export interface ProfileSummaryProps {
  /** 表示するプロファイル */
  profile: BodyProfile;
  /** 編集ボタンクリック時のコールバック */
  onEdit?: () => void;
  /** コンパクト表示モード */
  compact?: boolean;
}

/**
 * プロファイル表示コンポーネント
 * 
 * **要件: 5.2**
 * - プロファイル情報の表示
 * - 編集ボタン
 * 
 * デザイン: Athletic Precision
 * - Outfitフォントによる洗練されたタイポグラフィ
 * - データ駆動型のビジュアルフィードバック
 * - アクセシビリティ対応
 */
export const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  profile,
  onEdit,
  compact = false,
}) => {
  /**
   * 最終更新日時をフォーマット
   */
  const formatUpdatedAt = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今日更新';
    } else if (diffDays === 1) {
      return '昨日更新';
    } else if (diffDays < 7) {
      return `${diffDays}日前に更新`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}週間前に更新`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  /**
   * BMIを計算
   */
  const calculateBMI = (): number => {
    const heightInMeters = profile.height / 100;
    return profile.weight / (heightInMeters * heightInMeters);
  };

  /**
   * BMIカテゴリーを取得
   */
  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) {
      return { label: '低体重', color: 'var(--color-warning)' };
    } else if (bmi < 25) {
      return { label: '標準', color: 'var(--color-success)' };
    } else if (bmi < 30) {
      return { label: '肥満（1度）', color: 'var(--color-warning)' };
    } else {
      return { label: '肥満（2度以上）', color: 'var(--color-error)' };
    }
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <div className={styles.compactStats}>
          <div className={styles.compactStat}>
            <span className={styles.compactValue}>{profile.height}</span>
            <span className={styles.compactUnit}>cm</span>
          </div>
          <div className={styles.compactDivider} />
          <div className={styles.compactStat}>
            <span className={styles.compactValue}>{profile.weight}</span>
            <span className={styles.compactUnit}>kg</span>
          </div>
          <div className={styles.compactDivider} />
          <div className={styles.compactStat}>
            <span className={styles.compactValue}>{profile.weeklyFrequency}</span>
            <span className={styles.compactUnit}>回/週</span>
          </div>
        </div>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            aria-label="プロファイルを編集"
          >
            編集
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>プロファイル</h2>
          <p className={styles.updatedAt}>
            {formatUpdatedAt(profile.updatedAt)}
          </p>
        </div>
        {onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            aria-label="プロファイルを編集"
          >
            編集
          </Button>
        )}
      </div>

      {/* 主要指標 */}
      <div className={styles.mainStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} aria-hidden="true">
            📏
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>身長</p>
            <p className={styles.statValue}>
              {profile.height}
              <span className={styles.statUnit}>cm</span>
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} aria-hidden="true">
            ⚖️
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>体重</p>
            <p className={styles.statValue}>
              {profile.weight}
              <span className={styles.statUnit}>kg</span>
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} aria-hidden="true">
            💪
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>トレーニング頻度</p>
            <p className={styles.statValue}>
              {profile.weeklyFrequency}
              <span className={styles.statUnit}>回/週</span>
            </p>
          </div>
        </div>
      </div>

      {/* BMI情報 */}
      <div className={styles.bmiCard}>
        <div className={styles.bmiHeader}>
          <h3 className={styles.bmiTitle}>BMI</h3>
          <span
            className={styles.bmiCategory}
            style={{ color: bmiCategory.color }}
          >
            {bmiCategory.label}
          </span>
        </div>
        <div className={styles.bmiValue}>
          {bmi.toFixed(1)}
        </div>
        <p className={styles.bmiDescription}>
          Body Mass Index（体格指数）
        </p>
      </div>

      {/* 目標 */}
      {profile.goals && (
        <div className={styles.goalsCard}>
          <h3 className={styles.goalsTitle}>目標</h3>
          <p className={styles.goalsText}>{profile.goals}</p>
        </div>
      )}
    </div>
  );
};
