/**
 * Vibe-Pay 金流橋接器 - 環境配置
 *
 * 安全原則：
 * 1. 嚴禁硬編碼任何金鑰
 * 2. 所有敏感資訊從環境變數讀取
 * 3. 啟動時驗證必要環境變數
 */

import type { NewebPayConfig, IdempotencyConfig } from '../types';

// ============================================
// 環境變數名稱常量
// ============================================

const ENV_KEYS = {
  MERCHANT_ID: 'NEWEBPAY_MERCHANT_ID',
  HASH_KEY: 'NEWEBPAY_HASH_KEY',
  HASH_IV: 'NEWEBPAY_HASH_IV',
  IS_PRODUCTION: 'NEWEBPAY_IS_PRODUCTION',
  VERSION: 'NEWEBPAY_VERSION',
  RETURN_URL: 'NEWEBPAY_RETURN_URL',
  NOTIFY_URL: 'NEWEBPAY_NOTIFY_URL',
  CLIENT_BACK_URL: 'NEWEBPAY_CLIENT_BACK_URL',
  PERIOD_NOTIFY_URL: 'NEWEBPAY_PERIOD_NOTIFY_URL',
} as const;

// ============================================
// 環境變數驗證
// ============================================

interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
}

/**
 * 驗證必要環境變數是否存在
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const requiredKeys = [
    ENV_KEYS.MERCHANT_ID,
    ENV_KEYS.HASH_KEY,
    ENV_KEYS.HASH_IV,
  ];

  const missingKeys: string[] = [];
  const invalidKeys: string[] = [];

  for (const key of requiredKeys) {
    const value = process.env[key];
    if (!value) {
      missingKeys.push(key);
    }
  }

  // 驗證 HashKey 長度 (必須 32 字元)
  const hashKey = process.env[ENV_KEYS.HASH_KEY];
  if (hashKey && hashKey.length !== 32) {
    invalidKeys.push(`${ENV_KEYS.HASH_KEY} (expected 32 chars, got ${hashKey.length})`);
  }

  // 驗證 HashIV 長度 (必須 16 字元)
  const hashIV = process.env[ENV_KEYS.HASH_IV];
  if (hashIV && hashIV.length !== 16) {
    invalidKeys.push(`${ENV_KEYS.HASH_IV} (expected 16 chars, got ${hashIV.length})`);
  }

  return {
    isValid: missingKeys.length === 0 && invalidKeys.length === 0,
    missingKeys,
    invalidKeys,
  };
}

/**
 * 安全地讀取環境變數
 * @throws Error 如果必要變數缺失
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please set it in your .env file.`
    );
  }
  return value;
}

/**
 * 讀取選填環境變數
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// ============================================
// 配置載入
// ============================================

/**
 * 載入藍新金流配置
 * 所有金鑰從環境變數讀取，嚴禁硬編碼
 */
export function loadNewebPayConfig(): NewebPayConfig {
  const isProduction = getOptionalEnv(ENV_KEYS.IS_PRODUCTION, 'false') === 'true';

  return {
    merchantId: getRequiredEnv(ENV_KEYS.MERCHANT_ID),
    hashKey: getRequiredEnv(ENV_KEYS.HASH_KEY),
    hashIV: getRequiredEnv(ENV_KEYS.HASH_IV),
    version: getOptionalEnv(ENV_KEYS.VERSION, '2.0'),
    isTest: !isProduction,
    respondType: 'JSON',
  };
}

/**
 * 取得 API 端點 (依據環境)
 */
export function getEndpoints(isProduction: boolean) {
  return {
    mpg: isProduction
      ? 'https://core.newebpay.com/MPG/mpg_gateway'
      : 'https://ccore.newebpay.com/MPG/mpg_gateway',
    period: isProduction
      ? 'https://core.newebpay.com/MPG/period'
      : 'https://ccore.newebpay.com/MPG/period',
    periodAlter: isProduction
      ? 'https://core.newebpay.com/MPG/period/AlterStatus'
      : 'https://ccore.newebpay.com/MPG/period/AlterStatus',
    queryTradeInfo: isProduction
      ? 'https://core.newebpay.com/API/QueryTradeInfo'
      : 'https://ccore.newebpay.com/API/QueryTradeInfo',
  };
}

/**
 * 取得回呼 URL 配置
 */
export function getCallbackUrls() {
  return {
    returnUrl: getOptionalEnv(ENV_KEYS.RETURN_URL, ''),
    notifyUrl: getOptionalEnv(ENV_KEYS.NOTIFY_URL, ''),
    clientBackUrl: getOptionalEnv(ENV_KEYS.CLIENT_BACK_URL, ''),
    periodNotifyUrl: getOptionalEnv(ENV_KEYS.PERIOD_NOTIFY_URL, ''),
  };
}

// ============================================
// 冪等性配置
// ============================================

/**
 * 載入冪等性機制配置
 */
export function loadIdempotencyConfig(): IdempotencyConfig {
  return {
    // Key 過期時間: 24 小時
    keyTTL: parseInt(process.env.IDEMPOTENCY_KEY_TTL || '86400000', 10),
    // 處理鎖定超時: 5 分鐘
    lockTimeout: parseInt(process.env.IDEMPOTENCY_LOCK_TIMEOUT || '300000', 10),
    // 最大重試次數
    maxRetries: parseInt(process.env.IDEMPOTENCY_MAX_RETRIES || '3', 10),
    // 是否啟用分散式鎖
    enableDistributedLock: process.env.IDEMPOTENCY_DISTRIBUTED_LOCK === 'true',
  };
}

// ============================================
// 開發/測試用預設值 (僅供參考，不含實際金鑰)
// ============================================

/**
 * 產生 .env 範本內容
 */
export function generateEnvTemplate(): string {
  return `# ========================================
# Vibe-Pay 金流橋接器 - 環境變數配置
# ========================================
# 警告：此為範本文件，請填入您的實際金鑰
# 嚴禁將含有真實金鑰的 .env 檔案提交到版本控制
# ========================================

# 藍新金流商店設定
NEWEBPAY_MERCHANT_ID=your_merchant_id_here
NEWEBPAY_HASH_KEY=your_32_character_hash_key_here
NEWEBPAY_HASH_IV=your_16_char_iv_

# 環境設定 (true = 正式環境, false = 測試環境)
NEWEBPAY_IS_PRODUCTION=false

# API 版本
NEWEBPAY_VERSION=2.0

# 回呼 URL 設定
NEWEBPAY_RETURN_URL=https://your-domain.com/payment/return
NEWEBPAY_NOTIFY_URL=https://your-domain.com/payment/notify
NEWEBPAY_CLIENT_BACK_URL=https://your-domain.com/payment/cancel
NEWEBPAY_PERIOD_NOTIFY_URL=https://your-domain.com/payment/period-notify

# 冪等性機制設定
IDEMPOTENCY_KEY_TTL=86400000
IDEMPOTENCY_LOCK_TIMEOUT=300000
IDEMPOTENCY_MAX_RETRIES=3
IDEMPOTENCY_DISTRIBUTED_LOCK=false

# Supabase 設定
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
`;
}

export { ENV_KEYS };
