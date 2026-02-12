import React, { useState } from 'react';
import { Button, Input, Select, Modal, ToastContainer } from './index';
import type { ToastType } from './Toast';
import styles from './ComponentShowcase.module.css';

/**
 * 共通UIコンポーネントのショーケース
 * 各コンポーネントの使用例を表示
 */
export const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    message: string;
  }>>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  const bodyPartOptions = [
    { value: 'chest', label: '胸' },
    { value: 'back', label: '背中' },
    { value: 'shoulders', label: '肩' },
    { value: 'arms', label: '腕' },
    { value: 'legs', label: '脚' },
    { value: 'core', label: '体幹' },
  ];

  return (
    <div className={styles.showcase}>
      <h1 className={styles.title}>共通UIコンポーネント</h1>

      {/* Button */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.grid}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className={styles.grid}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className={styles.grid}>
          <Button loading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Input */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input</h2>
        <div className={styles.column}>
          <Input
            label="メールアドレス"
            type="email"
            placeholder="example@example.com"
            helperText="有効なメールアドレスを入力してください"
          />
          <Input
            label="パスワード"
            type="password"
            placeholder="8文字以上"
            required
          />
          <Input
            label="エラー例"
            type="text"
            error="このフィールドは必須です"
          />
        </div>
      </section>

      {/* Select */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Select</h2>
        <div className={styles.column}>
          <Select
            label="トレーニング部位"
            options={bodyPartOptions}
            placeholder="部位を選択"
            helperText="トレーニングする部位を選んでください"
          />
          <Select
            label="必須選択"
            options={bodyPartOptions}
            placeholder="選択してください"
            required
          />
        </div>
      </section>

      {/* Modal */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          モーダルを開く
        </Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="確認"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  addToast('success', '操作が完了しました');
                }}
              >
                確認
              </Button>
            </>
          }
        >
          <p>この操作を実行してもよろしいですか？</p>
          <p>この操作は取り消すことができません。</p>
        </Modal>
      </section>

      {/* Toast */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toast</h2>
        <div className={styles.grid}>
          <Button
            variant="primary"
            onClick={() => addToast('success', '成功しました！')}
          >
            Success Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => addToast('info', '情報メッセージです')}
          >
            Info Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => addToast('warning', '警告メッセージです')}
          >
            Warning Toast
          </Button>
          <Button
            variant="danger"
            onClick={() => addToast('error', 'エラーが発生しました')}
          >
            Error Toast
          </Button>
        </div>
      </section>

      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        position="top-right"
      />
    </div>
  );
};
