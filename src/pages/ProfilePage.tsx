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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {isEditing ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-scale-in">
            <ProfileForm
              profile={profile}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              submitText="保存"
            />
          </div>
        ) : profile ? (
          <div className="animate-fade-in">
            <ProfileSummary profile={profile} onEdit={handleEdit} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">プロファイルが見つかりません</h2>
            <p className="text-gray-600 mb-10 text-lg">
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
