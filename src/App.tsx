import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from './components/layout';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// コード分割: React.lazyでルートベースの分割
const ProgressPage = lazy(() => import('./pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// ローディングフォールバック
function LoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-[400px] text-gray-500">
      読み込み中...
    </div>
  );
}

/**
 * メインアプリケーションコンポーネント
 * 
 * 要件: 11.1, 11.2 - コード分割とLazy Loading
 */
function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <OfflineIndicator />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<ProgressPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
