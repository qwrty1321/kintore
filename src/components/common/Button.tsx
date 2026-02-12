import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのバリアント */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 全幅表示 */
  fullWidth?: boolean;
  /** ローディング状態 */
  loading?: boolean;
  /** 左側のアイコン */
  leftIcon?: React.ReactNode;
  /** 右側のアイコン */
  rightIcon?: React.ReactNode;
}

/**
 * アクセシブルで洗練されたボタンコンポーネント
 * 
 * 特徴:
 * - WCAG 2.1 AA準拠（最低44x44pxのタッチターゲット）
 * - キーボードナビゲーション対応
 * - フォーカスインジケーター
 * - ローディング状態のサポート
 * - 滑らかなアニメーション
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className={styles.spinner} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="60"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="60;0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        )}
        {!loading && leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={styles.content}>{children}</span>
        {!loading && rightIcon && (
          <span className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
