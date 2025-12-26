/**
 * 圖片處理工具 - 驗證函數單元測試
 *
 * 測試覆蓋：
 * - 正常路徑 (Happy Path)
 * - 邊界情況 (Edge Cases)
 * - 錯誤處理
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
  validateFile,
  validateFiles,
  safeParseInt,
  safeParseFloat,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
} from '../utils/validation';

// 模擬 File 物件
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('validateFileType', () => {
  it('應該接受有效的 JPEG 檔案', () => {
    const file = createMockFile('test.jpg', 1000, 'image/jpeg');
    const result = validateFileType(file);
    expect(result.isValid).toBe(true);
  });

  it('應該接受有效的 PNG 檔案', () => {
    const file = createMockFile('test.png', 1000, 'image/png');
    const result = validateFileType(file);
    expect(result.isValid).toBe(true);
  });

  it('應該接受有效的 WebP 檔案', () => {
    const file = createMockFile('test.webp', 1000, 'image/webp');
    const result = validateFileType(file);
    expect(result.isValid).toBe(true);
  });

  it('應該接受有效的 GIF 檔案', () => {
    const file = createMockFile('test.gif', 1000, 'image/gif');
    const result = validateFileType(file);
    expect(result.isValid).toBe(true);
  });

  it('應該拒絕不支援的檔案類型', () => {
    const file = createMockFile('test.pdf', 1000, 'application/pdf');
    const result = validateFileType(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('不支援的檔案格式');
  });

  it('應該拒絕副檔名與類型不符的檔案', () => {
    const file = createMockFile('test.txt', 1000, 'image/jpeg');
    const result = validateFileType(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('副檔名與類型不符');
  });

  it('應該拒絕 null 或 undefined', () => {
    const result = validateFileType(null as unknown as File);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('無效的檔案物件');
  });
});

describe('validateFileSize', () => {
  it('應該接受正常大小的檔案', () => {
    const file = createMockFile('test.jpg', 1000, 'image/jpeg');
    const result = validateFileSize(file);
    expect(result.isValid).toBe(true);
  });

  it('應該拒絕超過大小限制的檔案', () => {
    const file = createMockFile('test.jpg', MAX_FILE_SIZE + 1, 'image/jpeg');
    const result = validateFileSize(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('超過限制');
  });

  it('應該拒絕空檔案', () => {
    const file = createMockFile('test.jpg', 0, 'image/jpeg');
    const result = validateFileSize(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('檔案為空');
  });

  it('應該處理無效的檔案物件', () => {
    const result = validateFileSize(null as unknown as File);
    expect(result.isValid).toBe(false);
  });
});

describe('validateImageDimensions', () => {
  it('應該接受有效的尺寸', () => {
    const result = validateImageDimensions(800, 600);
    expect(result.isValid).toBe(true);
  });

  it('應該拒絕過小的尺寸', () => {
    const result = validateImageDimensions(5, 5);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`不能小於 ${MIN_IMAGE_DIMENSION}`);
  });

  it('應該拒絕過大的尺寸', () => {
    const result = validateImageDimensions(5000, 5000);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`不能超過 ${MAX_IMAGE_DIMENSION}`);
  });

  it('應該拒絕非數字類型', () => {
    const result = validateImageDimensions('800' as unknown as number, 600);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('必須為數字');
  });

  it('應該拒絕 NaN', () => {
    const result = validateImageDimensions(NaN, 600);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('無效的尺寸數值');
  });

  it('應該拒絕非整數', () => {
    const result = validateImageDimensions(800.5, 600);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('必須為整數');
  });

  it('應該接受邊界值', () => {
    const minResult = validateImageDimensions(MIN_IMAGE_DIMENSION, MIN_IMAGE_DIMENSION);
    expect(minResult.isValid).toBe(true);

    const maxResult = validateImageDimensions(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION);
    expect(maxResult.isValid).toBe(true);
  });
});

describe('validatePercentage', () => {
  it('應該接受有效的百分比 (0-1)', () => {
    expect(validatePercentage(0.5, '透明度').isValid).toBe(true);
    expect(validatePercentage(0, '透明度').isValid).toBe(true);
    expect(validatePercentage(1, '透明度').isValid).toBe(true);
  });

  it('應該拒絕超出範圍的值', () => {
    const result1 = validatePercentage(-0.1, '透明度');
    expect(result1.isValid).toBe(false);

    const result2 = validatePercentage(1.1, '透明度');
    expect(result2.isValid).toBe(false);
  });

  it('應該拒絕非數字類型', () => {
    const result = validatePercentage('0.5' as unknown as number, '透明度');
    expect(result.isValid).toBe(false);
  });

  it('應該拒絕 NaN', () => {
    const result = validatePercentage(NaN, '透明度');
    expect(result.isValid).toBe(false);
  });
});

describe('validateBatchSize', () => {
  it('應該接受有效的批次大小', () => {
    expect(validateBatchSize(1).isValid).toBe(true);
    expect(validateBatchSize(MAX_BATCH_SIZE).isValid).toBe(true);
  });

  it('應該拒絕超過上限的批次大小', () => {
    const result = validateBatchSize(MAX_BATCH_SIZE + 1);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('上限');
  });

  it('應該拒絕無效的數量', () => {
    expect(validateBatchSize(0).isValid).toBe(false);
    expect(validateBatchSize(-1).isValid).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('應該轉義 HTML 特殊字元', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeString(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('應該轉義引號', () => {
    const input = 'test"value\'data';
    const result = sanitizeString(input);
    expect(result).not.toContain('"');
    expect(result).not.toContain("'");
  });

  it('應該限制字串長度', () => {
    const longString = 'a'.repeat(300);
    const result = sanitizeString(longString);
    expect(result.length).toBeLessThanOrEqual(255);
  });

  it('應該處理非字串類型', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
  });

  it('應該移除前後空白', () => {
    const result = sanitizeString('  test  ');
    expect(result).toBe('test');
  });
});

describe('sanitizeFileName', () => {
  it('應該移除路徑遍歷字元', () => {
    const result = sanitizeFileName('../../../etc/passwd');
    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });

  it('應該移除特殊字元', () => {
    const result = sanitizeFileName('file:name*with?special<chars>.jpg');
    expect(result).not.toContain(':');
    expect(result).not.toContain('*');
    expect(result).not.toContain('?');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('應該限制檔名長度', () => {
    const longName = 'a'.repeat(250) + '.jpg';
    const result = sanitizeFileName(longName);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it('應該處理非字串類型', () => {
    expect(sanitizeFileName(null as unknown as string)).toBe('unnamed');
    expect(sanitizeFileName(undefined as unknown as string)).toBe('unnamed');
  });

  it('應該將空白轉換為底線', () => {
    const result = sanitizeFileName('my file name.jpg');
    expect(result).not.toContain(' ');
    expect(result).toContain('_');
  });
});

describe('validateFile', () => {
  it('應該同時驗證類型和大小', () => {
    const validFile = createMockFile('test.jpg', 1000, 'image/jpeg');
    expect(validateFile(validFile).isValid).toBe(true);

    const invalidType = createMockFile('test.pdf', 1000, 'application/pdf');
    expect(validateFile(invalidType).isValid).toBe(false);

    const tooLarge = createMockFile('test.jpg', MAX_FILE_SIZE + 1, 'image/jpeg');
    expect(validateFile(tooLarge).isValid).toBe(false);
  });
});

describe('validateFiles', () => {
  it('應該返回有效檔案和錯誤列表', () => {
    const files = [
      createMockFile('valid.jpg', 1000, 'image/jpeg'),
      createMockFile('invalid.pdf', 1000, 'application/pdf'),
      createMockFile('valid.png', 1000, 'image/png'),
    ];

    const result = validateFiles(files);
    expect(result.validFiles.length).toBe(2);
    expect(result.errors.length).toBe(1);
  });

  it('應該驗證批次大小', () => {
    const tooManyFiles = Array(MAX_BATCH_SIZE + 1)
      .fill(null)
      .map((_, i) => createMockFile(`file${i}.jpg`, 100, 'image/jpeg'));

    const result = validateFiles(tooManyFiles);
    expect(result.validFiles.length).toBe(0);
    expect(result.errors.length).toBe(1);
  });
});

describe('safeParseInt', () => {
  it('應該正確解析整數', () => {
    expect(safeParseInt(42, 0)).toBe(42);
    expect(safeParseInt('42', 0)).toBe(42);
    expect(safeParseInt(42.9, 0)).toBe(42);
  });

  it('應該返回預設值當輸入無效時', () => {
    expect(safeParseInt('invalid', 10)).toBe(10);
    expect(safeParseInt(NaN, 10)).toBe(10);
    expect(safeParseInt(null, 10)).toBe(10);
    expect(safeParseInt(undefined, 10)).toBe(10);
  });
});

describe('safeParseFloat', () => {
  it('應該正確解析浮點數', () => {
    expect(safeParseFloat(3.14, 0)).toBe(3.14);
    expect(safeParseFloat('3.14', 0)).toBe(3.14);
  });

  it('應該返回預設值當輸入無效時', () => {
    expect(safeParseFloat('invalid', 1.5)).toBe(1.5);
    expect(safeParseFloat(NaN, 1.5)).toBe(1.5);
    expect(safeParseFloat(null, 1.5)).toBe(1.5);
  });
});
