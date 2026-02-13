import React, { useState, useEffect } from 'react';
import { ProfileSummary } from '@/components/profile/ProfileSummary';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useProfileStore } from '@/stores/profileStore';
import type { BodyProfile } from '@/types';

/**
 * プロファイルページ
 * 
 * プロファイルの表示と編集を行うページ
 */
export const ProfilePage: React.FC = () => {
  const { profile, loadProfile } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);

  // 初回読み込み時にプロファイルを取得
  useEffect(() => {
    // 仮のユーザーIDでプロファイルを読み込み
    const userId = 'user-demo';
    loadProfile(userId);
  }, [loadProfile]);

  /**
   * 編集モードを開始
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * 編集をキャンセル
   */
  const handleCancel = () => {
    setIsEditing(false);
  };

  /**
   * 保存成功時
   */
  const handleSuccess = (_updatedProfile: BodyProfile) => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {isEditing ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ProfileForm
              profile={profile}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              submitText="保存"
            />
          </div>
        ) : profile ? (
          <ProfileSummary profile={profile} onEdit={handleEdit} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">プロファイルが見つかりません</h2>
            <p className="text-gray-600 mb-8">
              プロファイルを作成して、トレーニングを始めましょう。
            </p>
            <ProfileForm
              onSuccess={handleSuccess}
              submitText="プロファイルを作成"
            />
          </div>
        )}
      </div>
    </div>
  );
};
