/**
 * API通信クライアントのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendAnonymousData, healthCheck, ApiError } from './apiClient';
import type { AnonymousDataPayload } from '@/types';

// グローバルfetchをモック
global.fetch = vi.fn();

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendAnonymousData', () => {
    const mockPayload: AnonymousDataPayload = {
      profileHash: 'hash123',
      height: 170,
      weight: 70,
      weeklyFrequency: 3,
      workouts: [
        {
          date: '2024-01-01T00:00:00.000Z',
          bodyPart: 'chest',
          exerciseName: 'ベンチプレス',
          maxWeight: 60,
          totalReps: 30,
          totalSets: 3,
        },
      ],
    };

    it('成功した場合、レスポンスを返す', async () => {
      const mockResponse = { success: true, message: 'Data received' };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await sendAnonymousData(mockPayload);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/anonymous-data'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockPayload),
        })
      );
    });

    it('HTTPエラーの場合、ApiErrorをスローする', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid data' }),
      } as Response);

      await expect(sendAnonymousData(mockPayload)).rejects.toThrow(ApiError);
      await expect(sendAnonymousData(mockPayload)).rejects.toThrow('Invalid data');
    });

    it('ネットワークエラーの場合、ApiErrorをスローする', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

      await expect(sendAnonymousData(mockPayload)).rejects.toThrow(ApiError);
      await expect(sendAnonymousData(mockPayload)).rejects.toThrow('ネットワークエラー');
    });

    it('タイムアウトの場合、ApiErrorをスローする', async () => {
      vi.mocked(fetch).mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });

      await expect(sendAnonymousData(mockPayload)).rejects.toThrow(ApiError);
      await expect(sendAnonymousData(mockPayload)).rejects.toThrow('タイムアウト');
    });
  });

  describe('healthCheck', () => {
    it('サーバーが正常な場合、trueを返す', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      const result = await healthCheck();

      expect(result).toBe(true);
    });

    it('サーバーがエラーの場合、falseを返す', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const result = await healthCheck();

      expect(result).toBe(false);
    });

    it('ネットワークエラーの場合、falseを返す', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await healthCheck();

      expect(result).toBe(false);
    });
  });
});
