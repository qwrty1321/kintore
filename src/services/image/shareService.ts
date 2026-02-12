/**
 * 画像シェアサービス
 * 
 * Web Share APIを使用した画像のシェア機能を提供します。
 * 要件: 3B.1、3B.2、3B.3、3B.4、3B.5
 */

import type { WorkoutRecord, WorkoutImage } from '@/types';
import { getImageURL } from './imageService';

// ============================================
// 型定義
// ============================================

export interface ShareOptions {
  includePersonalInfo?: boolean; // 個人情報を含めるか（デフォルト: false）
}

export interface ShareData {
  title: string;
  text: string;
  files?: File[];
}

// ============================================
// Web Share API サポート確認
// ============================================

/**
 * Web Share APIがサポートされているか確認
 * 要件: 3B.2 - Web Share APIを使用
 */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * ファイルシェアがサポートされているか確認
 */
export function isFileShareSupported(): boolean {
  return (
    isShareSupported() &&
    navigator.canShare !== undefined &&
    navigator.canShare({ files: [] })
  );
}

// ============================================
// シェアテキスト生成
// ============================================

/**
 * トレーニング記録からシェア用テキストを生成
 * 
 * 要件: 3B.4 - トレーニング情報（日付、部位、重量など）をテキストとして含める
 * 要件: 3B.5 - プライバシー設定時は個人情報を除外
 * 
 * @param workout - トレーニング記録
 * @param options - シェアオプション
 * @returns シェア用テキスト
 */
export function generateShareText(
  workout: WorkoutRecord,
  options: ShareOptions = {}
): string {
  const { includePersonalInfo = false } = options;

  const date = new Date(workout.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 部位の日本語表示
  const bodyPartNames: Record<string, string> = {
    chest: '胸',
    back: '背中',
    shoulders: '肩',
    arms: '腕',
    legs: '脚',
    core: '体幹',
    other: 'その他',
  };

  const bodyPartJa = bodyPartNames[workout.bodyPart] || workout.bodyPart;

  // 最大重量と総回数を計算
  const maxWeight = Math.max(...workout.sets.map(s => s.weight));
  const totalReps = workout.sets.reduce((sum, s) => sum + s.reps, 0);
  const totalSets = workout.sets.length;

  let text = `📅 ${date}\n`;
  text += `💪 ${bodyPartJa} - ${workout.exerciseName}\n`;
  text += `🏋️ ${maxWeight}kg × ${totalSets}セット\n`;
  text += `🔢 合計 ${totalReps}回\n`;

  // 個人情報を含める場合のみユーザーIDを追加
  if (includePersonalInfo && workout.userId) {
    text += `\n👤 ユーザー: ${workout.userId}\n`;
  }

  text += `\n#筋トレ #ワークアウト #${bodyPartJa}`;

  return text;
}

// ============================================
// 画像シェア
// ============================================

/**
 * BlobをFileに変換
 */
async function blobToFile(blob: Blob, filename: string): Promise<File> {
  return new File([blob], filename, { type: blob.type });
}

/**
 * 画像とトレーニング情報をシェア
 * 
 * 要件: 3B.1 - シェアボタンを提供
 * 要件: 3B.2 - Web Share APIを使用してネイティブシェアダイアログを表示
 * 要件: 3B.3 - Web Share APIが利用できない場合、画像をダウンロード
 * 
 * @param workout - トレーニング記録
 * @param image - シェアする画像
 * @param options - シェアオプション
 */
export async function shareWorkoutImage(
  workout: WorkoutRecord,
  image: WorkoutImage,
  options: ShareOptions = {}
): Promise<void> {
  const shareText = generateShareText(workout, options);
  const title = `${workout.exerciseName} - トレーニング記録`;

  // Web Share APIがサポートされている場合
  if (isFileShareSupported()) {
    try {
      const file = await blobToFile(
        image.blob,
        `workout-${workout.date.toISOString().split('T')[0]}.jpg`
      );

      const shareData: ShareData = {
        title,
        text: shareText,
        files: [file],
      };

      await navigator.share(shareData);
    } catch (error) {
      // ユーザーがキャンセルした場合はエラーを無視
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('シェアがキャンセルされました');
        return;
      }
      
      console.error('シェアに失敗しました:', error);
      throw new Error('画像のシェアに失敗しました');
    }
  } else {
    // フォールバック: 画像をダウンロード
    downloadImage(image, `workout-${workout.date.toISOString().split('T')[0]}.jpg`);
    
    // テキストをクリップボードにコピー
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        console.log('トレーニング情報をクリップボードにコピーしました');
      } catch (error) {
        console.warn('クリップボードへのコピーに失敗しました:', error);
      }
    }
  }
}

/**
 * テキストのみをシェア（画像なし）
 * 
 * @param workout - トレーニング記録
 * @param options - シェアオプション
 */
export async function shareWorkoutText(
  workout: WorkoutRecord,
  options: ShareOptions = {}
): Promise<void> {
  const shareText = generateShareText(workout, options);
  const title = `${workout.exerciseName} - トレーニング記録`;

  if (isShareSupported()) {
    try {
      await navigator.share({
        title,
        text: shareText,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('シェアがキャンセルされました');
        return;
      }
      
      console.error('シェアに失敗しました:', error);
      throw new Error('テキストのシェアに失敗しました');
    }
  } else {
    // フォールバック: クリップボードにコピー
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        console.log('トレーニング情報をクリップボードにコピーしました');
      } catch (error) {
        console.warn('クリップボードへのコピーに失敗しました:', error);
        throw new Error('クリップボードへのコピーに失敗しました');
      }
    } else {
      throw new Error('シェア機能がサポートされていません');
    }
  }
}

// ============================================
// 画像ダウンロード（フォールバック）
// ============================================

/**
 * 画像をダウンロード
 * 
 * 要件: 3B.3 - Web Share APIが利用できない場合、画像をダウンロード
 * 
 * @param image - ダウンロードする画像
 * @param filename - ファイル名
 */
export function downloadImage(image: WorkoutImage, filename: string): void {
  const url = getImageURL(image);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 複数の画像をダウンロード
 * 
 * @param images - ダウンロードする画像の配列
 * @param baseFilename - ベースファイル名
 */
export function downloadImages(images: WorkoutImage[], baseFilename: string): void {
  images.forEach((image, index) => {
    const filename = `${baseFilename}-${index + 1}.jpg`;
    downloadImage(image, filename);
  });
}
