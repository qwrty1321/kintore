import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

/**
 * Header - 固定ヘッダーコンポーネント
 * 
 * モバイルとデスクトップで異なるナビゲーション表示
 * - デスクトップ: 横並びナビゲーション
 * - モバイル: ハンバーガーメニュー
 * 
 * 要件: 8.1, 8.2
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'ホーム', icon: '🏠' },
    { path: '/workouts', label: 'トレーニング', icon: '💪' },
    { path: '/progress', label: '進捗', icon: '📊' },
    { path: '/compare', label: '比較', icon: '👥' },
    { path: '/profile', label: 'プロフィール', icon: '⚙️' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* ロゴ */}
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Workout Tracker</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className={styles.desktopNav} aria-label="メインナビゲーション">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* モバイルメニューボタン */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className={`${styles.menuIcon} ${isMenuOpen ? styles.menuIconOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* モバイルナビゲーション */}
      <nav
        id="mobile-menu"
        className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}
        aria-label="モバイルナビゲーション"
      >
        <ul className={styles.mobileNavList}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.mobileNavLinkActive : ''}`}
                onClick={closeMenu}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <span className={styles.mobileNavIcon}>{item.icon}</span>
                <span className={styles.mobileNavLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* オーバーレイ（モバイルメニュー開閉時） */}
      {isMenuOpen && (
        <div
          className={styles.overlay}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
