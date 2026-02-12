/**
 * API通信クライアント
 * 
 * サーバーとの通信を管理します。
 * 
 * 要件:
 * - 6.1: データをサーバーに送信
 * - 12.1: HTTPS通信を使用
 */

import type { AnonymousDataPayload } from '@/types';

/**
 * API設定
 */
const API_CONFIG = {
  // 本番環境ではHTTPSエンドポイントを使用
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.workout-tracker.example.com',
  timeout: 30000, // 30秒
};

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 匿名データをサーバーに送信
 * 
 * @param payload - 匿名化されたデータペイロード
 * @returns 送信成功時のレスポンス
 * @throws {ApiError} 送信失敗時
 */
export async function sendAnonymousData(
  payload: AnonymousDataPayload
): Promise<{ success: boolean; message: string }> {
  const endpoint = '/api/v1/anonymous-data';
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  try {
    // AbortControllerでタイムアウトを実装
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // HTTPステータスコードをチェック
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    // レスポンスを解析
    const data = await response.json();
    return data;
  } catch (error) {
    // ネットワークエラーまたはタイムアウト
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('リクエストがタイムアウトしました', undefined, endpoint);
      }
      throw new ApiError(
        `ネットワークエラー: ${error.message}`,
        undefined,
        endpoint
      );
    }

    throw new ApiError('不明なエラーが発生しました', undefined, endpoint);
  }
}

/**
 * 比較データを取得
 * 
 * 類似ユーザーの集計データを取得します。
 * 要件: 7.1、7.2
 * 
 * @param bodyPart - 部位
 * @param exerciseName - トレーニング方法
 * @param profile - ユーザーのプロファイル
 * @returns 比較データ
 * @throws {ApiError} 取得失敗時
 */
export async function fetchComparisonData(
  bodyPart: string,
  exerciseName: string,
  profile: { height: number; weight: number; weeklyFrequency: number }
): Promise<any> {
  const endpoint = '/api/v1/comparison-data';
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bodyPart,
        exerciseName,
        profile,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('リクエストがタイムアウトしました', undefined, endpoint);
      }
      throw new ApiError(
        `ネットワークエラー: ${error.message}`,
        undefined,
        endpoint
      );
    }

    throw new ApiError('不明なエラーが発生しました', undefined, endpoint);
  }
}

/**
 * ヘルスチェック
 * 
 * サーバーの接続状態を確認します。
 * 
 * @returns サーバーが正常な場合true
 */
export async function healthCheck(): Promise<boolean> {
  const endpoint = '/api/v1/health';
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch {
    return false;
  }
}
