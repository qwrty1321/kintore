/**
 * 定数定義 - Workout Tracker
 */

import type { BodyPart } from '@/types';

// ============================================
// 部位の定義
// ============================================

export const BODY_PARTS: Record<BodyPart, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
  other: 'その他',
};

export const BODY_PART_OPTIONS = Object.entries(BODY_PARTS).map(([value, label]) => ({
  value: value as BodyPart,
  label,
}));

// ============================================
// バリデーション制約
// ============================================

export const VALIDATION_CONSTRAINTS = {
  // トレーニング記録
  workout: {
    exerciseName: {
      minLength: 1,
      maxLength: 50,
    },
    weight: {
      min: 0.1,
      max: 500,
    },
    reps: {
      min: 1,
      max: 100,
    },
    sets: {
      min: 1,
      max: 10,
    },
    notes: {
      maxLength: 500,
    },
  },
  
  // 身体プロファイル
  profile: {
    height: {
      min: 100,
      max: 250,
    },
    weight: {
      min: 30,
      max: 300,
    },
    weeklyFrequency: {
      min: 0,
      max: 14,
    },
  },
  
  // RM計算
  rm: {
    weight: {
      min: 0.1,
      max: 1000,
    },
    reps: {
      min: 1,
      max: 30,
    },
  },
  
  // 画像
  image: {
    maxCount: 5,
    maxWidth: 1920,
    maxSizeMB: 10,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  },
};

// ============================================
// 比較データ設定
// ============================================

export const COMPARISON_SETTINGS = {
  heightTolerance: 5,      // ±5cm
  weightTolerance: 5,      // ±5kg
  frequencyTolerance: 1,   // ±1回/週
  minSampleSize: 10,       // 最小サンプル数
};

// ============================================
// パフォーマンス設定
// ============================================

export const PERFORMANCE_TARGETS = {
  lcp: 2500,      // Largest Contentful Paint (ms)
  fid: 100,       // First Input Delay (ms)
  cls: 0.1,       // Cumulative Layout Shift
  saveTimeout: 200, // 保存操作のタイムアウト (ms)
  pageTransition: 500, // ページ遷移時間 (ms)
};

// ============================================
// ストレージキー
// ============================================

export const STORAGE_KEYS = {
  userId: 'workout_tracker_user_id',
  profile: 'workout_tracker_profile',
  settings: 'workout_tracker_settings',
  lastSync: 'workout_tracker_last_sync',
  privacyConsent: 'workout_tracker_privacy_consent',
};

// ============================================
// API設定
// ============================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.workout-tracker.example.com',
  timeout: 10000, // 10秒
  retryAttempts: 3,
  retryDelay: 1000, // 1秒
};

// ============================================
// デフォルト値
// ============================================

export const DEFAULTS = {
  userId: () => crypto.randomUUID(),
  workoutSets: 3,
  workoutReps: 10,
  workoutWeight: 20,
};

// ============================================
// エラーメッセージ
// ============================================

export const ERROR_MESSAGES = {
  validation: {
    required: (field: string) => `${field}は必須です`,
    minLength: (field: string, min: number) => `${field}は${min}文字以上で入力してください`,
    maxLength: (field: string, max: number) => `${field}は${max}文字以内で入力してください`,
    min: (field: string, min: number) => `${field}は${min}以上で入力してください`,
    max: (field: string, max: number) => `${field}は${max}以下で入力してください`,
    range: (field: string, min: number, max: number) => 
      `${field}は${min}〜${max}の範囲で入力してください`,
  },
  storage: {
    saveFailed: 'データの保存に失敗しました',
    loadFailed: 'データの読み込みに失敗しました',
    deleteFailed: 'データの削除に失敗しました',
    quotaExceeded: 'ストレージの容量が不足しています',
  },
  network: {
    offline: 'オフラインです。データはローカルに保存されました',
    timeout: '通信がタイムアウトしました',
    serverError: 'サーバーエラーが発生しました',
    unknownError: '不明なエラーが発生しました',
  },
  image: {
    uploadFailed: '画像のアップロードに失敗しました',
    compressionFailed: '画像の圧縮に失敗しました',
    invalidFormat: 'サポートされていない画像形式です',
    tooLarge: '画像サイズが大きすぎます',
    maxCountExceeded: `画像は最大${VALIDATION_CONSTRAINTS.image.maxCount}枚まで添付できます`,
  },
  calculation: {
    invalidInput: '無効な入力値です',
    rmCalculationFailed: 'RM計算に失敗しました',
  },
};

// ============================================
// 成功メッセージ
// ============================================

export const SUCCESS_MESSAGES = {
  workout: {
    created: 'トレーニング記録を保存しました',
    updated: 'トレーニング記録を更新しました',
    deleted: 'トレーニング記録を削除しました',
    copied: 'トレーニング記録をコピーしました',
  },
  preset: {
    created: 'プリセットを作成しました',
    updated: 'プリセットを更新しました',
    deleted: 'プリセットを削除しました',
  },
  profile: {
    created: 'プロファイルを作成しました',
    updated: 'プロファイルを更新しました',
  },
  sync: {
    completed: 'データを同期しました',
  },
};
