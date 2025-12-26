/**
 * 圖片處理工具 - 錯誤處理
 *
 * 資安規範：
 * - 錯誤遮蔽：前端僅顯示通用錯誤訊息
 * - 嚴禁洩露 Stack Trace 等系統架構資訊
 * - 所有錯誤都經過安全包裝
 */

/**
 * 安全錯誤類別
 * 用於向使用者顯示的錯誤，不包含敏感資訊
 */
export class SafeError extends Error {
  public readonly userMessage: string;
  public readonly code: string;

  constructor(userMessage: string, code: string = 'UNKNOWN_ERROR') {
    super(userMessage);
    this.name = 'SafeError';
    this.userMessage = userMessage;
    this.code = code;
  }
}

/**
 * 錯誤代碼對應的使用者友好訊息
 */
const ERROR_MESSAGES: Record<string, string> = {
  FILE_TYPE_INVALID: '不支援的檔案格式',
  FILE_SIZE_EXCEEDED: '檔案大小超過限制',
  FILE_READ_ERROR: '無法讀取檔案',
  IMAGE_PROCESS_ERROR: '圖片處理失敗，請重試',
  BACKGROUND_REMOVAL_ERROR: '去背處理失敗，請重試',
  WATERMARK_ERROR: '浮水印添加失敗',
  RESIZE_ERROR: '尺寸調整失敗',
  COMPRESSION_ERROR: '壓縮處理失敗',
  DOWNLOAD_ERROR: '下載失敗，請重試',
  NETWORK_ERROR: '網路連線異常',
  MEMORY_ERROR: '記憶體不足，請減少圖片數量',
  UNKNOWN_ERROR: '發生未知錯誤，請重試',
};

/**
 * 將原始錯誤轉換為安全錯誤
 * 遮蔽內部錯誤訊息，只顯示通用訊息
 */
export function toSafeError(error: unknown, defaultCode: string = 'UNKNOWN_ERROR'): SafeError {
  // 如果已經是 SafeError，直接返回
  if (error instanceof SafeError) {
    return error;
  }

  // 開發環境記錄完整錯誤（僅 console，不暴露給使用者）
  if (import.meta.env.DEV) {
    console.error('[DEV] Original error:', error);
  }

  // 嘗試識別錯誤類型
  const code = identifyErrorCode(error) ?? defaultCode;
  const userMessage = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN_ERROR;

  return new SafeError(userMessage, code);
}

/**
 * 根據錯誤內容識別錯誤代碼
 */
function identifyErrorCode(error: unknown): string | null {
  if (!error) return null;

  const errorMessage = error instanceof Error
    ? error.message.toLowerCase()
    : String(error).toLowerCase();

  // 記憶體錯誤
  if (
    errorMessage.includes('memory') ||
    errorMessage.includes('heap') ||
    errorMessage.includes('allocation')
  ) {
    return 'MEMORY_ERROR';
  }

  // 網路錯誤
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('cors')
  ) {
    return 'NETWORK_ERROR';
  }

  // 檔案讀取錯誤
  if (
    errorMessage.includes('file') ||
    errorMessage.includes('read') ||
    errorMessage.includes('load')
  ) {
    return 'FILE_READ_ERROR';
  }

  // Canvas 相關錯誤
  if (
    errorMessage.includes('canvas') ||
    errorMessage.includes('context')
  ) {
    return 'IMAGE_PROCESS_ERROR';
  }

  return null;
}

/**
 * 獲取使用者友好的錯誤訊息
 */
export function getUserFriendlyMessage(error: unknown): string {
  const safeError = toSafeError(error);
  return safeError.userMessage;
}

/**
 * 安全的非同步操作包裝器
 * 確保所有錯誤都被妥善處理
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorCode: string = 'UNKNOWN_ERROR'
): Promise<{ success: true; data: T } | { success: false; error: SafeError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const safeError = toSafeError(error, errorCode);
    return { success: false, error: safeError };
  }
}

/**
 * 錯誤日誌記錄（僅開發環境）
 * 生產環境不暴露任何詳細錯誤
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.group(`[Error] ${context}`);
    console.error('Error object:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    console.groupEnd();
  }
  // 生產環境：可以在這裡添加匿名錯誤追蹤（如 Sentry）
  // 但不能包含使用者資料或敏感資訊
}

/**
 * 斷言函數 - 用於防禦性程式設計
 */
export function assertDefined<T>(
  value: T | null | undefined,
  errorMessage: string = '必要的值未定義'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new SafeError(errorMessage, 'ASSERTION_ERROR');
  }
}

/**
 * 型別守衛 - 安全檢查
 */
export function isFile(value: unknown): value is File {
  return value instanceof File;
}

export function isBlob(value: unknown): value is Blob {
  return value instanceof Blob;
}

export function isImageElement(value: unknown): value is HTMLImageElement {
  return value instanceof HTMLImageElement;
}
