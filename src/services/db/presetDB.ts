/**
 * プリセットのデータベース操作
 * 
 * **検証: 要件 2.1、2.2、2.3、2.4**
 */

import { db } from './schema';
import type { Preset, BodyPart } from '@/types';

/**
 * プリセットを保存
 * 
 * **検証: 要件 2.1**
 * 
 * @param preset - 保存するプリセット
 * @returns 保存されたプリセットのID
 */
export async function savePreset(preset: Preset): Promise<string> {
  try {
    await db.presets.put(preset);
    return preset.id;
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'savePreset',
      cause: error as Error,
    };
  }
}

/**
 * プリセットを取得
 * 
 * @param id - プリセットのID
 * @returns プリセット、見つからない場合はundefined
 */
export async function getPreset(id: string): Promise<Preset | undefined> {
  try {
    return await db.presets.get(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getPreset',
      cause: error as Error,
    };
  }
}

/**
 * すべてのプリセットを取得
 * 
 * @returns すべてのプリセットの配列
 */
export async function getAllPresets(): Promise<Preset[]> {
  try {
    return await db.presets.toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getAllPresets',
      cause: error as Error,
    };
  }
}

/**
 * 部位に基づいてプリセットを取得
 * 
 * @param bodyPart - 部位
 * @returns 指定された部位のプリセットの配列
 */
export async function getPresetsByBodyPart(bodyPart: BodyPart): Promise<Preset[]> {
  try {
    return await db.presets.where('bodyPart').equals(bodyPart).toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'getPresetsByBodyPart',
      cause: error as Error,
    };
  }
}

/**
 * プリセットを更新
 * 
 * **検証: 要件 2.3**
 * 
 * @param id - プリセットのID
 * @param updates - 更新する内容
 */
export async function updatePreset(
  id: string,
  updates: Partial<Preset>
): Promise<void> {
  try {
    await db.presets.update(id, updates);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'updatePreset',
      cause: error as Error,
    };
  }
}

/**
 * プリセットを削除
 * 
 * **検証: 要件 2.4**
 * 
 * @param id - プリセットのID
 */
export async function deletePreset(id: string): Promise<void> {
  try {
    await db.presets.delete(id);
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'deletePreset',
      cause: error as Error,
    };
  }
}

/**
 * 名前でプリセットを検索
 * 
 * @param name - プリセット名（部分一致）
 * @returns 名前に一致するプリセットの配列
 */
export async function searchPresetsByName(name: string): Promise<Preset[]> {
  try {
    return await db.presets
      .filter(preset => preset.name.toLowerCase().includes(name.toLowerCase()))
      .toArray();
  } catch (error) {
    throw {
      type: 'storage',
      operation: 'searchPresetsByName',
      cause: error as Error,
    };
  }
}
