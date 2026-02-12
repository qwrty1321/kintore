/**
 * プロパティベーステスト - 画像処理とシェア機能
 * 
 * fast-checkを使用して、任意の有効な入力に対して成り立つ
 * 普遍的なプロパティを検証します。
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  isValidImageFormat,
  validateImageFile 
} from '@/services/image/imageProcessor';
import { 
  generateShareText 
} from '@/services/image/shareService';
import type { WorkoutRecord, BodyPart, WorkoutSet } from '@/types';

/**
 * Arbitrary: BodyPart型のランダム生成
 */
const bodyPartArbitrary = fc.constantFrom<BodyPart>(
  'chest',
  'back',
  'shoulders',
  'arms',
  'legs',
  'core',
  'other'
);

/**
 * Arbitrary: WorkoutSet型のランダム生成
 */
const workoutSetArbitrary: fc.Arbitrary<WorkoutSet> = fc.record({
  setNumber: fc.integer({ min: 1, max: 10 }),
  weight: fc.float({ min: 0, max: 500, noNaN: true }),
  reps: fc.integer({ min: 1, max: 100 }),
  completed: fc.boolean(),
});

/**
 * Arbitrary: WorkoutRecord型のランダム生成
 */
const workoutRecordArbitrary: fc.Arbitrary<WorkoutRecord> = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  bodyPart: bodyPartArbitrary,
  exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
  sets: fc.array(workoutSetArbitrary, { minLength: 1, maxLength: 10 }),
  images: fc.option(fc.array(fc.uuid(), { maxLength: 5 }), { nil: undefined }),
  notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  syncStatus: fc.constantFrom('synced', 'pending', 'failed'),
});

describe('Feature: workout-tracker, Property 10: 画像形式の受け入れ', () => {
  it('**検証: 要件 3A.2** - 任意のJPEG、PNG、WebP形式の画像ファイルについて、アップロード処理は成功し、エラーを返さない', async () => {
    await fc.assert(
      fc.property(
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 1024 * 1024 * 2 }), // 最大2MB
        (mimeType: string, filename: string, size: number) => {
          // Fileオブジェクトをモック
          const mockFile = new File(
            [new ArrayBuffer(size)],
            `${filename}.jpg`,
            { type: mimeType }
          );
          
          // 形式が受け入れられることを確認
          expect(isValidImageFormat(mockFile)).toBe(true);
          
          // バリデーションが成功することを確認
          const validation = validateImageFile(mockFile);
          expect(validation.valid).toBe(true);
          expect(validation.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('**検証: 要件 3A.2** - サポートされていない形式は拒否される', async () => {
    await fc.assert(
      fc.property(
        fc.constantFrom('image/gif', 'image/svg+xml', 'image/bmp', 'application/pdf'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (mimeType: string, filename: string) => {
          const mockFile = new File(
            [new ArrayBuffer(1024)],
            filename,
            { type: mimeType }
          );
          
          // 形式が拒否されることを確認
          expect(isValidImageFormat(mockFile)).toBe(false);
          
          // バリデーションが失敗することを確認
          const validation = validateImageFile(mockFile);
          expect(validation.valid).toBe(false);
          expect(validation.error).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Feature: workout-tracker, Property 13: シェアテキストの完全性', () => {
  it('**検証: 要件 3B.4** - 任意のトレーニング記録について、シェア用テキストを生成した場合、そのテキストには日付、部位、トレーニング方法、重量、回数の情報が含まれる', async () => {
    await fc.assert(
      fc.property(
        workoutRecordArbitrary,
        (workout: WorkoutRecord) => {
          // シェアテキストを生成
          const shareText = generateShareText(workout);
          
          // 日付が含まれることを確認
          const dateStr = new Date(workout.date).toLocaleDateString('ja-JP');
          expect(shareText).toContain(dateStr.split('/')[0]); // 年が含まれる
          
          // トレーニング方法が含まれることを確認
          expect(shareText).toContain(workout.exerciseName);
          
          // 重量情報が含まれることを確認
          const maxWeight = Math.max(...workout.sets.map(s => s.weight));
          expect(shareText).toContain(`${maxWeight}kg`);
          
          // セット数が含まれることを確認
          const totalSets = workout.sets.length;
          expect(shareText).toContain(`${totalSets}セット`);
          
          // 合計回数が含まれることを確認
          const totalReps = workout.sets.reduce((sum, s) => sum + s.reps, 0);
          expect(shareText).toContain(`${totalReps}回`);
          
          // 部位情報が含まれることを確認（日本語表示）
          const bodyPartNames: Record<string, string> = {
            chest: '胸',
            back: '背中',
            shoulders: '肩',
            arms: '腕',
            legs: '脚',
            core: '体幹',
            other: 'その他',
          };
          const bodyPartJa = bodyPartNames[workout.bodyPart];
          expect(shareText).toContain(bodyPartJa);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: workout-tracker, Property 14: プライバシー設定時の個人情報除外', () => {
  it('**検証: 要件 3B.5** - 任意のトレーニング記録について、プライバシー設定が有効な場合、シェア用データには個人を特定できる情報（ユーザーID）が含まれない', async () => {
    await fc.assert(
      fc.property(
        workoutRecordArbitrary,
        (workout: WorkoutRecord) => {
          // プライバシー設定を無効にしてシェアテキストを生成
          const shareTextWithoutPrivacy = generateShareText(workout, {
            includePersonalInfo: false,
          });
          
          // ユーザーIDが含まれないことを確認
          expect(shareTextWithoutPrivacy).not.toContain(workout.userId);
          expect(shareTextWithoutPrivacy).not.toContain('ユーザー:');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('**検証: 要件 3B.5** - プライバシー設定が無効な場合、個人情報が含まれる', async () => {
    await fc.assert(
      fc.property(
        workoutRecordArbitrary,
        (workout: WorkoutRecord) => {
          // プライバシー設定を有効にしてシェアテキストを生成
          const shareTextWithPrivacy = generateShareText(workout, {
            includePersonalInfo: true,
          });
          
          // ユーザーIDが含まれることを確認
          expect(shareTextWithPrivacy).toContain(workout.userId);
          expect(shareTextWithPrivacy).toContain('ユーザー:');
        }
      ),
      { numRuns: 100 }
    );
  });
});
