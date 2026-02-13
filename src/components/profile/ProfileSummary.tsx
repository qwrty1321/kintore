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
      <div className="flex items-center justify-between gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-2xl font-display font-bold text-gray-900">{profile.height}</span>
            <span className="text-sm text-gray-500 ml-1">cm</span>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <span className="text-2xl font-display font-bold text-gray-900">{profile.weight}</span>
            <span className="text-sm text-gray-500 ml-1">kg</span>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <span className="text-2xl font-display font-bold text-gray-900">{profile.weeklyFrequency}</span>
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
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">プロファイル</h2>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">身長</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {profile.height}
                <span className="text-lg text-gray-500 ml-1">cm</span>
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">体重</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {profile.weight}
                <span className="text-lg text-gray-500 ml-1">kg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">頻度</p>
              <p className="text-3xl font-display font-bold text-gray-900">
                {profile.weeklyFrequency}
                <span className="text-lg text-gray-500 ml-1">回/週</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BMI情報 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-gray-900">BMI</h3>
          <span
            className="px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
            style={{ 
              color: bmiCategory.color,
              backgroundColor: `${bmiCategory.color}15`,
              border: `2px solid ${bmiCategory.color}30`
            }}
          >
            {bmiCategory.label}
          </span>
        </div>
        <div className="text-6xl font-display font-bold text-gray-900 mb-3">
          {bmi.toFixed(1)}
        </div>
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Body Mass Index（体格指数）
        </p>
      </div>

      {/* 目標 */}
      {profile.goals && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900">目標</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{profile.goals}</p>
        </div>
      )}
    </div>
  );
};
