/**
 * プロパティベーステスト - プリセット
 * 
 * fast-checkを使用して、任意の有効な入力に対して成り立つ
 * 普遍的なプロパティを検証します。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { savePreset, getPreset, updatePreset } from '@/services/db/presetDB';
import { db } from '@/services/db/schema';
import type { Preset, BodyPart, PresetSet } from '@/types';

// テスト前にデータベースをクリア
beforeEach(async () => {
  await db.presets.clear();
});

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
 * Arbitrary: PresetSet型のランダム生成
 */
const presetSetArbitrary: fc.Arbitrary<PresetSet> = fc.record({
  setNumber: fc.integer({ min: 1, max: 10 }),
  weight: fc.float({ min: 0.1, max: 500, noNaN: true }),
  reps: fc.integer({ min: 1, max: 100 }),
});

/**
 * Arbitrary: Preset型のランダム生成
 */
const presetArbitrary: fc.Arbitrary<Preset> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  bodyPart: bodyPartArbitrary,
  exerciseName: fc.string({ minLength: 1, maxLength: 50 }),
  sets: fc.array(presetSetArbitrary, { minLength: 1, maxLength: 10 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
});

describe('Feature: workout-tracker, Property 5: プリセット更新のラウンドトリップ', () => {
  it('**検証: 要件 2.3** - 任意のプリセットについて、更新してから再度取得した場合、更新後の値が正確に保持されている', async () => {
    await fc.assert(
      fc.asyncProperty(
        presetArbitrary,
        presetArbitrary,
        async (originalPreset: Preset, updateData: Preset) => {
          // 元のプリセットを保存
          const savedId = await savePreset(originalPreset);
          expect(savedId).toBe(originalPreset.id);
          
          // 更新データを準備（IDは元のまま、他のフィールドを更新）
          const updates: Partial<Preset> = {
            name: updateData.name,
            bodyPart: updateData.bodyPart,
            exerciseName: updateData.exerciseName,
            sets: updateData.sets,
          };
          
          // プリセットを更新
          await updatePreset(originalPreset.id, updates);
          
          // 更新後のプリセットを取得
          const retrieved = await getPreset(originalPreset.id);
          
          // 取得できたことを確認
          expect(retrieved).toBeDefined();
          
          if (retrieved) {
            // IDとcreatedAtは変更されていないことを確認
            expect(retrieved.id).toBe(originalPreset.id);
            expect(retrieved.createdAt.getTime()).toBe(originalPreset.createdAt.getTime());
            
            // 更新されたフィールドが正確に反映されていることを確認
            expect(retrieved.name).toBe(updates.name);
            expect(retrieved.bodyPart).toBe(updates.bodyPart);
            expect(retrieved.exerciseName).toBe(updates.exerciseName);
            
            // セット情報の検証
            expect(retrieved.sets).toHaveLength(updates.sets!.length);
            retrieved.sets.forEach((set, index) => {
              expect(set.setNumber).toBe(updates.sets![index].setNumber);
              expect(set.weight).toBe(updates.sets![index].weight);
              expect(set.reps).toBe(updates.sets![index].reps);
            });
          }
        }
      ),
      { numRuns: 100 } // 最低100回の反復で検証
    );
  });
});
