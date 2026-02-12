import { ReactNode } from 'react';
import { Header } from './Header';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout - メインレイアウトコンポーネント
 * 
 * レスポンシブデザインで、デスクトップとモバイルで異なる広告配置を実現
 * - デスクトップ (≥1024px): 左右に広告スペース (160px)
 * - モバイル (<1024px): 下部に固定バナー広告 (60px)
 * 
 * 要件: 8.1, 8.2, 8.3, 8.6, 8.7
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      {/* 固定ヘッダー */}
      <Header />
      
      <div className={styles.appLayout}>
        {/* デスクトップ: 左側広告スペース */}
        <aside className={styles.adLeft} aria-label="広告スペース（左）">
          <div className={styles.adPlaceholder}>
            {/* 広告コンテンツがここに配置されます */}
          </div>
        </aside>

        {/* メインコンテンツエリア */}
        <main className={styles.mainContent}>
          {children}
        </main>

        {/* デスクトップ: 右側広告スペース */}
        <aside className={styles.adRight} aria-label="広告スペース（右）">
          <div className={styles.adPlaceholder}>
            {/* 広告コンテンツがここに配置されます */}
          </div>
        </aside>

        {/* モバイル: 下部固定バナー広告 */}
        <aside className={styles.adBottom} aria-label="広告スペース（下部）">
          <div className={styles.adPlaceholder}>
            {/* 広告コンテンツがここに配置されます */}
          </div>
        </aside>
      </div>
    </>
  );
}
