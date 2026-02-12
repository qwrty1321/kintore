/**
 * オフライン状態検知フック
 * 
 * **要件: 9.1、9.3、9.4**
 */

import { useEffect } from 'react';
import { useSyncStore } from '@/stores/syncStore';

/**
 * オンライン/オフライン状態を監視し、syncStoreを更新するフック
 * 
 * ブラウザのonline/offlineイベントをリッスンし、
 * ネットワーク接続状態の変化を検知します
 * 
 * **検証: 要件 9.1、9.3、9.4**
 */
export function useOfflineStatus() {
  const { isOnline, setOnlineStatus } = useSyncStore();

  useEffect(() => {
    // 初期状態を設定
    setOnlineStatus(navigator.onLine);

    // オンラインイベントハンドラー
    const handleOnline = () => {
      console.log('ネットワーク接続が復帰しました');
      setOnlineStatus(true);
    };

    // オフラインイベントハンドラー
    const handleOffline = () => {
      console.log('ネットワーク接続が切断されました');
      setOnlineStatus(false);
    };

    // イベントリスナーを登録
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // クリーンアップ
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return { isOnline };
}

