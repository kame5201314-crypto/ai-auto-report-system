/**
 * 輸入消毒模組 (Input Sanitizer)
 *
 * 防止 XSS 攻擊與 SQL 注入
 * 所有使用者輸入必須經過此模組處理
 */

// ============================================
// XSS 防護
// ============================================

/**
 * HTML 實體編碼表
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * 轉義 HTML 特殊字元，防止 XSS 攻擊
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * 移除 HTML 標籤
 */
export function stripHtml(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/<[^>]*>/g, '');
}

/**
 * 移除危險的 JavaScript 事件處理器
 */
export function removeEventHandlers(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  // 移除所有 on* 事件處理器
  return str.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * 移除 script 標籤及內容
 */
export function removeScripts(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// ============================================
// SQL 注入防護
// ============================================

/**
 * 危險的 SQL 關鍵字
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  /(--)/g,
  /(;)/g,
  /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
  /(UNION\s+SELECT)/gi,
  /(')/g,
];

/**
 * 檢測是否包含 SQL 注入嘗試
 */
export function detectSqlInjection(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  // Reset lastIndex for global regex patterns to avoid state issues
  return SQL_INJECTION_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(str);
  });
}

/**
 * 轉義 SQL 特殊字元
 */
export function escapeSql(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

// ============================================
// 通用消毒函數
// ============================================

/**
 * 消毒選項
 */
export interface SanitizeOptions {
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  maxLength?: number;
  allowHtml?: boolean;
  removeNewlines?: boolean;
}

/**
 * 通用字串消毒
 */
export function sanitizeString(
  input: unknown,
  options: SanitizeOptions = {}
): string {
  // 類型檢查
  if (input === null || input === undefined) {
    return '';
  }

  let str = String(input);

  // 移除危險腳本
  str = removeScripts(str);
  str = removeEventHandlers(str);

  // HTML 處理
  if (!options.allowHtml) {
    str = escapeHtml(str);
  }

  // 修剪空白
  if (options.trim !== false) {
    str = str.trim();
  }

  // 大小寫轉換
  if (options.toLowerCase) {
    str = str.toLowerCase();
  } else if (options.toUpperCase) {
    str = str.toUpperCase();
  }

  // 移除換行
  if (options.removeNewlines) {
    str = str.replace(/[\r\n]/g, ' ');
  }

  // 長度限制
  if (options.maxLength && str.length > options.maxLength) {
    str = str.substring(0, options.maxLength);
  }

  return str;
}

/**
 * 消毒 Email 地址
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, '')
    .substring(0, 254); // RFC 5321 最大長度
}

/**
 * 消毒使用者名稱
 */
export function sanitizeUsername(username: unknown): string {
  if (typeof username !== 'string') {
    return '';
  }

  return username
    .trim()
    .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '') // 只允許英數字、底線、中文
    .substring(0, 50);
}

/**
 * 消毒 URL
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // 檢查是否為危險協議
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  return trimmed;
}

/**
 * 消毒數字
 */
export function sanitizeNumber(
  input: unknown,
  options: { min?: number; max?: number; defaultValue?: number } = {}
): number {
  const num = Number(input);

  if (isNaN(num)) {
    return options.defaultValue ?? 0;
  }

  let result = num;

  if (options.min !== undefined && result < options.min) {
    result = options.min;
  }

  if (options.max !== undefined && result > options.max) {
    result = options.max;
  }

  return result;
}

/**
 * 消毒物件（深度消毒所有字串屬性）
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeOptions = {}
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // 消毒 key
    const sanitizedKey = sanitizeString(key, { ...options, maxLength: 100 });

    if (typeof value === 'string') {
      result[sanitizedKey] = sanitizeString(value, options);
    } else if (Array.isArray(value)) {
      result[sanitizedKey] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item, options)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>, options)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[sanitizedKey] = sanitizeObject(
        value as Record<string, unknown>,
        options
      );
    } else {
      result[sanitizedKey] = value;
    }
  }

  return result as T;
}

// ============================================
// 導出快捷函數
// ============================================

export const sanitize = {
  string: sanitizeString,
  email: sanitizeEmail,
  username: sanitizeUsername,
  url: sanitizeUrl,
  number: sanitizeNumber,
  object: sanitizeObject,
  html: escapeHtml,
  sql: escapeSql,
  stripHtml,
};

export default sanitize;
