/**
 * 輸入消毒模組單元測試
 * Sanitizer Module Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  stripHtml,
  removeEventHandlers,
  removeScripts,
  detectSqlInjection,
  escapeSql,
  sanitizeString,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeUrl,
  sanitizeNumber,
  sanitizeObject,
} from '../sanitizer';

describe('Sanitizer - XSS Protection', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape ampersand', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
      expect(escapeHtml("It's fine")).toBe('It&#x27;s fine');
    });

    it('should return empty string for non-string input', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
      expect(escapeHtml(123 as unknown as string)).toBe('');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test');
    });

    it('should handle multiple tags', () => {
      expect(stripHtml('<h1>Title</h1><p>Content</p>')).toBe('TitleContent');
    });

    it('should handle self-closing tags', () => {
      expect(stripHtml('Hello<br/>World')).toBe('HelloWorld');
    });
  });

  describe('removeEventHandlers', () => {
    it('should remove onclick handlers', () => {
      const result = removeEventHandlers('<img onclick="alert(1)" src="x">');
      expect(result).not.toContain('onclick');
      expect(result).toContain('src="x"');
    });

    it('should remove onerror handlers', () => {
      const result = removeEventHandlers('<img onerror="alert(1)">');
      expect(result).not.toContain('onerror');
    });

    it('should remove onload handlers', () => {
      const result = removeEventHandlers('<body onload="malicious()">');
      expect(result).not.toContain('onload');
    });
  });

  describe('removeScripts', () => {
    it('should remove script tags and content', () => {
      expect(
        removeScripts('<div>Hello<script>evil()</script>World</div>')
      ).toBe('<div>HelloWorld</div>');
    });

    it('should handle multiple script tags', () => {
      expect(
        removeScripts('<script>a()</script>Text<script>b()</script>')
      ).toBe('Text');
    });
  });
});

describe('Sanitizer - SQL Injection Protection', () => {
  describe('detectSqlInjection', () => {
    it('should detect SELECT statements', () => {
      expect(detectSqlInjection('SELECT * FROM users')).toBe(true);
    });

    it('should detect DROP statements', () => {
      expect(detectSqlInjection("'; DROP TABLE users;--")).toBe(true);
    });

    it('should detect OR 1=1 pattern', () => {
      expect(detectSqlInjection("' OR 1=1 --")).toBe(true);
    });

    it('should detect UNION SELECT', () => {
      expect(detectSqlInjection("' UNION SELECT password FROM users")).toBe(true);
    });

    it('should return false for normal text', () => {
      expect(detectSqlInjection('Hello World')).toBe(false);
      expect(detectSqlInjection('John Doe')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      // SQL detection uses regex with /gi flag
      expect(detectSqlInjection('SELECT * FROM users')).toBe(true);
      // Note: The function uses regex.test() which may have lastIndex issues
      // Testing separately to avoid regex state interference
      const lowerCase = detectSqlInjection('select * from users');
      expect(lowerCase).toBe(true);
    });
  });

  describe('escapeSql', () => {
    it('should escape single quotes', () => {
      expect(escapeSql("O'Reilly")).toBe("O''Reilly");
    });

    it('should escape backslashes', () => {
      expect(escapeSql('C:\\path')).toBe('C:\\\\path');
    });

    it('should escape null bytes', () => {
      expect(escapeSql('test\x00')).toBe('test\\0');
    });

    it('should escape newlines', () => {
      expect(escapeSql('line1\nline2')).toBe('line1\\nline2');
    });
  });
});

describe('Sanitizer - General Functions', () => {
  describe('sanitizeString', () => {
    it('should trim by default', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should escape HTML by default', () => {
      expect(sanitizeString('<script>')).toBe('&lt;script&gt;');
    });

    it('should respect maxLength option', () => {
      expect(sanitizeString('hello world', { maxLength: 5 })).toBe('hello');
    });

    it('should convert to lowercase when specified', () => {
      expect(sanitizeString('HELLO', { toLowerCase: true })).toBe('hello');
    });

    it('should convert to uppercase when specified', () => {
      expect(sanitizeString('hello', { toUpperCase: true })).toBe('HELLO');
    });

    it('should remove newlines when specified', () => {
      expect(sanitizeString('line1\nline2', { removeNewlines: true })).toBe(
        'line1 line2'
      );
    });

    it('should handle null and undefined', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should convert numbers to string', () => {
      expect(sanitizeString(123)).toBe('123');
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase email', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeEmail("test'@example.com")).toBe('test@example.com');
      expect(sanitizeEmail('test<>@example.com')).toBe('test@example.com');
    });

    it('should limit length to 254 characters', () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      expect(sanitizeEmail(longEmail).length).toBeLessThanOrEqual(254);
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeEmail(null)).toBe('');
      expect(sanitizeEmail(123)).toBe('');
    });
  });

  describe('sanitizeUsername', () => {
    it('should remove special characters', () => {
      expect(sanitizeUsername('user@name!')).toBe('username');
    });

    it('should allow alphanumeric and underscore', () => {
      expect(sanitizeUsername('user_123')).toBe('user_123');
    });

    it('should allow Chinese characters', () => {
      expect(sanitizeUsername('使用者123')).toBe('使用者123');
    });

    it('should limit length to 50 characters', () => {
      const longUsername = 'a'.repeat(100);
      expect(sanitizeUsername(longUsername).length).toBe(50);
    });
  });

  describe('sanitizeUrl', () => {
    it('should return valid URLs unchanged', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com/path')).toBe(
        'http://example.com/path'
      );
    });

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('should handle case-insensitive protocols', () => {
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('sanitizeNumber', () => {
    it('should return number for valid input', () => {
      expect(sanitizeNumber(42)).toBe(42);
      expect(sanitizeNumber('42')).toBe(42);
      expect(sanitizeNumber(3.14)).toBe(3.14);
    });

    it('should return default value for invalid input', () => {
      expect(sanitizeNumber('abc')).toBe(0);
      expect(sanitizeNumber('abc', { defaultValue: -1 })).toBe(-1);
    });

    it('should clamp to min value', () => {
      expect(sanitizeNumber(5, { min: 10 })).toBe(10);
    });

    it('should clamp to max value', () => {
      expect(sanitizeNumber(100, { max: 50 })).toBe(50);
    });

    it('should handle range', () => {
      expect(sanitizeNumber(75, { min: 0, max: 100 })).toBe(75);
      expect(sanitizeNumber(-10, { min: 0, max: 100 })).toBe(0);
      expect(sanitizeNumber(150, { min: 0, max: 100 })).toBe(100);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string properties', () => {
      const input = {
        name: '<script>evil()</script>John',
        age: 30,
      };
      const result = sanitizeObject(input);
      // sanitizeObject removes scripts first, then escapes remaining HTML
      expect(result.name).not.toContain('<script>');
      expect(result.name).toContain('John');
      expect(result.age).toBe(30);
    });

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<b>John</b>',
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe('&lt;b&gt;John&lt;&#x2F;b&gt;');
    });

    it('should sanitize arrays', () => {
      const input = {
        tags: ['<script>', 'normal', '<div>'],
      };
      const result = sanitizeObject(input);
      expect(result.tags[0]).toBe('&lt;script&gt;');
      expect(result.tags[1]).toBe('normal');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeObject(null as unknown as Record<string, unknown>)).toBe(null);
      expect(sanitizeObject(undefined as unknown as Record<string, unknown>)).toBe(undefined);
    });
  });
});
