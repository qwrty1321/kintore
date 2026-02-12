# 設計書: Workout Tracker

## 概要

Workout Trackerは、モバイルとPCの両方で動作するプログレッシブウェブアプリケーション（PWA）です。ユーザーはトレーニング記録を入力・可視化し、画像を添付し、RM計算を行い、匿名化されたデータを通じて類似ユーザーと比較できます。

### 設計の核心原則

1. **オフラインファースト**: すべてのコア機能はオフラインで動作
2. **パフォーマンス優先**: Core Web Vitals最適化、3秒以内の初回読み込み
3. **アクセシビリティ**: WCAG 2.1 AA準拠
4. **印象的なデザイン**: 独自性のある視覚体験、広告との調和

## アーキテクチャ

### 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **状態管理**: Zustand（軽量、シンプル）
- **ルーティング**: React Router v6
- **スタイリング**: CSS Modules + CSS Variables（デザイントークン）
- **グラフ**: Chart.js（軽量、レスポンシブ）
- **ローカルストレージ**: IndexedDB（Dexie.js）
- **画像処理**: Browser-image-compression
- **PWA**: Workbox（Service Worker）
- **ビルドツール**: Vite

### アーキテクチャパターン

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (React Components + CSS Modules)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Application Layer              │
│     (Zustand Stores + Hooks)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Domain Layer                 │
│  (Business Logic + Calculations)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Infrastructure Layer            │
│  (IndexedDB + API Client + SW)          │
└─────────────────────────────────────────┘
```

### レイヤー責務

1. **Presentation Layer**: UI表示、ユーザー入力、アニメーション
2. **Application Layer**: 状態管理、ビジネスロジックの調整
3. **Domain Layer**: コアビジネスロジック、計算、バリデーション
4. **Infrastructure Layer**: データ永続化、API通信、キャッシング

## コンポーネントとインターフェース

### コアコンポーネント構造

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          # メインレイアウト（広告スペース含む）
│   │   ├── MobileLayout.tsx       # モバイル専用レイアウト
│   │   └── DesktopLayout.tsx      # デスクトップ専用レイアウト
│   ├── workout/
│   │   ├── WorkoutForm.tsx        # トレーニング入力フォーム
│   │   ├── WorkoutList.tsx        # 記録一覧
│   │   ├── WorkoutCard.tsx        # 個別記録カード
│   │   ├── PresetSelector.tsx     # プリセット選択
│   │   └── RMCalculator.tsx       # RM計算機
│   ├── image/
│   │   ├── ImageUploader.tsx      # 画像アップロード
│   │   ├── ImageGallery.tsx       # 画像ギャラリー
│   │   └── ImageShareButton.tsx   # シェアボタン
│   ├── chart/
│   │   ├── ProgressChart.tsx      # 進捗グラフ
│   │   ├── ComparisonChart.tsx    # 比較グラフ
│   │   └── ChartFilters.tsx       # フィルター
│   ├── profile/
│   │   ├── ProfileForm.tsx        # プロファイル入力
│   │   └── ProfileSummary.tsx     # プロファイル表示
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── stores/
│   ├── workoutStore.ts            # トレーニング記録状態
│   ├── presetStore.ts             # プリセット状態
│   ├── profileStore.ts            # プロファイル状態
│   ├── imageStore.ts              # 画像状態
│   └── syncStore.ts               # 同期状態
├── services/
│   ├── db/
│   │   ├── workoutDB.ts           # IndexedDB操作
│   │   ├── imageDB.ts             # 画像ストレージ
│   │   └── schema.ts              # DBスキーマ
│   ├── api/
│   │   ├── apiClient.ts           # API通信
│   │   ├── syncService.ts         # データ同期
│   │   └── comparisonService.ts   # 比較データ取得
│   ├── calculations/
│   │   ├── rmCalculator.ts        # RM計算
│   │   └── statistics.ts          # 統計計算
│   └── image/
│       ├── imageProcessor.ts      # 画像処理
│       └── shareService.ts        # シェア機能
├── hooks/
│   ├── useWorkouts.ts
│   ├── usePresets.ts
│   ├── useProfile.ts
│   ├── useImages.ts
│   ├── useSync.ts
│   └── useOfflineStatus.ts
└── utils/
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

### 主要インターフェース

```typescript
// トレーニング記録
interface WorkoutRecord {
  id: string;
  userId: string;
  date: Date;
  bodyPart: BodyPart;
  exerciseName: string;
  sets: WorkoutSet[];
  images?: string[];  // IndexedDB内の画像ID
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

interface WorkoutSet {
  setNumber: number;
  weight: number;      // kg
  reps: number;
  completed: boolean;
  rm1?: number;        // 計算された1RM
}

type BodyPart = 
  | 'chest' | 'back' | 'shoulders' 
  | 'arms' | 'legs' | 'core' | 'other';

// プリセット
interface Preset {
  id: string;
  name: string;
  bodyPart: BodyPart;
  exerciseName: string;
  sets: PresetSet[];
  createdAt: Date;
}

interface PresetSet {
  setNumber: number;
  weight: number;
  reps: number;
}

// 身体プロファイル
interface BodyProfile {
  userId: string;
  height: number;      // cm
  weight: number;      // kg
  weeklyFrequency: number;  // 週あたりのトレーニング回数
  goals?: string;
  updatedAt: Date;
}

// 画像
interface WorkoutImage {
  id: string;
  workoutId: string;
  blob: Blob;
  thumbnail: Blob;
  mimeType: string;
  size: number;
  createdAt: Date;
}

// 比較データ
interface ComparisonData {
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

// API レスポンス
interface AnonymousDataPayload {
  profileHash: string;  // ハッシュ化されたユーザーID
  height: number;
  weight: number;
  weeklyFrequency: number;
  workouts: AnonymousWorkout[];
}

interface AnonymousWorkout {
  date: string;  // ISO 8601
  bodyPart: BodyPart;
  exerciseName: string;
  maxWeight: number;
  totalReps: number;
  totalSets: number;
}
```

## データモデル

### IndexedDB スキーマ

```typescript
// Dexie.js スキーマ定義
class WorkoutDatabase extends Dexie {
  workouts!: Table<WorkoutRecord>;
  presets!: Table<Preset>;
  profile!: Table<BodyProfile>;
  images!: Table<WorkoutImage>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('WorkoutTrackerDB');
    this.version(1).stores({
      workouts: 'id, userId, date, bodyPart, exerciseName, syncStatus',
      presets: 'id, name, bodyPart',
      profile: 'userId',
      images: 'id, workoutId, createdAt',
      syncQueue: '++id, timestamp, status'
    });
  }
}
```

### データフロー

```
ユーザー入力
    ↓
バリデーション (Domain Layer)
    ↓
状態更新 (Zustand Store)
    ↓
IndexedDB保存 (Infrastructure Layer)
    ↓
同期キュー追加 (オンライン時)
    ↓
API送信 (バックグラウンド)
```

## デザインシステム

### 美的方向性

**コンセプト**: "Athletic Precision" - スポーツウェアブランドの洗練さと、データ可視化の明瞭さを融合

**トーン**: モダン・ミニマル・エネルギッシュ

**差別化要素**:
- 大胆なタイポグラフィ階層
- 動的なグラデーション背景
- マイクロインタラクションの洗練
- データ駆動型のビジュアルフィードバック

### デザイントークン

```css
:root {
  /* Primitive Tokens - 物理値 */
  --color-primary-50: #e8f4f8;
  --color-primary-100: #b8e1f0;
  --color-primary-200: #88cee8;
  --color-primary-300: #58bbe0;
  --color-primary-400: #28a8d8;
  --color-primary-500: #0891c2;  /* メインブランドカラー */
  --color-primary-600: #067399;
  --color-primary-700: #055570;
  --color-primary-800: #033747;
  --color-primary-900: #021a1e;

  --color-accent-50: #fff3e0;
  --color-accent-500: #ff9800;  /* アクセントカラー */
  --color-accent-700: #f57c00;

  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #eeeeee;
  --color-neutral-300: #e0e0e0;
  --color-neutral-400: #bdbdbd;
  --color-neutral-500: #9e9e9e;
  --color-neutral-600: #757575;
  --color-neutral-700: #616161;
  --color-neutral-800: #424242;
  --color-neutral-900: #212121;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Semantic Tokens - 役割 */
  --color-bg-primary: var(--color-neutral-50);
  --color-bg-secondary: var(--color-neutral-100);
  --color-bg-elevated: #ffffff;
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-inverse: #ffffff;
  --color-border: var(--color-neutral-300);
  --color-interactive: var(--color-primary-500);
  --color-interactive-hover: var(--color-primary-600);

  /* Typography */
  --font-display: 'Outfit', -apple-system, sans-serif;  /* 独特なディスプレイフォント */
  --font-body: 'Inter', -apple-system, sans-serif;

  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.5rem);
  --font-size-xl: clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem);
  --font-size-2xl: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;

  /* Layout */
  --container-max-width: 1200px;
  --sidebar-ad-width: 160px;  /* PC: 左右広告 */
  --mobile-ad-height: 60px;   /* モバイル: 下部バナー */
  --content-padding: var(--space-lg);

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-fixed: 1200;
  --z-modal: 1300;
  --z-toast: 1400;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: var(--color-neutral-900);
    --color-bg-secondary: var(--color-neutral-800);
    --color-bg-elevated: var(--color-neutral-700);
    --color-text-primary: var(--color-neutral-50);
    --color-text-secondary: var(--color-neutral-400);
    --color-border: var(--color-neutral-700);
  }
}
```

### レイアウト戦略

#### デスクトップレイアウト（≥1024px）

```
┌────────────────────────────────────────────────────────┐
│                      Header (固定)                      │
├──────────┬────────────────────────────┬─────────────────┤
│          │                            │                 │
│   左側   │                            │      右側       │
│  広告    │      メインコンテンツ       │     広告        │
│ (160px)  │      (max 1200px)          │    (160px)      │
│          │                            │                 │
│          │                            │                 │
└──────────┴────────────────────────────┴─────────────────┘
```

#### モバイルレイアウト（<1024px）

```
┌────────────────────────────────────┐
│         Header (固定)              │
├────────────────────────────────────┤
│                                    │
│                                    │
│        メインコンテンツ             │
│                                    │
│                                    │
├────────────────────────────────────┤
│    下部バナー広告 (固定, 60px)      │
└────────────────────────────────────┘
```

### コンポーネントデザイン仕様

#### ボタン

```css
.button {
  /* 基本スタイル */
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-lg);
  transition: all var(--transition-base);
  min-height: 44px;  /* アクセシビリティ */
  
  /* ホバーエフェクト */
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  /* アクティブ状態 */
  &:active {
    transform: translateY(0);
  }
}
```

#### カード

```css
.card {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-xl);
  }
}
```

### アニメーション戦略

```css
/* ページ遷移 */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* カード表示（スタガード） */
.card-list > .card {
  animation: fadeSlideIn var(--transition-base) ease-out;
  animation-fill-mode: both;
}

.card-list > .card:nth-child(1) { animation-delay: 0ms; }
.card-list > .card:nth-child(2) { animation-delay: 50ms; }
.card-list > .card:nth-child(3) { animation-delay: 100ms; }

/* モーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 正確性プロパティ

プロパティとは、システムのすべての有効な実行において真であるべき特性や動作のことです。これは人間が読める仕様と機械で検証可能な正確性保証の橋渡しとなります。

### プロパティ 1: トレーニング記録のラウンドトリップ

*任意の*有効なトレーニング記録について、IndexedDBに保存してから取得した場合、元の記録と同等のデータが得られる

**検証: 要件 1.2**

### プロパティ 2: 無効な入力の拒否

*任意の*無効なトレーニングデータ（負の重量、0以下の回数、空の必須フィールドなど）について、バリデーション関数はエラーを返し、保存を拒否する

**検証: 要件 1.3**

### プロパティ 3: プリセット作成時のデータ保持

*任意の*トレーニング記録について、その記録からプリセットを作成した場合、プリセットは元の記録の部位、トレーニング方法、セット情報（重量、回数）を正確に保持する

**検証: 要件 2.1**

### プロパティ 4: プリセット選択時のフォーム自動入力

*任意の*プリセットについて、それを選択した場合、入力フォームにはプリセットに保存されたすべての値が正確に入力される

**検証: 要件 2.2**

### プロパティ 5: プリセット更新のラウンドトリップ

*任意の*プリセットについて、更新してから再度取得した場合、更新後の値が正確に保持されている

**検証: 要件 2.3**

### プロパティ 6: プリセット削除の完全性

*任意の*プリセットについて、削除操作を実行した場合、そのプリセットはストレージから完全に削除され、以降の取得で見つからない

**検証: 要件 2.4**

### プロパティ 7: 記録コピー時のデータ保持

*任意の*トレーニング記録について、コピー操作を実行した場合、新しい記録は元の記録のすべてのフィールド（日付を除く）を保持する

**検証: 要件 3.1**

### プロパティ 8: コピー時の日付自動設定

*任意の*トレーニング記録について、コピー操作を実行した場合、新しい記録の日付は現在日時に設定される

**検証: 要件 3.2**

### プロパティ 9: コピー元の不変性

*任意の*トレーニング記録について、コピーして新しい記録を編集した場合、元の記録は変更されない

**検証: 要件 3.3**

### プロパティ 10: 画像形式の受け入れ

*任意の*JPEG、PNG、WebP形式の画像ファイルについて、アップロード処理は成功し、エラーを返さない

**検証: 要件 3A.2**

### プロパティ 11: 画像リサイズの制約

*任意の*アップロードされた画像について、処理後の画像の幅は1920px以下である

**検証: 要件 3A.3**

### プロパティ 12: 画像保存のラウンドトリップ

*任意の*画像について、IndexedDBに保存してから取得した場合、元の画像データと同等のデータが得られる

**検証: 要件 3A.5**

### プロパティ 13: シェアテキストの完全性

*任意の*トレーニング記録について、シェア用テキストを生成した場合、そのテキストには日付、部位、トレーニング方法、重量、回数の情報が含まれる

**検証: 要件 3B.4**

### プロパティ 14: プライバシー設定時の個人情報除外

*任意の*トレーニング記録について、プライバシー設定が有効な場合、シェア用データには個人を特定できる情報（ユーザーID、名前など）が含まれない

**検証: 要件 3B.5**

### プロパティ 15: RM計算の数学的正確性

*任意の*有効な重量（w > 0）と回数（1 ≤ r ≤ 30）について、Epley式による1RM計算結果は `w * (1 + r / 30)` に等しい

**検証: 要件 3C.2**

### プロパティ 16: RM計算結果のフォーマット

*任意の*1RM計算結果について、表示される値は小数点第1位まで丸められている

**検証: 要件 3C.3**

### プロパティ 17: RMパーセンテージ計算の正確性

*任意の*1RM値について、50%、60%、70%、80%、90%の計算結果は、それぞれ1RM値に対応するパーセンテージを乗じた値に等しい

**検証: 要件 3C.4**

### プロパティ 18: RM計算の無効入力拒否

*任意の*無効な入力（重量 ≤ 0、回数 > 30、回数 ≤ 0）について、RM計算関数はエラーを返す

**検証: 要件 3C.5**

### プロパティ 19: データフィルタリングの正確性

*任意の*フィルター条件（部位、トレーニング方法、日付範囲）について、フィルタリング結果のすべての記録はその条件を満たす

**検証: 要件 4.3, 4.4**

### プロパティ 20: プロファイル更新のラウンドトリップ

*任意の*身体プロファイルについて、更新してから再度取得した場合、更新後の値が正確に保持されている

**検証: 要件 5.2**

### プロパティ 21: プロファイル入力の妥当性検証

*任意の*無効なプロファイル値（身長 < 100cm または > 250cm、体重 < 30kg または > 300kg、週頻度 < 0 または > 14）について、バリデーション関数はエラーを返す

**検証: 要件 5.3**

### プロパティ 22: 匿名データの個人情報除外

*任意の*トレーニングデータと身体プロファイルについて、匿名化処理後のペイロードには元のユーザーIDが含まれず、ハッシュ化されたIDのみが含まれる

**検証: 要件 6.1, 6.2**

### プロパティ 23: 同期失敗時のキューイング

*任意の*データ送信失敗について、そのデータは同期キューに追加され、ステータスが'pending'または'failed'になる

**検証: 要件 6.4**

### プロパティ 24: 類似ユーザー判定の範囲

*任意の*2つの身体プロファイルについて、類似判定関数が真を返す場合、身長差は±5cm以内、体重差は±5kg以内、週頻度差は±1回以内である

**検証: 要件 7.2**

### プロパティ 25: 統計計算の正確性

*任意の*数値データセットについて、計算された平均値、中央値、パーセンタイルは数学的に正しい

**検証: 要件 7.3**

### プロパティ 26: 比較データのフィルタリング

*任意の*トレーニング方法フィルターについて、比較データ結果のすべての記録はそのトレーニング方法に一致する

**検証: 要件 7.5**

### プロパティ 27: オフライン時のローカル保存

*任意の*トレーニング記録について、オフライン状態で作成された場合、IndexedDBに保存され、syncStatusが'pending'になる

**検証: 要件 9.1**

### プロパティ 28: ユーザーIDハッシュ化の一方向性

*任意の*ユーザーIDについて、ハッシュ化された値から元のIDを復元することはできない（ハッシュ関数は一方向関数である）

**検証: 要件 12.2**

## エラーハンドリング

### エラー分類

1. **バリデーションエラー**: ユーザー入力の検証失敗
2. **ストレージエラー**: IndexedDB操作の失敗
3. **ネットワークエラー**: API通信の失敗
4. **画像処理エラー**: 画像の読み込み・圧縮の失敗
5. **計算エラー**: RM計算などの数値計算の失敗

### エラーハンドリング戦略

```typescript
// エラー型定義
type AppError = 
  | { type: 'validation'; field: string; message: string }
  | { type: 'storage'; operation: string; cause: Error }
  | { type: 'network'; endpoint: string; status?: number; cause: Error }
  | { type: 'image'; operation: string; cause: Error }
  | { type: 'calculation'; operation: string; cause: Error };

// エラーハンドラー
class ErrorHandler {
  handle(error: AppError): void {
    // ログ記録
    this.log(error);
    
    // ユーザーへの通知
    this.notify(error);
    
    // リカバリー処理
    this.recover(error);
  }
  
  private log(error: AppError): void {
    // エラーをローカルストレージに記録
    // 開発環境ではコンソールに出力
  }
  
  private notify(error: AppError): void {
    // トースト通知でユーザーに通知
    // エラーメッセージは日本語で分かりやすく
  }
  
  private recover(error: AppError): void {
    switch (error.type) {
      case 'network':
        // オフラインモードに切り替え
        // 同期キューに追加
        break;
      case 'storage':
        // ストレージクォータ確認
        // 古いデータの削除提案
        break;
      // ...
    }
  }
}
```

### グレースフルデグラデーション

1. **ネットワーク障害**: オフラインモードに自動切り替え、ローカルデータのみ使用
2. **ストレージ不足**: 古いデータの削除を提案、画像圧縮率を上げる
3. **画像処理失敗**: 元の画像をそのまま保存、次回起動時に再処理
4. **API障害**: キャッシュされたデータを使用、バックグラウンドで再試行

## テスト戦略

### デュアルテストアプローチ

本プロジェクトでは、ユニットテストとプロパティベーステストの両方を使用します:

- **ユニットテスト**: 特定の例、エッジケース、エラー条件を検証
- **プロパティベーステスト**: すべての入力に対して成り立つ普遍的なプロパティを検証

両者は補完的であり、包括的なカバレッジを実現します。

### プロパティベーステスト設定

- **ライブラリ**: fast-check（TypeScript/JavaScript用）
- **反復回数**: 各プロパティテストで最低100回
- **タグ形式**: `Feature: workout-tracker, Property {番号}: {プロパティテキスト}`

### テストカバレッジ目標

- **ユニットテスト**: 80%以上のコードカバレッジ
- **プロパティテスト**: すべての正確性プロパティを実装
- **統合テスト**: 主要なユーザーフローをカバー
- **E2Eテスト**: クリティカルパスを検証

### テスト構成

```
tests/
├── unit/
│   ├── services/
│   │   ├── rmCalculator.test.ts
│   │   ├── validation.test.ts
│   │   └── statistics.test.ts
│   ├── stores/
│   │   ├── workoutStore.test.ts
│   │   └── presetStore.test.ts
│   └── utils/
│       └── formatting.test.ts
├── property/
│   ├── workout.property.test.ts      # プロパティ 1-9
│   ├── image.property.test.ts        # プロパティ 10-14
│   ├── rm.property.test.ts           # プロパティ 15-18
│   ├── filtering.property.test.ts    # プロパティ 19, 26
│   ├── profile.property.test.ts      # プロパティ 20-21
│   └── anonymization.property.test.ts # プロパティ 22, 28
├── integration/
│   ├── workoutFlow.test.ts
│   ├── syncFlow.test.ts
│   └── offlineFlow.test.ts
└── e2e/
    ├── createWorkout.spec.ts
    ├── viewProgress.spec.ts
    └── compareData.spec.ts
```

### プロパティテスト例

```typescript
import fc from 'fast-check';
import { saveWorkout, getWorkout } from '@/services/db/workoutDB';
import { WorkoutRecord } from '@/types';

describe('Feature: workout-tracker, Property 1: トレーニング記録のラウンドトリップ', () => {
  it('任意の有効なトレーニング記録について、保存してから取得した場合、元の記録と同等のデータが得られる', async () => {
    await fc.assert(
      fc.asyncProperty(
        // ランダムなトレーニング記録を生成
        fc.record({
          id: fc.uuid(),
          userId: fc.uuid(),
          date: fc.date(),
          bodyPart: fc.constantFrom('chest', 'back', 'shoulders', 'arms', 'legs', 'core'),
          exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
          sets: fc.array(
            fc.record({
              setNumber: fc.integer({ min: 1, max: 10 }),
              weight: fc.float({ min: 0.1, max: 500 }),
              reps: fc.integer({ min: 1, max: 100 }),
              completed: fc.boolean(),
            }),
            { minLength: 1, maxLength: 10 }
          ),
        }),
        async (workout: WorkoutRecord) => {
          // 保存
          await saveWorkout(workout);
          
          // 取得
          const retrieved = await getWorkout(workout.id);
          
          // 検証
          expect(retrieved).toEqual(workout);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

