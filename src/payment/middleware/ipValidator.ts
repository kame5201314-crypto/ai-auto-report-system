/**
 * IP 白名單驗證器
 * 只接受藍新官方 IP 的 Webhook 請求
 *
 * @module payment/middleware/ipValidator
 */

import { NEWEBPAY_OFFICIAL_IPS } from '../types';

/**
 * 藍新官方 IP 白名單（擴展版）
 */
const NEWEBPAY_IP_WHITELIST: string[] = [
  // 正式環境 IP
  '175.99.72.1',
  '175.99.72.2',
  '175.99.72.3',
  '175.99.72.4',
  '175.99.72.5',
  '175.99.72.6',
  '175.99.72.7',
  '175.99.72.8',
  '175.99.72.9',
  '175.99.72.10',
  '175.99.72.11',
  '175.99.72.12',
  '175.99.72.13',
  '175.99.72.14',
  '175.99.72.15',
  '175.99.72.16',
  '175.99.72.17',
  '175.99.72.18',
  '175.99.72.19',
  '175.99.72.20',
  // 備用 IP 範圍
  '61.219.166.1',
  '61.219.166.2',
  '61.219.166.3',
  '61.219.166.4',
  '61.219.166.5',
  '61.219.166.6',
  '61.219.166.7',
  '61.219.166.8',
];

/**
 * 測試環境 IP（開發時使用）
 */
const TEST_IP_WHITELIST: string[] = [
  '127.0.0.1',
  '::1',
  'localhost',
  // 藍新測試環境
  '59.124.47.1',
  '59.124.47.2',
  '59.124.47.3',
  '59.124.47.4',
  '59.124.47.5',
];

/**
 * IP 驗證器類別
 */
export class IPValidator {
  private whitelist: Set<string>;
  private allowTestIPs: boolean;
  private customIPs: Set<string>;

  constructor(allowTestIPs: boolean = false) {
    this.allowTestIPs = allowTestIPs;
    this.whitelist = new Set(NEWEBPAY_IP_WHITELIST);
    this.customIPs = new Set();

    if (allowTestIPs) {
      TEST_IP_WHITELIST.forEach(ip => this.whitelist.add(ip));
    }
  }

  /**
   * 驗證 IP 是否在白名單中
   * @param ip - 要驗證的 IP 地址
   * @returns 是否通過驗證
   */
  isAllowed(ip: string): boolean {
    // 清理 IP 地址
    const cleanIP = this.cleanIP(ip);

    // 檢查精確匹配
    if (this.whitelist.has(cleanIP) || this.customIPs.has(cleanIP)) {
      return true;
    }

    // 檢查 IP 範圍（CIDR 格式）
    return this.checkIPRange(cleanIP);
  }

  /**
   * 清理 IP 地址
   */
  private cleanIP(ip: string): string {
    // 移除 IPv6 前綴
    if (ip.startsWith('::ffff:')) {
      return ip.slice(7);
    }

    // 移除埠號
    const colonIndex = ip.lastIndexOf(':');
    if (colonIndex > 0 && ip.includes('.')) {
      return ip.slice(0, colonIndex);
    }

    return ip.trim();
  }

  /**
   * 檢查 IP 是否在指定範圍內
   */
  private checkIPRange(ip: string): boolean {
    // 檢查 175.99.72.0/24 範圍
    if (ip.startsWith('175.99.72.')) {
      const lastOctet = parseInt(ip.split('.')[3], 10);
      return lastOctet >= 0 && lastOctet <= 255;
    }

    // 檢查 61.219.166.0/24 範圍
    if (ip.startsWith('61.219.166.')) {
      const lastOctet = parseInt(ip.split('.')[3], 10);
      return lastOctet >= 0 && lastOctet <= 255;
    }

    // 測試環境：59.124.47.0/24
    if (this.allowTestIPs && ip.startsWith('59.124.47.')) {
      const lastOctet = parseInt(ip.split('.')[3], 10);
      return lastOctet >= 0 && lastOctet <= 255;
    }

    return false;
  }

  /**
   * 添加自訂 IP 到白名單
   * @param ip - IP 地址
   */
  addIP(ip: string): void {
    this.customIPs.add(this.cleanIP(ip));
  }

  /**
   * 從白名單移除 IP
   * @param ip - IP 地址
   */
  removeIP(ip: string): void {
    this.customIPs.delete(this.cleanIP(ip));
  }

  /**
   * 取得驗證結果詳情
   */
  validate(ip: string): {
    allowed: boolean;
    cleanIP: string;
    reason?: string;
  } {
    const cleanIP = this.cleanIP(ip);
    const allowed = this.isAllowed(ip);

    return {
      allowed,
      cleanIP,
      reason: allowed
        ? undefined
        : `IP ${cleanIP} 不在藍新官方白名單中`,
    };
  }
}

/**
 * 預設 IP 驗證器實例
 */
const isTestMode = typeof process !== 'undefined'
  ? process.env?.NODE_ENV !== 'production'
  : true;

export const ipValidator = new IPValidator(isTestMode);

/**
 * Express/Koa 風格的中介軟體
 */
export function ipValidatorMiddleware(validator: IPValidator = ipValidator) {
  return async (
    req: {
      ip?: string;
      headers?: Record<string, string | string[]>;
      connection?: { remoteAddress?: string };
    },
    res: { status: (code: number) => { json: (data: unknown) => void } },
    next: () => void
  ) => {
    // 取得真實 IP（考慮代理）
    const forwardedFor = req.headers?.['x-forwarded-for'];
    const realIP = typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : req.headers?.['x-real-ip'] as string ||
          req.ip ||
          req.connection?.remoteAddress ||
          '';

    const result = validator.validate(realIP);

    if (!result.allowed) {
      console.warn(`[IP Validator] 拒絕來自 ${result.cleanIP} 的請求`);

      return res.status(403).json({
        success: false,
        error: 'Forbidden: IP not in whitelist',
      });
    }

    next();
  };
}

/**
 * 記錄可疑請求
 */
export async function logSuspiciousRequest(
  ip: string,
  endpoint: string,
  payload: unknown
): Promise<void> {
  try {
    const { supabase } = await import('../../lib/supabase');

    await supabase
      .from('webhook_logs')
      .insert({
        source_ip: ip,
        endpoint,
        payload: payload as Record<string, unknown>,
        is_valid: false,
        validation_error: 'IP not in whitelist',
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('記錄可疑請求失敗:', error);
  }
}

export default IPValidator;
