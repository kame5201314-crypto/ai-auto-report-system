/**
 * NewebPayVault - 藍新金流安全加密類別
 *
 * ██╗   ██╗██╗██████╗ ███████╗      ██████╗  █████╗ ██╗   ██╗
 * ██║   ██║██║██╔══██╗██╔════╝      ██╔══██╗██╔══██╗╚██╗ ██╔╝
 * ██║   ██║██║██████╔╝█████╗  █████╗██████╔╝███████║ ╚████╔╝
 * ╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════╝██╔═══╝ ██╔══██║  ╚██╔╝
 *  ╚████╔╝ ██║██████╔╝███████╗      ██║     ██║  ██║   ██║
 *   ╚═══╝  ╚═╝╚═════╝ ╚══════╝      ╚═╝     ╚═╝  ╚═╝   ╚═╝
 *
 * 核心安全原則：
 * 1. 嚴禁硬編碼任何金鑰 - 所有金鑰從 .env 環境變數讀取
 * 2. AES-256-CBC 加密 + SHA256 雜湊驗證
 * 3. 參數排序嚴格遵循藍新規範
 * 4. 支援安全審計日誌
 *
 * @module payment/services/NewebPayVault
 */

import * as crypto from 'crypto';
import type {
  NewebPayConfig,
  MPGTradeInfo,
  MPGFormData,
  MPGResult,
  PeriodicalTradeInfo,
  PeriodicalResult,
  EncryptionResult,
  DecryptionResult,
  KeyValidationResult,
  SecurityAuditLog,
} from '../types';
import { loadNewebPayConfig, validateEnvironmentVariables } from '../config/newebpay.config';

// ============================================
// 常量定義
// ============================================

/** AES-256-CBC 演算法標識 */
const CIPHER_ALGORITHM = 'aes-256-cbc' as const;

/** 金鑰長度要求 */
const KEY_REQUIREMENTS = {
  HASH_KEY_LENGTH: 32,  // 256 bits
  HASH_IV_LENGTH: 16,   // 128 bits
} as const;

/** 藍新 MPG 參數排序 (嚴格順序) */
const MPG_PARAM_ORDER = [
  'MerchantID',
  'RespondType',
  'TimeStamp',
  'Version',
  'MerchantOrderNo',
  'Amt',
  'ItemDesc',
  'TradeLimit',
  'ExpireDate',
  'ReturnURL',
  'NotifyURL',
  'ClientBackURL',
  'Email',
  'EmailModify',
  'LoginType',
  'OrderComment',
  'CREDIT',
  'InstFlag',
  'CreditRed',
  'UNIONPAY',
  'WEBATM',
  'VACC',
  'CVS',
  'BARCODE',
  'ESUNWALLET',
  'TAIWANPAY',
  'LINEPAY',
  'SAMSUNGPAY',
  'GOOGLEPAY',
  'CVSCOM',
  'LgsType',
  'INVOICE',
] as const;

/** 定期定額參數排序 */
const PERIOD_PARAM_ORDER = [
  'MerchantID',
  'RespondType',
  'TimeStamp',
  'Version',
  'MerchantOrderNo',
  'PeriodNo',
  'Amt',
  'ItemDesc',
  'Email',
  'PeriodType',
  'PeriodPoint',
  'PeriodAmt',
  'PeriodMemo',
  'PeriodStartType',
  'PeriodFirstdate',
  'ReturnURL',
  'NotifyURL',
  'BackURL',
  'PeriodNotifyURL',
  'OrderComment',
  'INVOICE',
] as const;

// ============================================
// NewebPayVault 類別
// ============================================

/**
 * 藍新金流安全加密保險庫
 *
 * 設計模式: Singleton (確保金鑰只載入一次)
 *
 * @example
 * ```typescript
 * // 初始化 (應用啟動時)
 * const vault = NewebPayVault.getInstance();
 *
 * // 加密交易資訊
 * const encrypted = vault.encryptTradeInfo(tradeParams);
 *
 * // 解密回應
 * const decrypted = vault.decryptTradeInfo(encryptedData, tradeSha);
 * ```
 */
export class NewebPayVault {
  private static instance: NewebPayVault | null = null;

  /** 配置資訊 (金鑰已載入) */
  private readonly config: NewebPayConfig;

  /** 是否已初始化 */
  private initialized = false;

  /** 審計日誌佇列 */
  private auditLogs: SecurityAuditLog[] = [];

  /** 審計日誌最大保留數量 */
  private readonly maxAuditLogs = 1000;

  // ============================================
  // 建構與初始化
  // ============================================

  /**
   * 私有建構函式 (Singleton 模式)
   * @throws Error 如果環境變數驗證失敗
   */
  private constructor() {
    // 驗證環境變數
    const validation = validateEnvironmentVariables();
    if (!validation.isValid) {
      const errors: string[] = [];
      if (validation.missingKeys.length > 0) {
        errors.push(`Missing: ${validation.missingKeys.join(', ')}`);
      }
      if (validation.invalidKeys.length > 0) {
        errors.push(`Invalid: ${validation.invalidKeys.join(', ')}`);
      }
      throw new Error(
        `NewebPayVault initialization failed.\n${errors.join('\n')}\n` +
        `Please check your .env file.`
      );
    }

    // 載入配置
    this.config = loadNewebPayConfig();

    // 驗證金鑰格式
    const keyValidation = this.validateKeys();
    if (!keyValidation.isValid) {
      throw new Error(
        `Key validation failed: ${keyValidation.errors.join(', ')}`
      );
    }

    this.initialized = true;
    this.logAudit('KEY_ACCESS', true, undefined, 'Vault initialized');
  }

  /**
   * 取得 Vault 實例 (Singleton)
   */
  public static getInstance(): NewebPayVault {
    if (!NewebPayVault.instance) {
      NewebPayVault.instance = new NewebPayVault();
    }
    return NewebPayVault.instance;
  }

  /**
   * 重置實例 (僅供測試使用)
   */
  public static resetInstance(): void {
    NewebPayVault.instance = null;
  }

  // ============================================
  // 金鑰驗證
  // ============================================

  /**
   * 驗證 HashKey 和 HashIV 格式
   */
  private validateKeys(): KeyValidationResult {
    const errors: string[] = [];
    const { hashKey, hashIV } = this.config;

    // 驗證 HashKey
    if (hashKey.length !== KEY_REQUIREMENTS.HASH_KEY_LENGTH) {
      errors.push(
        `HashKey must be exactly ${KEY_REQUIREMENTS.HASH_KEY_LENGTH} characters ` +
        `(got ${hashKey.length})`
      );
    }

    // 驗證 HashIV
    if (hashIV.length !== KEY_REQUIREMENTS.HASH_IV_LENGTH) {
      errors.push(
        `HashIV must be exactly ${KEY_REQUIREMENTS.HASH_IV_LENGTH} characters ` +
        `(got ${hashIV.length})`
      );
    }

    // 檢查是否包含非法字元 (僅允許英數字)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(hashKey)) {
      errors.push('HashKey contains invalid characters (only alphanumeric allowed)');
    }
    if (!alphanumericRegex.test(hashIV)) {
      errors.push('HashIV contains invalid characters (only alphanumeric allowed)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      hashKeyLength: hashKey.length,
      hashIVLength: hashIV.length,
    };
  }

  // ============================================
  // 核心加密方法
  // ============================================

  /**
   * 加密 MPG 交易資訊
   *
   * 加密流程：
   * 1. 將參數按照藍新規定順序排列
   * 2. 組成 Query String (URL Encoded)
   * 3. 使用 AES-256-CBC 加密
   * 4. 輸出 Hex 編碼字串
   * 5. 計算 SHA256 雜湊
   *
   * @param params - MPG 交易參數
   * @returns 加密結果 (TradeInfo + TradeSha)
   */
  public encryptTradeInfo(params: Partial<MPGTradeInfo>): EncryptionResult {
    this.ensureInitialized();

    const timestamp = Math.floor(Date.now() / 1000);

    // 組裝完整參數
    const fullParams: MPGTradeInfo = {
      MerchantID: this.config.merchantId,
      RespondType: this.config.respondType || 'JSON',
      TimeStamp: timestamp.toString(),
      Version: this.config.version || '2.0',
      ...params,
    } as MPGTradeInfo;

    // 按照藍新規定順序排列參數並組成 Query String
    const queryString = this.buildOrderedQueryString(
      fullParams as unknown as Record<string, unknown>,
      MPG_PARAM_ORDER
    );

    // AES-256-CBC 加密
    const tradeInfo = this.aesEncrypt(queryString);

    // SHA256 雜湊
    const tradeSha = this.sha256Hash(tradeInfo);

    this.logAudit('ENCRYPT', true, fullParams.MerchantOrderNo);

    return {
      tradeInfo,
      tradeSha,
      timestamp,
    };
  }

  /**
   * 加密定期定額交易資訊
   *
   * @param params - 定期定額參數
   * @returns 加密結果
   */
  public encryptPeriodInfo(params: Partial<PeriodicalTradeInfo>): EncryptionResult {
    this.ensureInitialized();

    const timestamp = Math.floor(Date.now() / 1000);

    const fullParams: PeriodicalTradeInfo = {
      MerchantID: this.config.merchantId,
      RespondType: this.config.respondType || 'JSON',
      TimeStamp: timestamp.toString(),
      Version: this.config.version || '1.0',
      ...params,
    } as PeriodicalTradeInfo;

    const queryString = this.buildOrderedQueryString(
      fullParams as unknown as Record<string, unknown>,
      PERIOD_PARAM_ORDER
    );
    const tradeInfo = this.aesEncrypt(queryString);
    const tradeSha = this.sha256Hash(tradeInfo);

    this.logAudit('ENCRYPT', true, fullParams.MerchantOrderNo);

    return {
      tradeInfo,
      tradeSha,
      timestamp,
    };
  }

  /**
   * 解密並驗證交易回應
   *
   * 解密流程：
   * 1. 驗證 SHA256 雜湊
   * 2. AES-256-CBC 解密
   * 3. 解析 JSON 資料
   *
   * @param encryptedData - 加密的 TradeInfo
   * @param tradeSha - SHA256 雜湊值
   * @returns 解密結果
   */
  public decryptTradeInfo<T = MPGResult>(
    encryptedData: string,
    tradeSha: string
  ): DecryptionResult<T> {
    this.ensureInitialized();

    try {
      // 步驟 1: 驗證 SHA256 雜湊
      const calculatedSha = this.sha256Hash(encryptedData);
      const isValid = calculatedSha === tradeSha.toUpperCase();

      if (!isValid) {
        this.logAudit('VALIDATE', false, undefined, 'SHA256 mismatch');
        return {
          success: false,
          isValid: false,
          error: 'SHA256 validation failed. Data may have been tampered.',
        };
      }

      // 步驟 2: AES-256-CBC 解密
      const decryptedString = this.aesDecrypt(encryptedData);

      // 步驟 3: 解析 JSON
      const data = JSON.parse(decryptedString) as T;

      this.logAudit('DECRYPT', true);

      return {
        success: true,
        data,
        isValid: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logAudit('DECRYPT', false, undefined, errorMessage);

      return {
        success: false,
        isValid: false,
        error: `Decryption failed: ${errorMessage}`,
      };
    }
  }

  // ============================================
  // 低階加密方法
  // ============================================

  /**
   * AES-256-CBC 加密
   *
   * 加密細節：
   * - 演算法: AES-256-CBC
   * - 金鑰長度: 32 bytes (256 bits)
   * - IV 長度: 16 bytes (128 bits)
   * - Padding: PKCS7 (Node.js crypto 預設)
   * - 輸出: 十六進位字串 (小寫)
   *
   * @param plaintext - 明文字串
   * @returns Hex 編碼的密文
   */
  private aesEncrypt(plaintext: string): string {
    const key = Buffer.from(this.config.hashKey, 'utf8');
    const iv = Buffer.from(this.config.hashIV, 'utf8');

    const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
    cipher.setAutoPadding(true); // 使用 PKCS7 padding

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  /**
   * AES-256-CBC 解密
   *
   * @param ciphertext - Hex 編碼的密文
   * @returns 解密後的明文
   */
  private aesDecrypt(ciphertext: string): string {
    const key = Buffer.from(this.config.hashKey, 'utf8');
    const iv = Buffer.from(this.config.hashIV, 'utf8');

    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * SHA256 雜湊
   *
   * 藍新金流 SHA256 格式：
   * HashKey={HashKey}&{TradeInfo}&HashIV={HashIV}
   *
   * 輸出規格：
   * - 大寫十六進位字串
   *
   * @param tradeInfo - 加密後的 TradeInfo
   * @returns 大寫的 SHA256 雜湊值
   */
  private sha256Hash(tradeInfo: string): string {
    // 重要：藍新規定的格式
    // HashKey=xxx&{加密後TradeInfo}&HashIV=xxx
    const hashString = `HashKey=${this.config.hashKey}&${tradeInfo}&HashIV=${this.config.hashIV}`;

    const hash = crypto.createHash('sha256');
    hash.update(hashString);

    // 轉換為大寫
    return hash.digest('hex').toUpperCase();
  }

  // ============================================
  // 參數處理
  // ============================================

  /**
   * 按照指定順序建立 Query String
   *
   * 重要：藍新金流對參數順序有嚴格要求
   *
   * @param params - 參數物件
   * @param order - 參數順序陣列
   * @returns URL Encoded Query String
   */
  private buildOrderedQueryString(
    params: Record<string, unknown>,
    order: readonly string[]
  ): string {
    const parts: string[] = [];

    // 按照指定順序排列
    for (const key of order) {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }

    // 處理未在順序清單中的參數 (按字母順序)
    const additionalKeys = Object.keys(params)
      .filter(key => !order.includes(key as never))
      .sort();

    for (const key of additionalKeys) {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        parts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }

    return parts.join('&');
  }

  // ============================================
  // 表單資料生成
  // ============================================

  /**
   * 產生 MPG 表單提交資料
   *
   * @param params - MPG 參數
   * @returns 完整的表單資料
   */
  public generateMPGFormData(params: Partial<MPGTradeInfo>): MPGFormData {
    const encrypted = this.encryptTradeInfo(params);

    return {
      MerchantID: this.config.merchantId,
      TradeInfo: encrypted.tradeInfo,
      TradeSha: encrypted.tradeSha,
      Version: this.config.version || '2.0',
    };
  }

  /**
   * 產生定期定額表單提交資料
   */
  public generatePeriodFormData(params: Partial<PeriodicalTradeInfo>): MPGFormData {
    const encrypted = this.encryptPeriodInfo(params);

    return {
      MerchantID: this.config.merchantId,
      TradeInfo: encrypted.tradeInfo,
      TradeSha: encrypted.tradeSha,
      Version: this.config.version || '1.0',
    };
  }

  // ============================================
  // 安全輔助方法
  // ============================================

  /**
   * 計算請求雜湊 (用於冪等性檢查)
   *
   * @param data - 請求資料
   * @returns SHA256 雜湊值
   */
  public hashRequest(data: Record<string, unknown>): string {
    const sortedJson = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(sortedJson).digest('hex');
  }

  /**
   * 產生安全的訂單編號
   *
   * 格式: {prefix}{timestamp}{random}
   * 總長度: 20-30 字元
   *
   * @param prefix - 前綴 (預設: 'VP')
   * @returns 唯一訂單編號
   */
  public generateOrderNo(prefix = 'VP'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${timestamp}${random}`.slice(0, 30);
  }

  /**
   * 驗證 Webhook 簽名
   *
   * @param tradeInfo - 加密的 TradeInfo
   * @param tradeSha - 收到的 TradeSha
   * @returns 是否驗證通過
   */
  public verifyWebhookSignature(tradeInfo: string, tradeSha: string): boolean {
    const calculatedSha = this.sha256Hash(tradeInfo);
    const isValid = calculatedSha === tradeSha.toUpperCase();

    this.logAudit('VALIDATE', isValid, undefined,
      isValid ? undefined : 'Webhook signature mismatch'
    );

    return isValid;
  }

  // ============================================
  // 安全審計
  // ============================================

  /**
   * 記錄審計日誌
   */
  private logAudit(
    eventType: SecurityAuditLog['eventType'],
    success: boolean,
    merchantOrderNo?: string,
    error?: string
  ): void {
    const log: SecurityAuditLog = {
      eventType,
      timestamp: new Date().toISOString(),
      merchantOrderNo,
      success,
      error,
    };

    this.auditLogs.push(log);

    // 限制日誌數量
    if (this.auditLogs.length > this.maxAuditLogs) {
      this.auditLogs = this.auditLogs.slice(-this.maxAuditLogs);
    }
  }

  /**
   * 取得審計日誌 (僅供管理用途)
   */
  public getAuditLogs(limit = 100): SecurityAuditLog[] {
    return this.auditLogs.slice(-limit);
  }

  /**
   * 清除審計日誌
   */
  public clearAuditLogs(): void {
    this.auditLogs = [];
  }

  // ============================================
  // 狀態檢查
  // ============================================

  /**
   * 確保已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('NewebPayVault is not initialized');
    }
  }

  /**
   * 取得配置資訊 (遮蔽敏感資料)
   */
  public getConfigInfo(): {
    merchantId: string;
    version: string;
    isTest: boolean;
    hashKeyMasked: string;
    hashIVMasked: string;
  } {
    return {
      merchantId: this.config.merchantId,
      version: this.config.version || '2.0',
      isTest: this.config.isTest,
      hashKeyMasked: this.maskString(this.config.hashKey),
      hashIVMasked: this.maskString(this.config.hashIV),
    };
  }

  /**
   * 遮蔽字串 (保留前後各 4 字元)
   */
  private maskString(str: string): string {
    if (str.length <= 8) {
      return '*'.repeat(str.length);
    }
    return str.slice(0, 4) + '*'.repeat(str.length - 8) + str.slice(-4);
  }

  /**
   * 健康檢查
   */
  public healthCheck(): {
    status: 'healthy' | 'unhealthy';
    initialized: boolean;
    keysValid: boolean;
    auditLogCount: number;
  } {
    const keysValid = this.validateKeys().isValid;

    return {
      status: this.initialized && keysValid ? 'healthy' : 'unhealthy',
      initialized: this.initialized,
      keysValid,
      auditLogCount: this.auditLogs.length,
    };
  }
}

// ============================================
// 便捷匯出
// ============================================

/**
 * 取得 Vault 實例的便捷方法
 */
export function getVault(): NewebPayVault {
  return NewebPayVault.getInstance();
}

export default NewebPayVault;
