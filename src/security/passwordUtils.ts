/**
 * 密碼工具模組 (Password Utilities)
 *
 * 提供密碼雜湊、驗證與安全相關功能
 * 注意：前端環境下，實際的 bcrypt 運算應在後端執行
 * 此模組提供前端所需的密碼驗證與安全檢查
 */

import { getPasswordStrength } from './validator';

// ============================================
// 類型定義
// ============================================

export interface PasswordHashResult {
  hash: string;
  salt: string;
  algorithm: string;
  iterations: number;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
  preventCommonPasswords: boolean;
  preventUserInfoInPassword: boolean;
  maxRepeatingChars: number;
  historyCount: number;
}

export interface PasswordValidationResult {
  valid: boolean;
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  errors: string[];
  suggestions: string[];
}

// ============================================
// 預設密碼政策
// ============================================

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*(),.?":{}|<>',
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  maxRepeatingChars: 3,
  historyCount: 5,
};

// ============================================
// 常見弱密碼列表
// ============================================

const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '123456789', '12345678',
  'qwerty', 'abc123', 'monkey', 'master', 'dragon',
  'admin', 'letmein', 'login', 'welcome', 'shadow',
  'sunshine', 'princess', 'passw0rd', 'qwerty123', 'iloveyou',
  'trustno1', 'password1', '1234567890', 'starwars', 'football',
  'baseball', 'soccer', 'hockey', 'batman', 'superman',
  'harley', 'tigger', 'charlie', 'thomas', 'george',
];

// ============================================
// 密碼雜湊（前端模擬，實際應在後端使用 bcrypt）
// ============================================

/**
 * 使用 Web Crypto API 進行密碼雜湊
 * 注意：這是前端實現，生產環境應使用後端 bcrypt
 */
export async function hashPassword(
  password: string,
  salt?: string
): Promise<PasswordHashResult> {
  // 生成或使用提供的 salt
  const saltBuffer = salt
    ? hexToBuffer(salt)
    : crypto.getRandomValues(new Uint8Array(16));

  const saltHex = bufferToHex(saltBuffer);

  // 使用 PBKDF2 進行密碼雜湊
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const iterations = 100000;
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hash = bufferToHex(new Uint8Array(derivedBits));

  return {
    hash,
    salt: saltHex,
    algorithm: 'PBKDF2-SHA256',
    iterations,
  };
}

/**
 * 驗證密碼
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const result = await hashPassword(password, salt);
  return result.hash === storedHash;
}

/**
 * 生成隨機密碼
 */
export function generatePassword(
  length: number = 16,
  options: {
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
  } = {}
): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  // 確保包含各類型字元
  let attempts = 0;
  while (attempts < 100) {
    let isValid = true;

    if (uppercase && !/[A-Z]/.test(password)) isValid = false;
    if (lowercase && !/[a-z]/.test(password)) isValid = false;
    if (numbers && !/[0-9]/.test(password)) isValid = false;
    if (symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) isValid = false;

    if (isValid) break;

    // 重新生成
    crypto.getRandomValues(randomValues);
    password = '';
    for (let i = 0; i < length; i++) {
      password += chars[randomValues[i] % chars.length];
    }
    attempts++;
  }

  return password;
}

// ============================================
// 密碼政策驗證
// ============================================

/**
 * 根據政策驗證密碼
 */
export function validatePassword(
  password: string,
  policy: Partial<PasswordPolicy> = {},
  userInfo?: {
    username?: string;
    email?: string;
    name?: string;
  }
): PasswordValidationResult {
  const fullPolicy = { ...DEFAULT_PASSWORD_POLICY, ...policy };
  const errors: string[] = [];
  const suggestions: string[] = [];

  // 長度檢查
  if (password.length < fullPolicy.minLength) {
    errors.push(`密碼長度至少需要 ${fullPolicy.minLength} 個字元`);
  }
  if (password.length > fullPolicy.maxLength) {
    errors.push(`密碼長度不得超過 ${fullPolicy.maxLength} 個字元`);
  }

  // 大寫字母
  if (fullPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密碼必須包含至少一個大寫字母');
    suggestions.push('加入大寫字母 (A-Z)');
  }

  // 小寫字母
  if (fullPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密碼必須包含至少一個小寫字母');
    suggestions.push('加入小寫字母 (a-z)');
  }

  // 數字
  if (fullPolicy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('密碼必須包含至少一個數字');
    suggestions.push('加入數字 (0-9)');
  }

  // 特殊字元
  if (fullPolicy.requireSpecialChars) {
    const specialCharsRegex = new RegExp(
      `[${fullPolicy.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`
    );
    if (!specialCharsRegex.test(password)) {
      errors.push('密碼必須包含至少一個特殊字元');
      suggestions.push(`加入特殊字元 (${fullPolicy.specialChars})`);
    }
  }

  // 常見密碼檢查
  if (fullPolicy.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some((cp) => lowerPassword.includes(cp))) {
      errors.push('密碼過於常見，容易被破解');
      suggestions.push('使用更獨特的密碼組合');
    }
  }

  // 使用者資訊檢查
  if (fullPolicy.preventUserInfoInPassword && userInfo) {
    const lowerPassword = password.toLowerCase();
    const userInfoValues = [
      userInfo.username,
      userInfo.email?.split('@')[0],
      userInfo.name,
    ].filter(Boolean).map((v) => v!.toLowerCase());

    for (const info of userInfoValues) {
      if (info.length >= 3 && lowerPassword.includes(info)) {
        errors.push('密碼不應包含使用者名稱或個人資訊');
        suggestions.push('避免使用與帳號相關的資訊');
        break;
      }
    }
  }

  // 連續重複字元檢查
  if (fullPolicy.maxRepeatingChars > 0) {
    const repeatingRegex = new RegExp(`(.)\\1{${fullPolicy.maxRepeatingChars},}`);
    if (repeatingRegex.test(password)) {
      errors.push(`不得有連續 ${fullPolicy.maxRepeatingChars + 1} 個以上相同字元`);
    }
  }

  // 取得密碼強度
  const strength = getPasswordStrength(password);

  return {
    valid: errors.length === 0,
    score: strength.score,
    level: strength.level,
    errors,
    suggestions: [...suggestions, ...strength.suggestions],
  };
}

/**
 * 檢查密碼是否在歷史記錄中
 * 注意：實際比對應在後端使用雜湊值進行
 */
export async function isPasswordInHistory(
  password: string,
  passwordHistory: Array<{ hash: string; salt: string }>
): Promise<boolean> {
  for (const entry of passwordHistory) {
    const matches = await verifyPassword(password, entry.hash, entry.salt);
    if (matches) return true;
  }
  return false;
}

// ============================================
// 工具函數
// ============================================

/**
 * Buffer 轉 Hex 字串
 */
function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hex 字串轉 Buffer
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * 計算密碼熵值
 */
export function calculatePasswordEntropy(password: string): number {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) charsetSize += 32;
  if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) charsetSize += 100;

  if (charsetSize === 0) return 0;

  return password.length * Math.log2(charsetSize);
}

/**
 * 估計密碼破解時間
 */
export function estimateCrackTime(password: string): {
  seconds: number;
  display: string;
} {
  const entropy = calculatePasswordEntropy(password);
  // 假設每秒可嘗試 10 億次
  const guessesPerSecond = 1e9;
  const combinations = Math.pow(2, entropy);
  const averageAttempts = combinations / 2;
  const seconds = averageAttempts / guessesPerSecond;

  let display: string;
  if (seconds < 1) {
    display = '瞬間';
  } else if (seconds < 60) {
    display = `${Math.round(seconds)} 秒`;
  } else if (seconds < 3600) {
    display = `${Math.round(seconds / 60)} 分鐘`;
  } else if (seconds < 86400) {
    display = `${Math.round(seconds / 3600)} 小時`;
  } else if (seconds < 31536000) {
    display = `${Math.round(seconds / 86400)} 天`;
  } else if (seconds < 31536000 * 100) {
    display = `${Math.round(seconds / 31536000)} 年`;
  } else if (seconds < 31536000 * 1000000) {
    display = `${Math.round(seconds / (31536000 * 1000))} 千年`;
  } else {
    display = '數百萬年';
  }

  return { seconds, display };
}

// ============================================
// 導出
// ============================================

export const passwordUtils = {
  hashPassword,
  verifyPassword,
  generatePassword,
  validatePassword,
  isPasswordInHistory,
  calculatePasswordEntropy,
  estimateCrackTime,
  DEFAULT_PASSWORD_POLICY,
  COMMON_PASSWORDS,
};

export default passwordUtils;
