/**
 * TDD 示範 - 圖片格式建議功能測試
 *
 * TDD 流程：
 * 1. 紅燈 (Red) - 先寫失敗的測試
 * 2. 綠燈 (Green) - 實作最小程式碼讓測試通過
 * 3. 重構 (Refactor) - 優化程式碼
 */

import { describe, it, expect } from 'vitest';
import {
  suggestOutputFormat,
  estimateFileSize,
  getFormatRecommendation,
  analyzeImageCharacteristics,
  type ImageAnalysis,
  type FormatRecommendation,
} from '../utils/formatSuggester';

describe('suggestOutputFormat - 根據用途建議輸出格式', () => {
  it('電商平台應建議 JPEG 格式（檔案小、相容性高）', () => {
    const result = suggestOutputFormat('ecommerce');
    expect(result).toBe('jpeg');
  });

  it('需要透明背景應建議 PNG 格式', () => {
    const result = suggestOutputFormat('transparent');
    expect(result).toBe('png');
  });

  it('網頁優化應建議 WebP 格式（最佳壓縮比）', () => {
    const result = suggestOutputFormat('web-optimized');
    expect(result).toBe('webp');
  });

  it('高品質印刷應建議 PNG 格式', () => {
    const result = suggestOutputFormat('print');
    expect(result).toBe('png');
  });

  it('社群媒體應建議 JPEG 格式', () => {
    const result = suggestOutputFormat('social-media');
    expect(result).toBe('jpeg');
  });

  it('未知用途應預設 JPEG', () => {
    const result = suggestOutputFormat('unknown' as any);
    expect(result).toBe('jpeg');
  });
});

describe('estimateFileSize - 估算輸出檔案大小', () => {
  it('應正確估算 JPEG 檔案大小', () => {
    const result = estimateFileSize(800, 800, 'jpeg', 0.85);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(800 * 800 * 3); // 不可能比原始更大
  });

  it('應正確估算 PNG 檔案大小', () => {
    const result = estimateFileSize(800, 800, 'png', 1);
    expect(result).toBeGreaterThan(0);
  });

  it('應正確估算 WebP 檔案大小（比 JPEG 更小）', () => {
    const jpegSize = estimateFileSize(800, 800, 'jpeg', 0.85);
    const webpSize = estimateFileSize(800, 800, 'webp', 0.85);
    expect(webpSize).toBeLessThan(jpegSize);
  });

  it('低品質應產生更小的檔案', () => {
    const highQuality = estimateFileSize(800, 800, 'jpeg', 0.95);
    const lowQuality = estimateFileSize(800, 800, 'jpeg', 0.5);
    expect(lowQuality).toBeLessThan(highQuality);
  });

  it('應處理無效輸入', () => {
    expect(estimateFileSize(0, 0, 'jpeg', 0.85)).toBe(0);
    expect(estimateFileSize(-100, 100, 'jpeg', 0.85)).toBe(0);
  });
});

describe('getFormatRecommendation - 取得完整格式建議', () => {
  it('應返回完整的建議物件', () => {
    const result = getFormatRecommendation(1000, 1000, true, 'ecommerce');

    expect(result).toHaveProperty('format');
    expect(result).toHaveProperty('quality');
    expect(result).toHaveProperty('estimatedSize');
    expect(result).toHaveProperty('reason');
  });

  it('需要透明背景時應建議 PNG 且說明原因', () => {
    const result = getFormatRecommendation(800, 800, true, 'ecommerce');

    expect(result.format).toBe('png');
    expect(result.reason).toContain('透明');
  });

  it('電商用途不需透明時應建議 JPEG', () => {
    const result = getFormatRecommendation(800, 800, false, 'ecommerce');

    expect(result.format).toBe('jpeg');
    expect(result.quality).toBeGreaterThanOrEqual(0.8);
    expect(result.quality).toBeLessThanOrEqual(0.9);
  });

  it('大圖片應建議較低品質以減少檔案大小', () => {
    const smallImage = getFormatRecommendation(400, 400, false, 'ecommerce');
    const largeImage = getFormatRecommendation(2000, 2000, false, 'ecommerce');

    expect(largeImage.quality).toBeLessThanOrEqual(smallImage.quality);
  });
});

describe('analyzeImageCharacteristics - 分析圖片特性', () => {
  it('應分析小圖片', () => {
    const result = analyzeImageCharacteristics(100, 100);

    expect(result.sizeCategory).toBe('small');
    expect(result.totalPixels).toBe(10000);
  });

  it('應分析中等圖片', () => {
    const result = analyzeImageCharacteristics(800, 600);

    expect(result.sizeCategory).toBe('medium');
    expect(result.aspectRatio).toBeCloseTo(800 / 600, 2);
  });

  it('應分析大圖片', () => {
    const result = analyzeImageCharacteristics(2000, 2000);

    expect(result.sizeCategory).toBe('large');
  });

  it('應識別正方形圖片', () => {
    const result = analyzeImageCharacteristics(500, 500);

    expect(result.isSquare).toBe(true);
  });

  it('應識別非正方形圖片', () => {
    const result = analyzeImageCharacteristics(800, 600);

    expect(result.isSquare).toBe(false);
  });

  it('應識別橫向圖片', () => {
    const result = analyzeImageCharacteristics(1920, 1080);

    expect(result.orientation).toBe('landscape');
  });

  it('應識別直向圖片', () => {
    const result = analyzeImageCharacteristics(1080, 1920);

    expect(result.orientation).toBe('portrait');
  });

  it('應處理無效尺寸', () => {
    const result = analyzeImageCharacteristics(0, 0);

    expect(result.sizeCategory).toBe('small');
    expect(result.totalPixels).toBe(0);
  });
});
