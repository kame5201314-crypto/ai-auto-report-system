/**
 * 邊界情況測試 (Edge Cases)
 *
 * 測試極端情況、異常輸入、邊界值
 */

import { describe, it, expect } from 'vitest';
import {
  validateFileType,
  validateFileSize,
  validateImageDimensions,
  validatePercentage,
  validateBatchSize,
  sanitizeString,
  sanitizeFileName,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
} from '../utils/validation';
import {
  SafeError,
  toSafeError,
  safeAsync,
} from '../utils/errorHandler';

// ============================================
// 極端數值邊界測試
// ============================================

describe('極端數值邊界測試', () => {
  describe('validateImageDimensions - 極端邊界值', () => {
    it('應該接受最小邊界值', () => {
      const result = validateImageDimensions(MIN_IMAGE_DIMENSION, MIN_IMAGE_DIMENSION);
      expect(result.isValid).toBe(true);
    });

    it('應該接受最大邊界值', () => {
      const result = validateImageDimensions(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION);
      expect(result.isValid).toBe(true);
    });

    it('應該拒絕最小邊界值 - 1', () => {
      const result = validateImageDimensions(MIN_IMAGE_DIMENSION - 1, MIN_IMAGE_DIMENSION);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕最大邊界值 + 1', () => {
      const result = validateImageDimensions(MAX_IMAGE_DIMENSION + 1, MAX_IMAGE_DIMENSION);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕 JavaScript 最大安全整數', () => {
      const result = validateImageDimensions(Number.MAX_SAFE_INTEGER, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕負數最大值', () => {
      const result = validateImageDimensions(-Number.MAX_SAFE_INTEGER, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕 Infinity', () => {
      const result = validateImageDimensions(Infinity, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕 -Infinity', () => {
      const result = validateImageDimensions(-Infinity, 100);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePercentage - 極端邊界值', () => {
    it('應該接受 0', () => {
      expect(validatePercentage(0, 'test').isValid).toBe(true);
    });

    it('應該接受 1', () => {
      expect(validatePercentage(1, 'test').isValid).toBe(true);
    });

    it('應該拒絕極小負數', () => {
      expect(validatePercentage(-0.0001, 'test').isValid).toBe(false);
    });

    it('應該拒絕極小超過 1', () => {
      expect(validatePercentage(1.0001, 'test').isValid).toBe(false);
    });

    it('應該拒絕 Infinity', () => {
      expect(validatePercentage(Infinity, 'test').isValid).toBe(false);
    });
  });

  describe('validateBatchSize - 極端邊界值', () => {
    it('應該接受 1', () => {
      expect(validateBatchSize(1).isValid).toBe(true);
    });

    it('應該接受最大批次數', () => {
      expect(validateBatchSize(MAX_BATCH_SIZE).isValid).toBe(true);
    });

    it('應該拒絕 0', () => {
      expect(validateBatchSize(0).isValid).toBe(false);
    });

    it('應該拒絕最大批次數 + 1', () => {
      expect(validateBatchSize(MAX_BATCH_SIZE + 1).isValid).toBe(false);
    });
  });
});

// ============================================
// 特殊字元與編碼測試
// ============================================

describe('特殊字元與編碼測試', () => {
  describe('sanitizeString - 特殊字元處理', () => {
    it('應該處理 Unicode 字元', () => {
      const result = sanitizeString('你好世界 🎉');
      expect(result).toContain('你好世界');
    });

    it('應該處理零寬字元', () => {
      const input = 'test\u200B\u200C\u200Dvalue';
      const result = sanitizeString(input);
      expect(typeof result).toBe('string');
    });

    it('應該處理控制字元', () => {
      const input = 'test\x00\x01\x02value';
      const result = sanitizeString(input);
      expect(typeof result).toBe('string');
    });

    it('應該處理 RTL 標記', () => {
      const input = 'test\u200F\u200Evalue';
      const result = sanitizeString(input);
      expect(typeof result).toBe('string');
    });

    it('應該處理 SQL 注入嘗試', () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizeString(input);
      expect(result).not.toContain("'");
    });

    it('應該處理 JavaScript 注入嘗試', () => {
      const input = '<img src=x onerror="alert(1)">';
      const result = sanitizeString(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('應該處理多行字串', () => {
      const input = 'line1\nline2\rline3\r\nline4';
      const result = sanitizeString(input);
      expect(typeof result).toBe('string');
    });

    it('應該處理純空白字串', () => {
      const result = sanitizeString('   \t\n  ');
      expect(result).toBe('');
    });
  });

  describe('sanitizeFileName - 特殊檔名處理', () => {
    it('應該處理 Windows 保留名稱', () => {
      const result = sanitizeFileName('CON.txt');
      expect(typeof result).toBe('string');
    });

    it('應該處理以點開頭的檔名', () => {
      const result = sanitizeFileName('.hidden');
      expect(result).not.toBe('');
    });

    it('應該處理多個連續點', () => {
      const result = sanitizeFileName('file...name.txt');
      expect(result).not.toContain('..');
    });

    it('應該處理 URL 編碼字元', () => {
      const result = sanitizeFileName('file%20name%2F.txt');
      expect(typeof result).toBe('string');
    });

    it('應該處理 Unicode 正規化攻擊', () => {
      // 使用不同的 Unicode 正規化形式
      const nfc = 'café';
      const nfd = 'café'; // 使用組合字元
      const result1 = sanitizeFileName(nfc);
      const result2 = sanitizeFileName(nfd);
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });
  });
});

// ============================================
// 型別強制轉換測試
// ============================================

describe('型別強制轉換測試', () => {
  describe('validateImageDimensions - 錯誤型別處理', () => {
    it('應該拒絕字串數字', () => {
      const result = validateImageDimensions('100' as any, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕物件', () => {
      const result = validateImageDimensions({} as any, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕陣列', () => {
      const result = validateImageDimensions([100] as any, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕布林值', () => {
      const result = validateImageDimensions(true as any, 100);
      expect(result.isValid).toBe(false);
    });

    it('應該拒絕 Symbol', () => {
      const result = validateImageDimensions(Symbol('test') as any, 100);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePercentage - 錯誤型別處理', () => {
    it('應該拒絕字串', () => {
      expect(validatePercentage('0.5' as any, 'test').isValid).toBe(false);
    });

    it('應該拒絕 null', () => {
      expect(validatePercentage(null as any, 'test').isValid).toBe(false);
    });

    it('應該拒絕 undefined', () => {
      expect(validatePercentage(undefined as any, 'test').isValid).toBe(false);
    });
  });
});

// ============================================
// 非同步錯誤處理測試
// ============================================

describe('非同步錯誤處理測試', () => {
  describe('safeAsync - 各種錯誤情況', () => {
    it('應該處理 Promise 拒絕', async () => {
      const result = await safeAsync(async () => {
        return Promise.reject(new Error('Rejected'));
      });
      expect(result.success).toBe(false);
    });

    it('應該處理巢狀 Promise 錯誤', async () => {
      const result = await safeAsync(async () => {
        await Promise.resolve();
        await Promise.resolve();
        throw new Error('Nested error');
      });
      expect(result.success).toBe(false);
    });

    it('應該處理 setTimeout 中的錯誤', async () => {
      const result = await safeAsync(async () => {
        await new Promise<void>((resolve, reject) => {
          setTimeout(() => reject(new Error('Timeout error')), 1);
        });
      });
      expect(result.success).toBe(false);
    });

    it('應該處理非 Error 物件的拋出', async () => {
      const result = await safeAsync(async () => {
        throw 'string error';
      });
      expect(result.success).toBe(false);
    });

    it('應該處理 undefined 拋出', async () => {
      const result = await safeAsync(async () => {
        throw undefined;
      });
      expect(result.success).toBe(false);
    });

    it('應該處理 null 拋出', async () => {
      const result = await safeAsync(async () => {
        throw null;
      });
      expect(result.success).toBe(false);
    });

    it('應該保留成功結果的型別', async () => {
      const result = await safeAsync(async () => {
        return { id: 1, name: 'test' };
      });

      if (result.success) {
        expect(result.data).toEqual({ id: 1, name: 'test' });
      }
    });
  });
});

// ============================================
// 記憶體與效能邊界測試
// ============================================

describe('記憶體與效能邊界測試', () => {
  describe('sanitizeString - 大量資料處理', () => {
    it('應該限制超長字串', () => {
      const longString = 'x'.repeat(10000);
      const result = sanitizeString(longString);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('應該處理重複的 XSS 嘗試', () => {
      const repeated = '<script>'.repeat(1000);
      const result = sanitizeString(repeated);
      expect(result).not.toContain('<');
    });
  });

  describe('sanitizeFileName - 大量資料處理', () => {
    it('應該限制超長檔名', () => {
      const longName = 'x'.repeat(1000) + '.jpg';
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });
});

// ============================================
// 並發與競態條件測試
// ============================================

describe('並發處理測試', () => {
  it('多個 safeAsync 應該能並發執行', async () => {
    const results = await Promise.all([
      safeAsync(async () => 'result1'),
      safeAsync(async () => 'result2'),
      safeAsync(async () => 'result3'),
    ]);

    expect(results.every(r => r.success)).toBe(true);
  });

  it('混合成功失敗的並發操作', async () => {
    const results = await Promise.all([
      safeAsync(async () => 'success'),
      safeAsync(async () => { throw new Error('fail'); }),
      safeAsync(async () => 'success'),
    ]);

    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[2].success).toBe(true);
  });
});
