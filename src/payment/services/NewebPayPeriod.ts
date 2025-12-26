/**
 * NewebPayPeriod - 藍新定期定額訂閱服務
 *
 * 功能：
 * 1. 建立訂閱請求
 * 2. 處理訂閱回應
 * 3. 管理訂閱狀態 (暫停/恢復/終止)
 * 4. 處理每期扣款通知
 *
 * @module payment/services/NewebPayPeriod
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NewebPayVault, getVault } from './NewebPayVault';
import { IdempotencyService } from './IdempotencyService';
import { getEndpoints, getCallbackUrls } from '../config/newebpay.config';
import type {
  PeriodicalTradeInfo,
  MPGFormData,
  PeriodicalResult,
  PeriodType,
  SubscribePaymentRequest,
  SubscribePaymentResponse,
  WebhookPayload,
  ValidatedWebhookData,
  Subscription,
  SubscriptionPayment,
  PeriodicalStatusRequest,
} from '../types';

// ============================================
// NewebPayPeriod 類別
// ============================================

export class NewebPayPeriod {
  private readonly vault: NewebPayVault;
  private readonly idempotencyService: IdempotencyService;
  private readonly supabase: SupabaseClient;
  private readonly endpoints: ReturnType<typeof getEndpoints>;
  private readonly callbackUrls: ReturnType<typeof getCallbackUrls>;

  constructor(supabaseClient: SupabaseClient) {
    this.vault = getVault();
    this.idempotencyService = new IdempotencyService(supabaseClient);
    this.supabase = supabaseClient;

    const config = this.vault.getConfigInfo();
    this.endpoints = getEndpoints(!config.isTest);
    this.callbackUrls = getCallbackUrls();
  }

  // ============================================
  // 訂閱建立
  // ============================================

  /**
   * 建立定期定額訂閱
   */
  public async createSubscription(
    request: SubscribePaymentRequest
  ): Promise<SubscribePaymentResponse> {
    const merchantOrderNo = this.vault.generateOrderNo('VPS');

    // 冪等性檢查
    const idempotencyCheck = await this.idempotencyService.checkAndLock({
      merchantId: this.vault.getConfigInfo().merchantId,
      orderNo: merchantOrderNo,
      amount: request.amount,
      requestType: 'PERIOD',
      requestBody: request as unknown as Record<string, unknown>,
    });

    if (idempotencyCheck.isDuplicate && idempotencyCheck.cachedResponse) {
      return idempotencyCheck.cachedResponse as unknown as SubscribePaymentResponse;
    }

    if (!idempotencyCheck.shouldProcess) {
      return {
        success: false,
        error: idempotencyCheck.error || 'Request is being processed',
      };
    }

    try {
      // 組裝定期定額參數
      const tradeParams: Partial<PeriodicalTradeInfo> = {
        MerchantOrderNo: merchantOrderNo,
        Amt: request.amount,
        ItemDesc: request.itemDesc,
        Email: request.email,
        PeriodType: request.periodType,
        PeriodPoint: request.periodPoint,
        PeriodAmt: request.totalPeriods,
        ReturnURL: request.returnUrl || this.callbackUrls.returnUrl,
        NotifyURL: request.notifyUrl || this.callbackUrls.notifyUrl,
        PeriodNotifyURL: request.periodNotifyUrl || this.callbackUrls.periodNotifyUrl,
      };

      // 加密產生表單資料
      const formData = this.vault.generatePeriodFormData(tradeParams);

      // 產生 HTML 表單
      const formHtml = this.generateFormHtml(formData);

      // 儲存訂閱記錄
      await this.saveSubscription({
        user_id: request.userId,
        merchant_order_no: merchantOrderNo,
        period_type: request.periodType,
        period_point: request.periodPoint,
        amount: request.amount,
        total_periods: request.totalPeriods,
        status: 'active',
        idempotency_key: idempotencyCheck.newRecord?.idempotency_key,
      });

      const response: SubscribePaymentResponse = {
        success: true,
        data: {
          merchantOrderNo,
          formHtml,
          formData,
          actionUrl: this.endpoints.period,
        },
      };

      if (idempotencyCheck.newRecord) {
        await this.idempotencyService.markCompleted(
          idempotencyCheck.newRecord.id,
          response as unknown as Record<string, unknown>
        );
      }

      return response;

    } catch (error) {
      if (idempotencyCheck.newRecord) {
        await this.idempotencyService.markFailed(
          idempotencyCheck.newRecord.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed',
      };
    }
  }

  /**
   * 產生付款表單 HTML
   */
  private generateFormHtml(formData: MPGFormData): string {
    return `
      <form id="newebpay-period-form" method="post" action="${this.endpoints.period}">
        <input type="hidden" name="MerchantID" value="${formData.MerchantID}">
        <input type="hidden" name="PostData_" value="${formData.TradeInfo}">
      </form>
      <script>document.getElementById('newebpay-period-form').submit();</script>
    `.trim();
  }

  // ============================================
  // Webhook 處理
  // ============================================

  /**
   * 處理訂閱首次授權回呼
   */
  public async handleFirstAuthWebhook(
    payload: WebhookPayload
  ): Promise<ValidatedWebhookData> {
    const isValid = this.vault.verifyWebhookSignature(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!isValid) {
      return { isValid: false, error: 'Invalid signature' };
    }

    const decrypted = this.vault.decryptTradeInfo<PeriodicalResult>(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!decrypted.success || !decrypted.data) {
      return { isValid: false, error: decrypted.error };
    }

    await this.updateSubscriptionFromWebhook(decrypted.data);

    return { isValid: true, decryptedData: decrypted.data };
  }

  /**
   * 處理每期扣款通知
   */
  public async handlePeriodNotify(
    payload: WebhookPayload
  ): Promise<ValidatedWebhookData> {
    const isValid = this.vault.verifyWebhookSignature(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!isValid) {
      return { isValid: false, error: 'Invalid signature' };
    }

    const decrypted = this.vault.decryptTradeInfo<PeriodicalResult>(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!decrypted.success || !decrypted.data) {
      return { isValid: false, error: decrypted.error };
    }

    await this.recordPeriodPayment(decrypted.data);

    return { isValid: true, decryptedData: decrypted.data };
  }

  /**
   * 更新訂閱狀態
   */
  private async updateSubscriptionFromWebhook(
    result: PeriodicalResult
  ): Promise<void> {
    if (!result.Result) return;

    const {
      MerchantOrderNo,
      PeriodNo,
      NextAuthDate,
      Card4No,
      TokenValue,
    } = result.Result;

    const isSuccess = result.Status === 'SUCCESS';

    await this.supabase
      .from('payment_subscriptions')
      .update({
        period_no: PeriodNo,
        status: isSuccess ? 'active' : 'terminated',
        next_auth_date: NextAuthDate,
        period_token: TokenValue,
        last_auth_status: result.Status,
      })
      .eq('merchant_order_no', MerchantOrderNo);
  }

  /**
   * 記錄每期扣款
   */
  private async recordPeriodPayment(result: PeriodicalResult): Promise<void> {
    if (!result.Result) return;

    const {
      MerchantOrderNo,
      PeriodNo,
      AlreadyTimes,
      Amt,
      AuthCode,
      AuthDate,
      NextAuthDate,
    } = result.Result;

    const isSuccess = result.Status === 'SUCCESS';

    // 取得訂閱 ID
    const { data: subscription } = await this.supabase
      .from('payment_subscriptions')
      .select('id, total_periods')
      .eq('period_no', PeriodNo)
      .single();

    if (!subscription) return;

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
      raw_response: result as unknown as Record<string, unknown>,
    });

    // 更新訂閱狀態
    const updates: Partial<Subscription> = {
      completed_periods: AlreadyTimes,
      last_auth_date: AuthDate ? new Date(AuthDate) : undefined,
      last_auth_status: result.Status,
      next_auth_date: NextAuthDate ? new Date(NextAuthDate) : undefined,
    };

    // 檢查是否到期
    if (AlreadyTimes >= subscription.total_periods) {
      updates.status = 'expired';
    }

    await this.supabase
      .from('payment_subscriptions')
      .update(updates)
      .eq('id', subscription.id);
  }

  // ============================================
  // 訂閱管理
  // ============================================

  /**
   * 暫停訂閱
   */
  public async suspendSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<boolean> {
    return this.alterSubscriptionStatus(subscriptionId, userId, 'suspend');
  }

  /**
   * 恢復訂閱
   */
  public async restartSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<boolean> {
    return this.alterSubscriptionStatus(subscriptionId, userId, 'restart');
  }

  /**
   * 終止訂閱
   */
  public async terminateSubscription(
    subscriptionId: string,
    userId: string
  ): Promise<boolean> {
    return this.alterSubscriptionStatus(subscriptionId, userId, 'terminate');
  }

  /**
   * 變更訂閱狀態
   */
  private async alterSubscriptionStatus(
    subscriptionId: string,
    userId: string,
    action: 'suspend' | 'restart' | 'terminate'
  ): Promise<boolean> {
    // 取得訂閱資料
    const { data: subscription } = await this.supabase
      .from('payment_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (!subscription || !subscription.period_no) {
      return false;
    }

    // 呼叫藍新 API 變更狀態
    // TODO: 實作 API 呼叫
    const statusRequest: PeriodicalStatusRequest = {
      MerchantID: this.vault.getConfigInfo().merchantId,
      PeriodNo: subscription.period_no,
      AlterType: action,
    };

    console.log('Alter subscription:', statusRequest);

    // 更新本地狀態
    const statusMap = {
      suspend: 'suspended',
      restart: 'active',
      terminate: 'terminated',
    };

    const updates: Partial<Subscription> = {
      status: statusMap[action] as Subscription['status'],
    };

    if (action === 'terminate') {
      updates.terminated_at = new Date();
    }

    await this.supabase
      .from('payment_subscriptions')
      .update(updates)
      .eq('id', subscriptionId);

    return true;
  }

  // ============================================
  // 訂閱儲存與查詢
  // ============================================

  /**
   * 儲存訂閱
   */
  private async saveSubscription(
    subscription: Partial<Subscription>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('payment_subscriptions')
      .insert({
        user_id: subscription.user_id,
        merchant_order_no: subscription.merchant_order_no,
        period_type: subscription.period_type,
        period_point: subscription.period_point,
        amount: subscription.amount,
        total_periods: subscription.total_periods,
        status: subscription.status || 'active',
        idempotency_key: subscription.idempotency_key,
      });

    if (error) {
      throw new Error(`Failed to save subscription: ${error.message}`);
    }
  }

  /**
   * 查詢訂閱
   */
  public async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const { data } = await this.supabase
      .from('payment_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    return data as Subscription | null;
  }

  /**
   * 查詢使用者訂閱
   */
  public async getUserSubscriptions(
    userId: string,
    options?: {
      status?: string;
      limit?: number;
    }
  ): Promise<Subscription[]> {
    let query = this.supabase
      .from('payment_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data } = await query;
    return (data as Subscription[]) || [];
  }

  /**
   * 查詢訂閱付款記錄
   */
  public async getSubscriptionPayments(
    subscriptionId: string
  ): Promise<SubscriptionPayment[]> {
    const { data } = await this.supabase
      .from('payment_subscription_payments')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('period_times', { ascending: true });

    return (data as SubscriptionPayment[]) || [];
  }
}

export default NewebPayPeriod;
