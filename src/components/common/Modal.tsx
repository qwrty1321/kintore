import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

export interface ModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** タイトル */
  title?: string;
  /** 子要素 */
  children: React.ReactNode;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** 背景クリックで閉じるか */
  closeOnBackdropClick?: boolean;
  /** ESCキーで閉じるか */
  closeOnEsc?: boolean;
  /** フッター要素 */
  footer?: React.ReactNode;
}

/**
 * アクセシブルで洗練されたモーダルコンポーネント
 * 
 * 特徴:
 * - WCAG 2.1 AA準拠
 * - フォーカストラップ（モーダル内でフォーカスを保持）
 * - ESCキーで閉じる
 * - 背景スクロール防止
 * - スムーズなアニメーション
 * - ポータルを使用してbody直下にレンダリング
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // モーダルが開いた時の処理
  useEffect(() => {
    if (isOpen) {
      // 現在のフォーカス要素を保存
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // 背景スクロールを防止
      document.body.style.overflow = 'hidden';
      
      // モーダル内の最初のフォーカス可能な要素にフォーカス
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    } else {
      // モーダルが閉じた時、元の要素にフォーカスを戻す
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // フォーカストラップ
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white rounded-xl shadow-xl animate-in zoom-in-95 duration-200',
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* ヘッダー */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              onClick={onClose}
              aria-label="閉じる"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* コンテンツ */}
        <div className="px-6 py-4">{children}</div>

        {/* フッター */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // ポータルを使用してbody直下にレンダリング
  return createPortal(modalContent, document.body);
};
