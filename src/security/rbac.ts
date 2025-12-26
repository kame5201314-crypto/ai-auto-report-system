/**
 * 角色權限控管模組 (RBAC - Role-Based Access Control)
 *
 * 實作角色與權限的管理
 * 支援階層式角色繼承
 */

import { UserRole, Permission, AuthorizationError } from './types';
import { auditLogger } from './auditLogger';

// ============================================
// 類型定義
// ============================================

export interface RoleDefinition {
  /** 角色名稱 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 權限列表 */
  permissions: Permission[];
  /** 繼承的角色 */
  inherits?: UserRole[];
  /** 角色層級（數字越大權限越高） */
  level: number;
}

export interface PermissionCheck {
  /** 是否有權限 */
  allowed: boolean;
  /** 拒絕原因 */
  reason?: string;
  /** 缺少的權限 */
  missingPermissions?: Permission[];
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  permissions: Permission[];
  customPermissions?: Permission[];
  deniedPermissions?: Permission[];
}

// ============================================
// 角色定義
// ============================================

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  super_admin: {
    name: '超級管理員',
    description: '擁有系統所有權限',
    level: 100,
    permissions: [
      // 系統管理
      'system:manage',
      'system:config',
      'system:logs',
      // 使用者管理
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'users:manage_roles',
      // 經銷商管理
      'dealers:read',
      'dealers:create',
      'dealers:update',
      'dealers:delete',
      'dealers:approve',
      // 訂單管理
      'orders:read',
      'orders:create',
      'orders:update',
      'orders:delete',
      'orders:approve',
      'orders:export',
      // 發票管理
      'invoices:read',
      'invoices:create',
      'invoices:update',
      'invoices:delete',
      'invoices:approve',
      // 報表
      'reports:read',
      'reports:export',
      'reports:create',
      // 設定
      'settings:read',
      'settings:update',
      // 審計
      'audit:read',
      'audit:export',
    ],
  },

  admin: {
    name: '管理員',
    description: '系統管理員，可管理大部分功能',
    level: 80,
    inherits: ['manager'],
    permissions: [
      // 使用者管理（有限）
      'users:read',
      'users:create',
      'users:update',
      // 設定
      'settings:read',
      'settings:update',
      // 審計
      'audit:read',
    ],
  },

  manager: {
    name: '經理',
    description: '部門經理，可管理經銷商和訂單',
    level: 60,
    inherits: ['sales'],
    permissions: [
      // 經銷商管理
      'dealers:read',
      'dealers:create',
      'dealers:update',
      'dealers:approve',
      // 訂單管理
      'orders:read',
      'orders:create',
      'orders:update',
      'orders:approve',
      'orders:export',
      // 發票
      'invoices:read',
      'invoices:create',
      'invoices:update',
      'invoices:approve',
      // 報表
      'reports:read',
      'reports:export',
    ],
  },

  sales: {
    name: '業務',
    description: '業務人員，可處理訂單和客戶',
    level: 40,
    inherits: ['viewer'],
    permissions: [
      // 經銷商（有限）
      'dealers:read',
      'dealers:create',
      // 訂單
      'orders:read',
      'orders:create',
      'orders:update',
      // 發票
      'invoices:read',
      'invoices:create',
    ],
  },

  accountant: {
    name: '會計',
    description: '會計人員，處理財務相關',
    level: 40,
    inherits: ['viewer'],
    permissions: [
      // 訂單（唯讀）
      'orders:read',
      // 發票
      'invoices:read',
      'invoices:create',
      'invoices:update',
      'invoices:approve',
      // 報表
      'reports:read',
      'reports:export',
    ],
  },

  viewer: {
    name: '檢視者',
    description: '只能檢視資料',
    level: 10,
    permissions: [
      'dealers:read',
      'orders:read',
      'invoices:read',
      'reports:read',
    ],
  },

  guest: {
    name: '訪客',
    description: '未登入用戶',
    level: 0,
    permissions: [],
  },
};

// ============================================
// RBAC 類別
// ============================================

export class RBAC {
  private roleDefinitions: Record<UserRole, RoleDefinition>;
  private userPermissionsCache: Map<string, Set<Permission>> = new Map();

  constructor(customRoles?: Partial<Record<UserRole, RoleDefinition>>) {
    this.roleDefinitions = {
      ...ROLE_DEFINITIONS,
      ...customRoles,
    };
  }

  /**
   * 取得角色定義
   */
  getRole(role: UserRole): RoleDefinition | undefined {
    return this.roleDefinitions[role];
  }

  /**
   * 取得所有角色
   */
  getAllRoles(): Record<UserRole, RoleDefinition> {
    return { ...this.roleDefinitions };
  }

  /**
   * 取得角色的所有權限（包含繼承）
   */
  getRolePermissions(role: UserRole): Permission[] {
    const roleDefinition = this.roleDefinitions[role];
    if (!roleDefinition) return [];

    const permissions = new Set<Permission>(roleDefinition.permissions);

    // 處理繼承
    if (roleDefinition.inherits) {
      for (const inheritedRole of roleDefinition.inherits) {
        const inheritedPermissions = this.getRolePermissions(inheritedRole);
        for (const perm of inheritedPermissions) {
          permissions.add(perm);
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * 取得使用者的所有權限
   */
  getUserPermissions(user: UserPermissions): Permission[] {
    // 檢查快取
    const cacheKey = `${user.userId}_${user.role}`;
    if (this.userPermissionsCache.has(cacheKey)) {
      return Array.from(this.userPermissionsCache.get(cacheKey)!);
    }

    // 取得角色權限
    const rolePermissions = this.getRolePermissions(user.role);
    const permissions = new Set<Permission>(rolePermissions);

    // 添加自定義權限
    if (user.customPermissions) {
      for (const perm of user.customPermissions) {
        permissions.add(perm);
      }
    }

    // 移除被拒絕的權限
    if (user.deniedPermissions) {
      for (const perm of user.deniedPermissions) {
        permissions.delete(perm);
      }
    }

    // 快取結果
    this.userPermissionsCache.set(cacheKey, permissions);

    return Array.from(permissions);
  }

  /**
   * 檢查是否有特定權限
   */
  hasPermission(user: UserPermissions, permission: Permission): boolean {
    const permissions = this.getUserPermissions(user);
    return permissions.includes(permission);
  }

  /**
   * 檢查是否有多個權限（全部）
   */
  hasAllPermissions(user: UserPermissions, permissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions(user);
    return permissions.every((perm) => userPermissions.includes(perm));
  }

  /**
   * 檢查是否有多個權限（任一）
   */
  hasAnyPermission(user: UserPermissions, permissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions(user);
    return permissions.some((perm) => userPermissions.includes(perm));
  }

  /**
   * 詳細權限檢查
   */
  checkPermission(
    user: UserPermissions,
    requiredPermissions: Permission[],
    requireAll: boolean = true
  ): PermissionCheck {
    const userPermissions = this.getUserPermissions(user);

    const missingPermissions = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm)
    );

    if (requireAll) {
      // 需要全部權限
      if (missingPermissions.length === 0) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `缺少必要權限: ${missingPermissions.join(', ')}`,
        missingPermissions,
      };
    } else {
      // 只需任一權限
      if (missingPermissions.length < requiredPermissions.length) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: '沒有任何所需權限',
        missingPermissions,
      };
    }
  }

  /**
   * 斷言權限（無權限時拋出錯誤）
   */
  assertPermission(
    user: UserPermissions,
    permission: Permission,
    resource?: string
  ): void {
    if (!this.hasPermission(user, permission)) {
      // 記錄審計日誌
      auditLogger.logSecurityEvent({
        userId: user.userId,
        action: 'access_denied',
        details: {
          requiredPermission: permission,
          userRole: user.role,
          resource,
        },
        success: false,
        errorMessage: `權限不足: ${permission}`,
      });

      throw new AuthorizationError(
        `您沒有執行此操作的權限 (需要: ${permission})`,
        permission
      );
    }
  }

  /**
   * 檢查角色層級
   */
  getRoleLevel(role: UserRole): number {
    return this.roleDefinitions[role]?.level || 0;
  }

  /**
   * 比較角色層級
   */
  compareRoles(roleA: UserRole, roleB: UserRole): number {
    const levelA = this.getRoleLevel(roleA);
    const levelB = this.getRoleLevel(roleB);
    return levelA - levelB;
  }

  /**
   * 檢查是否可以管理目標角色
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    // 管理者角色層級必須高於目標角色
    return this.compareRoles(managerRole, targetRole) > 0;
  }

  /**
   * 取得可分配的角色列表
   */
  getAssignableRoles(managerRole: UserRole): UserRole[] {
    const managerLevel = this.getRoleLevel(managerRole);

    return (Object.keys(this.roleDefinitions) as UserRole[]).filter(
      (role) => this.getRoleLevel(role) < managerLevel
    );
  }

  /**
   * 清除快取
   */
  clearCache(): void {
    this.userPermissionsCache.clear();
  }

  /**
   * 清除特定使用者的快取
   */
  clearUserCache(userId: string): void {
    for (const key of this.userPermissionsCache.keys()) {
      if (key.startsWith(`${userId}_`)) {
        this.userPermissionsCache.delete(key);
      }
    }
  }
}

// ============================================
// 預設實例
// ============================================

export const rbac = new RBAC();

// ============================================
// 便捷函數
// ============================================

/**
 * 檢查權限
 */
export function hasPermission(
  role: UserRole,
  permission: Permission,
  userId: string = 'anonymous'
): boolean {
  return rbac.hasPermission({ userId, role, permissions: [] }, permission);
}

/**
 * 檢查多個權限
 */
export function hasPermissions(
  role: UserRole,
  permissions: Permission[],
  requireAll: boolean = true,
  userId: string = 'anonymous'
): boolean {
  const user = { userId, role, permissions: [] };
  return requireAll
    ? rbac.hasAllPermissions(user, permissions)
    : rbac.hasAnyPermission(user, permissions);
}

/**
 * 取得角色權限列表
 */
export function getPermissions(role: UserRole): Permission[] {
  return rbac.getRolePermissions(role);
}

/**
 * 斷言權限
 */
export function assertPermission(
  role: UserRole,
  permission: Permission,
  userId: string = 'anonymous'
): void {
  rbac.assertPermission({ userId, role, permissions: [] }, permission);
}

// ============================================
// React Hook 輔助類型
// ============================================

export interface UsePermissionsResult {
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  permissions: Permission[];
  role: UserRole;
  roleDefinition: RoleDefinition | undefined;
}

// ============================================
// 導出
// ============================================

export default rbac;
