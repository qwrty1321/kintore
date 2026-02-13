import React from 'react';
import { Button } from '@/components/common/Button';
import type { BodyProfile } from '@/types';

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
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{profile.height}</span>
            <span className="text-sm text-gray-500 ml-1">cm</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{profile.weight}</span>
            <span className="text-sm text-gray-500 ml-1">kg</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{profile.weeklyFrequency}</span>
            <span className="text-sm text-gray-500 ml-1">回/週</span>
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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">プロファイル</h2>
          <p className="text-sm text-gray-500 mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2" aria-hidden="true">
            📏
          </div>
          <p className="text-sm text-gray-600 mb-1">身長</p>
          <p className="text-3xl font-bold text-gray-900">
            {profile.height}
            <span className="text-lg text-gray-500 ml-1">cm</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2" aria-hidden="true">
            ⚖️
          </div>
          <p className="text-sm text-gray-600 mb-1">体重</p>
          <p className="text-3xl font-bold text-gray-900">
            {profile.weight}
            <span className="text-lg text-gray-500 ml-1">kg</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-3xl mb-2" aria-hidden="true">
            💪
          </div>
          <p className="text-sm text-gray-600 mb-1">トレーニング頻度</p>
          <p className="text-3xl font-bold text-gray-900">
            {profile.weeklyFrequency}
            <span className="text-lg text-gray-500 ml-1">回/週</span>
          </p>
        </div>
      </div>

      {/* BMI情報 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">BMI</h3>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              color: bmiCategory.color,
              backgroundColor: `${bmiCategory.color}15`
            }}
          >
            {bmiCategory.label}
          </span>
        </div>
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {bmi.toFixed(1)}
        </div>
        <p className="text-sm text-gray-600">
          Body Mass Index（体格指数）
        </p>
      </div>

      {/* 目標 */}
      {profile.goals && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">目標</h3>
          <p className="text-gray-700">{profile.goals}</p>
        </div>
      )}
    </div>
  );
};
