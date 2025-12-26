/**
 * API 驗證中間件
 *
 * 功能：
 * 1. 請求參數驗證
 * 2. 藍新 IP 白名單驗證 (Webhook)
 * 3. 簽名驗證
 *
 * @module payment/middleware/validation
 */

import type {
  SinglePaymentRequest,
  SubscribePaymentRequest,
  WebhookPayload,
  PeriodType,
  PaymentMethod,
} from '../types';
import { NEWEBPAY_OFFICIAL_IPS } from '../types';

// ============================================
// 驗證結果型別
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// ============================================
// 單次付款驗證
// ============================================

/**
 * 驗證單次付款請求
 */
export function validateSinglePaymentRequest(
  body: unknown
): ValidationResult<SinglePaymentRequest> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { success: false, errors: ['Request body is required'] };
  }

  const data = body as Record<string, unknown>;

  // 必填欄位
  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('amount is required and must be a number');
  } else if (data.amount <= 0) {
    errors.push('amount must be greater than 0');
  } else if (!Number.isInteger(data.amount)) {
    errors.push('amount must be an integer');
  }

  if (!data.itemDesc || typeof data.itemDesc !== 'string') {
    errors.push('itemDesc is required and must be a string');
  } else if (data.itemDesc.length > 50) {
    errors.push('itemDesc must be 50 characters or less');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required and must be a string');
  } else if (!isValidEmail(data.email)) {
    errors.push('email format is invalid');
  }

  // 選填欄位驗證
  if (data.paymentMethods) {
    if (!Array.isArray(data.paymentMethods)) {
      errors.push('paymentMethods must be an array');
    } else {
      const validMethods = [
        'CREDIT', 'WEBATM', 'VACC', 'CVS', 'BARCODE',
        'ESUNWALLET', 'TAIWANPAY', 'LINEPAY', 'SAMSUNGPAY', 'GOOGLEPAY',
      ];
      for (const method of data.paymentMethods) {
        if (!validMethods.includes(method as string)) {
          errors.push(`Invalid payment method: ${method}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      amount: data.amount as number,
      itemDesc: data.itemDesc as string,
      email: data.email as string,
      userId: data.userId as string | undefined,
      paymentMethods: data.paymentMethods as PaymentMethod[] | undefined,
      returnUrl: data.returnUrl as string | undefined,
      notifyUrl: data.notifyUrl as string | undefined,
      clientBackUrl: data.clientBackUrl as string | undefined,
    },
  };
}

// ============================================
// 訂閱付款驗證
// ============================================

/**
 * 驗證訂閱請求
 */
export function validateSubscribeRequest(
  body: unknown
): ValidationResult<SubscribePaymentRequest> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { success: false, errors: ['Request body is required'] };
  }

  const data = body as Record<string, unknown>;

  // 必填欄位
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required');
  }

  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('amount is required and must be a number');
  } else if (data.amount <= 0) {
    errors.push('amount must be greater than 0');
  }

  if (!data.itemDesc || typeof data.itemDesc !== 'string') {
    errors.push('itemDesc is required');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('email format is invalid');
  }

  // 週期驗證
  const validPeriodTypes: PeriodType[] = ['D', 'W', 'M', 'Y'];
  if (!data.periodType || !validPeriodTypes.includes(data.periodType as PeriodType)) {
    errors.push('periodType must be D, W, M, or Y');
  }

  if (!data.periodPoint || typeof data.periodPoint !== 'string') {
    errors.push('periodPoint is required');
  } else {
    // 驗證 periodPoint 格式
    const periodType = data.periodType as PeriodType;
    if (!validatePeriodPoint(periodType, data.periodPoint as string)) {
      errors.push(`Invalid periodPoint for ${periodType} period type`);
    }
  }

  if (!data.totalPeriods || typeof data.totalPeriods !== 'number') {
    errors.push('totalPeriods is required');
  } else if (data.totalPeriods < 2 || data.totalPeriods > 99) {
    errors.push('totalPeriods must be between 2 and 99');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      userId: data.userId as string,
      amount: data.amount as number,
      itemDesc: data.itemDesc as string,
      email: data.email as string,
      periodType: data.periodType as PeriodType,
      periodPoint: data.periodPoint as string,
      totalPeriods: data.totalPeriods as number,
      returnUrl: data.returnUrl as string | undefined,
      notifyUrl: data.notifyUrl as string | undefined,
      periodNotifyUrl: data.periodNotifyUrl as string | undefined,
    },
  };
}

/**
 * 驗證 periodPoint 格式
 */
function validatePeriodPoint(periodType: PeriodType, periodPoint: string): boolean {
  const point = parseInt(periodPoint, 10);

  switch (periodType) {
    case 'D':
      // 每日：無特定限制
      return true;
    case 'W':
      // 每週：1-7 (週一到週日)
      return point >= 1 && point <= 7;
    case 'M':
      // 每月：1-31 (幾號)
      return point >= 1 && point <= 31;
    case 'Y':
      // 每年：格式 MMDD
      if (periodPoint.length !== 4) return false;
      const month = parseInt(periodPoint.slice(0, 2), 10);
      const day = parseInt(periodPoint.slice(2, 4), 10);
      return month >= 1 && month <= 12 && day >= 1 && day <= 31;
    default:
      return false;
  }
}

// ============================================
// Webhook 驗證
// ============================================

/**
 * 驗證 Webhook 請求
 */
export function validateWebhookPayload(
  body: unknown
): ValidationResult<WebhookPayload> {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { success: false, errors: ['Request body is required'] };
  }

  const data = body as Record<string, unknown>;

  if (!data.Status || typeof data.Status !== 'string') {
    errors.push('Status is required');
  }

  if (!data.MerchantID || typeof data.MerchantID !== 'string') {
    errors.push('MerchantID is required');
  }

  if (!data.TradeInfo || typeof data.TradeInfo !== 'string') {
    errors.push('TradeInfo is required');
  }

  if (!data.TradeSha || typeof data.TradeSha !== 'string') {
    errors.push('TradeSha is required');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      Status: data.Status as string,
      MerchantID: data.MerchantID as string,
      TradeInfo: data.TradeInfo as string,
      TradeSha: data.TradeSha as string,
      Version: (data.Version as string) || '2.0',
    },
  };
}

/**
 * 驗證請求來源 IP 是否為藍新官方 IP
 */
export function validateNewebPayIP(clientIP: string): boolean {
  // 移除 IPv6 前綴
  const ip = clientIP.replace('::ffff:', '');

  // 檢查是否在白名單中
  for (const allowedIP of NEWEBPAY_OFFICIAL_IPS) {
    if (allowedIP.includes('/')) {
      // CIDR 格式
      if (isIPInCIDR(ip, allowedIP)) {
        return true;
      }
    } else if (ip === allowedIP) {
      return true;
    }
  }

  // 開發環境允許本地 IP
  if (process.env.NODE_ENV === 'development') {
    const devAllowedIPs = ['127.0.0.1', 'localhost', '::1'];
    return devAllowedIPs.includes(ip);
  }

  return false;
}

/**
 * 檢查 IP 是否在 CIDR 範圍內
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = parseInt(bits, 10);

  const ipParts = ip.split('.').map(Number);
  const rangeParts = range.split('.').map(Number);

  const ipNum =
    (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum =
    (rangeParts[0] << 24) +
    (rangeParts[1] << 16) +
    (rangeParts[2] << 8) +
    rangeParts[3];

  const maskNum = ~((1 << (32 - mask)) - 1);

  return (ipNum & maskNum) === (rangeNum & maskNum);
}

// ============================================
// 輔助函數
// ============================================

/**
 * Email 格式驗證
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 訂單編號驗證 (英數字，1-30 字元)
 */
export function isValidOrderNo(orderNo: string): boolean {
  const orderNoRegex = /^[a-zA-Z0-9]{1,30}$/;
  return orderNoRegex.test(orderNo);
}

export default {
  validateSinglePaymentRequest,
  validateSubscribeRequest,
  validateWebhookPayload,
  validateNewebPayIP,
  isValidOrderNo,
};
