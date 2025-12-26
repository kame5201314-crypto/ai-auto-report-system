/**
 * Remove.bg API 整合服務
 *
 * 官方文件：https://www.remove.bg/api
 *
 * 價格：
 * - 免費：每月 50 張預覽圖（低解析度 625x400）
 * - 付費：高清圖約 $0.20/張，量大有折扣
 */

import { SafeError, logError } from '../utils/errorHandler';

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export interface RemoveBgOptions {
  apiKey: string;
  size?: 'preview' | 'full' | 'auto';  // preview=免費低解析度, full=付費高清
  type?: 'auto' | 'person' | 'product' | 'car';
  format?: 'png' | 'jpg' | 'zip';
  bgColor?: string;  // 背景顏色，如 '#FFFFFF'
}

export interface RemoveBgResult {
  success: boolean;
  blob?: Blob;
  creditsUsed?: number;
  error?: string;
}

/**
 * 使用 Remove.bg API 去除背景
 */
export async function removeBackgroundWithApi(
  imageFile: File,
  options: RemoveBgOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const { apiKey, size = 'auto', type = 'auto', format = 'png' } = options;

  // 驗證 API Key
  if (!apiKey || apiKey.trim().length === 0) {
    throw new SafeError('請提供 Remove.bg API Key', 'API_KEY_MISSING');
  }

  try {
    onProgress?.(10);

    // 建立 FormData
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', size);
    formData.append('type', type);
    formData.append('format', format);

    // 如果有指定背景顏色
    if (options.bgColor) {
      formData.append('bg_color', options.bgColor);
    }

    onProgress?.(30);

    // 發送請求
    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    onProgress?.(70);

    // 處理錯誤回應
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = getErrorMessage(response.status, errorData);
      throw new SafeError(errorMessage, 'REMOVE_BG_API_ERROR');
    }

    // 取得處理後的圖片
    const blob = await response.blob();

    onProgress?.(100);

    // 記錄使用的額度（從 header 取得）
    const creditsCharged = response.headers.get('X-Credits-Charged');
    if (creditsCharged) {
      console.log(`Remove.bg 本次消耗額度: ${creditsCharged}`);
    }

    return blob;
  } catch (error) {
    logError('removeBackgroundWithApi', error);

    if (error instanceof SafeError) {
      throw error;
    }

    throw new SafeError(
      '連接 Remove.bg API 時發生錯誤，請檢查網路連線',
      'REMOVE_BG_API_ERROR'
    );
  }
}

/**
 * 驗證 API Key 是否有效
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  credits?: number;
  error?: string;
}> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: 'API Key 不能為空' };
  }

  try {
    const response = await fetch('https://api.remove.bg/v1.0/account', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        return { valid: false, error: 'API Key 無效或已過期' };
      }
      return { valid: false, error: `API 錯誤: ${response.status}` };
    }

    const data = await response.json();
    return {
      valid: true,
      credits: data.data?.attributes?.credits?.total || 0,
    };
  } catch (error) {
    logError('validateApiKey', error);
    return { valid: false, error: '無法連接到 Remove.bg API' };
  }
}

/**
 * 取得帳戶資訊（剩餘額度等）
 */
export async function getAccountInfo(apiKey: string): Promise<{
  success: boolean;
  credits?: {
    total: number;
    subscription: number;
    payg: number;
    enterprise: number;
  };
  error?: string;
}> {
  try {
    const response = await fetch('https://api.remove.bg/v1.0/account', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      return { success: false, error: getErrorMessage(response.status, {}) };
    }

    const data = await response.json();
    const credits = data.data?.attributes?.credits;

    return {
      success: true,
      credits: {
        total: credits?.total || 0,
        subscription: credits?.subscription || 0,
        payg: credits?.payg || 0,
        enterprise: credits?.enterprise || 0,
      },
    };
  } catch (error) {
    logError('getAccountInfo', error);
    return { success: false, error: '無法取得帳戶資訊' };
  }
}

/**
 * 根據錯誤狀態碼返回友善的錯誤訊息
 */
function getErrorMessage(status: number, errorData: any): string {
  const errors = errorData.errors || [];
  const firstError = errors[0] || {};

  switch (status) {
    case 400:
      return firstError.title || '請求格式錯誤，請確認圖片格式正確';
    case 402:
      return '額度不足，請購買更多額度或使用免費的本地處理';
    case 403:
      return 'API Key 無效或已過期，請檢查設定';
    case 429:
      return '請求過於頻繁，請稍後再試';
    case 500:
    case 502:
    case 503:
      return 'Remove.bg 服務暫時無法使用，請稍後再試或使用本地處理';
    default:
      return firstError.title || `API 錯誤 (${status})`;
  }
}

/**
 * 取得 Remove.bg 價格資訊
 */
export const REMOVE_BG_PRICING = {
  preview: {
    resolution: '最高 0.25 MP (約 625x400)',
    price: '免費（每月 50 張）',
    recommended: '預覽用途',
  },
  full: {
    resolution: '最高 25 MP',
    price: '約 $0.20/張',
    recommended: '正式使用、電商',
  },
  subscription: {
    plans: [
      { name: '免費', credits: 1, price: '$0/月' },
      { name: '基本', credits: 40, price: '$9/月' },
      { name: '專業', credits: 200, price: '$29/月' },
      { name: '商業', credits: 500, price: '$59/月' },
    ],
  },
};
