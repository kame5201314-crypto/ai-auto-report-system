/**
 * API Rate Limiting 中介軟體
 * 防止暴力破解和惡意請求
 *
 * @module payment/middleware/rateLimiter
 */

import type { RateLimitConfig, RateLimitRecord } from '../types';
import { supabase } from '../../lib/supabase';

/**
 * 預設 Rate Limit 設定
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 分鐘
  maxRequests: 10,     // 每分鐘最多 10 次請求
  message: '請求過於頻繁，請稍後再試',
};

/**
 * 內存快取 (用於快速驗證)
 */
const memoryCache: Map<string, RateLimitRecord> = new Map();

/**
 * Rate Limiter 類別
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private useDatabase: boolean;

  constructor(config?: Partial<RateLimitConfig>, useDatabase: boolean = false) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.useDatabase = useDatabase;
  }

  /**
   * 檢查請求是否被允許
   * @param identifier - 識別符（IP 或使用者 ID）
   * @param endpoint - API 端點
   * @returns 是否允許請求
   */
  async isAllowed(identifier: string, endpoint: string = 'default'): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    message?: string;
  }> {
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();

    // 從快取取得記錄
    let record = memoryCache.get(key);

    // 檢查是否需要重置
    if (!record || now >= record.resetAt) {
      record = {
        count: 0,
        resetAt: now + this.config.windowMs,
      };
    }

    // 增加計數
    record.count++;

    // 更新快取
    memoryCache.set(key, record);

    // 如果啟用資料庫，同步到資料庫
    if (this.useDatabase) {
      await this.syncToDatabase(identifier, endpoint, record);
    }

    const remaining = Math.max(0, this.config.maxRequests - record.count);
    const allowed = record.count <= this.config.maxRequests;

    return {
      allowed,
      remaining,
      resetAt: record.resetAt,
      message: allowed ? undefined : this.config.message,
    };
  }

  /**
   * 同步到資料庫
   */
  private async syncToDatabase(
    identifier: string,
    endpoint: string,
    record: RateLimitRecord
  ): Promise<void> {
    try {
      const windowStart = new Date(record.resetAt - this.config.windowMs).toISOString();

      // 嘗試更新現有記錄，否則插入新記錄
      const { error } = await supabase.rpc('upsert_rate_limit', {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_count: record.count,
        p_window_start: windowStart,
      });

      if (error) {
        // 如果 RPC 不存在，使用普通的 upsert
        await supabase
          .from('rate_limit_records')
          .upsert({
            identifier,
            endpoint,
            request_count: record.count,
            window_start: windowStart,
          }, {
            onConflict: 'identifier,endpoint',
          });
      }
    } catch (error) {
      console.warn('同步 Rate Limit 到資料庫失敗:', error);
    }
  }

  /**
   * 重置特定識別符的計數
   */
  reset(identifier: string, endpoint: string = 'default'): void {
    const key = `${identifier}:${endpoint}`;
    memoryCache.delete(key);
  }

  /**
   * 清理過期記錄
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of memoryCache.entries()) {
      if (now >= record.resetAt) {
        memoryCache.delete(key);
      }
    }
  }

  /**
   * 取得統計資訊
   */
  getStats(): {
    totalRecords: number;
    activeRecords: number;
  } {
    const now = Date.now();
    let activeRecords = 0;

    for (const record of memoryCache.values()) {
      if (now < record.resetAt) {
        activeRecords++;
      }
    }

    return {
      totalRecords: memoryCache.size,
      activeRecords,
    };
  }
}

/**
 * 預設設定的 Rate Limiter 工廠
 */
export const rateLimiters = {
  /**
   * 付款 API Rate Limiter（嚴格）
   */
  payment: new RateLimiter({
    windowMs: 60 * 1000,  // 1 分鐘
    maxRequests: 5,       // 每分鐘最多 5 次
    message: '付款請求過於頻繁，請稍後再試',
  }),

  /**
   * Webhook Rate Limiter（較寬鬆）
   */
  webhook: new RateLimiter({
    windowMs: 60 * 1000,  // 1 分鐘
    maxRequests: 100,     // 每分鐘最多 100 次
    message: 'Webhook 請求過於頻繁',
  }),

  /**
   * 查詢 API Rate Limiter（一般）
   */
  query: new RateLimiter({
    windowMs: 60 * 1000,  // 1 分鐘
    maxRequests: 30,      // 每分鐘最多 30 次
    message: '查詢請求過於頻繁，請稍後再試',
  }),

  /**
   * 訂閱操作 Rate Limiter（嚴格）
   */
  subscription: new RateLimiter({
    windowMs: 60 * 1000,  // 1 分鐘
    maxRequests: 3,       // 每分鐘最多 3 次
    message: '訂閱操作過於頻繁，請稍後再試',
  }),
};

/**
 * 建立自訂 Rate Limiter
 */
export function createRateLimiter(config: Partial<RateLimitConfig>): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Express/Koa 風格的中介軟體包裝器
 */
export function rateLimitMiddleware(limiter: RateLimiter) {
  return async (
    req: { ip?: string; headers?: Record<string, string>; userId?: string },
    res: { status: (code: number) => { json: (data: unknown) => void } },
    next: () => void
  ) => {
    // 優先使用使用者 ID，其次使用 IP
    const identifier = req.userId ||
      req.headers?.['x-forwarded-for']?.split(',')[0].trim() ||
      req.ip ||
      'unknown';

    const result = await limiter.isAllowed(identifier);

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: result.message,
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
    }

    next();
  };
}

/**
 * 定期清理過期記錄
 */
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
}, 60 * 1000); // 每分鐘清理一次

export default RateLimiter;
