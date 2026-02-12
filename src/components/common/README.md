# 共通UIコンポーネント

Athletic Precisionデザインシステムに基づいた、アクセシブルで洗練されたUIコンポーネント群です。

## 特徴

- **WCAG 2.1 AA準拠**: すべてのコンポーネントがアクセシビリティ基準を満たしています
- **キーボードナビゲーション**: すべてのインタラクティブ要素にキーボードでアクセス可能
- **フォーカスインジケーター**: 明確な視覚的フィードバック
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **ダークモード対応**: prefers-color-schemeに自動対応
- **モーション削減対応**: prefers-reduced-motionに対応

## コンポーネント

### Button

```tsx
import { Button } from '@/components/common';

// 基本的な使用
<Button variant="primary" onClick={handleClick}>
  保存
</Button>

// アイコン付き
<Button 
  variant="secondary" 
  leftIcon={<PlusIcon />}
>
  追加
</Button>

// ローディング状態
<Button loading>
  送信中...
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `loading`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

### Input

```tsx
import { Input } from '@/components/common';

// 基本的な使用
<Input
  label="メールアドレス"
  type="email"
  placeholder="example@example.com"
  required
/>

// エラー表示
<Input
  label="パスワード"
  type="password"
  error="パスワードは8文字以上である必要があります"
/>

// アイコン付き
<Input
  label="検索"
  leftIcon={<SearchIcon />}
  placeholder="検索..."
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean

### Select

```tsx
import { Select } from '@/components/common';

const options = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'legs', label: '脚' },
];

<Select
  label="部位"
  options={options}
  placeholder="部位を選択"
  required
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: SelectOption[]
- `placeholder`: string
- `fullWidth`: boolean

### Modal

```tsx
import { Modal } from '@/components/common';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="確認"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        キャンセル
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        確認
      </Button>
    </>
  }
>
  <p>この操作を実行してもよろしいですか？</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'full'
- `closeOnBackdropClick`: boolean
- `closeOnEsc`: boolean
- `footer`: ReactNode

### Toast

```tsx
import { Toast, ToastContainer } from '@/components/common';

// トースト管理用のカスタムフック（例）
const [toasts, setToasts] = useState([]);

const addToast = (type, message) => {
  const id = Date.now().toString();
  setToasts([...toasts, { id, type, message }]);
};

const removeToast = (id) => {
  setToasts(toasts.filter(t => t.id !== id));
};

// 使用例
<ToastContainer
  toasts={toasts}
  onRemove={removeToast}
  position="top-right"
/>

<Button onClick={() => addToast('success', '保存しました')}>
  保存
</Button>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `message`: string
- `duration`: number (ミリ秒、0で自動非表示なし)
- `onClose`: () => void

## アクセシビリティ

### キーボード操作

- **Tab**: 次の要素にフォーカス
- **Shift + Tab**: 前の要素にフォーカス
- **Enter/Space**: ボタンやリンクを実行
- **Escape**: モーダルを閉じる
- **矢印キー**: セレクトボックスの選択

### スクリーンリーダー

- すべてのフォーム要素に適切なラベルが関連付けられています
- エラーメッセージは`role="alert"`で通知されます
- モーダルは`role="dialog"`と`aria-modal="true"`を使用
- ローディング状態は`aria-busy`で通知されます

### フォーカス管理

- モーダル内でフォーカストラップが実装されています
- モーダルを閉じると元の要素にフォーカスが戻ります
- すべてのインタラクティブ要素に明確なフォーカスインジケーターがあります

## デザイントークン

コンポーネントは`src/styles/tokens.css`で定義されたデザイントークンを使用しています。

カスタマイズする場合は、トークンファイルを編集してください。

## ブラウザサポート

- Chrome/Edge (最新2バージョン)
- Firefox (最新2バージョン)
- Safari (最新2バージョン)
- iOS Safari (最新2バージョン)
- Android Chrome (最新2バージョン)
