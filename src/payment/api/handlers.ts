/**
 * Vibe-Pay API 處理器
 *
 * API 端點：
 * - POST /api/v1/payment/single     - 單次付款
 * - POST /api/v1/payment/subscribe  - 定期定額訂閱
 * - POST /api/payment-callback      - 付款回呼 (Webhook)
 * - POST /api/payment/period-notify - 每期扣款通知
 *
 * @module payment/api/handlers
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NewebPayVault, getVault } from '../services/NewebPayVault';
import { NewebPayMPG } from '../services/NewebPayMPG';
import { NewebPayPeriod } from '../services/NewebPayPeriod';
import { IdempotencyService } from '../services/IdempotencyService';
import { SubscriptionStateMachine, SubscriptionEvent, SubscriptionState } from '../state-machine/SubscriptionStateMachine';
import {
  validateSinglePaymentRequest,
  validateSubscribeRequest,
  validateWebhookPayload,
  validateNewebPayIP,
} from '../middleware/validation';
import { getEndpoints } from '../config/newebpay.config';
import type {
  SinglePaymentRequest,
  SinglePaymentResponse,
  SubscribePaymentRequest,
  SubscribePaymentResponse,
  MPGResult,
  PeriodicalResult,
} from '../types';

// ============================================
// API 回應型別
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaymentFormResponse {
  merchantOrderNo: string;
  formHtml: string;
  actionUrl: string;
}

// ============================================
// PaymentAPIHandler 類別
// ============================================

/**
 * 金流 API 處理器
 *
 * @example
 * ```typescript
 * const handler = new PaymentAPIHandler(supabase);
 *
 * // Express.js 整合
 * app.post('/api/v1/payment/single', async (req, res) => {
 *   const result = await handler.handleSinglePayment(req.body);
 *   res.json(result);
 * });
 * ```
 */
export class PaymentAPIHandler {
  private readonly supabase: SupabaseClient;
  private readonly vault: NewebPayVault;
  private readonly mpg: NewebPayMPG;
  private readonly period: NewebPayPeriod;
  private readonly idempotency: IdempotencyService;
  private readonly stateMachine: SubscriptionStateMachine;
  private readonly endpoints: ReturnType<typeof getEndpoints>;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.vault = getVault();
    this.mpg = new NewebPayMPG(supabaseClient);
    this.period = new NewebPayPeriod(supabaseClient);
    this.idempotency = new IdempotencyService(supabaseClient);
    this.stateMachine = new SubscriptionStateMachine(supabaseClient);

    const config = this.vault.getConfigInfo();
    this.endpoints = getEndpoints(!config.isTest);
  }

  // ============================================
  // POST /api/v1/payment/single
  // ============================================

  /**
   * 處理單次付款請求
   *
   * 流程：
   * 1. 驗證請求參數
   * 2. 冪等性檢查
   * 3. 產生加密表單
   * 4. 儲存訂單記錄
   * 5. 返回自動提交 HTML 表單
   */
  public async handleSinglePayment(
    body: unknown,
    requestId?: string
  ): Promise<ApiResponse<PaymentFormResponse>> {
    const timestamp = new Date().toISOString();

    // 1. 驗證請求
    const validation = validateSinglePaymentRequest(body);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: validation.errors,
        },
        meta: { timestamp, requestId: requestId || '' },
      };
    }

    const request = validation.data!;

    try {
      // 2. 建立付款
      const result = await this.mpg.createPayment(request);

      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_CREATION_FAILED',
            message: result.error || 'Failed to create payment',
          },
          meta: { timestamp, requestId: requestId || '' },
        };
      }

      // 3. 返回表單資料
      return {
        success: true,
        data: {
          merchantOrderNo: result.data!.merchantOrderNo,
          formHtml: result.data!.formHtml,
          actionUrl: result.data!.actionUrl,
        },
        meta: { timestamp, requestId: requestId || '' },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: { timestamp, requestId: requestId || '' },
      };
    }
  }

  // ============================================
  // POST /api/v1/payment/subscribe
  // ============================================

  /**
   * 處理訂閱請求
   *
   * 流程：
   * 1. 驗證請求參數
   * 2. 冪等性檢查
   * 3. 建立訂閱記錄 (狀態: PENDING)
   * 4. 產生加密表單
   * 5. 返回自動提交 HTML 表單
   */
  public async handleSubscribe(
    body: unknown,
    requestId?: string
  ): Promise<ApiResponse<PaymentFormResponse>> {
    const timestamp = new Date().toISOString();

    // 1. 驗證請求
    const validation = validateSubscribeRequest(body);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: validation.errors,
        },
        meta: { timestamp, requestId: requestId || '' },
      };
    }

    const request = validation.data!;

    try {
      // 2. 建立訂閱
      const result = await this.period.createSubscription(request);

      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'SUBSCRIPTION_CREATION_FAILED',
            message: result.error || 'Failed to create subscription',
          },
          meta: { timestamp, requestId: requestId || '' },
        };
      }

      return {
        success: true,
        data: {
          merchantOrderNo: result.data!.merchantOrderNo,
          formHtml: result.data!.formHtml,
          actionUrl: result.data!.actionUrl,
        },
        meta: { timestamp, requestId: requestId || '' },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: { timestamp, requestId: requestId || '' },
      };
    }
  }

  // ============================================
  // POST /api/payment-callback
  // ============================================

  /**
   * 處理藍新付款回呼 (Webhook)
   *
   * 驗證流程：
   * 1. 驗證來源 IP (藍新官方 IP)
   * 2. 驗證請求格式
   * 3. 驗證 TradeSha 簽名
   * 4. 解密 TradeInfo
   * 5. 更新訂單/訂閱狀態
   */
  public async handlePaymentCallback(
    body: unknown,
    clientIP: string,
    callbackType: 'mpg' | 'period' = 'mpg'
  ): Promise<ApiResponse<{ status: string; message: string }>> {
    // 1. 驗證 IP (生產環境)
    if (process.env.NODE_ENV === 'production') {
      if (!validateNewebPayIP(clientIP)) {
        console.warn(`Rejected webhook from unauthorized IP: ${clientIP}`);
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED_IP',
            message: 'Request from unauthorized IP address',
          },
        };
      }
    }

    // 2. 驗證請求格式
    const validation = validateWebhookPayload(body);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Invalid webhook payload',
          details: validation.errors,
        },
      };
    }

    const payload = validation.data!;

    // 3. 驗證簽名
    if (!this.vault.verifyWebhookSignature(payload.TradeInfo, payload.TradeSha)) {
      return {
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'TradeSha signature verification failed',
        },
      };
    }

    // 4. 解密資料
    const decrypted = this.vault.decryptTradeInfo(payload.TradeInfo, payload.TradeSha);

    if (!decrypted.success || !decrypted.data) {
      return {
        success: false,
        error: {
          code: 'DECRYPTION_FAILED',
          message: decrypted.error || 'Failed to decrypt TradeInfo',
        },
      };
    }

    // 5. 處理不同類型的回呼
    try {
      if (callbackType === 'mpg') {
        await this.processMPGCallback(decrypted.data as MPGResult);
      } else {
        await this.processPeriodCallback(decrypted.data as unknown as PeriodicalResult);
      }

      return {
        success: true,
        data: {
          status: 'OK',
          message: 'Webhook processed successfully',
        },
      };
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Webhook processing failed',
        },
      };
    }
  }

  /**
   * 處理 MPG 單次付款回呼
   */
  private async processMPGCallback(result: MPGResult): Promise<void> {
    if (!result.Result) {
      throw new Error('Missing Result in MPG callback');
    }

    const { MerchantOrderNo, TradeNo, PaymentType, Auth, Amt } = result.Result;
    const isSuccess = result.Status === 'SUCCESS';

    // 更新訂單狀態
    const { error } = await this.supabase
      .from('payment_orders')
      .update({
        status: isSuccess ? 'paid' : 'failed',
        newebpay_trade_no: TradeNo,
        payment_method: PaymentType,
        auth_code: Auth,
        paid_at: isSuccess ? new Date().toISOString() : null,
        raw_response: result,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_order_no', MerchantOrderNo);

    if (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }

    // 更新冪等性記錄
    await this.supabase
      .from('payment_idempotency_keys')
      .update({
        status: 'COMPLETED',
        response_data: result,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_order_no', MerchantOrderNo);

    console.log(`MPG callback processed: ${MerchantOrderNo}, success: ${isSuccess}`);
  }

  /**
   * 處理定期定額回呼 (首次授權)
   */
  private async processPeriodCallback(result: PeriodicalResult): Promise<void> {
    if (!result.Result) {
      throw new Error('Missing Result in Period callback');
    }

    const {
      MerchantOrderNo,
      PeriodNo,
      AlreadyTimes,
      NextAuthDate,
      TokenValue,
    } = result.Result;

    const isSuccess = result.Status === 'SUCCESS';

    // 取得訂閱 ID
    const { data: subscription } = await this.supabase
      .from('payment_subscriptions')
      .select('id')
      .eq('merchant_order_no', MerchantOrderNo)
      .single();

    if (!subscription) {
      throw new Error(`Subscription not found: ${MerchantOrderNo}`);
    }

    // 透過狀態機處理
    if (isSuccess) {
      await this.stateMachine.transition(
        subscription.id,
        SubscriptionEvent.FIRST_AUTH_SUCCESS,
        {
          periodNo: PeriodNo,
          periodToken: TokenValue,
          nextAuthDate: NextAuthDate,
        }
      );
    } else {
      await this.stateMachine.transition(
        subscription.id,
        SubscriptionEvent.FIRST_AUTH_FAILED,
        { reason: result.Message }
      );
    }

    console.log(`Period callback processed: ${MerchantOrderNo}, success: ${isSuccess}`);
  }

  // ============================================
  // POST /api/payment/period-notify
  // ============================================

  /**
   * 處理每期扣款通知
   */
  public async handlePeriodNotify(
    body: unknown,
    clientIP: string
  ): Promise<ApiResponse<{ status: string }>> {
    // IP 驗證
    if (process.env.NODE_ENV === 'production') {
      if (!validateNewebPayIP(clientIP)) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED_IP',
            message: 'Unauthorized IP',
          },
        };
      }
    }

    // 驗證請求
    const validation = validateWebhookPayload(body);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Invalid payload',
        },
      };
    }

    const payload = validation.data!;

    // 驗證簽名並解密
    const decrypted = this.vault.decryptTradeInfo<PeriodicalResult>(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!decrypted.success || !decrypted.data) {
      return {
        success: false,
        error: {
          code: 'DECRYPTION_FAILED',
          message: 'Decryption failed',
        },
      };
    }

    const result = decrypted.data;
    const isSuccess = result.Status === 'SUCCESS';

    try {
      const {
        PeriodNo,
        MerchantOrderNo,
        AlreadyTimes,
        Amt,
        AuthCode,
        AuthDate,
        NextAuthDate,
      } = result.Result!;

      // 取得訂閱
      const { data: subscription } = await this.supabase
        .from('payment_subscriptions')
        .select('id, total_periods')
        .eq('period_no', PeriodNo)
        .single();

      if (!subscription) {
        throw new Error(`Subscription not found: ${PeriodNo}`);
      }

      // 記錄付款
      await this.supabase.from('payment_subscription_payments').insert({
        subscription_id: subscription.id,
        merchant_order_no: MerchantOrderNo,
        period_no: PeriodNo,
        period_times: AlreadyTimes,
        amount: Amt,
        status: isSuccess ? 'success' : 'failed',
        auth_code: AuthCode,
        auth_date: AuthDate,
        raw_response: result,
      });

      // 透過狀態機處理
      await this.stateMachine.handlePaymentResult(subscription.id, isSuccess, {
        periodTimes: AlreadyTimes,
        authCode: AuthCode,
        nextAuthDate: NextAuthDate,
        reason: isSuccess ? undefined : result.Message,
      });

      return {
        success: true,
        data: { status: 'OK' },
      };
    } catch (error) {
      console.error('Period notify error:', error);
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Processing failed',
        },
      };
    }
  }

  // ============================================
  // 訂閱管理 API
  // ============================================

  /**
   * 暫停訂閱
   * PUT /api/v1/subscription/:id/suspend
   */
  public async handleSuspendSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<ApiResponse<{ status: string }>> {
    const success = await this.stateMachine.suspendByUser(subscriptionId, userId);

    if (!success) {
      return {
        success: false,
        error: {
          code: 'SUSPEND_FAILED',
          message: 'Failed to suspend subscription',
        },
      };
    }

    // 呼叫藍新 API 暫停
    await this.period.suspendSubscription(subscriptionId, userId);

    return {
      success: true,
      data: { status: 'suspended' },
    };
  }

  /**
   * 恢復訂閱
   * PUT /api/v1/subscription/:id/resume
   */
  public async handleResumeSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<ApiResponse<{ status: string }>> {
    const success = await this.stateMachine.resumeByUser(subscriptionId, userId);

    if (!success) {
      return {
        success: false,
        error: {
          code: 'RESUME_FAILED',
          message: 'Failed to resume subscription',
        },
      };
    }

    // 呼叫藍新 API 恢復
    await this.period.restartSubscription(subscriptionId, userId);

    return {
      success: true,
      data: { status: 'active' },
    };
  }

  /**
   * 取消訂閱
   * DELETE /api/v1/subscription/:id
   */
  public async handleCancelSubscription(
    subscriptionId: string,
    userId: string,
    reason?: string
  ): Promise<ApiResponse<{ status: string }>> {
    const success = await this.stateMachine.cancelByUser(subscriptionId, userId, reason);

    if (!success) {
      return {
        success: false,
        error: {
          code: 'CANCEL_FAILED',
          message: 'Failed to cancel subscription',
        },
      };
    }

    // 呼叫藍新 API 終止
    await this.period.terminateSubscription(subscriptionId, userId);

    return {
      success: true,
      data: { status: 'cancelled' },
    };
  }

  // ============================================
  // 查詢 API
  // ============================================

  /**
   * 查詢訂單
   * GET /api/v1/payment/order/:orderNo
   */
  public async getOrder(orderNo: string): Promise<ApiResponse> {
    const order = await this.mpg.getOrder(orderNo);

    if (!order) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      };
    }

    return {
      success: true,
      data: order,
    };
  }

  /**
   * 查詢用戶訂閱
   * GET /api/v1/subscriptions
   */
  public async getUserSubscriptions(
    userId: string,
    options?: { status?: string; limit?: number }
  ): Promise<ApiResponse> {
    const subscriptions = await this.period.getUserSubscriptions(userId, options);

    return {
      success: true,
      data: subscriptions,
    };
  }
}

export default PaymentAPIHandler;
