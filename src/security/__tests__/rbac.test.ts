/**
 * RBAC 權限控管模組單元測試
 * RBAC Module Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  RBAC,
  rbac,
  ROLE_DEFINITIONS,
  hasPermission,
  hasPermissions,
  getPermissions,
} from '../rbac';
import { UserRole, Permission, AuthorizationError } from '../types';

describe('RBAC', () => {
  let testRbac: RBAC;

  beforeEach(() => {
    testRbac = new RBAC();
  });

  describe('getRole', () => {
    it('should return role definition for valid role', () => {
      const role = testRbac.getRole('super_admin');
      expect(role).toBeDefined();
      expect(role?.name).toBe('超級管理員');
      expect(role?.level).toBe(100);
    });

    it('should return undefined for invalid role', () => {
      const role = testRbac.getRole('invalid_role' as UserRole);
      expect(role).toBeUndefined();
    });
  });

  describe('getAllRoles', () => {
    it('should return all role definitions', () => {
      const roles = testRbac.getAllRoles();
      expect(Object.keys(roles)).toContain('super_admin');
      expect(Object.keys(roles)).toContain('admin');
      expect(Object.keys(roles)).toContain('manager');
      expect(Object.keys(roles)).toContain('guest');
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for super_admin', () => {
      const permissions = testRbac.getRolePermissions('super_admin');
      expect(permissions).toContain('system:manage');
      expect(permissions).toContain('users:create');
      expect(permissions).toContain('orders:approve');
    });

    it('should include inherited permissions', () => {
      const adminPermissions = testRbac.getRolePermissions('admin');
      // Admin inherits from manager
      expect(adminPermissions).toContain('dealers:read');
      expect(adminPermissions).toContain('orders:read');
    });

    it('should return empty array for guest', () => {
      const permissions = testRbac.getRolePermissions('guest');
      expect(permissions).toHaveLength(0);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      const user = {
        userId: 'user1',
        role: 'super_admin' as UserRole,
        permissions: [],
      };
      expect(testRbac.hasPermission(user, 'users:create')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
      };
      expect(testRbac.hasPermission(user, 'users:create')).toBe(false);
    });

    it('should consider custom permissions', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
        customPermissions: ['users:create' as Permission],
      };
      expect(testRbac.hasPermission(user, 'users:create')).toBe(true);
    });

    it('should consider denied permissions', () => {
      const user = {
        userId: 'user1',
        role: 'super_admin' as UserRole,
        permissions: [],
        deniedPermissions: ['users:delete' as Permission],
      };
      expect(testRbac.hasPermission(user, 'users:delete')).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      const user = {
        userId: 'user1',
        role: 'super_admin' as UserRole,
        permissions: [],
      };
      expect(
        testRbac.hasAllPermissions(user, ['users:create', 'users:read', 'users:delete'])
      ).toBe(true);
    });

    it('should return false when user lacks any permission', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
      };
      expect(
        testRbac.hasAllPermissions(user, ['dealers:read', 'dealers:create'])
      ).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
      };
      expect(
        testRbac.hasAnyPermission(user, ['dealers:read', 'dealers:create'])
      ).toBe(true);
    });

    it('should return false when user has no permissions', () => {
      const user = {
        userId: 'user1',
        role: 'guest' as UserRole,
        permissions: [],
      };
      expect(
        testRbac.hasAnyPermission(user, ['dealers:read', 'dealers:create'])
      ).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should return allowed for valid permission', () => {
      const user = {
        userId: 'user1',
        role: 'super_admin' as UserRole,
        permissions: [],
      };
      const result = testRbac.checkPermission(user, ['users:create']);
      expect(result.allowed).toBe(true);
    });

    it('should return missing permissions', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
      };
      const result = testRbac.checkPermission(user, ['users:create', 'users:delete']);
      expect(result.allowed).toBe(false);
      expect(result.missingPermissions).toContain('users:create');
      expect(result.missingPermissions).toContain('users:delete');
    });

    it('should handle requireAll=false', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
      };
      const result = testRbac.checkPermission(
        user,
        ['dealers:read', 'dealers:create'],
        false
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('assertPermission', () => {
    it('should not throw when permission exists', () => {
      const user = {
        userId: 'user1',
        role: 'super_admin' as UserRole,
        permissions: [],
      };
      expect(() => {
        testRbac.assertPermission(user, 'users:create');
      }).not.toThrow();
    });

    it('should throw AuthorizationError when permission missing', () => {
      const user = {
        userId: 'user1',
        role: 'viewer' as UserRole,
        permissions: [],
      };
      expect(() => {
        testRbac.assertPermission(user, 'users:create');
      }).toThrow(AuthorizationError);
    });
  });

  describe('getRoleLevel', () => {
    it('should return correct levels', () => {
      expect(testRbac.getRoleLevel('super_admin')).toBe(100);
      expect(testRbac.getRoleLevel('admin')).toBe(80);
      expect(testRbac.getRoleLevel('manager')).toBe(60);
      expect(testRbac.getRoleLevel('guest')).toBe(0);
    });
  });

  describe('compareRoles', () => {
    it('should compare roles correctly', () => {
      expect(testRbac.compareRoles('super_admin', 'admin')).toBeGreaterThan(0);
      expect(testRbac.compareRoles('admin', 'super_admin')).toBeLessThan(0);
      expect(testRbac.compareRoles('admin', 'admin')).toBe(0);
    });
  });

  describe('canManageRole', () => {
    it('should return true when manager has higher level', () => {
      expect(testRbac.canManageRole('super_admin', 'admin')).toBe(true);
      expect(testRbac.canManageRole('admin', 'manager')).toBe(true);
    });

    it('should return false when manager has equal or lower level', () => {
      expect(testRbac.canManageRole('admin', 'super_admin')).toBe(false);
      expect(testRbac.canManageRole('manager', 'manager')).toBe(false);
    });
  });

  describe('getAssignableRoles', () => {
    it('should return roles lower than manager', () => {
      const roles = testRbac.getAssignableRoles('super_admin');
      expect(roles).toContain('admin');
      expect(roles).toContain('manager');
      expect(roles).not.toContain('super_admin');
    });

    it('should return empty array for lowest role', () => {
      const roles = testRbac.getAssignableRoles('guest');
      expect(roles).toHaveLength(0);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached permissions', () => {
      // Access permission to populate cache
      const user = {
        userId: 'user1',
        role: 'admin' as UserRole,
        permissions: [],
      };
      testRbac.hasPermission(user, 'dealers:read');

      // Clear cache
      testRbac.clearCache();

      // Cache should be empty (internal implementation)
      // Just verify no errors
      expect(() => testRbac.clearCache()).not.toThrow();
    });
  });
});

describe('Convenience Functions', () => {
  describe('hasPermission', () => {
    it('should check permission using global instance', () => {
      expect(hasPermission('super_admin', 'users:create')).toBe(true);
      expect(hasPermission('guest', 'users:create')).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('should check multiple permissions', () => {
      expect(
        hasPermissions('super_admin', ['users:create', 'users:delete'], true)
      ).toBe(true);
      expect(
        hasPermissions('viewer', ['dealers:read', 'dealers:create'], false)
      ).toBe(true);
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions for role', () => {
      const permissions = getPermissions('super_admin');
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain('system:manage');
    });
  });
});

describe('ROLE_DEFINITIONS', () => {
  it('should define all required roles', () => {
    expect(ROLE_DEFINITIONS.super_admin).toBeDefined();
    expect(ROLE_DEFINITIONS.admin).toBeDefined();
    expect(ROLE_DEFINITIONS.manager).toBeDefined();
    expect(ROLE_DEFINITIONS.sales).toBeDefined();
    expect(ROLE_DEFINITIONS.accountant).toBeDefined();
    expect(ROLE_DEFINITIONS.viewer).toBeDefined();
    expect(ROLE_DEFINITIONS.guest).toBeDefined();
  });

  it('should have proper hierarchy', () => {
    expect(ROLE_DEFINITIONS.super_admin.level).toBeGreaterThan(
      ROLE_DEFINITIONS.admin.level
    );
    expect(ROLE_DEFINITIONS.admin.level).toBeGreaterThan(
      ROLE_DEFINITIONS.manager.level
    );
    expect(ROLE_DEFINITIONS.manager.level).toBeGreaterThan(
      ROLE_DEFINITIONS.viewer.level
    );
    expect(ROLE_DEFINITIONS.viewer.level).toBeGreaterThan(
      ROLE_DEFINITIONS.guest.level
    );
  });
});
