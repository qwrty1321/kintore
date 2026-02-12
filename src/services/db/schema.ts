/**
 * IndexedDBスキーマ定義
 * Dexie.jsを使用したデータベース設定
 */

import Dexie, { Table } from 'dexie';
import type {
  WorkoutRecord,
  Preset,
  BodyProfile,
  WorkoutImage,
  SyncQueueItem,
} from '@/types';

/**
 * WorkoutDatabaseクラス
 * 
 * IndexedDBを使用したローカルストレージの管理
 * オフラインファーストアーキテクチャの基盤
 * 
 * **検証: 要件 1.2、2.1、5.2、6.4**
 */
export class WorkoutDatabase extends Dexie {
  // テーブル定義
  workouts!: Table<WorkoutRecord, string>;
  presets!: Table<Preset, string>;
  profile!: Table<BodyProfile, string>;
  images!: Table<WorkoutImage, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('WorkoutTrackerDB');

    // スキーマバージョン1
    this.version(1).stores({
      // トレーニング記録テーブル
      // インデックス: id（主キー）、userId、date、bodyPart、exerciseName、syncStatus
      workouts: 'id, userId, date, bodyPart, exerciseName, syncStatus',

      // プリセットテーブル
      // インデックス: id（主キー）、name、bodyPart
      presets: 'id, name, bodyPart',

      // プロファイルテーブル
      // インデックス: userId（主キー）
      profile: 'userId',

      // 画像テーブル
      // インデックス: id（主キー）、workoutId、createdAt
      images: 'id, workoutId, createdAt',

      // 同期キューテーブル
      // インデックス: ++id（自動インクリメント主キー）、timestamp、status
      syncQueue: '++id, timestamp, status',
    });
  }
}

// データベースインスタンスをエクスポート
export const db = new WorkoutDatabase();
