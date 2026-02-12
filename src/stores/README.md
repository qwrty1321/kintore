# Stores - 状態管理

このディレクトリには、Zustandを使用した状態管理ストアが含まれています。

## 実装済みストア

### workoutStore
トレーニング記録の状態管理を行います。

**機能:**
- トレーニング記録のCRUD操作
- フィルタリング（部位、トレーニング方法、日付範囲）
- バリデーション統合

**要件:** 1.1、1.2、4.3、4.4

### presetStore
プリセットの状態管理を行います。

**機能:**
- プリセットのCRUD操作
- トレーニング記録からプリセット作成
- 部位によるフィルタリング
- 名前検索
- プリセットからフォームへの自動入力サポート

**要件:** 2.1、2.2、2.3、2.4

### profileStore
身体プロファイルの状態管理を行います。

**機能:**
- プロファイルの作成・更新
- バリデーション統合

**要件:** 5.1、5.2

### imageStore
画像の状態管理を行います。

**機能:**
- 画像のアップロード・保存・取得
- 画像形式の検証（JPEG、PNG、WebP）
- トレーニング記録に関連する画像の管理
- 画像の削除

**要件:** 3A.1、3A.2、3A.5

## 使用方法

### workoutStoreの使用例

```typescript
import { useWorkoutStore } from '@/stores/workoutStore';

function WorkoutComponent() {
  const { workouts, loadWorkouts, createWorkout } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleCreate = async (workout: WorkoutRecord) => {
    await createWorkout(workout);
  };

  return (
    <div>
      {workouts.map(workout => (
        <div key={workout.id}>{workout.exerciseName}</div>
      ))}
    </div>
  );
}
```

### presetStoreの使用例

```typescript
import { usePresetStore } from '@/stores/presetStore';
import { createWorkoutFromPreset } from '@/utils/presetHelpers';

function PresetComponent() {
  const { presets, loadPresets, createPresetFromWorkout } = usePresetStore();

  useEffect(() => {
    loadPresets();
  }, []);

  // トレーニング記録からプリセットを作成
  const handleCreateFromWorkout = async (workout: WorkoutRecord) => {
    await createPresetFromWorkout(workout, 'マイプリセット');
  };

  // プリセットからフォームデータを生成
  const handleSelectPreset = (preset: Preset) => {
    const formData = createWorkoutFromPreset(preset, userId);
    // フォームに自動入力
  };

  return (
    <div>
      {presets.map(preset => (
        <button key={preset.id} onClick={() => handleSelectPreset(preset)}>
          {preset.name}
        </button>
      ))}
    </div>
  );
}
```

### imageStoreの使用例

```typescript
import { useImageStore } from '@/stores/imageStore';

function ImageUploadComponent() {
  const { uploadImage, loadImagesByWorkoutId, deleteImageById } = useImageStore();

  const handleUpload = async (file: File, workoutId: string) => {
    const image: WorkoutImage = {
      id: crypto.randomUUID(),
      workoutId,
      blob: file,
      thumbnail: file, // 実際にはサムネイル生成処理が必要
      mimeType: file.type,
      size: file.size,
      createdAt: new Date(),
    };

    try {
      const id = await uploadImage(image);
      console.log('画像をアップロードしました:', id);
    } catch (error) {
      console.error('アップロードに失敗しました:', error);
    }
  };

  const handleLoadImages = async (workoutId: string) => {
    const images = await loadImagesByWorkoutId(workoutId);
    return images;
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, 'workout-id');
        }}
      />
    </div>
  );
}
```

## テスト

各ストアには以下のテストが含まれています:

- **ユニットテスト**: モックを使用した単体テスト
- **統合テスト**: 実際のIndexedDBを使用した統合テスト

テストの実行:
```bash
npm test
```

## アーキテクチャ

```
Store (Zustand)
    ↓
Database Operations (services/db)
    ↓
IndexedDB (Dexie.js)
```

各ストアは以下の責務を持ちます:
1. アプリケーション状態の管理
2. データベース操作の調整
3. エラーハンドリング
4. ローディング状態の管理
