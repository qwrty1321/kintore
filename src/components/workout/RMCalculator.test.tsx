/**
 * RMCalculator コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RMCalculator } from './RMCalculator';

describe('RMCalculator', () => {
  describe('基本表示', () => {
    it('タイトルと説明が表示される', () => {
      render(<RMCalculator />);
      
      expect(screen.getByText('RM計算機')).toBeInTheDocument();
      expect(screen.getByText(/実施した重量と回数から1RM/)).toBeInTheDocument();
    });

    it('重量と回数の入力フィールドが表示される', () => {
      render(<RMCalculator />);
      
      expect(screen.getByLabelText('重量 (kg)')).toBeInTheDocument();
      expect(screen.getByLabelText('回数')).toBeInTheDocument();
    });

    it('計算ボタンが表示される', () => {
      render(<RMCalculator />);
      
      expect(screen.getByRole('button', { name: '計算する' })).toBeInTheDocument();
    });
  });

  describe('初期値', () => {
    it('初期重量が設定される', () => {
      render(<RMCalculator initialWeight={100} />);
      
      const weightInput = screen.getByLabelText('重量 (kg)') as HTMLInputElement;
      expect(weightInput.value).toBe('100');
    });

    it('初期回数が設定される', () => {
      render(<RMCalculator initialReps={5} />);
      
      const repsInput = screen.getByLabelText('回数') as HTMLInputElement;
      expect(repsInput.value).toBe('5');
    });
  });

  describe('入力バリデーション', () => {
    it('重量が0以下の場合、エラーメッセージが表示される', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      const calculateButton = screen.getByRole('button', { name: '計算する' });
      
      fireEvent.change(weightInput, { target: { value: '0' } });
      fireEvent.change(repsInput, { target: { value: '5' } });
      fireEvent.click(calculateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/有効な重量を入力してください/)).toBeInTheDocument();
      });
    });

    it('回数が0以下の場合、エラーメッセージが表示される', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      const calculateButton = screen.getByRole('button', { name: '計算する' });
      
      fireEvent.change(weightInput, { target: { value: '100' } });
      fireEvent.change(repsInput, { target: { value: '0' } });
      fireEvent.click(calculateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/有効な回数を入力してください/)).toBeInTheDocument();
      });
    });

    it('回数が30を超える場合、エラーメッセージが表示される', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      const calculateButton = screen.getByRole('button', { name: '計算する' });
      
      fireEvent.change(weightInput, { target: { value: '100' } });
      fireEvent.change(repsInput, { target: { value: '31' } });
      fireEvent.click(calculateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/回数は30回以下で入力してください/)).toBeInTheDocument();
      });
    });
  });

  describe('RM計算', () => {
    it('有効な入力で1RMが計算される', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      
      // 100kg × 5回 = 1RM: 116.7kg
      fireEvent.change(weightInput, { target: { value: '100' } });
      fireEvent.change(repsInput, { target: { value: '5' } });
      
      // 自動計算されるのを待つ
      await waitFor(() => {
        expect(screen.getByText('116.7')).toBeInTheDocument();
      });
    });

    it('パーセンテージが正しく計算される', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      
      fireEvent.change(weightInput, { target: { value: '100' } });
      fireEvent.change(repsInput, { target: { value: '5' } });
      
      await waitFor(() => {
        // 1RM: 116.7kg
        expect(screen.getByText('116.7')).toBeInTheDocument();
        // 50%: 58.4kg
        expect(screen.getByText('58.4')).toBeInTheDocument();
        // 90%: 105.0kg
        expect(screen.getByText('105.0')).toBeInTheDocument();
      });
    });
  });

  describe('コールバック', () => {
    it('onApplyが呼ばれる（1RM）', async () => {
      const handleApply = vi.fn();
      render(<RMCalculator onApply={handleApply} />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      
      fireEvent.change(weightInput, { target: { value: '100' } });
      fireEvent.change(repsInput, { target: { value: '5' } });
      
      await waitFor(() => {
        expect(screen.getByText('116.7')).toBeInTheDocument();
      });
      
      const applyButton = screen.getByRole('button', { name: 'この値を使用' });
      fireEvent.click(applyButton);
      
      expect(handleApply).toHaveBeenCalledWith(116.7);
    });

    it('onCloseが呼ばれる', () => {
      const handleClose = vi.fn();
      render(<RMCalculator isModal onClose={handleClose} />);
      
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      fireEvent.click(closeButton);
      
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('コンパクトモード', () => {
    it('コンパクトモードでタイトルが表示されない', () => {
      render(<RMCalculator compact />);
      
      expect(screen.queryByText('RM計算機')).not.toBeInTheDocument();
    });

    it('コンパクトモードで説明が表示されない', () => {
      render(<RMCalculator compact />);
      
      expect(screen.queryByText(/実施した重量と回数から1RM/)).not.toBeInTheDocument();
    });

    it('コンパクトモードで計算ボタンが表示されない', () => {
      render(<RMCalculator compact />);
      
      expect(screen.queryByRole('button', { name: '計算する' })).not.toBeInTheDocument();
    });
  });

  describe('モーダルモード', () => {
    it('モーダルモードでオーバーレイが表示される', () => {
      const { container } = render(<RMCalculator isModal />);
      
      const overlay = container.querySelector('[class*="modalOverlay"]');
      expect(overlay).toBeInTheDocument();
    });

    it('モーダルモードで閉じるボタンが表示される', () => {
      render(<RMCalculator isModal onClose={() => {}} />);
      
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('オーバーレイクリックでonCloseが呼ばれる', () => {
      const handleClose = vi.fn();
      const { container } = render(<RMCalculator isModal onClose={handleClose} />);
      
      const overlay = container.querySelector('[class*="modalOverlay"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalled();
      }
    });
  });

  describe('リセット機能', () => {
    it('リセットボタンで入力がクリアされる', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)') as HTMLInputElement;
      const repsInput = screen.getByLabelText('回数') as HTMLInputElement;
      
      fireEvent.change(weightInput, { target: { value: '100' } });
      fireEvent.change(repsInput, { target: { value: '5' } });
      
      await waitFor(() => {
        expect(screen.getByText('116.7')).toBeInTheDocument();
      });
      
      const resetButton = screen.getByRole('button', { name: 'リセット' });
      fireEvent.click(resetButton);
      
      expect(weightInput.value).toBe('');
      expect(repsInput.value).toBe('');
      expect(screen.queryByText('116.7')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('入力フィールドにラベルが関連付けられている', () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      
      expect(weightInput).toBeInTheDocument();
      expect(repsInput).toBeInTheDocument();
    });

    it('エラーメッセージにrole="alert"が設定されている', async () => {
      render(<RMCalculator />);
      
      const weightInput = screen.getByLabelText('重量 (kg)');
      const repsInput = screen.getByLabelText('回数');
      const calculateButton = screen.getByRole('button', { name: '計算する' });
      
      fireEvent.change(weightInput, { target: { value: '0' } });
      fireEvent.change(repsInput, { target: { value: '5' } });
      fireEvent.click(calculateButton);
      
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });

    it('閉じるボタンにaria-labelが設定されている', () => {
      render(<RMCalculator isModal onClose={() => {}} />);
      
      const closeButton = screen.getByLabelText('閉じる');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
