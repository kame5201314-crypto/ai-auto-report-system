/**
 * 藍新金流 NewebPay 全方位金流服務 - 型別定義
 * @module payment/types
 */

// ============================================
// 基礎設定型別
// ============================================

export interface NewebPayConfig {
  /** 商店代號 */
  merchantId: string;
  /** HashKey (加密用) */
  hashKey: string;
  /** HashIV (加密用) */
  hashIV: string;
  /** 是否為測試環境 */
  isTest: boolean;
  /** API 版本 */
  version?: string;
  /** 回傳格式 (JSON/String) */
  respondType?: 'JSON' | 'String';
}

// ============================================
// MPG 單次付款型別
// ============================================

/** MPG 付款方式 */
export type PaymentMethod =
  | 'CREDIT'      // 信用卡
  | 'WEBATM'      // WebATM
  | 'VACC'        // ATM 轉帳
  | 'CVS'         // 超商代碼
  | 'BARCODE'     // 超商條碼
  | 'ESUNWALLET'  // 玉山 Wallet
  | 'TAIWANPAY'   // 台灣 Pay
  | 'LINEPAY'     // LINE Pay
  | 'SAMSUNGPAY'  // Samsung Pay
  | 'GOOGLEPAY'   // Google Pay
  | 'CVSCOM';     // 超商取貨付款

/** MPG 請求參數 */
export interface MPGTradeInfo {
  /** 商店代號 */
  MerchantID: string;
  /** 回傳格式 */
  RespondType: 'JSON' | 'String';
  /** 時間戳記 */
  TimeStamp: string;
  /** 串接版本 */
  Version: string;
  /** 商店訂單編號 (需唯一，限英數 30 字) */
  MerchantOrderNo: string;
  /** 訂單金額 (整數，新台幣) */
  Amt: number;
  /** 商品資訊 (最多 50 字) */
  ItemDesc: string;
  /** 付款人 Email */
  Email: string;
  /** 交易限制秒數 (60-900) */
  TradeLimit?: number;
  /** 繳費有效期限 (格式: YYYYMMDD，僅 ATM/超商) */
  ExpireDate?: string;
  /** 支付完成返回商店網址 */
  ReturnURL?: string;
  /** 支付通知網址 (Webhook) */
  NotifyURL?: string;
  /** 客戶端返回商店網址 */
  ClientBackURL?: string;
  /** 付款人 Email 通知 (1: 通知, 0: 不通知) */
  EmailModify?: 0 | 1;
  /** 是否需要登入藍新會員 (0: 不需要, 1: 需要) */
  LoginType?: 0 | 1;
  /** 商店備註 */
  OrderComment?: string;
  /** 信用卡一次付清 */
  CREDIT?: 0 | 1;
  /** 信用卡分期付款 */
  InstFlag?: string;
  /** 信用卡紅利 */
  CreditRed?: 0 | 1;
  /** 信用卡銀聯卡 */
  UNIONPAY?: 0 | 1;
  /** WebATM */
  WEBATM?: 0 | 1;
  /** ATM 轉帳 */
  VACC?: 0 | 1;
  /** 超商代碼繳費 */
  CVS?: 0 | 1;
  /** 超商條碼繳費 */
  BARCODE?: 0 | 1;
  /** 玉山 Wallet */
  ESUNWALLET?: 0 | 1;
  /** 台灣 Pay */
  TAIWANPAY?: 0 | 1;
  /** LINE Pay */
  LINEPAY?: 0 | 1;
  /** Samsung Pay */
  SAMSUNGPAY?: 0 | 1;
  /** Google Pay */
  GOOGLEPAY?: 0 | 1;
  /** 超商取貨付款 */
  CVSCOM?: 0 | 1;
  /** 物流類型 (B2C/C2C) */
  LgsType?: 'B2C' | 'C2C';
  /** 電子發票開立 */
  INVOICE?: 0 | 1;
}

/** MPG 加密後提交資料 */
export interface MPGFormData {
  MerchantID: string;
  TradeInfo: string;
  TradeSha: string;
  Version: string;
}

/** MPG 回傳結果 (解密後) */
export interface MPGResult {
  /** 交易狀態 (SUCCESS 表示成功) */
  Status: string;
  /** 訊息 */
  Message: string;
  /** 交易資訊 */
  Result?: {
    /** 商店代號 */
    MerchantID: string;
    /** 交易金額 */
    Amt: number;
    /** 藍新交易序號 */
    TradeNo: string;
    /** 商店訂單編號 */
    MerchantOrderNo: string;
    /** 支付方式 */
    PaymentType: string;
    /** 回應時間 */
    RespondTime: string;
    /** 授權碼 (信用卡) */
    Auth?: string;
    /** 信用卡卡號末四碼 */
    Card4No?: string;
    /** 信用卡卡號前六碼 */
    Card6No?: string;
    /** ECI 值 */
    ECI?: string;
    /** ATM 轉帳帳號 */
    BankCode?: string;
    /** 超商代碼 */
    CodeNo?: string;
    /** 超商條碼 */
    Barcode_1?: string;
    Barcode_2?: string;
    Barcode_3?: string;
  };
}

// ============================================
// Periodical 定期定額型別
// ============================================

/** 定期定額週期單位 */
export type PeriodType =
  | 'D'   // 日
  | 'W'   // 週
  | 'M'   // 月
  | 'Y';  // 年

/** 定期定額請求參數 */
export interface PeriodicalTradeInfo {
  /** 商店代號 */
  MerchantID: string;
  /** 回傳格式 */
  RespondType: 'JSON' | 'String';
  /** 時間戳記 */
  TimeStamp: string;
  /** 串接版本 */
  Version: string;
  /** 商店訂單編號 */
  MerchantOrderNo: string;
  /** 委託單號 (定期定額專用) */
  PeriodNo?: string;
  /** 訂單金額 */
  Amt: number;
  /** 商品資訊 */
  ItemDesc: string;
  /** 付款人 Email */
  Email: string;
  /** 週期類別 (D/W/M/Y) */
  PeriodType: PeriodType;
  /** 週期授權時間點 (每月幾號等) */
  PeriodPoint: string;
  /** 授權期數 */
  PeriodAmt: number;
  /** 檢查卡號模式 (0: 不檢查, 1: 檢查) */
  PeriodMemo?: string;
  /** 首期付款日期 (YYYYMMDD) */
  PeriodStartType?: '1' | '2' | '3';
  /** 是否啟用 (1: 啟用, 0: 暫停) */
  PeriodFirstdate?: string;
  /** 支付完成返回網址 */
  ReturnURL?: string;
  /** 支付通知網址 */
  NotifyURL?: string;
  /** 付款頁返回網址 */
  BackURL?: string;
  /** 每期授權通知網址 */
  PeriodNotifyURL?: string;
  /** 付款人備註 */
  OrderComment?: string;
  /** 電子發票 */
  INVOICE?: 0 | 1;
}

/** 定期定額回傳結果 */
export interface PeriodicalResult {
  Status: string;
  Message: string;
  Result?: {
    MerchantID: string;
    MerchantOrderNo: string;
    PeriodNo: string;
    AlreadyTimes: number;
    TotalTimes: number;
    PeriodType: PeriodType;
    PeriodPoint: string;
    Amt: number;
    AuthCode?: string;
    AuthDate: string;
    NextAmt?: number;
    NextAuthDate?: string;
    RespondCode?: string;
    EscrowBank?: string;
    Card4No?: string;
    Card6No?: string;
    AuthBank?: string;
    TokenValue?: string;
    TokenLife?: string;
  };
}

/** 定期定額狀態變更請求 */
export interface PeriodicalStatusRequest {
  MerchantID: string;
  PeriodNo: string;
  /** 變更動作: suspend(暫停), terminate(終止), restart(重啟) */
  AlterType: 'suspend' | 'terminate' | 'restart';
}

// ============================================
// 電子發票型別
// ============================================

/** 發票類別 */
export type InvoiceCategory =
  | 'B2B'   // 公司戶
  | 'B2C';  // 個人戶

/** 發票開立資訊 */
export interface InvoiceInfo {
  /** 發票類別 */
  Category: InvoiceCategory;
  /** 買受人統編 (B2B 必填) */
  BuyerUBN?: string;
  /** 買受人名稱 */
  BuyerName?: string;
  /** 買受人地址 */
  BuyerAddress?: string;
  /** 買受人 Email */
  BuyerEmail?: string;
  /** 買受人電話 */
  BuyerPhone?: string;
  /** 載具類別 (0: 會員載具, 1: 手機條碼, 2: 自然人憑證) */
  CarrierType?: '0' | '1' | '2';
  /** 載具編號 */
  CarrierNum?: string;
  /** 愛心碼 */
  LoveCode?: string;
  /** 是否索取紙本發票 (1: 是, 0: 否) */
  PrintFlag?: '0' | '1';
  /** 課稅類別 (1: 應稅, 2: 零稅率, 3: 免稅) */
  TaxType?: '1' | '2' | '3';
  /** 稅率 */
  TaxRate?: number;
  /** 稅額 */
  TaxAmt?: number;
  /** 商品名稱 (每項用 | 分隔) */
  ItemName: string;
  /** 商品數量 (每項用 | 分隔) */
  ItemCount: string;
  /** 商品單位 (每項用 | 分隔) */
  ItemUnit: string;
  /** 商品單價 (每項用 | 分隔) */
  ItemPrice: string;
  /** 商品小計 (每項用 | 分隔) */
  ItemAmt: string;
  /** 備註 */
  Comment?: string;
}

// ============================================
// Webhook 相關型別
// ============================================

/** Webhook 請求資料 */
export interface WebhookPayload {
  Status: string;
  MerchantID: string;
  TradeInfo: string;
  TradeSha: string;
  Version: string;
}

/** 驗證後的 Webhook 資料 */
export interface ValidatedWebhookData {
  isValid: boolean;
  decryptedData?: MPGResult | PeriodicalResult;
  error?: string;
}

// ============================================
// 資料庫模型
// ============================================

/** 訂單狀態 */
export type OrderStatus =
  | 'pending'      // 待付款
  | 'paid'         // 已付款
  | 'failed'       // 付款失敗
  | 'cancelled'    // 已取消
  | 'refunded';    // 已退款

/** 訂閱狀態 */
export type SubscriptionStatus =
  | 'pending'      // 等待首次授權
  | 'active'       // 啟用中
  | 'past_due'     // 付款逾期
  | 'suspended'    // 暫停中
  | 'cancelled'    // 已取消
  | 'terminated'   // 已終止
  | 'expired';     // 已到期

/** 訂單資料表 */
export interface PaymentOrder {
  id: string;
  merchant_order_no: string;
  user_id?: string;
  amount: number;
  item_desc: string;
  email: string;
  payment_method?: string;
  status: OrderStatus;
  newebpay_trade_no?: string;
  auth_code?: string;
  paid_at?: string;
  raw_response?: Record<string, unknown>;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

/** 訂閱資料表 */
export interface Subscription {
  id: string;
  user_id: string;
  merchant_order_no: string;
  period_no?: string;
  period_type: PeriodType;
  period_point: string;
  amount: number;
  total_periods: number;
  completed_periods: number;
  status: SubscriptionStatus;
  period_token?: string;
  next_auth_date?: string | Date;
  last_auth_date?: string | Date;
  last_auth_status?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
  terminated_at?: string | Date;
}

/** 訂閱付款記錄 */
export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  merchant_order_no: string;
  period_no: string;
  period_times: number;
  amount: number;
  status: 'success' | 'failed';
  auth_code?: string;
  auth_date?: string;
  response_code?: string;
  raw_response?: Record<string, unknown>;
  created_at: string;
}

/** 發票記錄 */
export interface Invoice {
  id: string;
  order_id?: string;
  subscription_payment_id?: string;
  invoice_no: string;
  invoice_date: string;
  category: InvoiceCategory;
  buyer_ubn?: string;
  buyer_name?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'issued' | 'void' | 'allowance';
  raw_response?: Record<string, unknown>;
  created_at: string;
}

// ============================================
// API 請求/回應型別
// ============================================

/** 單次付款 API 請求 */
export interface SinglePaymentRequest {
  amount: number;
  itemDesc: string;
  email: string;
  userId?: string;
  paymentMethods?: PaymentMethod[];
  returnUrl?: string;
  notifyUrl?: string;
  clientBackUrl?: string;
  invoice?: InvoiceInfo;
}

/** 單次付款 API 回應 */
export interface SinglePaymentResponse {
  success: boolean;
  data?: {
    merchantOrderNo: string;
    formHtml: string;
    formData: MPGFormData;
    actionUrl: string;
  };
  error?: string;
}

/** 訂閱付款 API 請求 */
export interface SubscribePaymentRequest {
  userId: string;
  amount: number;
  itemDesc: string;
  email: string;
  periodType: PeriodType;
  periodPoint: string;
  totalPeriods: number;
  returnUrl?: string;
  notifyUrl?: string;
  periodNotifyUrl?: string;
  invoice?: InvoiceInfo;
}

/** 訂閱付款 API 回應 */
export interface SubscribePaymentResponse {
  success: boolean;
  data?: {
    merchantOrderNo: string;
    formHtml: string;
    formData: MPGFormData;
    actionUrl: string;
  };
  error?: string;
}

/** 取消訂閱 API 請求 */
export interface CancelSubscriptionRequest {
  subscriptionId: string;
  userId: string;
  reason?: string;
}

/** 取消訂閱 API 回應 */
export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================
// Rate Limiting 型別
// ============================================

/** Rate Limit 設定 */
export interface RateLimitConfig {
  /** 時間窗口 (毫秒) */
  windowMs: number;
  /** 最大請求數 */
  maxRequests: number;
  /** 錯誤訊息 */
  message?: string;
}

/** Rate Limit 記錄 */
export interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// ============================================
// 冪等性 (Idempotency) 型別
// ============================================

/** 冪等性狀態 */
export type IdempotencyStatus =
  | 'PENDING'      // 等待處理
  | 'PROCESSING'   // 處理中
  | 'COMPLETED'    // 已完成
  | 'FAILED';      // 失敗

/** 冪等性記錄 */
export interface IdempotencyRecord {
  /** 唯一識別碼 */
  id: string;
  /** 冪等性 Key (格式: {merchant_id}:{order_no}:{amount}:{hash}) */
  idempotency_key: string;
  /** 處理狀態 */
  status: IdempotencyStatus;
  /** 請求雜湊 (SHA256 of request body) */
  request_hash: string;
  /** 請求類型 (MPG/PERIOD) */
  request_type: 'MPG' | 'PERIOD';
  /** 商店訂單編號 */
  merchant_order_no: string;
  /** 交易金額 */
  amount: number;
  /** 快取的回應資料 */
  response_data?: Record<string, unknown>;
  /** 錯誤訊息 */
  error_message?: string;
  /** 重試次數 */
  retry_count: number;
  /** 建立時間 */
  created_at: string;
  /** 更新時間 */
  updated_at: string;
  /** 過期時間 (預設 24 小時) */
  expires_at: string;
  /** 鎖定時間 (處理中時設定) */
  locked_at?: string;
  /** 鎖定者識別碼 (處理程序 ID) */
  locked_by?: string;
}

/** 冪等性檢查結果 */
export interface IdempotencyCheckResult {
  /** 是否為重複請求 */
  isDuplicate: boolean;
  /** 是否應該處理此請求 */
  shouldProcess: boolean;
  /** 現有記錄 (如果是重複請求) */
  existingRecord?: IdempotencyRecord;
  /** 新建立的記錄 (如果不是重複) */
  newRecord?: IdempotencyRecord;
  /** 快取的回應 (如果已完成) */
  cachedResponse?: Record<string, unknown>;
  /** 處理中的錯誤 */
  error?: string;
}

/** 冪等性配置 */
export interface IdempotencyConfig {
  /** Key 過期時間 (毫秒，預設 24 小時) */
  keyTTL: number;
  /** 處理鎖定超時 (毫秒，預設 5 分鐘) */
  lockTimeout: number;
  /** 最大重試次數 */
  maxRetries: number;
  /** 是否啟用分散式鎖 */
  enableDistributedLock: boolean;
}

// ============================================
// NewebPayVault 安全類別型別
// ============================================

/** 加密結果 */
export interface EncryptionResult {
  /** AES-256-CBC 加密後的 TradeInfo (Hex 編碼) */
  tradeInfo: string;
  /** SHA256 雜湊的 TradeSha (大寫 Hex) */
  tradeSha: string;
  /** 時間戳記 */
  timestamp: number;
}

/** 解密結果 */
export interface DecryptionResult<T = MPGResult | PeriodicalResult> {
  /** 是否解密成功 */
  success: boolean;
  /** 解密後的資料 */
  data?: T;
  /** SHA256 驗證是否通過 */
  isValid: boolean;
  /** 錯誤訊息 */
  error?: string;
}

/** 金鑰驗證結果 */
export interface KeyValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 驗證錯誤列表 */
  errors: string[];
  /** HashKey 長度 */
  hashKeyLength: number;
  /** HashIV 長度 */
  hashIVLength: number;
}

/** 安全審計日誌 */
export interface SecurityAuditLog {
  /** 事件類型 */
  eventType: 'ENCRYPT' | 'DECRYPT' | 'HASH' | 'VALIDATE' | 'KEY_ACCESS';
  /** 時間戳記 */
  timestamp: string;
  /** 商店訂單編號 (如有) */
  merchantOrderNo?: string;
  /** 操作結果 */
  success: boolean;
  /** 錯誤訊息 (如有) */
  error?: string;
  /** 來源 IP */
  sourceIP?: string;
  /** 請求 ID */
  requestId?: string;
}

// ============================================
// 藍新官方 IP 白名單
// ============================================

/** 藍新金流官方 IP (用於 Webhook 驗證) */
export const NEWEBPAY_OFFICIAL_IPS = [
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
  '61.219.166.1',
  '61.219.166.2',
  '61.219.166.3',
  '61.219.166.4',
  '61.219.166.5',
  // 測試環境
  '59.124.47.0/24',
] as const;

/** API 端點 */
export const NEWEBPAY_ENDPOINTS = {
  /** 正式環境 MPG */
  MPG_PROD: 'https://core.newebpay.com/MPG/mpg_gateway',
  /** 測試環境 MPG */
  MPG_TEST: 'https://ccore.newebpay.com/MPG/mpg_gateway',
  /** 正式環境定期定額 */
  PERIOD_PROD: 'https://core.newebpay.com/MPG/period',
  /** 測試環境定期定額 */
  PERIOD_TEST: 'https://ccore.newebpay.com/MPG/period',
  /** 正式環境定期定額狀態變更 */
  PERIOD_ALTER_PROD: 'https://core.newebpay.com/MPG/period/AlterStatus',
  /** 測試環境定期定額狀態變更 */
  PERIOD_ALTER_TEST: 'https://ccore.newebpay.com/MPG/period/AlterStatus',
} as const;
