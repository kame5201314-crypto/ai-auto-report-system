/**
 * 審計日誌模組 (Audit Logger)
 *
 * 記錄所有安全相關操作
 * 支援本地儲存與遠端同步
 */

import { AuditLog, UserRole, AuditAction, AuditResource } from './types';

// ============================================
// 類型定義
// ============================================

export interface AuditLoggerConfig {
  /** 最大本地日誌數量 */
  maxLocalLogs: number;
  /** 是否啟用控制台輸出 */
  enableConsole: boolean;
  /** 是否啟用遠端同步 */
  enableRemoteSync: boolean;
  /** 遠端 API 端點 */
  remoteEndpoint?: string;
  /** 批次同步大小 */
  batchSize: number;
  /** 同步間隔（毫秒） */
  syncInterval: number;
  /** 敏感欄位（需遮蔽） */
  sensitiveFields: string[];
}

export interface AuditLogEntry extends AuditLog {
  id: string;
  synced: boolean;
}

// ============================================
// 審計日誌類別
// ============================================

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private config: AuditLoggerConfig;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private readonly STORAGE_KEY = 'security_audit_logs';

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = {
      maxLocalLogs: config.maxLocalLogs || 1000,
      enableConsole: config.enableConsole ?? process.env.NODE_ENV === 'development',
      enableRemoteSync: config.enableRemoteSync ?? false,
      remoteEndpoint: config.remoteEndpoint,
      batchSize: config.batchSize || 50,
      syncInterval: config.syncInterval || 30000,
      sensitiveFields: config.sensitiveFields || [
        'password',
        'token',
        'secret',
        'creditCard',
        'ssn',
        'nationalId',
      ],
    };

    // 載入本地日誌
    this.loadFromStorage();

    // 啟動遠端同步
    if (this.config.enableRemoteSync && this.config.remoteEndpoint) {
      this.startSync();
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 遮蔽敏感資料
   */
  private maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...data };

    for (const key of Object.keys(masked)) {
      const lowerKey = key.toLowerCase();

      if (this.config.sensitiveFields.some((field) =>
        lowerKey.includes(field.toLowerCase())
      )) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveData(masked[key] as Record<string, unknown>);
      }
    }

    return masked;
  }

  /**
   * 記錄審計日誌
   */
  log(params: {
    userId?: string;
    userEmail?: string;
    userRole?: UserRole;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
  }): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: params.userId || 'anonymous',
      userEmail: params.userEmail,
      userRole: params.userRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details
        ? this.maskSensitiveData(params.details)
        : undefined,
      ipAddress: params.ipAddress || this.getClientIp(),
      userAgent: params.userAgent || this.getUserAgent(),
      success: params.success,
      errorMessage: params.errorMessage,
      synced: false,
    };

    // 添加到日誌列表
    this.logs.unshift(entry);

    // 限制本地日誌數量
    if (this.logs.length > this.config.maxLocalLogs) {
      this.logs = this.logs.slice(0, this.config.maxLocalLogs);
    }

    // 儲存到本地
    this.saveToStorage();

    // 控制台輸出
    if (this.config.enableConsole) {
      this.consoleLog(entry);
    }

    return entry;
  }

  /**
   * 快捷方法：記錄登入
   */
  logLogin(params: {
    userId: string;
    userEmail: string;
    success: boolean;
    errorMessage?: string;
    ipAddress?: string;
  }): AuditLogEntry {
    return this.log({
      ...params,
      action: params.success ? 'login' : 'login_failed',
      resource: 'auth',
      details: {
        method: 'password',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * 快捷方法：記錄登出
   */
  logLogout(params: {
    userId: string;
    userEmail: string;
  }): AuditLogEntry {
    return this.log({
      ...params,
      action: 'logout',
      resource: 'auth',
      success: true,
    });
  }

  /**
   * 快捷方法：記錄密碼變更
   */
  logPasswordChange(params: {
    userId: string;
    userEmail: string;
    success: boolean;
    errorMessage?: string;
  }): AuditLogEntry {
    return this.log({
      ...params,
      action: 'password_change',
      resource: 'user',
      resourceId: params.userId,
    });
  }

  /**
   * 快捷方法：記錄權限變更
   */
  logPermissionChange(params: {
    userId: string;
    userEmail: string;
    targetUserId: string;
    oldRole: UserRole;
    newRole: UserRole;
  }): AuditLogEntry {
    return this.log({
      userId: params.userId,
      userEmail: params.userEmail,
      action: 'permission_change',
      resource: 'user',
      resourceId: params.targetUserId,
      details: {
        oldRole: params.oldRole,
        newRole: params.newRole,
      },
      success: true,
    });
  }

  /**
   * 快捷方法：記錄資料存取
   */
  logDataAccess(params: {
    userId: string;
    userEmail?: string;
    resource: AuditResource;
    resourceId: string;
    action: 'read' | 'create' | 'update' | 'delete';
    success: boolean;
  }): AuditLogEntry {
    return this.log({
      ...params,
      action: params.action,
    });
  }

  /**
   * 快捷方法：記錄安全事件
   */
  logSecurityEvent(params: {
    userId?: string;
    action: AuditAction;
    details: Record<string, unknown>;
    success: boolean;
    errorMessage?: string;
  }): AuditLogEntry {
    return this.log({
      ...params,
      resource: 'system',
    });
  }

  /**
   * 取得日誌
   */
  getLogs(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: AuditAction;
    resource?: AuditResource;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  } = {}): AuditLogEntry[] {
    let filtered = [...this.logs];

    // 篩選條件
    if (options.userId) {
      filtered = filtered.filter((log) => log.userId === options.userId);
    }
    if (options.action) {
      filtered = filtered.filter((log) => log.action === options.action);
    }
    if (options.resource) {
      filtered = filtered.filter((log) => log.resource === options.resource);
    }
    if (options.startDate) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= options.startDate!
      );
    }
    if (options.endDate) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) <= options.endDate!
      );
    }
    if (options.success !== undefined) {
      filtered = filtered.filter((log) => log.success === options.success);
    }

    // 分頁
    const offset = options.offset || 0;
    const limit = options.limit || 100;

    return filtered.slice(offset, offset + limit);
  }

  /**
   * 取得登入失敗記錄
   */
  getFailedLogins(userId?: string, hours: number = 24): AuditLogEntry[] {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.getLogs({
      userId,
      action: 'login_failed',
      startDate: since,
    });
  }

  /**
   * 取得統計資訊
   */
  getStats(hours: number = 24): {
    total: number;
    successful: number;
    failed: number;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
    failedLogins: number;
  } {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(
      (log) => new Date(log.timestamp) >= since
    );

    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};
    let successful = 0;
    let failed = 0;
    let failedLogins = 0;

    for (const log of recentLogs) {
      // 統計成功/失敗
      if (log.success) {
        successful++;
      } else {
        failed++;
      }

      // 按動作統計
      byAction[log.action] = (byAction[log.action] || 0) + 1;

      // 按資源統計
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;

      // 登入失敗統計
      if (log.action === 'login_failed') {
        failedLogins++;
      }
    }

    return {
      total: recentLogs.length,
      successful,
      failed,
      byAction,
      byResource,
      failedLogins,
    };
  }

  /**
   * 清除日誌
   */
  clear(beforeDate?: Date): void {
    if (beforeDate) {
      this.logs = this.logs.filter(
        (log) => new Date(log.timestamp) > beforeDate
      );
    } else {
      this.logs = [];
    }
    this.saveToStorage();
  }

  /**
   * 匯出日誌
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'id',
        'timestamp',
        'userId',
        'userEmail',
        'action',
        'resource',
        'resourceId',
        'success',
        'errorMessage',
        'ipAddress',
      ];

      const rows = this.logs.map((log) =>
        headers.map((h) => {
          const value = log[h as keyof AuditLogEntry];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 控制台輸出
   */
  private consoleLog(entry: AuditLogEntry): void {
    const icon = entry.success ? '✅' : '❌';
    const level = entry.success ? 'info' : 'warn';

    console[level](
      `${icon} [AUDIT] ${entry.action} on ${entry.resource}`,
      {
        userId: entry.userId,
        resourceId: entry.resourceId,
        timestamp: entry.timestamp,
      }
    );
  }

  /**
   * 儲存到本地儲存
   */
  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
      }
    } catch (e) {
      console.warn('Failed to save audit logs to localStorage:', e);
    }
  }

  /**
   * 從本地儲存載入
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Failed to load audit logs from localStorage:', e);
      this.logs = [];
    }
  }

  /**
   * 取得客戶端 IP（前端無法直接取得，返回佔位符）
   */
  private getClientIp(): string {
    return 'client-side';
  }

  /**
   * 取得 User Agent
   */
  private getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'unknown';
  }

  /**
   * 啟動遠端同步
   */
  private startSync(): void {
    this.syncTimer = setInterval(() => {
      this.syncToRemote();
    }, this.config.syncInterval);
  }

  /**
   * 同步到遠端
   */
  private async syncToRemote(): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    const unsynced = this.logs.filter((log) => !log.synced);
    if (unsynced.length === 0) return;

    const batch = unsynced.slice(0, this.config.batchSize);

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        // 標記已同步
        for (const log of batch) {
          log.synced = true;
        }
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Failed to sync audit logs:', e);
    }
  }

  /**
   * 停止並釋放資源
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }
}

// ============================================
// 預設實例
// ============================================

export const auditLogger = new AuditLogger();

// ============================================
// 導出
// ============================================

export default auditLogger;
