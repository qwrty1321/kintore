/**
 * PresetManager 使用例
 * 
 * このファイルは、PresetManagerコンポーネントの使用方法を示すサンプルです。
 */

import React from 'react';
import { PresetManager } from './PresetManager';
import type { Preset } from '@/types';

/**
 * 基本的な使用例
 */
export function BasicExample() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <PresetManager />
    </div>
  );
}

/**
 * プリセット選択機能付き
 */
export function WithSelectionExample() {
  const handleSelect = (preset: Preset) => {
    console.log('選択されたプリセット:', preset);
    alert(`「${preset.name}」を選択しました`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>プリセット管理（選択機能付き）</h1>
      <PresetManager onSelect={handleSelect} />
    </div>
  );
}

/**
 * ダークモード対応例
 */
export function DarkModeExample() {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        background: '#1a1a1a',
      }}
    >
      <PresetManager />
    </div>
  );
}

/**
 * モバイルビュー例
 */
export function MobileExample() {
  return (
    <div
      style={{
        maxWidth: '375px',
        margin: '0 auto',
        border: '1px solid #ccc',
        minHeight: '667px',
      }}
    >
      <PresetManager />
    </div>
  );
}

// デフォルトエクスポート
export default BasicExample;
