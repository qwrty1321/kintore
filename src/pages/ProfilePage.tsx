import React, { useState, useEffect } from 'react';
import { ProfileSummary } from '@/components/profile/ProfileSummary';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useProfileStore } from '@/stores/profileStore';
import type { BodyProfile } from '@/types';
import styles from './ProfilePage.module.css';

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
    <div className={styles.container}>
      <div className={styles.content}>
        {isEditing ? (
          <ProfileForm
            profile={profile}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            submitText="保存"
          />
        ) : profile ? (
          <ProfileSummary profile={profile} onEdit={handleEdit} />
        ) : (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>プロファイルが見つかりません</h2>
            <p className={styles.emptyDescription}>
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
