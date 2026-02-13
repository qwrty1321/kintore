import React, { useState, useEffect } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useProfileStore } from '@/stores/profileStore';
import { validateBodyProfile } from '@/utils/validation';
import type { BodyProfile } from '@/types';

export interface ProfileFormProps {
  /** 既存のプロファイル（編集モード） */
  profile?: BodyProfile | null;
  /** 保存成功時のコールバック */
  onSuccess?: (profile: BodyProfile) => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 送信ボタンのテキスト */
  submitText?: string;
}

/**
 * プロファイル入力フォームコンポーネント
 * 
 * **要件: 5.1、5.3**
 * - 身長、体重、週あたりのトレーニング頻度の入力
 * - リアルタイムバリデーション
 * - 妥当な範囲を示すエラーメッセージ
 * 
 * デザイン: Athletic Precision
 * - Outfitフォントによる洗練されたタイポグラフィ
 * - 流動的なレイアウト
 * - アクセシビリティ対応
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSuccess,
  onCancel,
  submitText = '保存',
}) => {
  const { createProfile, updateProfileById, isLoading, error, clearError } = useProfileStore();

  // フォーム状態
  const [height, setHeight] = useState<string>(profile?.height?.toString() || '');
  const [weight, setWeight] = useState<string>(profile?.weight?.toString() || '');
  const [weeklyFrequency, setWeeklyFrequency] = useState<string>(
    profile?.weeklyFrequency?.toString() || ''
  );
  const [goals, setGoals] = useState<string>(profile?.goals || '');

  // バリデーションエラー
  const [errors, setErrors] = useState<Record<string, string>>({});

  // プロファイルが変更されたら状態を更新
  useEffect(() => {
    if (profile) {
      setHeight(profile.height?.toString() || '');
      setWeight(profile.weight?.toString() || '');
      setWeeklyFrequency(profile.weeklyFrequency?.toString() || '');
      setGoals(profile.goals || '');
    }
  }, [profile]);

  // エラーをクリア
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  /**
   * フィールドのバリデーション
   */
  const validateField = (field: string, value: string): string | undefined => {
    const partialProfile: Partial<BodyProfile> = {
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      weeklyFrequency: weeklyFrequency ? parseInt(weeklyFrequency, 10) : undefined,
    };

    // 現在のフィールドを更新
    if (field === 'height') {
      partialProfile.height = value ? parseFloat(value) : undefined;
    } else if (field === 'weight') {
      partialProfile.weight = value ? parseFloat(value) : undefined;
    } else if (field === 'weeklyFrequency') {
      partialProfile.weeklyFrequency = value ? parseInt(value, 10) : undefined;
    }

    const validation = validateBodyProfile(partialProfile);
    const fieldError = validation.errors.find((e) => e.field === field);
    return fieldError?.message;
  };

  /**
   * フィールド変更ハンドラー
   */
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeight(value);
    
    // リアルタイムバリデーション
    const error = validateField('height', value);
    setErrors((prev) => ({
      ...prev,
      height: error || '',
    }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(value);
    
    // リアルタイムバリデーション
    const error = validateField('weight', value);
    setErrors((prev) => ({
      ...prev,
      weight: error || '',
    }));
  };

  const handleWeeklyFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeeklyFrequency(value);
    
    // リアルタイムバリデーション
    const error = validateField('weeklyFrequency', value);
    setErrors((prev) => ({
      ...prev,
      weeklyFrequency: error || '',
    }));
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // すべてのフィールドをバリデーション
    const profileData: Partial<BodyProfile> = {
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      weeklyFrequency: weeklyFrequency ? parseInt(weeklyFrequency, 10) : undefined,
      goals: goals.trim() || undefined,
    };

    const validation = validateBodyProfile(profileData);

    if (!validation.valid) {
      // エラーをマップに変換
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    try {
      // 編集モードか新規作成か
      if (profile?.userId) {
        // 更新
        await updateProfileById(profile.userId, {
          height: parseFloat(height),
          weight: parseFloat(weight),
          weeklyFrequency: parseInt(weeklyFrequency, 10),
          goals: goals.trim() || undefined,
        });

        // 成功コールバック
        if (onSuccess) {
          onSuccess({
            ...profile,
            height: parseFloat(height),
            weight: parseFloat(weight),
            weeklyFrequency: parseInt(weeklyFrequency, 10),
            goals: goals.trim() || undefined,
            updatedAt: new Date(),
          });
        }
      } else {
        // 新規作成
        const userId = `user-${Date.now()}`; // 仮のユーザーID生成
        const newProfile: BodyProfile = {
          userId,
          height: parseFloat(height),
          weight: parseFloat(weight),
          weeklyFrequency: parseInt(weeklyFrequency, 10),
          goals: goals.trim() || undefined,
          updatedAt: new Date(),
        };

        await createProfile(newProfile);

        // 成功コールバック
        if (onSuccess) {
          onSuccess(newProfile);
        }
      }

      // エラーをクリア
      setErrors({});
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {profile ? 'プロファイルを編集' : 'プロファイルを作成'}
        </h2>
        <p className="text-gray-600">
          あなたの身体情報を入力してください。類似したユーザーとの比較に使用されます。
        </p>
      </div>

      <div className="space-y-4">
        {/* 身長 */}
        <Input
          label="身長"
          type="number"
          value={height}
          onChange={handleHeightChange}
          error={errors.height}
          helperText="100〜250cmの範囲で入力してください"
          placeholder="170"
          required
          fullWidth
          min={100}
          max={250}
          step={0.1}
          rightIcon={<span className="text-sm text-gray-500">cm</span>}
        />

        {/* 体重 */}
        <Input
          label="体重"
          type="number"
          value={weight}
          onChange={handleWeightChange}
          error={errors.weight}
          helperText="30〜300kgの範囲で入力してください"
          placeholder="70"
          required
          fullWidth
          min={30}
          max={300}
          step={0.1}
          rightIcon={<span className="text-sm text-gray-500">kg</span>}
        />

        {/* 週あたりのトレーニング頻度 */}
        <Input
          label="週あたりのトレーニング頻度"
          type="number"
          value={weeklyFrequency}
          onChange={handleWeeklyFrequencyChange}
          error={errors.weeklyFrequency}
          helperText="0〜14回の範囲で入力してください"
          placeholder="3"
          required
          fullWidth
          min={0}
          max={14}
          step={1}
          rightIcon={<span className="text-sm text-gray-500">回/週</span>}
        />

        {/* 目標（オプション） */}
        <div className="space-y-1.5">
          <label htmlFor="goals" className="text-sm font-medium text-gray-700">
            目標（オプション）
          </label>
          <textarea
            id="goals"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="例: 筋力アップ、体重減少、健康維持など"
            rows={3}
            maxLength={200}
          />
          <p className="text-sm text-gray-500">
            {goals.length}/200文字
          </p>
        </div>
      </div>

      {/* ストアのエラーメッセージ */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            キャンセル
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};
