/**
 * PresetSelector - 使用例
 */

import React, { useState } from 'react';
import { PresetSelector } from './PresetSelector';
import type { Preset, WorkoutSet } from '@/types';

export default function PresetSelectorExample() {
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [formData, setFormData] = useState({
    bodyPart: '',
    exerciseName: '',
    sets: [] as WorkoutSet[],
  });

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    
    // プリセットからフォームデータに自動入力
    setFormData({
      bodyPart: preset.bodyPart,
      exerciseName: preset.exerciseName,
      sets: preset.sets.map((set) => ({
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
        completed: false,
      })),
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>PresetSelector 使用例</h1>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        {/* 通常モード */}
        <div>
          <h2>通常モード</h2>
          <PresetSelector onSelect={handlePresetSelect} />
        </div>

        {/* コンパクトモード */}
        <div>
          <h2>コンパクトモード</h2>
          <PresetSelector onSelect={handlePresetSelect} compact />
        </div>
      </div>

      {/* 選択されたプリセットの表示 */}
      {selectedPreset && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#f5f5f5',
            borderRadius: '12px',
          }}
        >
          <h3>選択されたプリセット</h3>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
            {JSON.stringify(selectedPreset, null, 2)}
          </pre>

          <h3 style={{ marginTop: '1.5rem' }}>フォームデータ</h3>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
