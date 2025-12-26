/**
 * 藍新金流 NewebPay 安全性類別
 * 實作 AES-256-CBC 加密解密與 SHA256 雜湊
 *
 * @module payment/core/NewebPayVault
 * @security 嚴禁硬編碼敏感資訊，所有金鑰必須從環境變數讀取
 */

import type {
  NewebPayConfig,
  MPGTradeInfo,
  MPGFormData,
  MPGResult,
  PeriodicalTradeInfo,
  PeriodicalResult,
  WebhookPayload,
  ValidatedWebhookData,
} from '../types';

/**
 * NewebPay 安全性核心類別
 * 處理所有加密、解密、簽章驗證
 */
export class NewebPayVault {
  private readonly merchantId: string;
  private readonly hashKey: string;
  private readonly hashIV: string;
  private readonly isTest: boolean;
  private readonly version: string;
  private readonly respondType: 'JSON' | 'String';

  /**
   * 建立 NewebPayVault 實例
   * @throws {Error} 當環境變數未設定時拋出錯誤
   */
  constructor(config?: Partial<NewebPayConfig>) {
    // 從環境變數讀取敏感資訊 (嚴禁硬編碼)
    this.merchantId = config?.merchantId || this.getEnvVar('NEWEBPAY_MERCHANT_ID');
    this.hashKey = config?.hashKey || this.getEnvVar('NEWEBPAY_HASH_KEY');
    this.hashIV = config?.hashIV || this.getEnvVar('NEWEBPAY_HASH_IV');
    this.isTest = config?.isTest ?? this.getEnvVar('NEWEBPAY_TEST_MODE', 'true') === 'true';
    this.version = config?.version || '2.0';
    this.respondType = config?.respondType || 'JSON';

    // 驗證必要參數
    this.validateConfig();
  }

  /**
   * 從環境變數讀取設定
   */
  private getEnvVar(key: string, defaultValue?: string): string {
    // 支援多種環境變數讀取方式
    const value =
      (typeof process !== 'undefined' && process.env?.[key]) ||
      (typeof import.meta !== 'undefined' && (import.meta.env as Record<string, string>)?.[`VITE_${key}`]) ||
      defaultValue;

    if (!value && !defaultValue) {
      throw new Error(`環境變數 ${key} 未設定。請確保在 .env 檔案中設定此變數。`);
    }

    return value || '';
  }

  /**
   * 驗證設定是否完整
   */
  private validateConfig(): void {
    if (!this.merchantId || this.merchantId.length === 0) {
      throw new Error('MerchantID 未設定');
    }
    if (!this.hashKey || this.hashKey.length !== 32) {
      throw new Error('HashKey 必須為 32 字元');
    }
    if (!this.hashIV || this.hashIV.length !== 16) {
      throw new Error('HashIV 必須為 16 字元');
    }
  }

  /**
   * PKCS7 填充
   * @param data - 原始資料
   * @param blockSize - 區塊大小 (預設 32)
   */
  private pkcs7Pad(data: Uint8Array, blockSize: number = 32): Uint8Array {
    const padding = blockSize - (data.length % blockSize);
    const padded = new Uint8Array(data.length + padding);
    padded.set(data);
    padded.fill(padding, data.length);
    return padded;
  }

  /**
   * PKCS7 移除填充
   * @param data - 填充後的資料
   */
  private pkcs7Unpad(data: Uint8Array): Uint8Array {
    const padding = data[data.length - 1];
    if (padding > 32 || padding === 0) {
      return data;
    }
    // 驗證填充是否正確
    for (let i = data.length - padding; i < data.length; i++) {
      if (data[i] !== padding) {
        return data;
      }
    }
    return data.slice(0, data.length - padding);
  }

  /**
   * 將字串轉換為 Uint8Array
   */
  private stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  /**
   * 將 Uint8Array 轉換為字串
   */
  private bytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }

  /**
   * 將 Uint8Array 轉換為十六進位字串
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 將十六進位字串轉換為 Uint8Array
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  /**
   * AES-256-CBC 加密
   * @param data - 要加密的資料
   * @returns 加密後的十六進位字串
   */
  async encrypt(data: string): Promise<string> {
    const keyBytes = this.stringToBytes(this.hashKey);
    const ivBytes = this.stringToBytes(this.hashIV);
    const dataBytes = this.stringToBytes(data);
    const paddedData = this.pkcs7Pad(dataBytes, 16);

    // 使用 Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: ivBytes },
      cryptoKey,
      paddedData
    );

    return this.bytesToHex(new Uint8Array(encrypted));
  }

  /**
   * AES-256-CBC 解密
   * @param encryptedHex - 加密後的十六進位字串
   * @returns 解密後的原始資料
   */
  async decrypt(encryptedHex: string): Promise<string> {
    const keyBytes = this.stringToBytes(this.hashKey);
    const ivBytes = this.stringToBytes(this.hashIV);
    const encryptedBytes = this.hexToBytes(encryptedHex);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBytes },
      cryptoKey,
      encryptedBytes
    );

    const unpaddedData = this.pkcs7Unpad(new Uint8Array(decrypted));
    return this.bytesToString(unpaddedData);
  }

  /**
   * SHA256 雜湊 (產生 TradeSha)
   * @param tradeInfo - 加密後的 TradeInfo
   * @returns SHA256 雜湊值 (大寫)
   */
  async createTradeSha(tradeInfo: string): Promise<string> {
    const data = `HashKey=${this.hashKey}&${tradeInfo}&HashIV=${this.hashIV}`;
    const dataBytes = this.stringToBytes(data);

    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    return this.bytesToHex(new Uint8Array(hashBuffer)).toUpperCase();
  }

  /**
   * 產生 MPG 交易表單資料
   * @param tradeInfo - 交易資訊
   * @returns 加密後的表單資料
   */
  async createMPGFormData(tradeInfo: Omit<MPGTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'>): Promise<MPGFormData> {
    // 組合完整交易資訊
    const fullTradeInfo: MPGTradeInfo = {
      MerchantID: this.merchantId,
      RespondType: this.respondType,
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: this.version,
      ...tradeInfo,
    };

    // 將交易資訊轉換為 URL 編碼字串
    const queryString = this.objectToQueryString(fullTradeInfo);

    // AES 加密
    const encryptedTradeInfo = await this.encrypt(queryString);

    // SHA256 雜湊
    const tradeSha = await this.createTradeSha(encryptedTradeInfo);

    return {
      MerchantID: this.merchantId,
      TradeInfo: encryptedTradeInfo,
      TradeSha: tradeSha,
      Version: this.version,
    };
  }

  /**
   * 產生定期定額交易表單資料
   * @param tradeInfo - 定期定額交易資訊
   * @returns 加密後的表單資料
   */
  async createPeriodicalFormData(
    tradeInfo: Omit<PeriodicalTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'>
  ): Promise<MPGFormData> {
    const fullTradeInfo: PeriodicalTradeInfo = {
      MerchantID: this.merchantId,
      RespondType: this.respondType,
      TimeStamp: Math.floor(Date.now() / 1000).toString(),
      Version: '1.0', // 定期定額使用版本 1.0
      ...tradeInfo,
    };

    const queryString = this.objectToQueryString(fullTradeInfo);
    const encryptedTradeInfo = await this.encrypt(queryString);
    const tradeSha = await this.createTradeSha(encryptedTradeInfo);

    return {
      MerchantID: this.merchantId,
      TradeInfo: encryptedTradeInfo,
      TradeSha: tradeSha,
      Version: '1.0',
    };
  }

  /**
   * 將物件轉換為 URL 查詢字串
   */
  private objectToQueryString(obj: Record<string, unknown>): string {
    return Object.entries(obj)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
  }

  /**
   * 解析 URL 查詢字串為物件
   */
  private queryStringToObject(queryString: string): Record<string, string> {
    const result: Record<string, string> = {};
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        result[key] = decodeURIComponent(value || '');
      }
    });
    return result;
  }

  /**
   * 驗證藍新回傳的 CheckCode/TradeSha
   * @param payload - Webhook 回傳資料
   * @returns 驗證結果
   */
  async validateResponse(payload: WebhookPayload): Promise<ValidatedWebhookData> {
    try {
      // 驗證商店代號
      if (payload.MerchantID !== this.merchantId) {
        return {
          isValid: false,
          error: '商店代號不符',
        };
      }

      // 驗證 TradeSha
      const expectedTradeSha = await this.createTradeSha(payload.TradeInfo);
      if (payload.TradeSha !== expectedTradeSha) {
        return {
          isValid: false,
          error: 'TradeSha 驗證失敗，可能為偽造回傳',
        };
      }

      // 解密 TradeInfo
      const decryptedString = await this.decrypt(payload.TradeInfo);

      // 嘗試解析為 JSON
      let decryptedData: MPGResult | PeriodicalResult;
      try {
        decryptedData = JSON.parse(decryptedString);
      } catch {
        // 如果不是 JSON，嘗試解析為 URL 查詢字串
        const parsed = this.queryStringToObject(decryptedString);
        decryptedData = {
          Status: parsed.Status || '',
          Message: parsed.Message || '',
          Result: parsed as unknown as MPGResult['Result'],
        };
      }

      return {
        isValid: true,
        decryptedData,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `驗證過程發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
      };
    }
  }

  /**
   * 解密藍新回傳的 TradeInfo
   * @param encryptedTradeInfo - 加密的 TradeInfo
   * @returns 解密後的資料
   */
  async decryptTradeInfo<T = MPGResult | PeriodicalResult>(encryptedTradeInfo: string): Promise<T> {
    const decryptedString = await this.decrypt(encryptedTradeInfo);

    try {
      return JSON.parse(decryptedString) as T;
    } catch {
      // 如果不是 JSON 格式，回傳原始物件
      const parsed = this.queryStringToObject(decryptedString);
      return parsed as unknown as T;
    }
  }

  /**
   * 產生自動提交的 HTML 表單
   * @param formData - 表單資料
   * @param actionUrl - 提交目標 URL (可選，預設根據環境自動選擇)
   * @returns HTML 表單字串
   */
  generateAutoSubmitForm(formData: MPGFormData, actionUrl?: string, isPeriodical: boolean = false): string {
    const url = actionUrl || this.getActionUrl(isPeriodical);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>正在跳轉至付款頁面...</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .loading {
      text-align: center;
      color: white;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>正在跳轉至安全付款頁面，請稍候...</p>
  </div>
  <form id="newebpay-form" method="POST" action="${url}" style="display:none;">
    <input type="hidden" name="MerchantID" value="${this.escapeHtml(formData.MerchantID)}">
    <input type="hidden" name="TradeInfo" value="${this.escapeHtml(formData.TradeInfo)}">
    <input type="hidden" name="TradeSha" value="${this.escapeHtml(formData.TradeSha)}">
    <input type="hidden" name="Version" value="${this.escapeHtml(formData.Version)}">
  </form>
  <script>
    document.getElementById('newebpay-form').submit();
  </script>
</body>
</html>`;
  }

  /**
   * 取得 API 端點 URL
   */
  getActionUrl(isPeriodical: boolean = false): string {
    if (isPeriodical) {
      return this.isTest
        ? 'https://ccore.newebpay.com/MPG/period'
        : 'https://core.newebpay.com/MPG/period';
    }
    return this.isTest
      ? 'https://ccore.newebpay.com/MPG/mpg_gateway'
      : 'https://core.newebpay.com/MPG/mpg_gateway';
  }

  /**
   * 取得定期定額狀態變更 API 端點
   */
  getAlterStatusUrl(): string {
    return this.isTest
      ? 'https://ccore.newebpay.com/MPG/period/AlterStatus'
      : 'https://core.newebpay.com/MPG/period/AlterStatus';
  }

  /**
   * HTML 跳脫字元
   */
  private escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * 產生唯一的商店訂單編號
   * @param prefix - 前綴 (預設為空)
   * @returns 訂單編號 (最多 30 字元)
   */
  generateOrderNo(prefix: string = ''): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderNo = `${prefix}${timestamp}${random}`;
    return orderNo.substring(0, 30); // 限制 30 字元
  }

  /**
   * 取得商店代號
   */
  getMerchantId(): string {
    return this.merchantId;
  }

  /**
   * 取得是否為測試環境
   */
  getIsTest(): boolean {
    return this.isTest;
  }
}

/**
 * 建立 NewebPayVault 單例
 */
let vaultInstance: NewebPayVault | null = null;

export function getNewebPayVault(config?: Partial<NewebPayConfig>): NewebPayVault {
  if (!vaultInstance || config) {
    vaultInstance = new NewebPayVault(config);
  }
  return vaultInstance;
}

/**
 * 重設 Vault 實例 (用於測試)
 */
export function resetNewebPayVault(): void {
  vaultInstance = null;
}

export default NewebPayVault;
