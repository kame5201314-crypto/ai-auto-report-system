/**
 * 輸入驗證模組 (Input Validator)
 *
 * 提供各種輸入驗證函數
 * 確保資料符合預期格式
 */

import { ValidationError } from './types';

// ============================================
// 驗證規則介面
// ============================================

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  value: unknown;
  rules: ValidationRule[];
}

// ============================================
// 基礎驗證函數
// ============================================

/**
 * 驗證必填欄位
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * 驗證 Email 格式
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  // RFC 5322 簡化版
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * 驗證密碼強度
 */
export function isStrongPassword(password: unknown): boolean {
  if (typeof password !== 'string') return false;

  // 至少 8 個字元
  if (password.length < 8) return false;

  // 至少一個大寫字母
  if (!/[A-Z]/.test(password)) return false;

  // 至少一個小寫字母
  if (!/[a-z]/.test(password)) return false;

  // 至少一個數字
  if (!/[0-9]/.test(password)) return false;

  // 至少一個特殊字元
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}

/**
 * 驗證密碼強度（返回詳細資訊）
 */
export function getPasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('密碼至少需要 8 個字元');
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('加入大寫字母');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('加入小寫字母');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('加入數字');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('加入特殊字元');
  }

  // 檢查常見弱密碼
  const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (weakPasswords.some(wp => password.toLowerCase().includes(wp))) {
    score = Math.max(0, score - 2);
    suggestions.push('避免使用常見密碼');
  }

  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) level = 'weak';
  else if (score <= 3) level = 'fair';
  else if (score <= 5) level = 'good';
  else level = 'strong';

  return { score, level, suggestions };
}

/**
 * 驗證電話號碼（台灣格式）
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;

  // 清除空格和連字符
  const cleaned = phone.replace(/[\s-]/g, '');

  // 台灣手機：09 開頭，共 10 碼
  const mobileRegex = /^09\d{8}$/;

  // 台灣市話：02-08 開頭，共 9-10 碼
  const landlineRegex = /^0[2-8]\d{7,8}$/;

  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
}

/**
 * 驗證統一編號（台灣）
 */
export function isValidTaxId(taxId: unknown): boolean {
  if (typeof taxId !== 'string') return false;

  // 統一編號為 8 碼數字
  if (!/^\d{8}$/.test(taxId)) return false;

  // 加權驗證
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    const digit = parseInt(taxId[i], 10);
    const product = digit * weights[i];
    sum += Math.floor(product / 10) + (product % 10);
  }

  // 特殊規則：第 7 碼為 7 時，可能需要調整
  if (taxId[6] === '7') {
    return sum % 10 === 0 || (sum + 1) % 10 === 0;
  }

  return sum % 10 === 0;
}

/**
 * 驗證身分證字號（台灣）
 */
export function isValidNationalId(id: unknown): boolean {
  if (typeof id !== 'string') return false;

  // 格式：首字母 + 9 碼數字
  if (!/^[A-Z][12]\d{8}$/.test(id.toUpperCase())) return false;

  const upperId = id.toUpperCase();

  // 字母對照表
  const letterMap: Record<string, number> = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17,
    I: 34, J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23,
    Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30,
    Y: 31, Z: 33
  };

  const letterValue = letterMap[upperId[0]];
  if (!letterValue) return false;

  // 加權計算
  let sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9;

  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  for (let i = 0; i < 8; i++) {
    sum += parseInt(upperId[i + 1], 10) * weights[i];
  }

  sum += parseInt(upperId[9], 10);

  return sum % 10 === 0;
}

/**
 * 驗證 URL 格式
 */
export function isValidUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * 驗證日期格式
 */
export function isValidDate(date: unknown, format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY-MM-DD'): boolean {
  if (typeof date !== 'string') return false;

  let regex: RegExp;
  let year: number, month: number, day: number;

  switch (format) {
    case 'YYYY-MM-DD':
      regex = /^(\d{4})-(\d{2})-(\d{2})$/;
      break;
    case 'DD/MM/YYYY':
      regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      break;
    case 'MM/DD/YYYY':
      regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      break;
  }

  const match = date.match(regex);
  if (!match) return false;

  if (format === 'YYYY-MM-DD') {
    [, year, month, day] = match.map(Number) as [unknown, number, number, number];
  } else if (format === 'DD/MM/YYYY') {
    [, day, month, year] = match.map(Number) as [unknown, number, number, number];
  } else {
    [, month, day, year] = match.map(Number) as [unknown, number, number, number];
  }

  // 驗證日期有效性
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * 驗證數字範圍
 */
export function isInRange(
  value: unknown,
  min?: number,
  max?: number
): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * 驗證字串長度
 */
export function isValidLength(
  value: unknown,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'string') return false;
  if (min !== undefined && value.length < min) return false;
  if (max !== undefined && value.length > max) return false;
  return true;
}

/**
 * 驗證陣列長度
 */
export function isValidArrayLength(
  arr: unknown,
  min?: number,
  max?: number
): boolean {
  if (!Array.isArray(arr)) return false;
  if (min !== undefined && arr.length < min) return false;
  if (max !== undefined && arr.length > max) return false;
  return true;
}

// ============================================
// 預設驗證規則
// ============================================

export const rules = {
  required: (): ValidationRule => ({
    validate: isRequired,
    message: '此欄位為必填',
  }),

  email: (): ValidationRule<string> => ({
    validate: isValidEmail,
    message: '請輸入有效的 Email 格式',
  }),

  strongPassword: (): ValidationRule<string> => ({
    validate: isStrongPassword,
    message: '密碼需至少 8 碼，包含大小寫字母、數字及特殊字元',
  }),

  phone: (): ValidationRule<string> => ({
    validate: isValidPhone,
    message: '請輸入有效的電話號碼',
  }),

  taxId: (): ValidationRule<string> => ({
    validate: isValidTaxId,
    message: '請輸入有效的統一編號',
  }),

  nationalId: (): ValidationRule<string> => ({
    validate: isValidNationalId,
    message: '請輸入有效的身分證字號',
  }),

  url: (): ValidationRule<string> => ({
    validate: isValidUrl,
    message: '請輸入有效的網址',
  }),

  date: (format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY-MM-DD'): ValidationRule<string> => ({
    validate: (v) => isValidDate(v, format),
    message: `請輸入有效的日期格式 (${format})`,
  }),

  minLength: (min: number): ValidationRule<string> => ({
    validate: (v) => isValidLength(v, min),
    message: `至少需要 ${min} 個字元`,
  }),

  maxLength: (max: number): ValidationRule<string> => ({
    validate: (v) => isValidLength(v, undefined, max),
    message: `不得超過 ${max} 個字元`,
  }),

  range: (min: number, max: number): ValidationRule<number> => ({
    validate: (v) => isInRange(v, min, max),
    message: `數值需介於 ${min} 至 ${max} 之間`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (v) => typeof v === 'string' && regex.test(v),
    message,
  }),

  custom: <T>(validator: (value: T) => boolean, message: string): ValidationRule<T> => ({
    validate: validator,
    message,
  }),
};

// ============================================
// 驗證執行器
// ============================================

/**
 * 驗證單一欄位
 */
export function validateField(
  value: unknown,
  fieldRules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of fieldRules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 驗證多個欄位
 */
export function validateFields(
  fields: FieldValidation[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const { field, value, rules: fieldRules } of fields) {
    results[field] = validateField(value, fieldRules);
  }

  return results;
}

/**
 * 驗證物件（表單驗證）
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): {
  valid: boolean;
  errors: Record<string, string[]>;
  firstError?: string;
} {
  const errors: Record<string, string[]> = {};
  let firstError: string | undefined;

  for (const [field, fieldRules] of Object.entries(schema)) {
    const value = data[field as keyof T];
    const result = validateField(value, fieldRules as ValidationRule[]);

    if (!result.valid) {
      errors[field] = result.errors;
      if (!firstError && result.errors.length > 0) {
        firstError = `${field}: ${result.errors[0]}`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
}

/**
 * 驗證並拋出錯誤
 */
export function assertValid<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): void {
  const result = validateForm(data, schema);

  if (!result.valid) {
    throw new ValidationError(
      result.firstError || '驗證失敗',
      result.errors
    );
  }
}

// ============================================
// 導出
// ============================================

export const validator = {
  isRequired,
  isValidEmail,
  isStrongPassword,
  getPasswordStrength,
  isValidPhone,
  isValidTaxId,
  isValidNationalId,
  isValidUrl,
  isValidDate,
  isInRange,
  isValidLength,
  isValidArrayLength,
  rules,
  validateField,
  validateFields,
  validateForm,
  assertValid,
};

export default validator;
