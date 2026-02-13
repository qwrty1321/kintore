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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg shadow-lg"
      role="status" 
      aria-live="polite"
    >
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span className="text-sm font-medium">オフラインモード</span>
    </div>
  );
}
