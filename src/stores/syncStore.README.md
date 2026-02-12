# syncStore - 同期状態管理

## 概要

`syncStore`は、オフライン時のデータキューイングとオンライン復帰時の自動同期を管理するZustand Storeです。

**要件: 6.4、9.1**

## 主な機能

### 1. オンライン/オフライン状態の管理

- ブラウザのネットワーク状態を監視
- オンライン復帰時に自動的に同期を開始

### 2. 同期キューの管理

- データ送信失敗時に自動的にキューに追加
- オフライン時のデータをローカルに保存
- オンライン復帰時にキューを処理

### 3. リトライ機能

- 送信失敗時に最大3回まで自動リトライ
- リトライ回数を超えた場合は失敗ステータスに変更
- 失敗したアイテムを手動で再試行可能

## 使用方法

### 基本的な使用例

```typescript
import { useSyncStore } from '@/stores/syncStore';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

function MyComponent() {
  // オフライン状態を監視
  useOfflineStatus();
  
  const { 
    isOnline, 
    isSyncing, 
    syncQueue, 
    addToQueue 
  } = useSyncStore();

  const handleDataSubmit = async (data: AnonymousDataPayload) => {
    try {
      // キューに追加（オンラインの場合は自動的に送信を試みる）
      await addToQueue(data);
    } catch (error) {
      console.error('Failed to add to queue:', error);
    }
  };

  return (
    <div>
      <p>状態: {isOnline ? 'オンライン' : 'オフライン'}</p>
      <p>同期中: {isSyncing ? 'はい' : 'いいえ'}</p>
      <p>キュー内のアイテム: {syncQueue.length}</p>
    </div>
  );
}
```

### オフライン状態の監視

```typescript
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

function App() {
  // このフックをアプリのルートで呼び出す
  useOfflineStatus();
  
  return <YourApp />;
}
```

## API

### State

- `isOnline: boolean` - オンライン状態
- `isSyncing: boolean` - 同期処理中かどうか
- `syncQueue: SyncQueueItem[]` - 同期キューのアイテム
- `lastSyncTime: Date | null` - 最後の同期時刻
- `error: string | null` - エラーメッセージ

### Actions

#### `setOnlineStatus(isOnline: boolean)`

オンライン状態を設定します。オンラインに復帰した場合、自動的に同期を開始します。

#### `addToQueue(payload: AnonymousDataPayload): Promise<number>`

同期キューにデータを追加します。オンラインの場合は即座に送信を試みます。

**検証: 要件 6.4**

#### `loadQueue(): Promise<void>`

同期キューを読み込みます。

#### `processSyncQueue(): Promise<void>`

同期キューを処理します。オフライン時または既に同期中の場合はスキップします。

**検証: 要件 6.4、9.2**

#### `retryFailedItems(): Promise<void>`

失敗したアイテムを再試行します。

#### `clearQueue(): Promise<void>`

同期キューをクリアします（開発/テスト用）。

#### `clearError(): void`

エラーメッセージをクリアします。

## 実装の詳細

### 同期フロー

1. データが`addToQueue`に渡される
2. IndexedDBの同期キューに保存される（ステータス: `pending`）
3. オンラインの場合、`processSyncQueue`が自動的に呼び出される
4. 各アイテムを順次処理:
   - ステータスを`processing`に更新
   - API送信を試みる（TODO: 実装予定）
   - 成功: キューから削除
   - 失敗: リトライカウントを増やす
     - リトライ回数 < 3: ステータスを`pending`に戻す
     - リトライ回数 >= 3: ステータスを`failed`に変更

### オフライン対応

- オフライン時はデータをキューに追加するのみ
- オンライン復帰時に`setOnlineStatus(true)`が呼ばれ、自動的に同期を開始
- `useOfflineStatus`フックがブラウザのonline/offlineイベントを監視

## テスト

ユニットテストは`src/stores/__tests__/syncStore.test.ts`にあります。

主なテストケース:
- 初期状態の検証
- オンライン状態の更新
- キューへのアイテム追加
- キューの読み込み
- 同期処理のスキップ条件
- 失敗したアイテムの再試行
- キューのクリア

## TODO

- [ ] 実際のAPI送信処理を実装（現在はコメントアウト）
- [ ] バックグラウンド同期の実装（Service Worker）
- [ ] 同期の進捗状況の詳細な追跡
- [ ] ネットワークエラーの詳細な分類

