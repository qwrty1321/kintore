import { ReactNode } from 'react';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout - メインレイアウトコンポーネント
 * 
 * シンプルなレイアウト構造
 * 要件: 8.1, 8.2
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 固定ヘッダー */}
      <Header />
      
      {/* メインコンテンツエリア */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
