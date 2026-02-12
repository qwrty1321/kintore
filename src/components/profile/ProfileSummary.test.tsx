import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSummary } from './ProfileSummary';
import type { BodyProfile } from '@/types';

describe('ProfileSummary', () => {
  const mockProfile: BodyProfile = {
    userId: 'user-123',
    height: 170,
    weight: 70,
    weeklyFrequency: 3,
    goals: 'テスト目標',
    updatedAt: new Date('2024-01-15'),
  };

  describe('通常表示モード', () => {
    it('プロファイル情報を正しく表示する', () => {
      render(<ProfileSummary profile={mockProfile} />);

      // 身長
      expect(screen.getByText('170')).toBeInTheDocument();
      expect(screen.getByText('cm')).toBeInTheDocument();

      // 体重
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('kg')).toBeInTheDocument();

      // トレーニング頻度
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('回/週')).toBeInTheDocument();
    });

    it('BMIを正しく計算して表示する', () => {
      render(<ProfileSummary profile={mockProfile} />);

      // BMI = 70 / (1.7 * 1.7) = 24.2
      expect(screen.getByText('24.2')).toBeInTheDocument();
      expect(screen.getByText('標準')).toBeInTheDocument();
    });

    it('目標が設定されている場合は表示する', () => {
      render(<ProfileSummary profile={mockProfile} />);

      expect(screen.getByText('目標')).toBeInTheDocument();
      expect(screen.getByText('テスト目標')).toBeInTheDocument();
    });

    it('目標が設定されていない場合は表示しない', () => {
      const profileWithoutGoals = { ...mockProfile, goals: undefined };
      render(<ProfileSummary profile={profileWithoutGoals} />);

      expect(screen.queryByText('目標')).not.toBeInTheDocument();
    });

    it('編集ボタンが提供されている場合は表示する', () => {
      const onEdit = vi.fn();
      render(<ProfileSummary profile={mockProfile} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: 'プロファイルを編集' });
      expect(editButton).toBeInTheDocument();
    });

    it('編集ボタンをクリックするとコールバックが呼ばれる', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<ProfileSummary profile={mockProfile} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: 'プロファイルを編集' });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('編集ボタンが提供されていない場合は表示しない', () => {
      render(<ProfileSummary profile={mockProfile} />);

      expect(screen.queryByRole('button', { name: 'プロファイルを編集' })).not.toBeInTheDocument();
    });
  });

  describe('コンパクト表示モード', () => {
    it('コンパクトモードで主要指標のみを表示する', () => {
      render(<ProfileSummary profile={mockProfile} compact />);

      // 主要指標は表示される
      expect(screen.getByText('170')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // BMIや目標は表示されない
      expect(screen.queryByText('BMI')).not.toBeInTheDocument();
      expect(screen.queryByText('目標')).not.toBeInTheDocument();
    });

    it('コンパクトモードで編集ボタンを表示する', () => {
      const onEdit = vi.fn();
      render(<ProfileSummary profile={mockProfile} compact onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: 'プロファイルを編集' });
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('BMI計算とカテゴリー', () => {
    it('低体重のBMIを正しく分類する', () => {
      const profile: BodyProfile = {
        ...mockProfile,
        height: 170,
        weight: 50, // BMI = 17.3
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('17.3')).toBeInTheDocument();
      expect(screen.getByText('低体重')).toBeInTheDocument();
    });

    it('標準のBMIを正しく分類する', () => {
      const profile: BodyProfile = {
        ...mockProfile,
        height: 170,
        weight: 65, // BMI = 22.5
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('22.5')).toBeInTheDocument();
      expect(screen.getByText('標準')).toBeInTheDocument();
    });

    it('肥満（1度）のBMIを正しく分類する', () => {
      const profile: BodyProfile = {
        ...mockProfile,
        height: 170,
        weight: 80, // BMI = 27.7
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('27.7')).toBeInTheDocument();
      expect(screen.getByText('肥満（1度）')).toBeInTheDocument();
    });

    it('肥満（2度以上）のBMIを正しく分類する', () => {
      const profile: BodyProfile = {
        ...mockProfile,
        height: 170,
        weight: 90, // BMI = 31.1
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('31.1')).toBeInTheDocument();
      expect(screen.getByText('肥満（2度以上）')).toBeInTheDocument();
    });
  });

  describe('更新日時のフォーマット', () => {
    it('今日更新された場合は「今日更新」と表示する', () => {
      const profile: BodyProfile = {
        ...mockProfile,
        updatedAt: new Date(),
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('今日更新')).toBeInTheDocument();
    });

    it('昨日更新された場合は「昨日更新」と表示する', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const profile: BodyProfile = {
        ...mockProfile,
        updatedAt: yesterday,
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('昨日更新')).toBeInTheDocument();
    });

    it('数日前に更新された場合は「X日前に更新」と表示する', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const profile: BodyProfile = {
        ...mockProfile,
        updatedAt: threeDaysAgo,
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('3日前に更新')).toBeInTheDocument();
    });

    it('数週間前に更新された場合は「X週間前に更新」と表示する', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const profile: BodyProfile = {
        ...mockProfile,
        updatedAt: twoWeeksAgo,
      };
      render(<ProfileSummary profile={profile} />);

      expect(screen.getByText('2週間前に更新')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('編集ボタンに適切なaria-labelが設定されている', () => {
      const onEdit = vi.fn();
      render(<ProfileSummary profile={mockProfile} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: 'プロファイルを編集' });
      expect(editButton).toHaveAttribute('aria-label', 'プロファイルを編集');
    });

    it('装飾的なアイコンにaria-hidden属性が設定されている', () => {
      const { container } = render(<ProfileSummary profile={mockProfile} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
