/**
 * NewebPayMPG - 藍新 MPG 單次付款服務
 *
 * 功能：
 * 1. 建立付款請求 (含冪等性檢查)
 * 2. 產生付款表單
 * 3. 處理付款回應
 * 4. Webhook 驗證與處理
 *
 * @module payment/services/NewebPayMPG
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NewebPayVault, getVault } from './NewebPayVault';
import { IdempotencyService } from './IdempotencyService';
import { getEndpoints, getCallbackUrls } from '../config/newebpay.config';
import type {
  MPGTradeInfo,
  MPGFormData,
  MPGResult,
  SinglePaymentRequest,
  SinglePaymentResponse,
  WebhookPayload,
  ValidatedWebhookData,
  PaymentOrder,
} from '../types';

// ============================================
// NewebPayMPG 類別
// ============================================

export class NewebPayMPG {
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
  // 付款請求建立
  // ============================================

  /**
   * 建立單次付款請求
   *
   * 流程：
   * 1. 冪等性檢查 - 防止重複建立
   * 2. 產生唯一訂單編號
   * 3. 加密交易資訊
   * 4. 儲存訂單記錄
   * 5. 返回表單資料
   */
  public async createPayment(
    request: SinglePaymentRequest
  ): Promise<SinglePaymentResponse> {
    // 產生訂單編號
    const merchantOrderNo = this.vault.generateOrderNo('VP');

    // 冪等性檢查
    const idempotencyCheck = await this.idempotencyService.checkAndLock({
      merchantId: this.vault.getConfigInfo().merchantId,
      orderNo: merchantOrderNo,
      amount: request.amount,
      requestType: 'MPG',
      requestBody: request as unknown as Record<string, unknown>,
    });

    // 如果是重複請求且已完成
    if (idempotencyCheck.isDuplicate && idempotencyCheck.cachedResponse) {
      return idempotencyCheck.cachedResponse as unknown as SinglePaymentResponse;
    }

    // 如果無法處理 (正在處理中)
    if (!idempotencyCheck.shouldProcess) {
      return {
        success: false,
        error: idempotencyCheck.error || 'Request is being processed',
      };
    }

    try {
      // 組裝交易參數
      const tradeParams: Partial<MPGTradeInfo> = {
        MerchantOrderNo: merchantOrderNo,
        Amt: request.amount,
        ItemDesc: request.itemDesc,
        Email: request.email,
        ReturnURL: request.returnUrl || this.callbackUrls.returnUrl,
        NotifyURL: request.notifyUrl || this.callbackUrls.notifyUrl,
        ClientBackURL: request.clientBackUrl || this.callbackUrls.clientBackUrl,
      };

      // 設定付款方式
      if (request.paymentMethods) {
        for (const method of request.paymentMethods) {
          (tradeParams as Record<string, number>)[method] = 1;
        }
      } else {
        // 預設啟用信用卡
        tradeParams.CREDIT = 1;
      }

      // 加密產生表單資料
      const formData = this.vault.generateMPGFormData(tradeParams);

      // 產生 HTML 表單
      const formHtml = this.generateFormHtml(formData);

      // 儲存訂單記錄
      await this.saveOrder({
        merchant_order_no: merchantOrderNo,
        user_id: request.userId,
        amount: request.amount,
        item_desc: request.itemDesc,
        email: request.email,
        status: 'pending',
        idempotency_key: idempotencyCheck.newRecord?.idempotency_key,
      });

      const response: SinglePaymentResponse = {
        success: true,
        data: {
          merchantOrderNo,
          formHtml,
          formData,
          actionUrl: this.endpoints.mpg,
        },
      };

      // 標記冪等性為完成
      if (idempotencyCheck.newRecord) {
        await this.idempotencyService.markCompleted(
          idempotencyCheck.newRecord.id,
          response as unknown as Record<string, unknown>
        );
      }

      return response;

    } catch (error) {
      // 標記冪等性為失敗
      if (idempotencyCheck.newRecord) {
        await this.idempotencyService.markFailed(
          idempotencyCheck.newRecord.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * 產生付款表單 HTML
   */
  private generateFormHtml(formData: MPGFormData): string {
    return `
      <form id="newebpay-form" method="post" action="${this.endpoints.mpg}">
        <input type="hidden" name="MerchantID" value="${formData.MerchantID}">
        <input type="hidden" name="TradeInfo" value="${formData.TradeInfo}">
        <input type="hidden" name="TradeSha" value="${formData.TradeSha}">
        <input type="hidden" name="Version" value="${formData.Version}">
      </form>
      <script>document.getElementById('newebpay-form').submit();</script>
    `.trim();
  }

  // ============================================
  // Webhook 處理
  // ============================================

  /**
   * 驗證並處理 Webhook 回呼
   */
  public async handleWebhook(payload: WebhookPayload): Promise<ValidatedWebhookData> {
    // 驗證簽名
    const isValid = this.vault.verifyWebhookSignature(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid signature',
      };
    }

    // 解密資料
    const decrypted = this.vault.decryptTradeInfo<MPGResult>(
      payload.TradeInfo,
      payload.TradeSha
    );

    if (!decrypted.success || !decrypted.data) {
      return {
        isValid: false,
        error: decrypted.error || 'Decryption failed',
      };
    }

    // 更新訂單狀態
    await this.updateOrderFromWebhook(decrypted.data);

    return {
      isValid: true,
      decryptedData: decrypted.data,
    };
  }

  /**
   * 從 Webhook 資料更新訂單
   */
  private async updateOrderFromWebhook(result: MPGResult): Promise<void> {
    if (!result.Result) return;

    const { MerchantOrderNo, TradeNo, PaymentType, Auth } = result.Result;
    const isSuccess = result.Status === 'SUCCESS';

    await this.supabase
      .from('payment_orders')
      .update({
        status: isSuccess ? 'paid' : 'failed',
        newebpay_trade_no: TradeNo,
        payment_method: PaymentType,
        auth_code: Auth,
        paid_at: isSuccess ? new Date().toISOString() : null,
        raw_response: result as unknown as Record<string, unknown>,
      })
      .eq('merchant_order_no', MerchantOrderNo);
  }

  // ============================================
  // 訂單管理
  // ============================================

  /**
   * 儲存訂單
   */
  private async saveOrder(
    order: Partial<PaymentOrder>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('payment_orders')
      .insert({
        merchant_order_no: order.merchant_order_no,
        user_id: order.user_id,
        amount: order.amount,
        item_desc: order.item_desc,
        email: order.email,
        status: order.status || 'pending',
        idempotency_key: order.idempotency_key,
      });

    if (error) {
      throw new Error(`Failed to save order: ${error.message}`);
    }
  }

  /**
   * 查詢訂單狀態
   */
  public async getOrder(merchantOrderNo: string): Promise<PaymentOrder | null> {
    const { data, error } = await this.supabase
      .from('payment_orders')
      .select('*')
      .eq('merchant_order_no', merchantOrderNo)
      .single();

    if (error) {
      return null;
    }

    return data as PaymentOrder;
  }

  /**
   * 查詢使用者訂單
   */
  public async getUserOrders(
    userId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<PaymentOrder[]> {
    let query = this.supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data } = await query;
    return (data as PaymentOrder[]) || [];
  }

  // ============================================
  // 交易查詢 API
  // ============================================

  /**
   * 向藍新查詢交易狀態
   * (需要額外實作 API 呼叫)
   */
  public async queryTradeInfo(merchantOrderNo: string, amount: number): Promise<MPGResult | null> {
    // TODO: 實作藍新 QueryTradeInfo API
    // 這需要另一組加密參數
    console.log(`Query trade: ${merchantOrderNo}, ${amount}`);
    return null;
  }
}

export default NewebPayMPG;
