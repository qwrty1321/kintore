/**
 * RMCalculator - Repetition Maximum 計算機コンポーネント
 * 
 * 要件: 3C.1、3C.2、3C.3、3C.4、3C.6
 * 
 * 機能:
 * - 重量・回数入力
 * - 1RM計算と表示
 * - パーセンテージ表示（50%, 60%, 70%, 80%, 90%）
 * - 記録への自動入力オプション
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { calculateRM, RMCalculationError } from '@/services/calculations/rmCalculator';
import type { RMCalculationResult } from '@/services/calculations/rmCalculator';
import styles from './RMCalculator.module.css';

// ============================================
// 型定義
// ============================================

export interface RMCalculatorProps {
  /** 初期重量（kg） */
  initialWeight?: number;
  /** 初期回数 */
  initialReps?: number;
  /** 計算結果を適用するコールバック（1RM値を渡す） */
  onApply?: (oneRM: number) => void;
  /** 閉じるボタンのコールバック（モーダル使用時） */
  onClose?: () => void;
  /** モーダルモードかどうか */
  isModal?: boolean;
  /** コンパクト表示モード */
  compact?: boolean;
}

// ============================================
// コンポーネント
// ============================================

export const RMCalculator: React.FC<RMCalculatorProps> = ({
  initialWeight = 0,
  initialReps = 0,
  onApply,
  onClose,
  isModal = false,
  compact = false,
}) => {
  // ============================================
  // State
  // ============================================

  const [weight, setWeight] = useState<string>(initialWeight > 0 ? initialWeight.toString() : '');
  const [reps, setReps] = useState<string>(initialReps > 0 ? initialReps.toString() : '');
  const [result, setResult] = useState<RMCalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);

  // ============================================
  // 初期値が変更された場合に更新
  // ============================================

  useEffect(() => {
    if (initialWeight > 0) {
      setWeight(initialWeight.toString());
    }
  }, [initialWeight]);

  useEffect(() => {
    if (initialReps > 0) {
      setReps(initialReps.toString());
    }
  }, [initialReps]);

  // ============================================
  // 自動計算（入力値が有効な場合）
  // ============================================

  useEffect(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);

    if (!isNaN(w) && w > 0 && !isNaN(r) && r > 0 && r <= 30) {
      try {
        const calculation = calculateRM(w, r);
        setResult(calculation);
        setError('');
      } catch (err) {
        // 自動計算時はエラーを表示しない
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [weight, reps]);

  // ============================================
  // 計算実行
  // ============================================

  const handleCalculate = useCallback(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);

    // バリデーション
    if (isNaN(w) || w <= 0) {
      setError('有効な重量を入力してください（0より大きい値）');
      setResult(null);
      return;
    }

    if (isNaN(r) || r <= 0) {
      setError('有効な回数を入力してください（1以上）');
      setResult(null);
      return;
    }

    if (r > 30) {
      setError('回数は30回以下で入力してください');
      setResult(null);
      return;
    }

    try {
      const calculation = calculateRM(w, r);
      setResult(calculation);
      setError('');
      setSelectedPercentage(null);
    } catch (err) {
      if (err instanceof RMCalculationError) {
        setError(err.message);
      } else {
        setError('計算に失敗しました');
      }
      setResult(null);
    }
  }, [weight, reps]);

  // ============================================
  // パーセンテージ選択
  // ============================================

  const handlePercentageSelect = useCallback((percentage: number, value: number) => {
    setSelectedPercentage(percentage);
  }, []);

  // ============================================
  // 適用ボタン
  // ============================================

  const handleApply = useCallback((value: number) => {
    if (onApply) {
      onApply(value);
    }
  }, [onApply]);

  // ============================================
  // リセット
  // ============================================

  const handleReset = useCallback(() => {
    setWeight('');
    setReps('');
    setResult(null);
    setError('');
    setSelectedPercentage(null);
  }, []);

  // ============================================
  // レンダリング
  // ============================================

  const content = (
    <div className={`${styles.calculator} ${compact ? styles.compact : ''}`}>
      {/* ヘッダー */}
      {!compact && (
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.icon}>📊</span>
            RM計算機
          </h3>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="閉じる"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* 説明 */}
      {!compact && (
        <p className={styles.description}>
          実施した重量と回数から1RM（1回だけ挙上できる最大重量）を計算します
        </p>
      )}

      {/* 入力フォーム */}
      <div className={styles.inputs}>
        <Input
          type="number"
          label="重量 (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="例: 100"
          step="0.5"
          min="0"
          fullWidth
          autoFocus={!compact}
        />

        <Input
          type="number"
          label="回数"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="例: 5"
          step="1"
          min="1"
          max="30"
          fullWidth
        />
      </div>

      {/* 計算ボタン */}
      {!compact && (
        <Button
          type="button"
          variant="primary"
          onClick={handleCalculate}
          fullWidth
          disabled={!weight || !reps}
        >
          計算する
        </Button>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* 計算結果 */}
      {result && (
        <div className={styles.result}>
          {/* 1RM */}
          <div className={styles.oneRM}>
            <div className={styles.oneRMLabel}>1RM（最大挙上重量）</div>
            <div className={styles.oneRMValue}>
              {result.oneRM}
              <span className={styles.unit}>kg</span>
            </div>
            {onApply && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleApply(result.oneRM)}
                className={styles.applyButton}
              >
                この値を使用
              </Button>
            )}
          </div>

          {/* パーセンテージ */}
          <div className={styles.percentages}>
            <div className={styles.percentagesHeader}>
              <span className={styles.percentagesTitle}>トレーニング強度の目安</span>
              <span className={styles.percentagesSubtitle}>
                1RMに対する各パーセンテージの重量
              </span>
            </div>

            <div className={styles.percentageGrid}>
              {[
                { percent: 50, value: result.percentages.fifty, label: '50%', desc: 'ウォームアップ' },
                { percent: 60, value: result.percentages.sixty, label: '60%', desc: '軽負荷' },
                { percent: 70, value: result.percentages.seventy, label: '70%', desc: '中負荷' },
                { percent: 80, value: result.percentages.eighty, label: '80%', desc: '高負荷' },
                { percent: 90, value: result.percentages.ninety, label: '90%', desc: '最大負荷' },
              ].map(({ percent, value, label, desc }) => (
                <button
                  key={percent}
                  type="button"
                  className={`${styles.percentageCard} ${
                    selectedPercentage === percent ? styles.selected : ''
                  }`}
                  onClick={() => handlePercentageSelect(percent, value)}
                >
                  <div className={styles.percentageLabel}>{label}</div>
                  <div className={styles.percentageValue}>
                    {value}
                    <span className={styles.percentageUnit}>kg</span>
                  </div>
                  <div className={styles.percentageDesc}>{desc}</div>
                  {onApply && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(value);
                      }}
                      className={styles.percentageApply}
                    >
                      使用
                    </Button>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* リセットボタン */}
          {!compact && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className={styles.resetButton}
            >
              リセット
            </Button>
          )}
        </div>
      )}

      {/* 注意事項 */}
      {!compact && result && (
        <div className={styles.note}>
          <strong>注意:</strong> この計算はEpley式に基づく推定値です。
          実際の1RMは個人差があるため、安全に配慮してトレーニングを行ってください。
        </div>
      )}
    </div>
  );

  // モーダルモードの場合はオーバーレイで包む
  if (isModal) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {content}
          {onClose && (
            <div className={styles.modalActions}>
              <Button type="button" variant="outline" onClick={onClose} fullWidth>
                閉じる
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return content;
};
