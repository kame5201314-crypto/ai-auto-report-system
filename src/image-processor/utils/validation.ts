/**
 * 圖片處理工具 - 輸入驗證與安全工具
 *
 * 資安規範：
 * - 所有輸入必須經過類型檢查與過濾
 * - 防範 XSS 攻擊
 * - 檔案類型白名單驗證
 */

// 允許的 MIME 類型白名單
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

// 檔案大小限制 (20MB)
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

// 最大圖片尺寸限制
export const MAX_IMAGE_DIMENSION = 4096;
export const MIN_IMAGE_DIMENSION = 10;

// 最大批次處理數量
export const MAX_BATCH_SIZE = 50;

/**
 * 驗證結果介面
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 驗證檔案類型 (白名單驗證)
 */
export function validateFileType(file: File): ValidationResult {
  // 防禦性檢查
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: '無效的檔案物件' };
  }

  // 檢查 MIME 類型
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      isValid: false,
      error: `不支援的檔案格式: ${sanitizeString(file.type)}`,
    };
  }

  // 檢查副檔名 (雙重驗證)
  const fileName = file.name?.toLowerCase() ?? '';
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return { isValid: false, error: '檔案副檔名與類型不符' };
  }

  return { isValid: true };
}

/**
 * 驗證檔案大小
 */
export function validateFileSize(file: File): ValidationResult {
  if (!file || typeof file.size !== 'number') {
    return { isValid: false, error: '無法讀取檔案大小' };
  }

  if (file.size <= 0) {
    return { isValid: false, error: '檔案為空' };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `檔案大小 ${sizeMB}MB 超過限制 (最大 20MB)`,
    };
  }

  return { isValid: true };
}

/**
 * 驗證圖片尺寸參數
 */
export function validateImageDimensions(
  width: number,
  height: number
): ValidationResult {
  // 類型檢查
  if (typeof width !== 'number' || typeof height !== 'number') {
    return { isValid: false, error: '尺寸必須為數字' };
  }

  // NaN 檢查
  if (Number.isNaN(width) || Number.isNaN(height)) {
    return { isValid: false, error: '無效的尺寸數值' };
  }

  // 整數檢查
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { isValid: false, error: '尺寸必須為整數' };
  }

  // 範圍檢查
  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return {
      isValid: false,
      error: `尺寸不能小於 ${MIN_IMAGE_DIMENSION}px`,
    };
  }

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return {
      isValid: false,
      error: `尺寸不能超過 ${MAX_IMAGE_DIMENSION}px`,
    };
  }

  return { isValid: true };
}

/**
 * 驗證透明度/品質參數 (0-1)
 */
export function validatePercentage(value: number, fieldName: string): ValidationResult {
  if (typeof value !== 'number') {
    return { isValid: false, error: `${fieldName} 必須為數字` };
  }

  if (Number.isNaN(value)) {
    return { isValid: false, error: `${fieldName} 數值無效` };
  }

  if (value < 0 || value > 1) {
    return { isValid: false, error: `${fieldName} 必須在 0-1 之間` };
  }

  return { isValid: true };
}

/**
 * 驗證批次大小
 */
export function validateBatchSize(count: number): ValidationResult {
  if (typeof count !== 'number' || count <= 0) {
    return { isValid: false, error: '無效的批次數量' };
  }

  if (count > MAX_BATCH_SIZE) {
    return {
      isValid: false,
      error: `批次處理上限為 ${MAX_BATCH_SIZE} 張圖片`,
    };
  }

  return { isValid: true };
}

/**
 * 字串淨化 (防 XSS)
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 移除潛在的 HTML/Script 標籤
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .slice(0, 255); // 限制長度
}

/**
 * 驗證檔名安全性
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return 'unnamed';
  }

  // 移除路徑遍歷字元和特殊字元
  return fileName
    .replace(/\.\./g, '')
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .trim()
    .slice(0, 200) || 'unnamed';
}

/**
 * 完整檔案驗證
 */
export function validateFile(file: File): ValidationResult {
  const typeResult = validateFileType(file);
  if (!typeResult.isValid) return typeResult;

  const sizeResult = validateFileSize(file);
  if (!sizeResult.isValid) return sizeResult;

  return { isValid: true };
}

/**
 * 批次檔案驗證
 */
export function validateFiles(files: File[]): {
  validFiles: File[];
  errors: string[];
} {
  const validFiles: File[] = [];
  const errors: string[] = [];

  // 批次大小檢查
  const batchResult = validateBatchSize(files.length);
  if (!batchResult.isValid) {
    return { validFiles: [], errors: [batchResult.error ?? '批次驗證失敗'] };
  }

  for (const file of files) {
    const result = validateFile(file);
    if (result.isValid) {
      validFiles.push(file);
    } else {
      const safeName = sanitizeFileName(file?.name ?? 'unknown');
      errors.push(`${safeName}: ${result.error ?? '驗證失敗'}`);
    }
  }

  return { validFiles, errors };
}

/**
 * 安全的數值解析
 */
export function safeParseInt(value: unknown, defaultValue: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * 安全的浮點數解析
 */
export function safeParseFloat(value: unknown, defaultValue: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}
