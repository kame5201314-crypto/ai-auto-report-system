/**
 * 圖片處理工具 - 錯誤處理單元測試
 */

import { describe, it, expect, vi } from 'vitest';
import {
  SafeError,
  toSafeError,
  getUserFriendlyMessage,
  safeAsync,
  assertDefined,
  isFile,
  isBlob,
} from '../utils/errorHandler';

describe('SafeError', () => {
  it('應該創建包含使用者訊息和錯誤代碼的錯誤', () => {
    const error = new SafeError('測試錯誤', 'TEST_ERROR');
    expect(error.userMessage).toBe('測試錯誤');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.name).toBe('SafeError');
  });

  it('應該使用預設錯誤代碼', () => {
    const error = new SafeError('測試錯誤');
    expect(error.code).toBe('UNKNOWN_ERROR');
  });
});

describe('toSafeError', () => {
  it('應該直接返回 SafeError', () => {
    const original = new SafeError('原始錯誤', 'ORIGINAL');
    const result = toSafeError(original);
    expect(result).toBe(original);
  });

  it('應該將一般 Error 轉換為 SafeError', () => {
    const original = new Error('Internal error details');
    const result = toSafeError(original, 'FILE_READ_ERROR');
    expect(result).toBeInstanceOf(SafeError);
    expect(result.code).toBe('FILE_READ_ERROR');
    // 確保不洩露原始錯誤訊息
    expect(result.userMessage).not.toContain('Internal error details');
  });

  it('應該識別記憶體相關錯誤', () => {
    const error = new Error('Out of memory');
    const result = toSafeError(error);
    expect(result.code).toBe('MEMORY_ERROR');
  });

  it('應該識別網路相關錯誤', () => {
    const error = new Error('Network request failed');
    const result = toSafeError(error);
    expect(result.code).toBe('NETWORK_ERROR');
  });

  it('應該識別檔案讀取錯誤', () => {
    const error = new Error('Failed to read file');
    const result = toSafeError(error);
    expect(result.code).toBe('FILE_READ_ERROR');
  });

  it('應該處理非 Error 物件', () => {
    const result = toSafeError('string error');
    expect(result).toBeInstanceOf(SafeError);
  });

  it('應該處理 null 和 undefined', () => {
    expect(toSafeError(null)).toBeInstanceOf(SafeError);
    expect(toSafeError(undefined)).toBeInstanceOf(SafeError);
  });
});

describe('getUserFriendlyMessage', () => {
  it('應該返回使用者友好的訊息', () => {
    const error = new SafeError('友好訊息', 'TEST');
    expect(getUserFriendlyMessage(error)).toBe('友好訊息');
  });

  it('應該將一般錯誤轉換為友好訊息', () => {
    const error = new Error('Technical details');
    const message = getUserFriendlyMessage(error);
    expect(message).not.toContain('Technical details');
  });
});

describe('safeAsync', () => {
  it('應該正確處理成功的操作', async () => {
    const result = await safeAsync(async () => 'success');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('success');
    }
  });

  it('應該正確處理失敗的操作', async () => {
    const result = await safeAsync(async () => {
      throw new Error('Operation failed');
    }, 'TEST_ERROR');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(SafeError);
      expect(result.error.code).toBe('TEST_ERROR');
    }
  });

  it('應該正確處理非同步操作', async () => {
    const result = await safeAsync(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 42;
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(42);
    }
  });
});

describe('assertDefined', () => {
  it('應該通過非空值', () => {
    expect(() => assertDefined('value')).not.toThrow();
    expect(() => assertDefined(0)).not.toThrow();
    expect(() => assertDefined(false)).not.toThrow();
    expect(() => assertDefined({})).not.toThrow();
  });

  it('應該對 null 拋出錯誤', () => {
    expect(() => assertDefined(null)).toThrow(SafeError);
  });

  it('應該對 undefined 拋出錯誤', () => {
    expect(() => assertDefined(undefined)).toThrow(SafeError);
  });

  it('應該使用自訂錯誤訊息', () => {
    try {
      assertDefined(null, '自訂訊息');
    } catch (e) {
      expect((e as SafeError).userMessage).toBe('自訂訊息');
    }
  });
});

describe('isFile', () => {
  it('應該正確識別 File 物件', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    expect(isFile(file)).toBe(true);
  });

  it('應該拒絕非 File 物件', () => {
    expect(isFile(null)).toBe(false);
    expect(isFile(undefined)).toBe(false);
    expect(isFile('string')).toBe(false);
    expect(isFile({})).toBe(false);
    expect(isFile(new Blob())).toBe(false);
  });
});

describe('isBlob', () => {
  it('應該正確識別 Blob 物件', () => {
    const blob = new Blob(['content']);
    expect(isBlob(blob)).toBe(true);
  });

  it('應該識別 File 物件（File 繼承自 Blob）', () => {
    const file = new File(['content'], 'test.txt');
    expect(isBlob(file)).toBe(true);
  });

  it('應該拒絕非 Blob 物件', () => {
    expect(isBlob(null)).toBe(false);
    expect(isBlob(undefined)).toBe(false);
    expect(isBlob('string')).toBe(false);
    expect(isBlob({})).toBe(false);
  });
});

describe('錯誤遮蔽安全性測試', () => {
  it('不應該在錯誤訊息中洩露系統資訊', () => {
    const sensitiveError = new Error(
      'SQL Error: SELECT * FROM users WHERE password = "secret123"'
    );
    const safeError = toSafeError(sensitiveError);

    expect(safeError.userMessage).not.toContain('SQL');
    expect(safeError.userMessage).not.toContain('password');
    expect(safeError.userMessage).not.toContain('secret');
  });

  it('不應該在錯誤訊息中洩露檔案路徑', () => {
    const pathError = new Error(
      'ENOENT: no such file or directory, open "/etc/passwd"'
    );
    const safeError = toSafeError(pathError);

    expect(safeError.userMessage).not.toContain('/etc/passwd');
    expect(safeError.userMessage).not.toContain('ENOENT');
  });

  it('不應該在錯誤訊息中洩露堆疊追蹤', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at Object.<anonymous> (/app/src/index.js:10:15)';
    const safeError = toSafeError(error);

    expect(safeError.userMessage).not.toContain('Object.<anonymous>');
    expect(safeError.userMessage).not.toContain('/app/src');
  });
});
