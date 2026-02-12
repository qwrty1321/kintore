/**
 * プロパティベーステスト - プロファイル
 * 
 * fast-checkを使用して、任意の有効な入力に対して成り立つ
 * 普遍的なプロパティを検証します。
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { saveProfile, getProfile, updateProfile } from '@/services/db/profileDB';
import { db } from '@/services/db/schema';
import type { BodyProfile } from '@/types';

// テスト前にデータベースをクリア
beforeEach(async () => {
  await db.profile.clear();
});

/**
 * Arbitrary: BodyProfile型のランダム生成
 */
const bodyProfileArbitrary: fc.Arbitrary<BodyProfile> = fc.record({
  userId: fc.uuid(),
  height: fc.float({ min: 100, max: 250, noNaN: true }),
  weight: fc.float({ min: 30, max: 300, noNaN: true }),
  weeklyFrequency: fc.integer({ min: 0, max: 14 }),
  goals: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
});

describe('Feature: workout-tracker, Property 20: プロファイル更新のラウンドトリップ', () => {
  it('**検証: 要件 5.2** - 任意の身体プロファイルについて、更新してから再度取得した場合、更新後の値が正確に保持されている', async () => {
    await fc.assert(
      fc.asyncProperty(
        bodyProfileArbitrary,
        bodyProfileArbitrary,
        async (originalProfile: BodyProfile, updateData: BodyProfile) => {
          // 元のプロファイルを保存
          const savedUserId = await saveProfile(originalProfile);
          expect(savedUserId).toBe(originalProfile.userId);
          
          // 更新データを準備（userIdは元のまま、他のフィールドを更新）
          const updates: Partial<BodyProfile> = {
            height: updateData.height,
            weight: updateData.weight,
            weeklyFrequency: updateData.weeklyFrequency,
            goals: updateData.goals,
          };
          
          // プロファイルを更新
          await updateProfile(originalProfile.userId, updates);
          
          // 更新後のプロファイルを取得
          const retrieved = await getProfile(originalProfile.userId);
          
          // 取得できたことを確認
          expect(retrieved).toBeDefined();
          
          if (retrieved) {
            // userIdは変更されていないことを確認
            expect(retrieved.userId).toBe(originalProfile.userId);
            
            // 更新されたフィールドが正確に反映されていることを確認
            expect(retrieved.height).toBe(updates.height);
            expect(retrieved.weight).toBe(updates.weight);
            expect(retrieved.weeklyFrequency).toBe(updates.weeklyFrequency);
            expect(retrieved.goals).toBe(updates.goals);
            
            // updatedAtが更新されていることを確認（元の値より新しいか同じ）
            expect(retrieved.updatedAt.getTime()).toBeGreaterThanOrEqual(
              originalProfile.updatedAt.getTime()
            );
          }
        }
      ),
      { numRuns: 100 } // 最低100回の反復で検証
    );
  });
});
