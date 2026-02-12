/**
 * PWA設定 - Vite Plugin PWA
 * 
 * Service WorkerとPWAマニフェストの設定
 * 要件: 9.1, 9.2, 9.3, 9.4
 */

import { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
  
  manifest: {
    name: 'Workout Tracker',
    short_name: 'Workout',
    description: 'モバイルとPCで動作する筋トレメモアプリ',
    theme_color: '#0891c2',
    background_color: '#fafafa',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },

  workbox: {
    // キャッシュ戦略
    runtimeCaching: [
      {
        // API通信のキャッシュ（ネットワーク優先）
        urlPattern: /^https:\/\/api\.workout-tracker\.example\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24時間
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        // 画像のキャッシュ（キャッシュ優先）
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
          },
        },
      },
      {
        // フォントのキャッシュ
        urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
          },
        },
      },
      {
        // その他のアセット（CSS、JS）
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'asset-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7日
          },
        },
      },
    ],
    
    // オフライン時のフォールバック
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api/],
    
    // クリーンアップ
    cleanupOutdatedCaches: true,
    
    // バックグラウンド同期
    skipWaiting: true,
    clientsClaim: true,
  },

  devOptions: {
    enabled: false, // 開発時はService Workerを無効化
  },
};
