/**
 * オフラインインジケーターコンポーネント
 * 
 * ネットワーク接続状態を表示
 * 要件: 9.3、9.4
 */

import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export function OfflineIndicator() {
  const { isOnline } = useOfflineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg shadow-lg"
      role="status" 
      aria-live="polite"
    >
      <span className="text-lg">📡</span>
      <span className="text-sm font-medium">オフラインモード</span>
    </div>
  );
}
