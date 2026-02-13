import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('Header', () => {
  it('ロゴが表示される', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const logo = screen.getByText('Workout Tracker');
    expect(logo).toBeInTheDocument();
  });

  it('デスクトップナビゲーションにすべてのリンクが表示される', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // デスクトップナビゲーション内のリンクを確認
    const nav = screen.getByLabelText('メインナビゲーション');
    expect(nav).toBeInTheDocument();

    // 各ナビゲーション項目を確認
    const navItems = ['ホーム', 'トレーニング', '進捗', '比較', 'プロフィール'];
    navItems.forEach((item) => {
      const links = screen.getAllByText(item);
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('モバイルメニューボタンをクリックするとメニューが開閉する', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText('メニューを開く');
    expect(menuButton).toBeInTheDocument();

    // メニューを開く
    fireEvent.click(menuButton);
    
    const closeButton = screen.getByLabelText('メニューを閉じる');
    expect(closeButton).toBeInTheDocument();

    // メニューを閉じる
    fireEvent.click(closeButton);
    
    const openButton = screen.getByLabelText('メニューを開く');
    expect(openButton).toBeInTheDocument();
  });

  it('モバイルメニューのリンクをクリックするとメニューが閉じる', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // メニューを開く
    const menuButton = screen.getByLabelText('メニューを開く');
    fireEvent.click(menuButton);

    // モバイルナビゲーション内のリンクをクリック
    const mobileNav = screen.getByLabelText('モバイルナビゲーション');
    const homeLink = mobileNav.querySelector('a[href="/"]');
    
    if (homeLink) {
      fireEvent.click(homeLink);
    }

    // メニューが閉じたことを確認
    const openButton = screen.getByLabelText('メニューを開く');
    expect(openButton).toBeInTheDocument();
  });

  it('オーバーレイをクリックするとメニューが閉じる', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // メニューを開く
    const menuButton = screen.getByLabelText('メニューを開く');
    fireEvent.click(menuButton);

    // オーバーレイを探してクリック
    const overlay = document.querySelector('[class*="overlay"]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    // メニューが閉じたことを確認
    const openButton = screen.getByLabelText('メニューを開く');
    expect(openButton).toBeInTheDocument();
  });

  it('アクティブなページのリンクにaria-current属性が設定される', () => {
    // ルートパスでレンダリング
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // ホームリンクがアクティブであることを確認
    const homeLinks = screen.getAllByText('ホーム');
    const activeHomeLink = homeLinks.find(
      (link) => link.closest('a')?.getAttribute('aria-current') === 'page'
    );
    
    expect(activeHomeLink).toBeDefined();
  });

  it('キーボードでフォーカス可能である', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const logo = screen.getByText('Workout Tracker').closest('a');
    const menuButton = screen.getByLabelText('メニューを開く');

    expect(logo).toBeInTheDocument();
    expect(menuButton).toBeInTheDocument();

    // フォーカス可能であることを確認
    logo?.focus();
    expect(document.activeElement).toBe(logo);

    menuButton.focus();
    expect(document.activeElement).toBe(menuButton);
  });
});
