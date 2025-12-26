/**
 * 資安類型定義
 * Security Type Definitions
 */

// ============================================
// 使用者角色 (RBAC)
// ============================================

export type UserRole =
  | 'super_admin'   // 超級管理員 - 完全權限
  | 'admin'         // 管理員 - 管理權限
  | 'manager'       // 經理 - 部分管理權限
  | 'sales'         // 業務 - 銷售相關權限
  | 'accountant'    // 會計 - 財務相關權限
  | 'viewer'        // 檢視者 - 只讀權限
  | 'guest';        // 訪客 - 最小權限

// ============================================
// 權限定義
// ============================================

export type Permission =
  // 系統管理
  | 'system:manage'
  | 'system:config'
  | 'system:logs'
  // 使用者管理
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:manage_roles'
  // 經銷商管理
  | 'dealers:read'
  | 'dealers:create'
  | 'dealers:update'
  | 'dealers:delete'
  | 'dealers:approve'
  // 訂單管理
  | 'orders:read'
  | 'orders:create'
  | 'orders:update'
  | 'orders:delete'
  | 'orders:approve'
  | 'orders:export'
  // 發票管理
  | 'invoices:read'
  | 'invoices:create'
  | 'invoices:update'
  | 'invoices:delete'
  | 'invoices:approve'
  // 報表
  | 'reports:read'
  | 'reports:export'
  | 'reports:create'
  // 設定
  | 'settings:read'
  | 'settings:update'
  // 審計
  | 'audit:read'
  | 'audit:export';

// ============================================
// 審計動作類型
// ============================================

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'permission_change'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'access_denied'
  | 'rate_limited'
  | 'security_alert'
  | 'error';

// ============================================
// 審計資源類型
// ============================================

export type AuditResource =
  | 'auth'
  | 'user'
  | 'dealer'
  | 'order'
  | 'invoice'
  | 'report'
  | 'settings'
  | 'system';

// ============================================
// 使用者介面
// ============================================

export interface SecureUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // 不包含密碼！密碼僅在後端處理
}

// ============================================
// 審計日誌
// ============================================

export interface AuditLog {
  timestamp: string;
  userId: string;
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
}

// ============================================
// 錯誤類型
// ============================================

export class SecurityError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'SECURITY_ERROR',
    statusCode: number = 403
  ) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

export class AuthenticationError extends SecurityError {
  constructor(message: string = '認證失敗，請重新登入') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends SecurityError {
  public readonly requiredPermission?: Permission;

  constructor(message: string = '權限不足', requiredPermission?: Permission) {
    super(message, 'AUTHZ_ERROR', 403);
    this.name = 'AuthorizationError';
    this.requiredPermission = requiredPermission;
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends SecurityError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string = '驗證失敗', errors: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends SecurityError {
  public readonly retryAfter: number;

  constructor(message: string = '請求過於頻繁，請稍後再試', retryAfter: number = 60000) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// ============================================
// 登入相關類型
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: SecureUser;
  token?: string;
  expiresAt?: string;
  error?: string;
  requiresMfa?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// Session 相關類型
// ============================================

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  isValid: boolean;
}

// ============================================
// 安全配置
// ============================================

export interface SecurityConfig {
  /** Session 過期時間（毫秒） */
  sessionTimeout: number;
  /** 最大登入嘗試次數 */
  maxLoginAttempts: number;
  /** 帳號鎖定時間（毫秒） */
  lockoutDuration: number;
  /** 密碼最小長度 */
  passwordMinLength: number;
  /** 是否要求密碼複雜度 */
  requireComplexPassword: boolean;
  /** 是否啟用 MFA */
  enableMfa: boolean;
  /** 是否記錄審計日誌 */
  enableAuditLog: boolean;
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 分鐘
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 分鐘
  passwordMinLength: 8,
  requireComplexPassword: true,
  enableMfa: false,
  enableAuditLog: true,
};
