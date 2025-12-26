/**
 * 藍新金流電子發票服務
 * 支援自動開立、作廢、折讓
 *
 * @module payment/services/invoiceService
 */

import { NewebPayVault, getNewebPayVault } from '../core/NewebPayVault';
import type {
  InvoiceInfo,
  InvoiceCategory,
  Invoice,
} from '../types';
import { supabase } from '../../lib/supabase';

/**
 * 電子發票 API 端點
 */
const INVOICE_ENDPOINTS = {
  ISSUE_PROD: 'https://inv.pay2go.com/API/invoice_issue',
  ISSUE_TEST: 'https://cinv.pay2go.com/API/invoice_issue',
  VOID_PROD: 'https://inv.pay2go.com/API/invoice_invalid',
  VOID_TEST: 'https://cinv.pay2go.com/API/invoice_invalid',
  ALLOWANCE_PROD: 'https://inv.pay2go.com/API/allowance_issue',
  ALLOWANCE_TEST: 'https://cinv.pay2go.com/API/allowance_issue',
};

/**
 * 電子發票服務類別
 */
export class InvoiceService {
  private vault: NewebPayVault;
  private isTest: boolean;

  constructor(vault?: NewebPayVault) {
    this.vault = vault || getNewebPayVault();
    this.isTest = this.vault.getIsTest();
  }

  /**
   * 開立電子發票
   * @param orderId - 訂單 ID
   * @param invoiceInfo - 發票資訊
   * @returns 開立結果
   */
  async issueInvoice(
    orderId: string,
    invoiceInfo: InvoiceInfo,
    amount: number
  ): Promise<{
    success: boolean;
    invoiceNo?: string;
    error?: string;
  }> {
    try {
      // 驗證發票資訊
      this.validateInvoiceInfo(invoiceInfo);

      // 計算稅額
      const taxRate = invoiceInfo.TaxRate || 5;
      const taxAmount = invoiceInfo.TaxType === '1'
        ? Math.round(amount * taxRate / 100)
        : 0;
      const totalAmount = amount + taxAmount;

      // 建構請求資料
      const postData = {
        RespondType: 'JSON',
        Version: '1.5',
        TimeStamp: Math.floor(Date.now() / 1000).toString(),
        TransNum: orderId,
        MerchantOrderNo: this.vault.generateOrderNo('INV'),
        BuyerName: invoiceInfo.BuyerName || '消費者',
        BuyerEmail: invoiceInfo.BuyerEmail || '',
        BuyerPhone: invoiceInfo.BuyerPhone || '',
        Category: invoiceInfo.Category,
        TaxType: invoiceInfo.TaxType || '1',
        TaxRate: taxRate,
        Amt: amount,
        TaxAmt: taxAmount,
        TotalAmt: totalAmount,
        ItemName: invoiceInfo.ItemName,
        ItemCount: invoiceInfo.ItemCount,
        ItemUnit: invoiceInfo.ItemUnit,
        ItemPrice: invoiceInfo.ItemPrice,
        ItemAmt: invoiceInfo.ItemAmt,
        PrintFlag: invoiceInfo.PrintFlag || 'N',
        ...(invoiceInfo.Category === 'B2B' && {
          BuyerUBN: invoiceInfo.BuyerUBN,
          BuyerAddress: invoiceInfo.BuyerAddress,
        }),
        ...(invoiceInfo.CarrierType && {
          CarrierType: invoiceInfo.CarrierType,
          CarrierNum: invoiceInfo.CarrierNum,
        }),
        ...(invoiceInfo.LoveCode && {
          LoveCode: invoiceInfo.LoveCode,
        }),
      };

      // 加密並發送請求
      const result = await this.sendRequest(
        this.isTest ? INVOICE_ENDPOINTS.ISSUE_TEST : INVOICE_ENDPOINTS.ISSUE_PROD,
        postData
      );

      if (result.Status === 'SUCCESS') {
        // 儲存發票記錄
        await this.saveInvoice({
          order_id: orderId,
          invoice_no: result.Result?.InvoiceNumber || '',
          invoice_date: new Date().toISOString().split('T')[0],
          category: invoiceInfo.Category,
          buyer_ubn: invoiceInfo.BuyerUBN,
          buyer_name: invoiceInfo.BuyerName,
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'issued',
          raw_response: result,
        });

        return {
          success: true,
          invoiceNo: result.Result?.InvoiceNumber,
        };
      }

      return {
        success: false,
        error: result.Message || '開立發票失敗',
      };
    } catch (error) {
      console.error('開立發票失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '開立發票時發生錯誤',
      };
    }
  }

  /**
   * 作廢電子發票
   * @param invoiceNo - 發票號碼
   * @param reason - 作廢原因
   */
  async voidInvoice(
    invoiceNo: string,
    reason: string = '客戶要求作廢'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const postData = {
        RespondType: 'JSON',
        Version: '1.0',
        TimeStamp: Math.floor(Date.now() / 1000).toString(),
        InvoiceNumber: invoiceNo,
        InvalidReason: reason,
      };

      const result = await this.sendRequest(
        this.isTest ? INVOICE_ENDPOINTS.VOID_TEST : INVOICE_ENDPOINTS.VOID_PROD,
        postData
      );

      if (result.Status === 'SUCCESS') {
        // 更新發票狀態
        await supabase
          .from('invoices')
          .update({ status: 'void' })
          .eq('invoice_no', invoiceNo);

        return { success: true };
      }

      return {
        success: false,
        error: result.Message || '作廢發票失敗',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '作廢發票時發生錯誤',
      };
    }
  }

  /**
   * 開立折讓單
   * @param invoiceNo - 原發票號碼
   * @param allowanceAmount - 折讓金額
   */
  async issueAllowance(
    invoiceNo: string,
    allowanceAmount: number,
    itemName: string
  ): Promise<{
    success: boolean;
    allowanceNo?: string;
    error?: string;
  }> {
    try {
      const postData = {
        RespondType: 'JSON',
        Version: '1.0',
        TimeStamp: Math.floor(Date.now() / 1000).toString(),
        InvoiceNo: invoiceNo,
        MerchantOrderNo: this.vault.generateOrderNo('ALW'),
        ItemName: itemName,
        ItemCount: '1',
        ItemUnit: '式',
        ItemPrice: allowanceAmount.toString(),
        ItemAmt: allowanceAmount.toString(),
        TotalAmt: allowanceAmount,
      };

      const result = await this.sendRequest(
        this.isTest ? INVOICE_ENDPOINTS.ALLOWANCE_TEST : INVOICE_ENDPOINTS.ALLOWANCE_PROD,
        postData
      );

      if (result.Status === 'SUCCESS') {
        return {
          success: true,
          allowanceNo: result.Result?.AllowanceNo,
        };
      }

      return {
        success: false,
        error: result.Message || '開立折讓失敗',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '開立折讓時發生錯誤',
      };
    }
  }

  /**
   * 驗證發票資訊
   */
  private validateInvoiceInfo(info: InvoiceInfo): void {
    if (!info.Category || !['B2B', 'B2C'].includes(info.Category)) {
      throw new Error('發票類別必須為 B2B 或 B2C');
    }

    if (info.Category === 'B2B' && !info.BuyerUBN) {
      throw new Error('B2B 發票必須提供統一編號');
    }

    if (info.BuyerUBN && !/^\d{8}$/.test(info.BuyerUBN)) {
      throw new Error('統一編號格式不正確（需 8 碼數字）');
    }

    if (!info.ItemName || !info.ItemCount || !info.ItemUnit || !info.ItemPrice || !info.ItemAmt) {
      throw new Error('商品資訊不完整');
    }
  }

  /**
   * 發送加密請求
   */
  private async sendRequest(
    url: string,
    data: Record<string, unknown>
  ): Promise<{
    Status: string;
    Message: string;
    Result?: Record<string, unknown>;
  }> {
    const queryString = Object.entries(data)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const encryptedData = await this.vault['encrypt'](queryString);
    const tradeSha = await this.vault['createTradeSha'](encryptedData);

    const formData = new URLSearchParams();
    formData.append('MerchantID_', this.vault.getMerchantId());
    formData.append('PostData_', encryptedData);
    formData.append('TradeSha', tradeSha);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    return await response.json();
  }

  /**
   * 儲存發票記錄
   */
  private async saveInvoice(invoice: Partial<Invoice>): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('儲存發票記錄失敗:', error.message);
    }
  }

  /**
   * 查詢發票
   */
  async getInvoice(invoiceNo: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_no', invoiceNo)
      .single();

    if (error) {
      console.error('查詢發票失敗:', error.message);
      return null;
    }

    return data as Invoice;
  }
}

/**
 * 電子發票服務單例
 */
let invoiceServiceInstance: InvoiceService | null = null;

export function getInvoiceService(): InvoiceService {
  if (!invoiceServiceInstance) {
    invoiceServiceInstance = new InvoiceService();
  }
  return invoiceServiceInstance;
}

export default InvoiceService;
