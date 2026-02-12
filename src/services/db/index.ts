/**
 * データベース操作のエクスポート
 * 
 * このファイルはすべてのデータベース操作を一元的にエクスポートします
 */

// スキーマとデータベースインスタンス
export { db, WorkoutDatabase } from './schema';

// トレーニング記録操作
export {
  saveWorkout,
  getWorkout,
  getAllWorkouts,
  getFilteredWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutsByUserId,
  getWorkoutsBySyncStatus,
} from './workoutDB';

// プリセット操作
export {
  savePreset,
  getPreset,
  getAllPresets,
  getPresetsByBodyPart,
  updatePreset,
  deletePreset,
} from './presetDB';

// プロファイル操作
export {
  saveProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} from './profileDB';

// 画像操作
export {
  saveImage,
  getImage,
  getImagesByWorkoutId,
  deleteImage,
  deleteImagesByWorkoutId,
} from './imageDB';

// 同期キュー操作
export {
  addToSyncQueue,
  getSyncQueueItem,
  getSyncQueueByStatus,
  updateSyncQueueItem,
  deleteSyncQueueItem,
  clearSuccessfulSyncQueue,
} from './syncQueueDB';
