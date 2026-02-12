/**
 * RMCalculator 使用例
 * 
 * このファイルは開発時の参考用です。
 * 実際のアプリケーションでは、WorkoutFormから統合して使用するか、
 * 独立したページとして表示します。
 */

import React, { useState } from 'react';
import { RMCalculator } from './RMCalculator';
import { Button } from '@/components/common/Button';

export const RMCalculatorStandalone: React.FC = () => {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>RM計算機（スタンドアロン）</h1>
      <RMCalculator />
    </div>
  );
};

export const RMCalculatorCompact: React.FC = () => {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>RM計算機（コンパクト）</h1>
      <RMCalculator compact />
    </div>
  );
};

export const RMCalculatorWithCallback: React.FC = () => {
  const [appliedValue, setAppliedValue] = useState<number | null>(null);

  const handleApply = (value: number) => {
    setAppliedValue(value);
    alert(`適用された値: ${value} kg`);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>RM計算機（コールバック付き）</h1>
      
      {appliedValue && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: '#e8f4f8',
            borderRadius: '0.5rem',
          }}
        >
          <strong>適用された値:</strong> {appliedValue} kg
        </div>
      )}
      
      <RMCalculator onApply={handleApply} />
    </div>
  );
};

export const RMCalculatorModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedValue, setAppliedValue] = useState<number | null>(null);

  const handleApply = (value: number) => {
    setAppliedValue(value);
    setIsOpen(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>RM計算機（モーダル）</h1>
      
      {appliedValue && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: '#e8f4f8',
            borderRadius: '0.5rem',
          }}
        >
          <strong>適用された値:</strong> {appliedValue} kg
        </div>
      )}
      
      <Button onClick={() => setIsOpen(true)}>RM計算機を開く</Button>
      
      {isOpen && (
        <RMCalculator
          isModal
          initialWeight={100}
          initialReps={5}
          onApply={handleApply}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export const RMCalculatorWithInitialValues: React.FC = () => {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>RM計算機（初期値付き）</h1>
      <RMCalculator initialWeight={100} initialReps={5} />
    </div>
  );
};

// すべての例を表示
export const RMCalculatorExamples: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>
        RMCalculator コンポーネント例
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <section>
          <h2 style={{ marginBottom: '1rem' }}>1. スタンドアロン</h2>
          <RMCalculatorStandalone />
        </section>
        
        <section>
          <h2 style={{ marginBottom: '1rem' }}>2. コンパクト表示</h2>
          <RMCalculatorCompact />
        </section>
        
        <section>
          <h2 style={{ marginBottom: '1rem' }}>3. コールバック付き</h2>
          <RMCalculatorWithCallback />
        </section>
        
        <section>
          <h2 style={{ marginBottom: '1rem' }}>4. モーダル表示</h2>
          <RMCalculatorModal />
        </section>
        
        <section>
          <h2 style={{ marginBottom: '1rem' }}>5. 初期値付き</h2>
          <RMCalculatorWithInitialValues />
        </section>
      </div>
    </div>
  );
};
