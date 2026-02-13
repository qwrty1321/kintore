/**
 * Vitestテストセットアップ
 */

import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dexie from 'dexie';
import 'fake-indexeddb/auto';

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなモック設定
if (!(globalThis as any).crypto.randomUUID) {
  Object.defineProperty((globalThis as any).crypto, 'randomUUID', {
    value: () => Math.random().toString(36).substring(2, 15),
    writable: true,
    configurable: true,
  });
}

// Dexieのテストモードを有効化
beforeAll(() => {
  // Dexieのデバッグモードを無効化（テスト環境では不要）
  Dexie.debug = false;
});
