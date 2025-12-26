/**
 * 安全認證 Context
 * Secure Authentication Context with RBAC
 *
 * 提供：
 * - 使用者登入/登出
 * - Session 管理
 * - RBAC 權限檢查
 * - 審計日誌整合
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  SecureUser,
  UserRole,
  Permission,
  LoginCredentials,
  LoginResult,
  DEFAULT_SECURITY_CONFIG,
  SecurityConfig,
  AuthenticationError,
} from './types';
import { rbac, RBAC, UsePermissionsResult } from './rbac';
import { loginLimiter } from './rateLimiter';
import { auditLogger } from './auditLogger';
import { validatePassword } from './passwordUtils';
import { sanitizeEmail } from './sanitizer';

// ============================================
// Context 類型
// ============================================

interface AuthContextValue {
  // 狀態
  user: SecureUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 認證方法
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;

  // 權限方法
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  checkRole: (minRole: UserRole) => boolean;
  getPermissions: () => Permission[];

  // 設定
  config: SecurityConfig;
}

// ============================================
// Context 建立
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// Storage 常數
// ============================================

const STORAGE_KEYS = {
  USER: 'secure_user',
  TOKEN: 'secure_token',
  EXPIRES: 'secure_expires',
} as const;

// ============================================
// Provider 元件
// ============================================

interface AuthProviderProps {
  children: ReactNode;
  config?: Partial<SecurityConfig>;
  onLogin?: (user: SecureUser) => void;
  onLogout?: () => void;
}

export function AuthProvider({
  children,
  config: customConfig,
  onLogin,
  onLogout,
}: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<SecureUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = useMemo(
    () => ({ ...DEFAULT_SECURITY_CONFIG, ...customConfig }),
    [customConfig]
  );

  // 初始化：檢查現有 Session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedExpires = localStorage.getItem(STORAGE_KEYS.EXPIRES);

        if (storedUser && storedExpires) {
          const expiresAt = new Date(storedExpires);

          if (expiresAt > new Date()) {
            const parsedUser = JSON.parse(storedUser) as SecureUser;
            setUser(parsedUser);
          } else {
            // Session 已過期
            clearAuthStorage();
          }
        }
      } catch (e) {
        console.error('Failed to restore auth session:', e);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 清除儲存
  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES);
  }, []);

  // 登入
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      setIsLoading(true);
      setError(null);

      try {
        // 消毒輸入
        const email = sanitizeEmail(credentials.email);

        // 檢查速率限制
        const rateLimitResult = loginLimiter.check(email);
        if (!rateLimitResult.allowed) {
          const errorMsg = '登入嘗試次數過多，帳號已暫時鎖定';
          setError(errorMsg);

          auditLogger.logLogin({
            userId: 'unknown',
            userEmail: email,
            success: false,
            errorMessage: errorMsg,
          });

          return {
            success: false,
            error: errorMsg,
          };
        }

        // 驗證密碼格式
        const passwordValidation = validatePassword(credentials.password);
        if (!passwordValidation.valid && passwordValidation.errors.length > 0) {
          // 不揭露具體的密碼驗證錯誤，以防止資訊洩漏
          const errorMsg = '帳號或密碼錯誤';
          setError(errorMsg);

          auditLogger.logLogin({
            userId: 'unknown',
            userEmail: email,
            success: false,
            errorMessage: 'Invalid password format',
          });

          return {
            success: false,
            error: errorMsg,
          };
        }

        // TODO: 實際 API 呼叫
        // 這裡模擬登入驗證，實際應該呼叫後端 API
        const mockUser = await mockLoginApi(email, credentials.password);

        if (!mockUser) {
          const errorMsg = '帳號或密碼錯誤';
          setError(errorMsg);

          auditLogger.logLogin({
            userId: 'unknown',
            userEmail: email,
            success: false,
            errorMessage: errorMsg,
          });

          return {
            success: false,
            error: errorMsg,
          };
        }

        // 設定 Session
        const expiresAt = new Date(
          Date.now() + (credentials.rememberMe ? 7 * 24 * 60 * 60 * 1000 : config.sessionTimeout)
        );

        // 儲存到 localStorage
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
        localStorage.setItem(STORAGE_KEYS.EXPIRES, expiresAt.toISOString());

        setUser(mockUser);
        setError(null);

        // 記錄審計日誌
        auditLogger.logLogin({
          userId: mockUser.id,
          userEmail: mockUser.email,
          success: true,
        });

        // 回調
        onLogin?.(mockUser);

        return {
          success: true,
          user: mockUser,
          expiresAt: expiresAt.toISOString(),
        };
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : '登入失敗';
        setError(errorMsg);

        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [config.sessionTimeout, onLogin]
  );

  // 登出
  const logout = useCallback(async () => {
    if (user) {
      auditLogger.logLogout({
        userId: user.id,
        userEmail: user.email,
      });
    }

    clearAuthStorage();
    setUser(null);
    setError(null);

    onLogout?.();
  }, [user, clearAuthStorage, onLogout]);

  // 刷新 Session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // TODO: 實際應該呼叫後端 API 驗證並刷新 token
      const expiresAt = new Date(Date.now() + config.sessionTimeout);
      localStorage.setItem(STORAGE_KEYS.EXPIRES, expiresAt.toISOString());
      return true;
    } catch {
      return false;
    }
  }, [user, config.sessionTimeout]);

  // 權限檢查
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return rbac.hasPermission(
        { userId: user.id, role: user.role, permissions: user.permissions },
        permission
      );
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return rbac.hasAllPermissions(
        { userId: user.id, role: user.role, permissions: user.permissions },
        permissions
      );
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return rbac.hasAnyPermission(
        { userId: user.id, role: user.role, permissions: user.permissions },
        permissions
      );
    },
    [user]
  );

  const checkRole = useCallback(
    (minRole: UserRole): boolean => {
      if (!user) return false;
      return rbac.compareRoles(user.role, minRole) >= 0;
    },
    [user]
  );

  const getPermissions = useCallback((): Permission[] => {
    if (!user) return [];
    return rbac.getUserPermissions({
      userId: user.id,
      role: user.role,
      permissions: user.permissions,
    });
  }, [user]);

  // Context 值
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
      refreshSession,
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      checkRole,
      getPermissions,
      config,
    }),
    [
      user,
      isLoading,
      error,
      login,
      logout,
      refreshSession,
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      checkRole,
      getPermissions,
      config,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hooks
// ============================================

/**
 * 使用認證 Context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * 使用權限 Hook
 */
export function usePermissions(): UsePermissionsResult {
  const { user, hasPermission, hasAllPermissions, hasAnyPermission, getPermissions } = useAuth();

  return useMemo(
    () => ({
      hasPermission,
      hasAllPermissions,
      hasAnyPermission,
      permissions: getPermissions(),
      role: user?.role || 'guest',
      roleDefinition: user ? rbac.getRole(user.role) : undefined,
    }),
    [user, hasPermission, hasAllPermissions, hasAnyPermission, getPermissions]
  );
}

/**
 * 使用使用者資訊
 */
export function useUser(): SecureUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * 使用認證狀態
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// ============================================
// 路由保護元件
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions,
  requiredRole,
  requireAll = true,
  fallback,
  redirectTo,
}: ProtectedRouteProps): React.ReactElement | null {
  const { isAuthenticated, isLoading, hasAllPermissions, hasAnyPermission, checkRole } = useAuth();

  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!isAuthenticated) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    return fallback ? <>{fallback}</> : null;
  }

  // 檢查角色
  if (requiredRole && !checkRole(requiredRole)) {
    return fallback ? <>{fallback}</> : null;
  }

  // 檢查權限
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequired = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequired) {
      return fallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}

// ============================================
// 權限檢查元件
// ============================================

interface CanProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({
  permission,
  requireAll = true,
  children,
  fallback = null,
}: CanProps): React.ReactElement | null {
  const { hasAllPermissions, hasAnyPermission } = useAuth();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// ============================================
// Mock API（實際應該呼叫後端）
// ============================================

async function mockLoginApi(email: string, password: string): Promise<SecureUser | null> {
  // 模擬 API 延遲
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 模擬使用者資料
  const mockUsers: Record<string, { password: string; user: SecureUser }> = {
    'admin@example.com': {
      password: 'Admin@123',
      user: {
        id: 'user_001',
        email: 'admin@example.com',
        username: 'admin',
        role: 'super_admin',
        permissions: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    },
    'manager@example.com': {
      password: 'Manager@123',
      user: {
        id: 'user_002',
        email: 'manager@example.com',
        username: 'manager',
        role: 'manager',
        permissions: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    },
    'user@example.com': {
      password: 'User@123',
      user: {
        id: 'user_003',
        email: 'user@example.com',
        username: 'user',
        role: 'viewer',
        permissions: [],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    },
  };

  const userData = mockUsers[email.toLowerCase()];

  if (!userData || userData.password !== password) {
    return null;
  }

  return {
    ...userData.user,
    lastLoginAt: new Date().toISOString(),
  };
}

// ============================================
// 導出
// ============================================

export default AuthContext;
