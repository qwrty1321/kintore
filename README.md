# Workout Tracker - 筋トレメモアプリ

モバイルとPCで動作するプログレッシブウェブアプリケーション（PWA）。トレーニング記録を入力・可視化し、匿名化されたデータを通じて類似ユーザーと比較できます。

## 🎯 コンセプト

**"Athletic Precision"** - スポーツウェアブランドの洗練さと、データ可視化の明瞭さを融合

## 🚀 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **状態管理**: Zustand
- **ルーティング**: React Router v6
- **スタイリング**: CSS Modules + CSS Variables
- **グラフ**: Chart.js
- **ローカルストレージ**: IndexedDB (Dexie.js)
- **画像処理**: browser-image-compression
- **PWA**: Workbox
- **ビルドツール**: Vite
- **テスト**: Vitest + fast-check

## 📁 ディレクトリ構造

```
src/
├── components/          # UIコンポーネント
│   ├── layout/         # レイアウトコンポーネント
│   ├── workout/        # トレーニング関連
│   ├── image/          # 画像関連
│   ├── chart/          # グラフ関連
│   ├── profile/        # プロファイル関連
│   └── common/         # 共通コンポーネント
├── stores/             # Zustand状態管理
├── services/           # ビジネスロジック
│   ├── db/            # IndexedDB操作
│   ├── api/           # API通信
│   ├── calculations/  # 計算ロジック
│   └── image/         # 画像処理
├── hooks/              # カスタムフック
├── utils/              # ユーティリティ
├── types/              # TypeScript型定義
└── styles/             # グローバルスタイル
```

## 🛠️ セットアップ

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

### テスト実行

```bash
# 全テスト実行
npm test

# UIモードでテスト実行
npm run test:ui
```

## 🎨 デザインシステム

### デザイントークン

- **Primitive Tokens**: 物理値（色、サイズ）
- **Semantic Tokens**: 役割（背景、テキスト、ボーダー）
- **Component Tokens**: コンポーネント固有の値

### タイポグラフィ

- **ディスプレイフォント**: Outfit（見出し用）
- **本文フォント**: Inter（本文用）
- **流動的スケール**: clamp()を使用

### カラーパレット

- **Primary**: シアン系（#0891c2）
- **Accent**: オレンジ系（#ff9800）
- **ダークモード対応**: prefers-color-scheme

## 📱 レスポンシブデザイン

### モバイル（< 1024px）

- 下部固定バナー広告（60px）
- タッチ最適化UI

### デスクトップ（≥ 1024px）

- 左右サイドバー広告（各160px）
- マウス操作最適化UI

## ♿ アクセシビリティ

- WCAG 2.1 レベルAA準拠
- キーボードナビゲーション対応
- スクリーンリーダー対応
- コントラスト比4.5:1以上
- タッチターゲット最低44×44px

## ⚡ パフォーマンス目標

- **LCP**: 2.5秒以下
- **FID**: 100ms以下
- **CLS**: 0.1以下
- **初回読み込み**: 3秒以内

## 🧪 テスト戦略

### デュアルテストアプローチ

- **ユニットテスト**: 特定の例とエッジケースを検証
- **プロパティベーステスト**: 普遍的なプロパティを検証（fast-check使用）

## 📄 ライセンス

MIT

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。
