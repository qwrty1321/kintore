import React from 'react';
import styles from './Input.module.css';

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

    const wrapperClassNames = [
      styles.wrapper,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClassNames = [
      styles.input,
      error && styles.error,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClassNames}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-label="必須">
                *
              </span>
            )}
          </label>
        )}
        
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.leftIcon} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClassNames}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <span className={styles.rightIcon} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} className={styles.errorText} role="alert">
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p id={helperId} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
