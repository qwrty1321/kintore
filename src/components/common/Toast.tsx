import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  /** トーストのタイプ */
  type: ToastType;
  /** メッセージ */
  message: string;
  /** 表示時間（ミリ秒）、0で自動非表示なし */
  duration?: number;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** アイコンをカスタマイズ */
  icon?: React.ReactNode;
}

/**
 * アクセシブルで洗練されたトーストコンポーネント
 * 
 * 特徴:
 * - WCAG 2.1 AA準拠
 * - role="alert"でスクリーンリーダーに通知
 * - 自動非表示のサポート
 * - スムーズなアニメーション
 * - タイプ別のアイコンと色
 */
export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 5000,
  onClose,
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // アニメーション完了後に閉じる
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const defaultIcons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.6667 5L7.50004 14.1667L3.33337 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15 5L5 15M5 5L15 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 14V10M10 6H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  const toastContent = (
    <div
      className={`${styles.toast} ${styles[type]} ${!isVisible ? styles.exit : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconWrapper}>
        {icon || defaultIcons[type]}
      </div>
      
      <p className={styles.message}>{message}</p>
      
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="閉じる"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );

  return createPortal(toastContent, document.body);
};

/**
 * トーストコンテナコンポーネント
 * 複数のトーストを管理するためのコンテナ
 */
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  const containerContent = (
    <div className={`${styles.container} ${styles[position]}`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );

  return createPortal(containerContent, document.body);
};
