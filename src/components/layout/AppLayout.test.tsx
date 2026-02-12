import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('子要素を正しくレンダリングする', () => {
    render(
      <AppLayout>
        <div data-testid="test-content">テストコンテンツ</div>
      </AppLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('3つの広告スペースを持つ', () => {
    render(
      <AppLayout>
        <div>コンテンツ</div>
      </AppLayout>
    );

    // 広告スペースのaria-labelで確認
    expect(screen.getByLabelText('広告スペース（左）')).toBeInTheDocument();
    expect(screen.getByLabelText('広告スペース（右）')).toBeInTheDocument();
    expect(screen.getByLabelText('広告スペース（下部）')).toBeInTheDocument();
  });

  it('メインコンテンツエリアが存在する', () => {
    const { container } = render(
      <AppLayout>
        <div>コンテンツ</div>
      </AppLayout>
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('複数の子要素を正しくレンダリングする', () => {
    render(
      <AppLayout>
        <div data-testid="child-1">子要素1</div>
        <div data-testid="child-2">子要素2</div>
        <div data-testid="child-3">子要素3</div>
      </AppLayout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('広告プレースホルダーが存在する', () => {
    const { container } = render(
      <AppLayout>
        <div>コンテンツ</div>
      </AppLayout>
    );

    // 3つの広告プレースホルダーが存在することを確認
    const placeholders = container.querySelectorAll('[class*="adPlaceholder"]');
    expect(placeholders).toHaveLength(3);
  });
});
