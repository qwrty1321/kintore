/**
 * オフラインインジケーターコンポーネント
 * 
 * ネットワーク接続状態を表示
 * 要件: 9.3、9.4
 */

import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import styles from './OfflineIndicator.module.css';

export function OfflineIndicator() {
  const { isOnline } = useOfflineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className={styles.indicator} role="status" aria-live="polite">
      <span className={styles.icon}>📡</span>
      <span className={styles.text}>オフラインモード</span>
    </div>
  );
}
