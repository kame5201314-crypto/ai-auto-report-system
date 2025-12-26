/**
 * 安全錯誤處理模組 (Secure Error Handler)
 *
 * 遮蔽敏感錯誤資訊
 * 防止資訊洩漏
 */

import {
  SecurityError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  RateLimitError,
} from './types';
import { auditLogger } from './auditLogger';

// ============================================
// 類型定義
// ============================================

export interface ErrorResponse {
  /** 錯誤代碼 */
  code: string;
  /** 使用者友善的錯誤訊息 */
  message: string;
  /** 錯誤類型 */
  type: ErrorType;
  /** HTTP 狀態碼 */
  statusCode: number;
  /** 額外資訊（非敏感） */
  details?: Record<string, unknown>;
  /** 請求 ID */
  requestId?: string;
  /** 時間戳 */
  timestamp: string;
}

export type ErrorType =
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'rate_limit'
  | 'not_found'
  | 'conflict'
  | 'internal'
  | 'network'
  | 'timeout'
  | 'unknown';

export interface ErrorHandlerConfig {
  /** 是否顯示詳細錯誤（僅開發環境） */
  showDetailedErrors: boolean;
  /** 是否記錄錯誤 */
  logErrors: boolean;
  /** 是否記錄審計日誌 */
  auditLog: boolean;
  /** 敏感關鍵字列表 */
  sensitiveKeywords: string[];
  /** 自定義錯誤訊息 */
  customMessages?: Record<string, string>;
}

// ============================================
// 預設設定
// ============================================

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  showDetailedErrors: process.env.NODE_ENV === 'development',
  logErrors: true,
  auditLog: true,
  sensitiveKeywords: [
    'password',
    'token',
    'secret',
    'key',
    'credential',
    'auth',
    'session',
    'cookie',
    'jwt',
    'bearer',
    'api_key',
    'apikey',
    'private',
    'database',
    'connection',
    'sql',
    'query',
  ],
};

// ============================================
// 預設錯誤訊息
// ============================================

const DEFAULT_ERROR_MESSAGES: Record<ErrorType, string> = {
  authentication: '請先登入以繼續操作',
  authorization: '您沒有執行此操作的權限',
  validation: '輸入資料格式有誤，請檢查後重試',
  rate_limit: '請求過於頻繁，請稍後再試',
  not_found: '找不到請求的資源',
  conflict: '操作衝突，資源可能已被修改',
  internal: '系統發生錯誤，請稍後再試',
  network: '網路連線異常，請檢查網路後重試',
  timeout: '請求逾時，請稍後再試',
  unknown: '發生未知錯誤，請稍後再試',
};

// ============================================
// 錯誤處理類別
// ============================================

export class SecureErrorHandler {
  private config: ErrorHandlerConfig;
  private requestId: string = '';

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 設定請求 ID
   */
  setRequestId(id: string): void {
    this.requestId = id;
  }

  /**
   * 生成請求 ID
   */
  generateRequestId(): string {
    this.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.requestId;
  }

  /**
   * 處理錯誤並返回安全的錯誤回應
   */
  handle(error: unknown, context?: Record<string, unknown>): ErrorResponse {
    // 生成請求 ID（如果沒有）
    if (!this.requestId) {
      this.generateRequestId();
    }

    const errorResponse = this.createErrorResponse(error);

    // 記錄錯誤
    if (this.config.logErrors) {
      this.logError(error, errorResponse, context);
    }

    // 審計日誌
    if (this.config.auditLog) {
      this.auditLogError(error, errorResponse, context);
    }

    return errorResponse;
  }

  /**
   * 建立錯誤回應
   */
  private createErrorResponse(error: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    // 處理已知的安全錯誤
    if (error instanceof SecurityError) {
      return this.handleSecurityError(error, timestamp);
    }

    // 處理一般錯誤
    if (error instanceof Error) {
      return this.handleGenericError(error, timestamp);
    }

    // 處理未知錯誤
    return {
      code: 'UNKNOWN_ERROR',
      message: DEFAULT_ERROR_MESSAGES.unknown,
      type: 'unknown',
      statusCode: 500,
      requestId: this.requestId,
      timestamp,
    };
  }

  /**
   * 處理安全相關錯誤
   */
  private handleSecurityError(error: SecurityError, timestamp: string): ErrorResponse {
    if (error instanceof AuthenticationError) {
      return {
        code: 'AUTH_REQUIRED',
        message: this.config.showDetailedErrors
          ? error.message
          : DEFAULT_ERROR_MESSAGES.authentication,
        type: 'authentication',
        statusCode: 401,
        requestId: this.requestId,
        timestamp,
      };
    }

    if (error instanceof AuthorizationError) {
      return {
        code: 'ACCESS_DENIED',
        message: this.config.showDetailedErrors
          ? error.message
          : DEFAULT_ERROR_MESSAGES.authorization,
        type: 'authorization',
        statusCode: 403,
        details: this.config.showDetailedErrors
          ? { requiredPermission: error.requiredPermission }
          : undefined,
        requestId: this.requestId,
        timestamp,
      };
    }

    if (error instanceof ValidationError) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        type: 'validation',
        statusCode: 400,
        details: { errors: error.errors },
        requestId: this.requestId,
        timestamp,
      };
    }

    if (error instanceof RateLimitError) {
      return {
        code: 'RATE_LIMITED',
        message: error.message,
        type: 'rate_limit',
        statusCode: 429,
        details: { retryAfter: error.retryAfter },
        requestId: this.requestId,
        timestamp,
      };
    }

    // 其他安全錯誤
    return {
      code: 'SECURITY_ERROR',
      message: this.config.showDetailedErrors
        ? error.message
        : DEFAULT_ERROR_MESSAGES.internal,
      type: 'internal',
      statusCode: 500,
      requestId: this.requestId,
      timestamp,
    };
  }

  /**
   * 處理一般錯誤
   */
  private handleGenericError(error: Error, timestamp: string): ErrorResponse {
    // 檢測錯誤類型
    const errorType = this.detectErrorType(error);
    const statusCode = this.getStatusCode(errorType);

    // 遮蔽敏感資訊
    const safeMessage = this.maskSensitiveInfo(error.message);

    return {
      code: this.getErrorCode(errorType),
      message: this.config.showDetailedErrors
        ? safeMessage
        : DEFAULT_ERROR_MESSAGES[errorType],
      type: errorType,
      statusCode,
      details: this.config.showDetailedErrors
        ? { stack: this.maskSensitiveInfo(error.stack || '') }
        : undefined,
      requestId: this.requestId,
      timestamp,
    };
  }

  /**
   * 偵測錯誤類型
   */
  private detectErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('network') || name.includes('network')) {
      return 'network';
    }
    if (message.includes('timeout') || name.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'not_found';
    }
    if (message.includes('conflict') || message.includes('409')) {
      return 'conflict';
    }
    if (message.includes('validation') || name.includes('validation')) {
      return 'validation';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'authentication';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return 'authorization';
    }

    return 'internal';
  }

  /**
   * 取得 HTTP 狀態碼
   */
  private getStatusCode(type: ErrorType): number {
    const statusCodes: Record<ErrorType, number> = {
      authentication: 401,
      authorization: 403,
      validation: 400,
      rate_limit: 429,
      not_found: 404,
      conflict: 409,
      internal: 500,
      network: 503,
      timeout: 504,
      unknown: 500,
    };
    return statusCodes[type];
  }

  /**
   * 取得錯誤代碼
   */
  private getErrorCode(type: ErrorType): string {
    const codes: Record<ErrorType, string> = {
      authentication: 'AUTH_REQUIRED',
      authorization: 'ACCESS_DENIED',
      validation: 'VALIDATION_ERROR',
      rate_limit: 'RATE_LIMITED',
      not_found: 'NOT_FOUND',
      conflict: 'CONFLICT',
      internal: 'INTERNAL_ERROR',
      network: 'NETWORK_ERROR',
      timeout: 'TIMEOUT',
      unknown: 'UNKNOWN_ERROR',
    };
    return codes[type];
  }

  /**
   * 遮蔽敏感資訊
   */
  private maskSensitiveInfo(text: string): string {
    let masked = text;

    for (const keyword of this.config.sensitiveKeywords) {
      // 遮蔽 key=value 格式
      const keyValueRegex = new RegExp(
        `(${keyword}[\\s]*[=:]\\s*)([^\\s,;]+)`,
        'gi'
      );
      masked = masked.replace(keyValueRegex, '$1***');

      // 遮蔽 "key": "value" 格式
      const jsonRegex = new RegExp(
        `("${keyword}"\\s*:\\s*)"[^"]*"`,
        'gi'
      );
      masked = masked.replace(jsonRegex, '$1"***"');
    }

    // 遮蔽 Email
    masked = masked.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '***@***.***'
    );

    // 遮蔽 IP 地址
    masked = masked.replace(
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      '***.***.***.***'
    );

    // 遮蔽檔案路徑
    masked = masked.replace(
      /[A-Za-z]:\\[^\s:*?"<>|]+/g,
      '***\\***'
    );
    masked = masked.replace(
      /\/(?:home|var|etc|usr|opt)\/[^\s:*?"<>|]+/g,
      '/***/***/***'
    );

    return masked;
  }

  /**
   * 記錄錯誤
   */
  private logError(
    error: unknown,
    response: ErrorResponse,
    context?: Record<string, unknown>
  ): void {
    const logData = {
      requestId: this.requestId,
      errorType: response.type,
      statusCode: response.statusCode,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: response.timestamp,
    };

    if (response.statusCode >= 500) {
      console.error('[ERROR]', JSON.stringify(logData, null, 2));
    } else if (response.statusCode >= 400) {
      console.warn('[WARN]', JSON.stringify(logData, null, 2));
    } else {
      console.log('[INFO]', JSON.stringify(logData, null, 2));
    }
  }

  /**
   * 記錄審計日誌
   */
  private auditLogError(
    error: unknown,
    response: ErrorResponse,
    context?: Record<string, unknown>
  ): void {
    auditLogger.logSecurityEvent({
      action: 'error',
      details: {
        errorCode: response.code,
        errorType: response.type,
        statusCode: response.statusCode,
        requestId: this.requestId,
        ...context,
      },
      success: false,
      errorMessage: response.message,
    });
  }
}

// ============================================
// 預設實例
// ============================================

export const errorHandler = new SecureErrorHandler();

// ============================================
// 便捷函數
// ============================================

/**
 * 處理錯誤
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): ErrorResponse {
  return errorHandler.handle(error, context);
}

/**
 * 建立安全的錯誤回應
 */
export function createErrorResponse(
  type: ErrorType,
  message?: string,
  details?: Record<string, unknown>
): ErrorResponse {
  const errorHandler = new SecureErrorHandler();
  return {
    code: errorHandler['getErrorCode'](type),
    message: message || DEFAULT_ERROR_MESSAGES[type],
    type,
    statusCode: errorHandler['getStatusCode'](type),
    details,
    requestId: errorHandler.generateRequestId(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * 判斷是否為安全錯誤
 */
export function isSecurityError(error: unknown): error is SecurityError {
  return error instanceof SecurityError;
}

/**
 * 判斷是否為認證錯誤
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * 判斷是否為授權錯誤
 */
export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

// ============================================
// 導出
// ============================================

export default errorHandler;
