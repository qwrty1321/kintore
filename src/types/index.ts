/**
 * 型定義 - Workout Tracker
 */

// ============================================
// 基本型
// ============================================

export type BodyPart = 
  | 'chest'      // 胸
  | 'back'       // 背中
  | 'shoulders'  // 肩
  | 'arms'       // 腕
  | 'legs'       // 脚
  | 'core'       // 体幹
  | 'other';     // その他

export type SyncStatus = 'synced' | 'pending' | 'failed';

// ============================================
// トレーニング記録
// ============================================

export interface WorkoutSet {
  setNumber: number;
  weight: number;      // kg
  reps: number;        // 回数
  completed: boolean;
  rm1?: number;        // 計算された1RM
}

export interface WorkoutRecord {
  id: string;
  userId: string;
  date: Date;
  bodyPart: BodyPart;
  exerciseName: string;
  sets: WorkoutSet[];
  images?: string[];   // IndexedDB内の画像ID
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

// ============================================
// プリセット
// ============================================

export interface PresetSet {
  setNumber: number;
  weight: number;
  reps: number;
}

export interface Preset {
  id: string;
  name: string;
  bodyPart: BodyPart;
  exerciseName: string;
  sets: PresetSet[];
  createdAt: Date;
}

// ============================================
// 身体プロファイル
// ============================================

export interface BodyProfile {
  userId: string;
  height: number;           // cm
  weight: number;           // kg
  weeklyFrequency: number;  // 週あたりのトレーニング回数
  goals?: string;
  updatedAt: Date;
}

// ============================================
// 画像
// ============================================

export interface WorkoutImage {
  id: string;
  workoutId: string;
  blob: Blob;
  thumbnail: Blob;
  mimeType: string;
  size: number;
  createdAt: Date;
}

// ============================================
// 比較データ
// ============================================

export interface ComparisonData {
  bodyPart: BodyPart;
  exerciseName: string;
  statistics: {
    mean: number;
    median: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
  };
  sampleSize: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

// ============================================
// API関連
// ============================================

export interface AnonymousWorkout {
  date: string;  // ISO 8601
  bodyPart: BodyPart;
  exerciseName: string;
  maxWeight: number;
  totalReps: number;
  totalSets: number;
}

export interface AnonymousDataPayload {
  profileHash: string;  // ハッシュ化されたユーザーID
  height: number;
  weight: number;
  weeklyFrequency: number;
  workouts: AnonymousWorkout[];
}

// ============================================
// 同期キュー
// ============================================

export interface SyncQueueItem {
  id?: number;
  timestamp: Date;
  status: 'pending' | 'processing' | 'failed';
  payload: AnonymousDataPayload;
  retryCount: number;
  lastError?: string;
}

// ============================================
// エラー型
// ============================================

export type AppError = 
  | { type: 'validation'; field: string; message: string }
  | { type: 'storage'; operation: string; cause: Error }
  | { type: 'network'; endpoint: string; status?: number; cause: Error }
  | { type: 'image'; operation: string; cause: Error }
  | { type: 'calculation'; operation: string; cause: Error };

// ============================================
// フィルター
// ============================================

export interface WorkoutFilter {
  bodyPart?: BodyPart;
  exerciseName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================
// チャート設定
// ============================================

export type ChartAxis = 'weight' | 'reps' | 'sets' | 'frequency';

export interface ChartConfig {
  axis: ChartAxis;
  filter?: WorkoutFilter;
}

// ============================================
// RM計算
// ============================================

export interface RMCalculation {
  weight: number;
  reps: number;
  rm1: number;
  percentages: {
    50: number;
    60: number;
    70: number;
    80: number;
    90: number;
  };
}

// ============================================
// バリデーション結果
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
