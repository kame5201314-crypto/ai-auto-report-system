/**
 * 藍新金流 MPG 單次付款服務
 *
 * @module payment/services/mpgService
 */

import { NewebPayVault, getNewebPayVault } from '../core/NewebPayVault';
import type {
  SinglePaymentRequest,
  SinglePaymentResponse,
  MPGTradeInfo,
  MPGFormData,
  MPGResult,
  PaymentMethod,
  InvoiceInfo,
  PaymentOrder,
} from '../types';
import { supabase } from '../../lib/supabase';

/**
 * MPG 單次付款服務類別
 */
export class MPGService {
  private vault: NewebPayVault;

  constructor(vault?: NewebPayVault) {
    this.vault = vault || getNewebPayVault();
  }

  /**
   * 建立單次付款
   * @param request - 付款請求參數
   * @returns 付款回應（包含表單 HTML）
   */
  async createPayment(request: SinglePaymentRequest): Promise<SinglePaymentResponse> {
    try {
      // 驗證請求參數
      this.validateRequest(request);

      // 產生訂單編號
      const merchantOrderNo = this.vault.generateOrderNo('S');

      // 建構交易資訊
      const tradeInfo = this.buildTradeInfo(merchantOrderNo, request);

      // 產生加密表單資料
      const formData = await this.vault.createMPGFormData(tradeInfo);

      // 儲存訂單到資料庫
      await this.saveOrder(merchantOrderNo, request);

      // 產生自動提交表單
      const formHtml = this.vault.generateAutoSubmitForm(formData);

      return {
        success: true,
        data: {
          merchantOrderNo,
          formHtml,
          formData,
          actionUrl: this.vault.getActionUrl(false),
        },
      };
    } catch (error) {
      console.error('建立付款失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '建立付款時發生未知錯誤',
      };
    }
  }

  /**
   * 驗證請求參數
   */
  private validateRequest(request: SinglePaymentRequest): void {
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
  }

  /**
   * 驗證 Email 格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 建構交易資訊
   */
  private buildTradeInfo(
    merchantOrderNo: string,
    request: SinglePaymentRequest
  ): Omit<MPGTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'> {
    const tradeInfo: Omit<MPGTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'> = {
      MerchantOrderNo: merchantOrderNo,
      Amt: request.amount,
      ItemDesc: request.itemDesc,
      Email: request.email,
      TradeLimit: 900, // 15 分鐘交易限制
      EmailModify: 0, // 不可修改 Email
      LoginType: 0, // 不需登入
    };

    // 設定回傳 URL
    if (request.returnUrl) {
      tradeInfo.ReturnURL = request.returnUrl;
    }

    if (request.notifyUrl) {
      tradeInfo.NotifyURL = request.notifyUrl;
    }

    if (request.clientBackUrl) {
      tradeInfo.ClientBackURL = request.clientBackUrl;
    }

    // 設定付款方式
    this.setPaymentMethods(tradeInfo, request.paymentMethods);

    // 設定電子發票
    if (request.invoice) {
      tradeInfo.INVOICE = 1;
      // 發票相關參數會附加在 tradeInfo 中
      this.setInvoiceInfo(tradeInfo, request.invoice);
    }

    return tradeInfo;
  }

  /**
   * 設定付款方式
   */
  private setPaymentMethods(
    tradeInfo: Omit<MPGTradeInfo, 'MerchantID' | 'RespondType' | 'TimeStamp' | 'Version'>,
    methods?: PaymentMethod[]
  ): void {
    // 預設開啟信用卡
    if (!methods || methods.length === 0) {
      tradeInfo.CREDIT = 1;
      return;
    }

    // 根據指定的付款方式設定
    methods.forEach(method => {
      switch (method) {
        case 'CREDIT':
          tradeInfo.CREDIT = 1;
          break;
        case 'WEBATM':
          tradeInfo.WEBATM = 1;
          break;
        case 'VACC':
          tradeInfo.VACC = 1;
          tradeInfo.ExpireDate = this.getExpireDate(7); // 7 天後到期
          break;
        case 'CVS':
          tradeInfo.CVS = 1;
          tradeInfo.ExpireDate = this.getExpireDate(7);
          break;
        case 'BARCODE':
          tradeInfo.BARCODE = 1;
          tradeInfo.ExpireDate = this.getExpireDate(7);
          break;
        case 'ESUNWALLET':
          tradeInfo.ESUNWALLET = 1;
          break;
        case 'TAIWANPAY':
          tradeInfo.TAIWANPAY = 1;
          break;
        case 'LINEPAY':
          tradeInfo.LINEPAY = 1;
          break;
        case 'SAMSUNGPAY':
          tradeInfo.SAMSUNGPAY = 1;
          break;
        case 'GOOGLEPAY':
          tradeInfo.GOOGLEPAY = 1;
          break;
        case 'CVSCOM':
          tradeInfo.CVSCOM = 1;
          break;
      }
    });
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

    // 將發票參數合併到交易資訊
    Object.assign(tradeInfo, invoiceParams);
  }

  /**
   * 計算到期日期
   */
  private getExpireDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 儲存訂單到資料庫
   */
  private async saveOrder(
    merchantOrderNo: string,
    request: SinglePaymentRequest
  ): Promise<void> {
    const order: Partial<PaymentOrder> = {
      merchant_order_no: merchantOrderNo,
      user_id: request.userId,
      amount: request.amount,
      item_desc: request.itemDesc,
      email: request.email,
      payment_method: request.paymentMethods?.join(',') || 'CREDIT',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('payment_orders')
      .insert(order);

    if (error) {
      console.warn('儲存訂單失敗（可能資料表不存在）:', error.message);
      // 不阻擋流程，允許在沒有資料庫的情況下運作
    }
  }

  /**
   * 處理付款結果回傳
   */
  async handlePaymentResult(result: MPGResult): Promise<void> {
    if (!result.Result) {
      console.error('付款結果缺少 Result 資料');
      return;
    }

    const { MerchantOrderNo, TradeNo, PaymentType, Auth } = result.Result;

    const updateData: Partial<PaymentOrder> = {
      status: result.Status === 'SUCCESS' ? 'paid' : 'failed',
      newebpay_trade_no: TradeNo,
      payment_method: PaymentType,
      auth_code: Auth,
      paid_at: result.Status === 'SUCCESS' ? new Date().toISOString() : undefined,
      raw_response: result as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('payment_orders')
      .update(updateData)
      .eq('merchant_order_no', MerchantOrderNo);

    if (error) {
      console.error('更新訂單狀態失敗:', error.message);
    }
  }

  /**
   * 查詢訂單
   */
  async getOrder(merchantOrderNo: string): Promise<PaymentOrder | null> {
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('merchant_order_no', merchantOrderNo)
      .single();

    if (error) {
      console.error('查詢訂單失敗:', error.message);
      return null;
    }

    return data as PaymentOrder;
  }

  /**
   * 查詢使用者訂單
   */
  async getUserOrders(userId: string): Promise<PaymentOrder[]> {
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查詢使用者訂單失敗:', error.message);
      return [];
    }

    return data as PaymentOrder[];
  }
}

/**
 * MPG 服務單例
 */
let mpgServiceInstance: MPGService | null = null;

export function getMPGService(): MPGService {
  if (!mpgServiceInstance) {
    mpgServiceInstance = new MPGService();
  }
  return mpgServiceInstance;
}

export default MPGService;
