import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from './components/layout';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// コード分割: React.lazyでルートベースの分割
const HomePage = lazy(() => import('./pages/HomePage'));
const WorkoutsPage = lazy(() => import('./pages/WorkoutsPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// ローディングフォールバック
function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      fontFamily: 'var(--font-body)',
      color: 'var(--color-text-secondary)'
    }}>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
