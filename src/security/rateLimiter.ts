/**
 * 速率限制模組 (Rate Limiter)
 *
 * 防止 API 濫用與暴力破解攻擊
 * 支援滑動窗口算法
 */

import { RateLimitError } from './types';

// ============================================
// 類型定義
// ============================================

export interface RateLimitConfig {
  /** 時間窗口（毫秒） */
  windowMs: number;
  /** 窗口內最大請求數 */
  maxRequests: number;
  /** 達到限制後的封鎖時間（毫秒） */
  blockDuration?: number;
  /** 錯誤訊息 */
  message?: string;
  /** 跳過的 key（例如白名單 IP） */
  skipKeys?: string[];
  /** 自定義 key 生成器 */
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitEntry {
  /** 請求時間戳列表 */
  timestamps: number[];
  /** 是否被封鎖 */
  blocked: boolean;
  /** 封鎖到期時間 */
  blockedUntil?: number;
  /** 總請求次數 */
  totalRequests: number;
}

export interface RateLimitResult {
  /** 是否允許請求 */
  allowed: boolean;
  /** 剩餘請求數 */
  remaining: number;
  /** 重置時間（毫秒時間戳） */
  resetTime: number;
  /** 是否被封鎖 */
  blocked: boolean;
  /** 封鎖剩餘時間（毫秒） */
  retryAfter?: number;
}

// ============================================
// 速率限制器類別
// ============================================

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: Required<RateLimitConfig>;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      blockDuration: config.blockDuration || config.windowMs * 2,
      message: config.message || '請求過於頻繁，請稍後再試',
      skipKeys: config.skipKeys || [],
      keyGenerator: config.keyGenerator || ((id) => id),
    };

    // 啟動定期清理
    this.startCleanup();
  }

  /**
   * 檢查並記錄請求
   */
  check(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();

    // 檢查是否在跳過列表中
    if (this.config.skipKeys.includes(key)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        blocked: false,
      };
    }

    let entry = this.store.get(key);

    // 初始化新條目
    if (!entry) {
      entry = {
        timestamps: [],
        blocked: false,
        totalRequests: 0,
      };
      this.store.set(key, entry);
    }

    // 檢查是否被封鎖
    if (entry.blocked && entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.blockedUntil,
          blocked: true,
          retryAfter: entry.blockedUntil - now,
        };
      }
      // 封鎖已過期，重置
      entry.blocked = false;
      entry.blockedUntil = undefined;
      entry.timestamps = [];
    }

    // 清除過期的時間戳
    const windowStart = now - this.config.windowMs;
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    // 計算剩餘配額
    const remaining = this.config.maxRequests - entry.timestamps.length;

    if (remaining <= 0) {
      // 達到限制，啟動封鎖
      entry.blocked = true;
      entry.blockedUntil = now + this.config.blockDuration;

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blocked: true,
        retryAfter: this.config.blockDuration,
      };
    }

    // 記錄此次請求
    entry.timestamps.push(now);
    entry.totalRequests++;

    return {
      allowed: true,
      remaining: remaining - 1,
      resetTime: now + this.config.windowMs,
      blocked: false,
    };
  }

  /**
   * 消耗配額（不檢查是否允許）
   */
  consume(identifier: string, tokens: number = 1): RateLimitResult {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();

    let entry = this.store.get(key);

    if (!entry) {
      entry = {
        timestamps: [],
        blocked: false,
        totalRequests: 0,
      };
      this.store.set(key, entry);
    }

    // 添加多個時間戳
    for (let i = 0; i < tokens; i++) {
      entry.timestamps.push(now);
    }
    entry.totalRequests += tokens;

    // 清除過期
    const windowStart = now - this.config.windowMs;
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    const remaining = Math.max(0, this.config.maxRequests - entry.timestamps.length);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime: now + this.config.windowMs,
      blocked: entry.blocked,
    };
  }

  /**
   * 檢查是否允許請求（不記錄）
   */
  isAllowed(identifier: string): boolean {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry) return true;

    // 檢查封鎖狀態
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // 計算當前窗口內的請求數
    const windowStart = now - this.config.windowMs;
    const recentRequests = entry.timestamps.filter((ts) => ts > windowStart).length;

    return recentRequests < this.config.maxRequests;
  }

  /**
   * 重置特定標識符的限制
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    this.store.delete(key);
  }

  /**
   * 手動封鎖標識符
   */
  block(identifier: string, duration?: number): void {
    const key = this.config.keyGenerator(identifier);
    const blockDuration = duration || this.config.blockDuration;
    const now = Date.now();

    this.store.set(key, {
      timestamps: [],
      blocked: true,
      blockedUntil: now + blockDuration,
      totalRequests: 0,
    });
  }

  /**
   * 解除封鎖
   */
  unblock(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);

    if (entry) {
      entry.blocked = false;
      entry.blockedUntil = undefined;
    }
  }

  /**
   * 取得標識符的統計資訊
   */
  getStats(identifier: string): {
    totalRequests: number;
    recentRequests: number;
    isBlocked: boolean;
    blockedUntil?: number;
  } | null {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);

    if (!entry) return null;

    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentRequests = entry.timestamps.filter((ts) => ts > windowStart).length;

    return {
      totalRequests: entry.totalRequests,
      recentRequests,
      isBlocked: entry.blocked && !!entry.blockedUntil && now < entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
    };
  }

  /**
   * 清除過期條目
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, entry] of this.store.entries()) {
      // 過濾過期時間戳
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

      // 檢查封鎖是否過期
      if (entry.blocked && entry.blockedUntil && now >= entry.blockedUntil) {
        entry.blocked = false;
        entry.blockedUntil = undefined;
      }

      // 移除空條目
      if (entry.timestamps.length === 0 && !entry.blocked) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 啟動定期清理
   */
  private startCleanup(): void {
    // 每分鐘清理一次
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * 停止清理並釋放資源
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  /**
   * 取得當前儲存大小
   */
  get size(): number {
    return this.store.size;
  }
}

// ============================================
// 預設限制器實例
// ============================================

/** API 請求限制器：每分鐘 60 次 */
export const apiLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'API 請求過於頻繁',
});

/** 登入嘗試限制器：每 15 分鐘 5 次 */
export const loginLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  blockDuration: 30 * 60 * 1000, // 封鎖 30 分鐘
  message: '登入嘗試次數過多，帳號已暫時鎖定',
});

/** 密碼重置限制器：每小時 3 次 */
export const passwordResetLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  message: '密碼重置請求過於頻繁',
});

/** 註冊限制器：每小時 5 次（每 IP） */
export const registrationLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: '註冊請求過於頻繁',
});

/** 驗證碼限制器：每分鐘 1 次 */
export const otpLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 1,
  message: '驗證碼請求過於頻繁',
});

// ============================================
// 便捷函數
// ============================================

/**
 * 檢查 API 請求是否允許
 */
export function checkApiLimit(identifier: string): RateLimitResult {
  return apiLimiter.check(identifier);
}

/**
 * 檢查登入嘗試是否允許
 */
export function checkLoginLimit(identifier: string): RateLimitResult {
  return loginLimiter.check(identifier);
}

/**
 * 執行速率限制檢查，如果被拒絕則拋出錯誤
 */
export function assertRateLimit(
  limiter: RateLimiter,
  identifier: string
): void {
  const result = limiter.check(identifier);

  if (!result.allowed) {
    throw new RateLimitError(
      limiter['config'].message,
      result.retryAfter || 0
    );
  }
}

/**
 * 建立自定義限制器
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

// ============================================
// 導出
// ============================================

export const rateLimiter = {
  RateLimiter,
  apiLimiter,
  loginLimiter,
  passwordResetLimiter,
  registrationLimiter,
  otpLimiter,
  checkApiLimit,
  checkLoginLimit,
  assertRateLimit,
  createRateLimiter,
};

export default rateLimiter;
