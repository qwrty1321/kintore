# API サービス

## 概要

このディレクトリには、サーバーとの通信とデータ同期を管理するサービスが含まれています。

## ファイル構成

- `apiClient.ts` - API通信クライアント（HTTPS通信）
- `syncService.ts` - データ同期サービス（キューイング、リトライ、バックグラウンド同期）
- `anonymizationService.ts` - データ匿名化サービス

## 主な機能

### 1. データ送信（apiClient.ts）

**要件: 6.1、12.1**

```typescript
import { sendAnonymousData } from '@/services/api/apiClient';

// 匿名データを送信
const result = await sendAnonymousData(payload);
```

- HTTPS通信を使用
- タイムアウト設定（30秒）
- エラーハンドリング

### 2. 同期サービス（syncService.ts）

**要件: 6.3、6.4、9.2**

#### データ共有の有効/無効

```typescript
import { setDataSharingEnabled, isDataSharingEnabled } from '@/services/api/syncService';

// データ共有を無効にする
setDataSharingEnabled(false);

// 現在の設定を確認
const enabled = isDataSharingEnabled();
```

#### データのキューイング

```typescript
import { queueWorkoutData } from '@/services/api/syncService';

// トレーニングデータをキューに追加
const queueId = await queueWorkoutData(userId, profile, workouts);
```

- データ共有が無効な場合は何もしない
- オフライン時は自動的にキューに追加
- オンライン時は即座に送信を試みる

#### 同期キューの処理

```typescript
import { processSyncQueue } from '@/services/api/syncService';

// 保留中のアイテムを処理
const result = await processSyncQueue();
console.log(`処理: ${result.processed}件, 成功: ${result.succeeded}件`);
```

#### 失敗したアイテムの再試行

```typescript
import { retryFailedItems } from '@/services/api/syncService';

// 失敗したアイテムを再試行
const count = await retryFailedItems();
console.log(`${count}件を再試行します`);
```

#### バックグラウンド同期

```typescript
import { startBackgroundSync } from '@/services/api/syncService';

// バックグラウンド同期を開始（60秒間隔）
const stopSync = startBackgroundSync(60000);

// 停止する場合
stopSync();
```

### 3. データ匿名化（anonymizationService.ts）

**要件: 6.1、6.2、12.2**

```typescript
import { createAnonymousPayload } from '@/services/api/anonymizationService';

// 匿名データペイロードを作成
const payload = await createAnonymousPayload(userId, profile, workouts);
```

- ユーザーIDをSHA-256でハッシュ化
- 個人を特定できる情報を除外
- 統計に必要な情報のみを抽出

## 同期フロー

```
1. ユーザーがトレーニングを記録
   ↓
2. queueWorkoutData() でキューに追加
   ↓
3. オンラインの場合、processSyncQueue() が自動実行
   ↓
4. 各アイテムを順次処理:
   - ステータスを 'processing' に更新
   - sendAnonymousData() でAPI送信
   - 成功: キューから削除
   - 失敗: リトライカウントを増やす
     - リトライ < 3回: 'pending' に戻す
     - リトライ >= 3回: 'failed' に変更
   ↓
5. オフライン時はキューに保存
   ↓
6. オンライン復帰時に自動的に同期開始
```

## リトライ戦略

- **最大リトライ回数**: 3回
- **リトライ間隔**: 5秒
- **失敗時の動作**:
  - 3回未満: ペンディングに戻して再試行
  - 3回以上: 失敗ステータスに変更
  - 手動で再試行可能（`retryFailedItems()`）

## 設定

同期設定はローカルストレージに保存されます：

```typescript
interface SyncSettings {
  enabled: boolean;        // データ共有の有効/無効
  autoSync: boolean;       // 自動同期の有効/無効
  maxRetries: number;      // 最大リトライ回数
  retryDelay: number;      // リトライ間隔（ミリ秒）
}
```

デフォルト値：
- `enabled`: true
- `autoSync`: true
- `maxRetries`: 3
- `retryDelay`: 5000

## 環境変数

`.env`ファイルでAPIエンドポイントを設定：

```
VITE_API_BASE_URL=https://api.workout-tracker.example.com
```

## エラーハンドリング

### ApiError

API通信のエラーを表すクラス：

```typescript
class ApiError extends Error {
  status?: number;      // HTTPステータスコード
  endpoint?: string;    // エンドポイント
}
```

### エラーの種類

1. **HTTPエラー**: ステータスコード4xx、5xx
2. **ネットワークエラー**: 接続失敗、DNS解決失敗など
3. **タイムアウト**: 30秒以内にレスポンスがない場合

## テスト

```bash
# ユニットテストを実行
npm test src/services/api
```

テストファイル：
- `apiClient.test.ts` - API通信のテスト
- `syncService.test.ts` - 同期サービスのテスト
- `anonymizationService.test.ts` - 匿名化のテスト

## 使用例

### アプリケーション起動時

```typescript
import { startBackgroundSync } from '@/services/api/syncService';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

function App() {
  // オフライン状態を監視
  useOfflineStatus();
  
  // バックグラウンド同期を開始
  useEffect(() => {
    const stopSync = startBackgroundSync(60000);
    return () => stopSync();
  }, []);
  
  return <YourApp />;
}
```

### トレーニング記録保存時

```typescript
import { queueWorkoutData } from '@/services/api/syncService';
import { useProfileStore } from '@/stores/profileStore';

async function saveWorkout(workout: WorkoutRecord) {
  // ローカルに保存
  await saveToIndexedDB(workout);
  
  // 同期キューに追加
  const profile = useProfileStore.getState().profile;
  if (profile) {
    await queueWorkoutData(workout.userId, profile, [workout]);
  }
}
```

### 設定画面

```typescript
import { isDataSharingEnabled, setDataSharingEnabled } from '@/services/api/syncService';

function SettingsPage() {
  const [enabled, setEnabled] = useState(isDataSharingEnabled());
  
  const handleToggle = (checked: boolean) => {
    setDataSharingEnabled(checked);
    setEnabled(checked);
  };
  
  return (
    <label>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      匿名データを共有する
    </label>
  );
}
```

## セキュリティ

- **HTTPS通信**: 本番環境では必ずHTTPSを使用
- **データ匿名化**: ユーザーIDはSHA-256でハッシュ化
- **個人情報の除外**: 名前、メールアドレス、画像などは送信しない
- **タイムアウト**: 長時間のリクエストを防止

## パフォーマンス

- **バッチ処理**: 複数のアイテムを順次処理
- **リトライ間隔**: 5秒の遅延でサーバー負荷を軽減
- **バックグラウンド同期**: ユーザー操作をブロックしない
- **キューイング**: オフライン時もデータを失わない
