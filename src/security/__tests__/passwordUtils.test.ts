/**
 * 密碼工具模組單元測試
 * Password Utils Module Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generatePassword,
  validatePassword,
  calculatePasswordEntropy,
  estimateCrackTime,
  DEFAULT_PASSWORD_POLICY,
} from '../passwordUtils';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const result = await hashPassword('testPassword123');
      expect(result.hash).toBeDefined();
      expect(result.salt).toBeDefined();
      expect(result.algorithm).toBe('PBKDF2-SHA256');
      expect(result.iterations).toBe(100000);
    });

    it('should produce different hashes for different passwords', async () => {
      const result1 = await hashPassword('password1');
      const result2 = await hashPassword('password2');
      expect(result1.hash).not.toBe(result2.hash);
    });

    it('should produce same hash with same salt', async () => {
      const result1 = await hashPassword('testPassword');
      const result2 = await hashPassword('testPassword', result1.salt);
      expect(result1.hash).toBe(result2.hash);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const { hash, salt } = await hashPassword('correctPassword');
      const isValid = await verifyPassword('correctPassword', hash, salt);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const { hash, salt } = await hashPassword('correctPassword');
      const isValid = await verifyPassword('wrongPassword', hash, salt);
      expect(isValid).toBe(false);
    });
  });

  describe('generatePassword', () => {
    it('should generate password of specified length', () => {
      const password = generatePassword(16);
      expect(password.length).toBe(16);
    });

    it('should include uppercase letters by default', () => {
      const password = generatePassword(20);
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should include lowercase letters by default', () => {
      const password = generatePassword(20);
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should include numbers by default', () => {
      const password = generatePassword(20);
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('should include symbols by default', () => {
      const password = generatePassword(20);
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
    });

    it('should respect options to exclude character types', () => {
      const password = generatePassword(20, {
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
      });
      expect(/[A-Z]/.test(password)).toBe(false);
      expect(/[0-9]/.test(password)).toBe(false);
    });

    it('should generate unique passwords', () => {
      const passwords = new Set<string>();
      for (let i = 0; i < 100; i++) {
        passwords.add(generatePassword(16));
      }
      expect(passwords.size).toBe(100);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('SecureP@ss123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password too short', () => {
      const result = validatePassword('Ab1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼長度至少需要 8 個字元');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('password@123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼必須包含至少一個大寫字母');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('PASSWORD@123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼必須包含至少一個小寫字母');
    });

    it('should reject password without number', () => {
      const result = validatePassword('Password@!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼必須包含至少一個數字');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼必須包含至少一個特殊字元');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('password123!A');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼過於常見，容易被破解');
    });

    it('should reject password containing user info', () => {
      const result = validatePassword('John123!@#', {}, { username: 'john' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密碼不應包含使用者名稱或個人資訊');
    });

    it('should reject repeating characters', () => {
      const result = validatePassword('Aaaaa@123');
      expect(result.valid).toBe(false);
    });

    it('should respect custom policy', () => {
      const result = validatePassword('abcd', { minLength: 4, requireUppercase: false });
      expect(result.errors).not.toContain('密碼長度至少需要 8 個字元');
    });

    it('should provide password strength level', () => {
      const weak = validatePassword('abc');
      expect(weak.level).toBe('weak');

      const strong = validatePassword('MySecure@Pass123');
      expect(strong.level).toBe('strong');
    });
  });

  describe('calculatePasswordEntropy', () => {
    it('should calculate higher entropy for complex passwords', () => {
      const simple = calculatePasswordEntropy('password');
      const complex = calculatePasswordEntropy('P@ssw0rd!');
      expect(complex).toBeGreaterThan(simple);
    });

    it('should calculate higher entropy for longer passwords', () => {
      const short = calculatePasswordEntropy('Ab1!');
      const long = calculatePasswordEntropy('Ab1!Ab1!Ab1!');
      expect(long).toBeGreaterThan(short);
    });

    it('should return 0 for empty password', () => {
      expect(calculatePasswordEntropy('')).toBe(0);
    });
  });

  describe('estimateCrackTime', () => {
    it('should estimate short time for weak passwords', () => {
      const result = estimateCrackTime('abc');
      expect(result.seconds).toBeLessThan(1);
      expect(result.display).toBe('瞬間');
    });

    it('should estimate long time for strong passwords', () => {
      const result = estimateCrackTime('MyVerySecure@P4ssw0rd!2024');
      expect(result.seconds).toBeGreaterThan(31536000); // More than a year
    });

    it('should provide human-readable display', () => {
      const result = estimateCrackTime('SomePassword123!');
      expect(result.display).toBeDefined();
      expect(typeof result.display).toBe('string');
    });
  });

  describe('DEFAULT_PASSWORD_POLICY', () => {
    it('should have reasonable defaults', () => {
      expect(DEFAULT_PASSWORD_POLICY.minLength).toBe(8);
      expect(DEFAULT_PASSWORD_POLICY.requireUppercase).toBe(true);
      expect(DEFAULT_PASSWORD_POLICY.requireLowercase).toBe(true);
      expect(DEFAULT_PASSWORD_POLICY.requireNumbers).toBe(true);
      expect(DEFAULT_PASSWORD_POLICY.requireSpecialChars).toBe(true);
      expect(DEFAULT_PASSWORD_POLICY.preventCommonPasswords).toBe(true);
    });
  });
});
