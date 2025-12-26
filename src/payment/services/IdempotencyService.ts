/**
 * IdempotencyService - 交易冪等性服務
 *
 * 核心目標：確保同一筆訂單不會重複扣款
 *
 * 冪等性機制設計：
 * 1. 唯一識別：使用 {merchant_id}:{order_no}:{amount}:{request_hash} 作為冪等性 Key
 * 2. 狀態機：PENDING → PROCESSING → COMPLETED/FAILED
 * 3. 分散式鎖：防止併發處理同一請求
 * 4. 快取回應：已完成的請求直接返回快取結果
 * 5. 過期清理：24 小時後自動清除過期記錄
 *
 * @module payment/services/IdempotencyService
 */

import * as crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  IdempotencyRecord,
  IdempotencyCheckResult,
  IdempotencyConfig,
  IdempotencyStatus,
} from '../types';
import { loadIdempotencyConfig } from '../config/newebpay.config';

// ============================================
// 常量定義
// ============================================

/** 預設處理程序 ID (用於識別鎖定者) */
const PROCESS_ID = `${process.env.HOSTNAME || 'local'}_${process.pid}_${Date.now()}`;

/** 資料表名稱 */
const TABLE_NAME = 'payment_idempotency_keys';

// ============================================
// IdempotencyService 類別
// ============================================

/**
 * 交易冪等性服務
 *
 * 使用方式：
 * ```typescript
 * const service = new IdempotencyService(supabaseClient);
 *
 * // 1. 開始處理前檢查
 * const check = await service.checkAndLock({
 *   merchantId: 'MERCHANT_001',
 *   orderNo: 'VP123456789',
 *   amount: 1000,
 *   requestBody: { ... }
 * });
 *
 * if (check.isDuplicate && check.cachedResponse) {
 *   // 返回快取結果
 *   return check.cachedResponse;
 * }
 *
 * if (!check.shouldProcess) {
 *   // 正在處理中，返回衝突
 *   throw new Error('Request is being processed');
 * }
 *
 * // 2. 執行實際交易
 * try {
 *   const result = await processPayment(...);
 *   await service.markCompleted(check.newRecord!.id, result);
 *   return result;
 * } catch (error) {
 *   await service.markFailed(check.newRecord!.id, error.message);
 *   throw error;
 * }
 * ```
 */
export class IdempotencyService {
  private readonly supabase: SupabaseClient;
  private readonly config: IdempotencyConfig;
  private readonly processId: string;

  constructor(supabaseClient?: SupabaseClient) {
    // 初始化 Supabase 客戶端
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                          process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    this.config = loadIdempotencyConfig();
    this.processId = PROCESS_ID;
  }

  // ============================================
  // 核心冪等性方法
  // ============================================

  /**
   * 檢查請求並嘗試取得處理鎖
   *
   * 這是冪等性機制的核心入口點
   *
   * @param params - 請求參數
   * @returns 冪等性檢查結果
   */
  public async checkAndLock(params: {
    merchantId: string;
    orderNo: string;
    amount: number;
    requestType: 'MPG' | 'PERIOD';
    requestBody: Record<string, unknown>;
  }): Promise<IdempotencyCheckResult> {
    const { merchantId, orderNo, amount, requestType, requestBody } = params;

    // 計算請求雜湊
    const requestHash = this.hashRequest(requestBody);

    // 生成冪等性 Key
    const idempotencyKey = this.generateIdempotencyKey(
      merchantId,
      orderNo,
      amount,
      requestHash
    );

    try {
      // 查詢現有記錄
      const { data: existingRecord, error: queryError } = await this.supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 = 找不到記錄 (正常情況)
        throw queryError;
      }

      // 情況 1: 找到現有記錄
      if (existingRecord) {
        return this.handleExistingRecord(existingRecord as IdempotencyRecord, requestHash);
      }

      // 情況 2: 新請求，建立記錄並取得鎖
      const newRecord = await this.createAndLockRecord({
        idempotencyKey,
        requestHash,
        requestType,
        merchantOrderNo: orderNo,
        amount,
      });

      return {
        isDuplicate: false,
        shouldProcess: true,
        newRecord,
      };

    } catch (error) {
      // 處理競爭條件：可能有其他程序同時建立了記錄
      if (this.isUniqueViolationError(error)) {
        // 重新查詢並處理
        const { data: record } = await this.supabase
          .from(TABLE_NAME)
          .select('*')
          .eq('idempotency_key', idempotencyKey)
          .single();

        if (record) {
          return this.handleExistingRecord(record as IdempotencyRecord, requestHash);
        }
      }

      throw error;
    }
  }

  /**
   * 處理已存在的冪等性記錄
   */
  private async handleExistingRecord(
    record: IdempotencyRecord,
    currentRequestHash: string
  ): Promise<IdempotencyCheckResult> {
    // 驗證請求內容是否一致
    if (record.request_hash !== currentRequestHash) {
      return {
        isDuplicate: true,
        shouldProcess: false,
        existingRecord: record,
        error: 'Idempotency key collision: request content mismatch',
      };
    }

    switch (record.status) {
      case 'COMPLETED':
        // 已完成：返回快取結果
        return {
          isDuplicate: true,
          shouldProcess: false,
          existingRecord: record,
          cachedResponse: record.response_data,
        };

      case 'FAILED':
        // 失敗：檢查是否可以重試
        if (record.retry_count < this.config.maxRetries) {
          // 允許重試，嘗試取得鎖
          const locked = await this.tryAcquireLock(record.id);
          if (locked) {
            await this.incrementRetryCount(record.id);
            return {
              isDuplicate: true,
              shouldProcess: true,
              existingRecord: record,
            };
          }
        }
        return {
          isDuplicate: true,
          shouldProcess: false,
          existingRecord: record,
          error: `Transaction failed: ${record.error_message}`,
        };

      case 'PROCESSING':
        // 處理中：檢查鎖是否過期
        if (this.isLockExpired(record)) {
          // 鎖已過期，嘗試取得
          const locked = await this.tryAcquireLock(record.id);
          if (locked) {
            return {
              isDuplicate: true,
              shouldProcess: true,
              existingRecord: record,
            };
          }
        }
        return {
          isDuplicate: true,
          shouldProcess: false,
          existingRecord: record,
          error: 'Request is currently being processed',
        };

      case 'PENDING':
      default:
        // 待處理：嘗試取得鎖
        const locked = await this.tryAcquireLock(record.id);
        if (locked) {
          return {
            isDuplicate: true,
            shouldProcess: true,
            existingRecord: record,
          };
        }
        return {
          isDuplicate: true,
          shouldProcess: false,
          existingRecord: record,
          error: 'Request is being acquired by another process',
        };
    }
  }

  /**
   * 建立新記錄並鎖定
   */
  private async createAndLockRecord(params: {
    idempotencyKey: string;
    requestHash: string;
    requestType: 'MPG' | 'PERIOD';
    merchantOrderNo: string;
    amount: number;
  }): Promise<IdempotencyRecord> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.keyTTL);

    const newRecord = {
      id: crypto.randomUUID(),
      idempotency_key: params.idempotencyKey,
      status: 'PROCESSING' as IdempotencyStatus,
      request_hash: params.requestHash,
      request_type: params.requestType,
      merchant_order_no: params.merchantOrderNo,
      amount: params.amount,
      retry_count: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      locked_at: now.toISOString(),
      locked_by: this.processId,
    };

    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as IdempotencyRecord;
  }

  // ============================================
  // 狀態更新方法
  // ============================================

  /**
   * 標記交易完成
   *
   * @param recordId - 記錄 ID
   * @param responseData - 回應資料
   */
  public async markCompleted(
    recordId: string,
    responseData: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE_NAME)
      .update({
        status: 'COMPLETED' as IdempotencyStatus,
        response_data: responseData,
        updated_at: new Date().toISOString(),
        locked_at: null,
        locked_by: null,
      })
      .eq('id', recordId)
      .eq('locked_by', this.processId); // 確保只有鎖定者可以更新

    if (error) {
      throw new Error(`Failed to mark completed: ${error.message}`);
    }
  }

  /**
   * 標記交易失敗
   *
   * @param recordId - 記錄 ID
   * @param errorMessage - 錯誤訊息
   */
  public async markFailed(
    recordId: string,
    errorMessage: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from(TABLE_NAME)
      .update({
        status: 'FAILED' as IdempotencyStatus,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
        locked_at: null,
        locked_by: null,
      })
      .eq('id', recordId)
      .eq('locked_by', this.processId);

    if (error) {
      throw new Error(`Failed to mark failed: ${error.message}`);
    }
  }

  /**
   * 釋放鎖定 (不改變狀態)
   */
  public async releaseLock(recordId: string): Promise<void> {
    await this.supabase
      .from(TABLE_NAME)
      .update({
        status: 'PENDING' as IdempotencyStatus,
        locked_at: null,
        locked_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId)
      .eq('locked_by', this.processId);
  }

  // ============================================
  // 鎖定管理
  // ============================================

  /**
   * 嘗試取得處理鎖
   *
   * 使用樂觀鎖定機制，防止併發衝突
   */
  private async tryAcquireLock(recordId: string): Promise<boolean> {
    const now = new Date();

    // 使用條件更新實現樂觀鎖
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .update({
        status: 'PROCESSING' as IdempotencyStatus,
        locked_at: now.toISOString(),
        locked_by: this.processId,
        updated_at: now.toISOString(),
      })
      .eq('id', recordId)
      .or(`locked_by.is.null,locked_at.lt.${new Date(now.getTime() - this.config.lockTimeout).toISOString()}`)
      .select()
      .single();

    return !error && !!data;
  }

  /**
   * 檢查鎖是否過期
   */
  private isLockExpired(record: IdempotencyRecord): boolean {
    if (!record.locked_at) {
      return true;
    }

    const lockedAt = new Date(record.locked_at);
    const expirationTime = lockedAt.getTime() + this.config.lockTimeout;

    return Date.now() > expirationTime;
  }

  /**
   * 增加重試計數
   */
  private async incrementRetryCount(recordId: string): Promise<void> {
    await this.supabase.rpc('increment_retry_count', { record_id: recordId });
  }

  // ============================================
  // 輔助方法
  // ============================================

  /**
   * 生成冪等性 Key
   *
   * 格式: {merchant_id}:{order_no}:{amount}:{hash_prefix}
   */
  private generateIdempotencyKey(
    merchantId: string,
    orderNo: string,
    amount: number,
    requestHash: string
  ): string {
    return `${merchantId}:${orderNo}:${amount}:${requestHash.slice(0, 16)}`;
  }

  /**
   * 計算請求雜湊
   */
  private hashRequest(data: Record<string, unknown>): string {
    const sortedJson = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(sortedJson).digest('hex');
  }

  /**
   * 檢查是否為唯一約束違反錯誤
   */
  private isUniqueViolationError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      // PostgreSQL unique violation: 23505
      return (error as { code: string }).code === '23505';
    }
    return false;
  }

  // ============================================
  // 清理與維護
  // ============================================

  /**
   * 清理過期記錄
   *
   * 建議定期執行 (如每小時)
   */
  public async cleanupExpiredRecords(): Promise<number> {
    const { data, error } = await this.supabase
      .from(TABLE_NAME)
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw new Error(`Cleanup failed: ${error.message}`);
    }

    return data?.length || 0;
  }

  /**
   * 取得訂單的冪等性狀態
   */
  public async getOrderStatus(
    merchantId: string,
    orderNo: string
  ): Promise<IdempotencyRecord | null> {
    const { data } = await this.supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('merchant_order_no', orderNo)
      .like('idempotency_key', `${merchantId}:${orderNo}:%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data as IdempotencyRecord | null;
  }

  /**
   * 強制解除卡住的鎖 (管理員用)
   *
   * @param recordId - 記錄 ID
   * @param adminKey - 管理員金鑰 (從環境變數驗證)
   */
  public async forceReleaseLock(
    recordId: string,
    adminKey: string
  ): Promise<boolean> {
    const expectedKey = process.env.IDEMPOTENCY_ADMIN_KEY;
    if (!expectedKey || adminKey !== expectedKey) {
      throw new Error('Unauthorized: Invalid admin key');
    }

    const { error } = await this.supabase
      .from(TABLE_NAME)
      .update({
        status: 'PENDING' as IdempotencyStatus,
        locked_at: null,
        locked_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    return !error;
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    pendingCount: number;
    processingCount: number;
    stuckCount: number;
  }> {
    try {
      const lockTimeout = new Date(Date.now() - this.config.lockTimeout);

      const [pending, processing, stuck] = await Promise.all([
        this.supabase
          .from(TABLE_NAME)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'PENDING'),
        this.supabase
          .from(TABLE_NAME)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'PROCESSING'),
        this.supabase
          .from(TABLE_NAME)
          .select('id', { count: 'exact', head: true })
          .eq('status', 'PROCESSING')
          .lt('locked_at', lockTimeout.toISOString()),
      ]);

      return {
        status: 'healthy',
        pendingCount: pending.count || 0,
        processingCount: processing.count || 0,
        stuckCount: stuck.count || 0,
      };
    } catch {
      return {
        status: 'unhealthy',
        pendingCount: 0,
        processingCount: 0,
        stuckCount: 0,
      };
    }
  }
}

export default IdempotencyService;
