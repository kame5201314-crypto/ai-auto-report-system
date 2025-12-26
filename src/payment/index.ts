/**
 * Vibe-Pay 金流橋接器
 *
 * ██╗   ██╗██╗██████╗ ███████╗      ██████╗  █████╗ ██╗   ██╗
 * ██║   ██║██║██╔══██╗██╔════╝      ██╔══██╗██╔══██╗╚██╗ ██╔╝
 * ██║   ██║██║██████╔╝█████╗  █████╗██████╔╝███████║ ╚████╔╝
 * ╚██╗ ██╔╝██║██╔══██╗██╔══╝  ╚════╝██╔═══╝ ██╔══██║  ╚██╔╝
 *  ╚████╔╝ ██║██████╔╝███████╗      ██║     ██║  ██║   ██║
 *   ╚═══╝  ╚═╝╚═════╝ ╚══════╝      ╚═╝     ╚═╝  ╚═╝   ╚═╝
 *
 * 支援藍新金流 MPG 單次付款與定期定額訂閱
 *
 * @module payment
 */

// ============================================
// 服務類別匯出
// ============================================

export { NewebPayVault, getVault } from './services/NewebPayVault';
export { NewebPayMPG } from './services/NewebPayMPG';
export { NewebPayPeriod } from './services/NewebPayPeriod';
export { IdempotencyService } from './services/IdempotencyService';

// ============================================
// API 處理器匯出
// ============================================

export { PaymentAPIHandler } from './api/handlers';
export type { ApiResponse, PaymentFormResponse } from './api/handlers';

// ============================================
// 狀態機匯出
// ============================================

export {
  SubscriptionStateMachine,
  SubscriptionState,
  SubscriptionEvent,
} from './state-machine/SubscriptionStateMachine';

// ============================================
// 驗證中間件匯出
// ============================================

export {
  validateSinglePaymentRequest,
  validateSubscribeRequest,
  validateWebhookPayload,
  validateNewebPayIP,
  isValidOrderNo,
} from './middleware/validation';

// ============================================
// 配置匯出
// ============================================

export {
  loadNewebPayConfig,
  validateEnvironmentVariables,
  getEndpoints,
  getCallbackUrls,
  loadIdempotencyConfig,
  generateEnvTemplate,
  ENV_KEYS,
} from './config/newebpay.config';

// ============================================
// 型別匯出
// ============================================

export type {
  // 配置型別
  NewebPayConfig,
  IdempotencyConfig,

  // MPG 型別
  MPGTradeInfo,
  MPGFormData,
  MPGResult,
  PaymentMethod,
  SinglePaymentRequest,
  SinglePaymentResponse,

  // 定期定額型別
  PeriodType,
  PeriodicalTradeInfo,
  PeriodicalResult,
  PeriodicalStatusRequest,
  SubscribePaymentRequest,
  SubscribePaymentResponse,

  // 冪等性型別
  IdempotencyStatus,
  IdempotencyRecord,
  IdempotencyCheckResult,

  // 加密型別
  EncryptionResult,
  DecryptionResult,
  KeyValidationResult,
  SecurityAuditLog,

  // Webhook 型別
  WebhookPayload,
  ValidatedWebhookData,

  // 資料庫型別
  OrderStatus,
  SubscriptionStatus,
  PaymentOrder,
  Subscription,
  SubscriptionPayment,
  Invoice,
  InvoiceCategory,
  InvoiceInfo,

  // API 型別
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  RateLimitConfig,
  RateLimitRecord,
} from './types';

// ============================================
// 常量匯出
// ============================================

export {
  NEWEBPAY_OFFICIAL_IPS,
  NEWEBPAY_ENDPOINTS,
} from './types';

// ============================================
// 快速入門工廠函數
// ============================================

import { SupabaseClient } from '@supabase/supabase-js';
import { NewebPayVault } from './services/NewebPayVault';
import { NewebPayMPG } from './services/NewebPayMPG';
import { NewebPayPeriod } from './services/NewebPayPeriod';
import { IdempotencyService } from './services/IdempotencyService';
import { PaymentAPIHandler } from './api/handlers';
import { SubscriptionStateMachine } from './state-machine/SubscriptionStateMachine';

/**
 * Vibe-Pay 金流服務實例集合
 */
export interface VibePayServices {
  vault: NewebPayVault;
  mpg: NewebPayMPG;
  period: NewebPayPeriod;
  idempotency: IdempotencyService;
  api: PaymentAPIHandler;
  stateMachine: SubscriptionStateMachine;
}

/**
 * 初始化 Vibe-Pay 金流服務
 *
 * @example
 * ```typescript
 * import { initializeVibePay } from './payment';
 * import { supabase } from './lib/supabase';
 *
 * const vibePay = initializeVibePay(supabase);
 *
 * // 建立單次付款
 * const payment = await vibePay.mpg.createPayment({
 *   amount: 1000,
 *   itemDesc: '商品描述',
 *   email: 'customer@example.com',
 * });
 *
 * // 建立訂閱
 * const subscription = await vibePay.period.createSubscription({
 *   userId: 'user-uuid',
 *   amount: 299,
 *   itemDesc: '月訂閱',
 *   email: 'subscriber@example.com',
 *   periodType: 'M',
 *   periodPoint: '01',
 *   totalPeriods: 12,
 * });
 * ```
 */
export function initializeVibePay(supabaseClient: SupabaseClient): VibePayServices {
  const vault = NewebPayVault.getInstance();
  const mpg = new NewebPayMPG(supabaseClient);
  const period = new NewebPayPeriod(supabaseClient);
  const idempotency = new IdempotencyService(supabaseClient);
  const api = new PaymentAPIHandler(supabaseClient);
  const stateMachine = new SubscriptionStateMachine(supabaseClient);

  return {
    vault,
    mpg,
    period,
    idempotency,
    api,
    stateMachine,
  };
}

/**
 * 健康檢查
 */
export async function healthCheck(supabaseClient: SupabaseClient): Promise<{
  vault: ReturnType<NewebPayVault['healthCheck']>;
  idempotency: Awaited<ReturnType<IdempotencyService['healthCheck']>>;
}> {
  const vault = NewebPayVault.getInstance();
  const idempotency = new IdempotencyService(supabaseClient);

  return {
    vault: vault.healthCheck(),
    idempotency: await idempotency.healthCheck(),
  };
}
