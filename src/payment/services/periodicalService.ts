/**
 * 藍新金流定期定額（訂閱）服務
 *
 * @module payment/services/periodicalService
 */

import { NewebPayVault, getNewebPayVault } from '../core/NewebPayVault';
import type {
  SubscribePaymentRequest,
  SubscribePaymentResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  PeriodicalTradeInfo,
  PeriodicalResult,
  PeriodicalStatusRequest,
  Subscription,
  SubscriptionPayment,
  PeriodType,
  InvoiceInfo,
} from '../types';
import { supabase } from '../../lib/supabase';

/**
 * 定期定額服務類別
 */
export class PeriodicalService {
  private vault: NewebPayVault;

  constructor(vault?: NewebPayVault) {
    this.vault = vault || getNewebPayVault();
  }

  /**
   * 建立訂閱付款
   * @param request - 訂閱請求參數
   * @returns 訂閱回應（包含表單 HTML）
   */
  async createSubscription(request: SubscribePaymentRequest): Promise<SubscribePaymentResponse> {
    try {
      // 驗證請求參數
      this.validateRequest(request);

      // 產生訂單編號
      const merchantOrderNo = this.vault.generateOrderNo('P');

      // 建構交易資訊
      const tradeInfo = this.buildTradeInfo(merchantOrderNo, request);

      // 產生加密表單資料
      const formData = await this.vault.createPeriodicalFormData(tradeInfo);

      // 建立訂閱記錄（狀態為 pending）
      await this.createSubscriptionRecord(merchantOrderNo, request);

      // 產生自動提交表單
      const formHtml = this.vault.generateAutoSubmitForm(formData, undefined, true);

      return {
        success: true,
        data: {
          merchantOrderNo,
          formHtml,
          formData,
          actionUrl: this.vault.getActionUrl(true),
        },
      };
    } catch (error) {
      console.error('建立訂閱失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '建立訂閱時發生未知錯誤',
      };
    }
  }

  /**
   * 驗證請求參數
   */
  private validateRequest(request: SubscribePaymentRequest): void {
    if (!request.userId) {
      throw new Error('訂閱必須提供使用者 ID');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('金額必須大於 0');
    }

    if (request.amount > 10000000) {
      throw new Error('金額不可超過 1000 萬');
    }

    if (!Number.isInteger(request.amount)) {
      throw new Error('金額必須為整數');
    }

    if (!request.itemDesc || request.itemDesc.length === 0) {
      throw new Error('商品描述不可為空');
    }

    if (request.itemDesc.length > 50) {
      throw new Error('商品描述不可超過 50 字');
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new Error('請提供有效的 Email');
    }

    if (!['D', 'W', 'M', 'Y'].includes(request.periodType)) {
      throw new Error('週期類型必須為 D/W/M/Y');
    }

    if (!request.periodPoint) {
      throw new Error('週期授權時間點不可為空');
    }

    this.validatePeriodPoint(request.periodType, request.periodPoint);

    if (!request.totalPeriods || request.totalPeriods < 1) {
      throw new Error('總期數必須至少為 1');
    }

    if (request.totalPeriods > 999) {
      throw new Error('總期數不可超過 999');
    }
  }

  /**
   * 驗證 Email 格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 驗證週期時間點格式
   */
  private validatePeriodPoint(periodType: PeriodType, periodPoint: string): void {
    switch (periodType) {
      case 'D':
        // 每日扣款，periodPoint 應為空或無意義
        break;
      case 'W':
        // 每週扣款，periodPoint 應為 1-7 (週一到週日)
        const weekDay = parseInt(periodPoint, 10);
        if (isNaN(weekDay) || weekDay < 1 || weekDay > 7) {
          throw new Error('每週扣款的 periodPoint 必須為 1-7（週一到週日）');
        }
        break;
      case 'M':
        // 每月扣款，periodPoint 應為 01-31
        const monthDay = parseInt(periodPoint, 10);
        if (isNaN(monthDay) || monthDay < 1 || monthDay > 31) {
          throw new Error('每月扣款的 periodPoint 必須為 01-31');
        }
        break;
      case 'Y':
        // 每年扣款，periodPoint 應為 MMDD 格式
        if (!/^\d{4}$/.test(periodPoint)) {
          throw new Error('每年扣款的 periodPoint 必須為 MMDD 格式');
        }
        const month = parseInt(periodPoint.slice(0, 2), 10);
        const day = parseInt(periodPoint.slice(2, 4), 10);
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          throw new Error('每年扣款的 periodPoint 日期格式不正確');
        }
        break;
    }
  }

  /**
   * 建構交易資訊
   */
  private buildTradeInfo(
    merchantOrderNo: string,
    request: SubscribePaymentRequest
  ): Omit<PeriodicalTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'> {
    const tradeInfo: Omit<PeriodicalTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'> = {
      MerchantOrderNo: merchantOrderNo,
      Amt: request.amount,
      ItemDesc: request.itemDesc,
      Email: request.email,
      PeriodType: request.periodType,
      PeriodPoint: request.periodPoint,
      PeriodAmt: request.totalPeriods,
      PeriodStartType: '2', // 2: 首筆立即授權
    };

    // 設定回傳 URL
    if (request.returnUrl) {
      tradeInfo.ReturnURL = request.returnUrl;
    }

    if (request.notifyUrl) {
      tradeInfo.NotifyURL = request.notifyUrl;
    }

    if (request.periodNotifyUrl) {
      tradeInfo.PeriodNotifyURL = request.periodNotifyUrl;
    }

    // 設定電子發票
    if (request.invoice) {
      tradeInfo.INVOICE = 1;
      this.setInvoiceInfo(tradeInfo, request.invoice);
    }

    return tradeInfo;
  }

  /**
   * 設定電子發票資訊
   */
  private setInvoiceInfo(
    tradeInfo: Record<string, unknown>,
    invoice: InvoiceInfo
  ): void {
    const invoiceParams: Record<string, string | number> = {
      InvType: invoice.Category,
      TaxType: invoice.TaxType || '1',
      ItemName: invoice.ItemName,
      ItemCount: invoice.ItemCount,
      ItemUnit: invoice.ItemUnit,
      ItemPrice: invoice.ItemPrice,
      ItemAmt: invoice.ItemAmt,
    };

    if (invoice.Category === 'B2B' && invoice.BuyerUBN) {
      invoiceParams.BuyerUBN = invoice.BuyerUBN;
    }

    if (invoice.BuyerName) {
      invoiceParams.BuyerName = invoice.BuyerName;
    }

    if (invoice.BuyerEmail) {
      invoiceParams.BuyerEmail = invoice.BuyerEmail;
    }

    if (invoice.CarrierType) {
      invoiceParams.CarrierType = invoice.CarrierType;
      if (invoice.CarrierNum) {
        invoiceParams.CarrierNum = invoice.CarrierNum;
      }
    }

    if (invoice.LoveCode) {
      invoiceParams.LoveCode = invoice.LoveCode;
    }

    invoiceParams.PrintFlag = invoice.PrintFlag || 'N';

    Object.assign(tradeInfo, invoiceParams);
  }

  /**
   * 建立訂閱記錄
   */
  private async createSubscriptionRecord(
    merchantOrderNo: string,
    request: SubscribePaymentRequest
  ): Promise<void> {
    const subscription: Partial<Subscription> = {
      user_id: request.userId,
      merchant_order_no: merchantOrderNo,
      period_no: '', // 藍新回傳後更新
      period_type: request.periodType,
      period_point: request.periodPoint,
      amount: request.amount,
      total_periods: request.totalPeriods,
      completed_periods: 0,
      status: 'active', // 先設為 active，失敗時更新
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('subscriptions')
      .insert(subscription);

    if (error) {
      console.warn('儲存訂閱記錄失敗（可能資料表不存在）:', error.message);
    }
  }

  /**
   * 處理首筆授權結果
   */
  async handleFirstAuthResult(result: PeriodicalResult): Promise<void> {
    if (!result.Result) {
      console.error('訂閱結果缺少 Result 資料');
      return;
    }

    const {
      MerchantOrderNo,
      PeriodNo,
      AlreadyTimes,
      TotalTimes,
      NextAuthDate,
      TokenValue,
      TokenLife,
      AuthCode,
      AuthDate,
    } = result.Result;

    const isSuccess = result.Status === 'SUCCESS';

    const updateData: Partial<Subscription> = {
      period_no: PeriodNo,
      period_token: TokenValue,
      status: isSuccess ? 'active' : 'terminated',
      completed_periods: AlreadyTimes,
      total_periods: TotalTimes,
      next_auth_date: NextAuthDate,
      last_auth_date: AuthDate,
      last_auth_status: result.Status,
      updated_at: new Date().toISOString(),
    };

    if (!isSuccess) {
      updateData.terminated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('merchant_order_no', MerchantOrderNo);

    if (error) {
      console.error('更新訂閱狀態失敗:', error.message);
    }

    // 記錄首筆付款
    if (isSuccess) {
      await this.recordPayment(result);
    }
  }

  /**
   * 處理後續期別授權結果（每期 Webhook 通知）
   */
  async handlePeriodAuthResult(result: PeriodicalResult): Promise<void> {
    if (!result.Result) {
      console.error('期別授權結果缺少 Result 資料');
      return;
    }

    const {
      PeriodNo,
      AlreadyTimes,
      NextAuthDate,
      AuthDate,
    } = result.Result;

    const isSuccess = result.Status === 'SUCCESS';

    // 更新訂閱記錄
    const updateData: Partial<Subscription> = {
      completed_periods: AlreadyTimes,
      next_auth_date: NextAuthDate,
      last_auth_date: AuthDate,
      last_auth_status: result.Status,
      updated_at: new Date().toISOString(),
    };

    // 檢查是否已完成所有期數
    if (AlreadyTimes >= (result.Result.TotalTimes || 0)) {
      updateData.status = 'expired';
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('period_no', PeriodNo);

    if (error) {
      console.error('更新訂閱期別狀態失敗:', error.message);
    }

    // 記錄付款
    await this.recordPayment(result);
  }

  /**
   * 記錄付款
   */
  private async recordPayment(result: PeriodicalResult): Promise<void> {
    if (!result.Result) return;

    const {
      MerchantOrderNo,
      PeriodNo,
      AlreadyTimes,
      Amt,
      AuthCode,
      AuthDate,
      RespondCode,
    } = result.Result;

    // 先查詢訂閱 ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('period_no', PeriodNo)
      .single();

    const payment: Partial<SubscriptionPayment> = {
      subscription_id: subscription?.id,
      merchant_order_no: MerchantOrderNo,
      period_no: PeriodNo,
      period_times: AlreadyTimes,
      amount: Amt,
      status: result.Status === 'SUCCESS' ? 'success' : 'failed',
      auth_code: AuthCode,
      auth_date: AuthDate,
      response_code: RespondCode,
      raw_response: result as unknown as Record<string, unknown>,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('subscription_payments')
      .insert(payment);

    if (error) {
      console.error('記錄付款失敗:', error.message);
    }
  }

  /**
   * 取消訂閱（一鍵取消）
   * @param request - 取消請求
   * @returns 取消結果
   */
  async cancelSubscription(request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    try {
      // 查詢訂閱
      const { data: subscription, error: queryError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', request.subscriptionId)
        .eq('user_id', request.userId)
        .single();

      if (queryError || !subscription) {
        return {
          success: false,
          error: '找不到該訂閱或您無權限取消此訂閱',
        };
      }

      if (subscription.status === 'terminated') {
        return {
          success: false,
          error: '該訂閱已終止',
        };
      }

      if (subscription.status === 'expired') {
        return {
          success: false,
          error: '該訂閱已到期',
        };
      }

      // 呼叫藍新 API 終止訂閱
      const alterResult = await this.alterSubscriptionStatus({
        MerchantID: this.vault.getMerchantId(),
        PeriodNo: subscription.period_no,
        AlterType: 'terminate',
      });

      if (!alterResult.success) {
        return {
          success: false,
          error: alterResult.error || '終止訂閱失敗',
        };
      }

      // 更新資料庫
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'terminated',
          terminated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.subscriptionId);

      if (updateError) {
        console.error('更新訂閱狀態失敗:', updateError.message);
      }

      return {
        success: true,
        message: '訂閱已成功取消',
      };
    } catch (error) {
      console.error('取消訂閱失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '取消訂閱時發生未知錯誤',
      };
    }
  }

  /**
   * 暫停訂閱
   */
  async suspendSubscription(subscriptionId: string, userId: string): Promise<CancelSubscriptionResponse> {
    try {
      const { data: subscription, error: queryError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single();

      if (queryError || !subscription) {
        return {
          success: false,
          error: '找不到該訂閱或您無權限操作此訂閱',
        };
      }

      if (subscription.status !== 'active') {
        return {
          success: false,
          error: '只有啟用中的訂閱可以暫停',
        };
      }

      const alterResult = await this.alterSubscriptionStatus({
        MerchantID: this.vault.getMerchantId(),
        PeriodNo: subscription.period_no,
        AlterType: 'suspend',
      });

      if (!alterResult.success) {
        return {
          success: false,
          error: alterResult.error || '暫停訂閱失敗',
        };
      }

      await supabase
        .from('subscriptions')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      return {
        success: true,
        message: '訂閱已暫停',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '暫停訂閱時發生錯誤',
      };
    }
  }

  /**
   * 重啟訂閱
   */
  async restartSubscription(subscriptionId: string, userId: string): Promise<CancelSubscriptionResponse> {
    try {
      const { data: subscription, error: queryError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single();

      if (queryError || !subscription) {
        return {
          success: false,
          error: '找不到該訂閱或您無權限操作此訂閱',
        };
      }

      if (subscription.status !== 'suspended') {
        return {
          success: false,
          error: '只有暫停中的訂閱可以重啟',
        };
      }

      const alterResult = await this.alterSubscriptionStatus({
        MerchantID: this.vault.getMerchantId(),
        PeriodNo: subscription.period_no,
        AlterType: 'restart',
      });

      if (!alterResult.success) {
        return {
          success: false,
          error: alterResult.error || '重啟訂閱失敗',
        };
      }

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      return {
        success: true,
        message: '訂閱已重新啟用',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重啟訂閱時發生錯誤',
      };
    }
  }

  /**
   * 呼叫藍新 API 變更訂閱狀態
   */
  private async alterSubscriptionStatus(
    request: PeriodicalStatusRequest
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 建構請求資料
      const postData = {
        RespondType: 'JSON',
        TimeStamp: Math.floor(Date.now() / 1000).toString(),
        Version: '1.0',
        MerchantOrderNo: request.PeriodNo,
        PeriodNo: request.PeriodNo,
        AlterType: request.AlterType,
      };

      const queryString = Object.entries(postData)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');

      const encryptedData = await this.vault['encrypt'](queryString);
      const tradeSha = await this.vault['createTradeSha'](encryptedData);

      const formData = new URLSearchParams();
      formData.append('MerchantID_', request.MerchantID);
      formData.append('PostData_', encryptedData);
      formData.append('TradeSha', tradeSha);

      const response = await fetch(this.vault.getAlterStatusUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();

      if (result.Status === 'SUCCESS') {
        return { success: true };
      }

      return {
        success: false,
        error: result.Message || '藍新 API 回傳錯誤',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '呼叫藍新 API 時發生錯誤',
      };
    }
  }

  /**
   * 查詢訂閱
   */
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      console.error('查詢訂閱失敗:', error.message);
      return null;
    }

    return data as Subscription;
  }

  /**
   * 查詢使用者訂閱
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查詢使用者訂閱失敗:', error.message);
      return [];
    }

    return data as Subscription[];
  }

  /**
   * 查詢訂閱付款記錄
   */
  async getSubscriptionPayments(subscriptionId: string): Promise<SubscriptionPayment[]> {
    const { data, error } = await supabase
      .from('subscription_payments')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查詢付款記錄失敗:', error.message);
      return [];
    }

    return data as SubscriptionPayment[];
  }
}

/**
 * 定期定額服務單例
 */
let periodicalServiceInstance: PeriodicalService | null = null;

export function getPeriodicalService(): PeriodicalService {
  if (!periodicalServiceInstance) {
    periodicalServiceInstance = new PeriodicalService();
  }
  return periodicalServiceInstance;
}

export default PeriodicalService;
