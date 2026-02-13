import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** ラベルテキスト */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** ヘルプテキスト */
  helperText?: string;
  /** 左側のアイコン */
  leftIcon?: React.ReactNode;
  /** 右側のアイコン */
  rightIcon?: React.ReactNode;
  /** 全幅表示 */
  fullWidth?: boolean;
}

/**
 * アクセシブルで洗練された入力フィールドコンポーネント
 * 
 * 特徴:
 * - WCAG 2.1 AA準拠
 * - ラベルとエラーメッセージの適切な関連付け
 * - フォーカスインジケーター
 * - アイコンサポート
 * - バリデーション状態の視覚的フィードバック
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // IDの生成（アクセシビリティのため）
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="必須">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3 py-2 border rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error ? 'border-red-500' : 'border-gray-300',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
