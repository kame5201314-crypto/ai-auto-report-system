/**
 * 圖片格式建議工具
 *
 * TDD 開發 - 此模組是先寫測試再實作的範例
 *
 * 功能：
 * - 根據用途建議最佳輸出格式
 * - 估算輸出檔案大小
 * - 分析圖片特性
 */

// 用途類型
export type ImagePurpose =
  | 'ecommerce'      // 電商平台
  | 'transparent'    // 需要透明背景
  | 'web-optimized'  // 網頁優化
  | 'print'          // 印刷用途
  | 'social-media';  // 社群媒體

// 輸出格式
export type OutputFormat = 'jpeg' | 'png' | 'webp';

// 圖片分析結果
export interface ImageAnalysis {
  totalPixels: number;
  aspectRatio: number;
  sizeCategory: 'small' | 'medium' | 'large';
  isSquare: boolean;
  orientation: 'landscape' | 'portrait' | 'square';
}

// 格式建議結果
export interface FormatRecommendation {
  format: OutputFormat;
  quality: number;
  estimatedSize: number;
  reason: string;
}

/**
 * 根據用途建議輸出格式
 */
export function suggestOutputFormat(purpose: ImagePurpose): OutputFormat {
  switch (purpose) {
    case 'transparent':
      return 'png';
    case 'web-optimized':
      return 'webp';
    case 'print':
      return 'png';
    case 'ecommerce':
    case 'social-media':
    default:
      return 'jpeg';
  }
}

/**
 * 估算輸出檔案大小（位元組）
 *
 * 使用經驗公式估算：
 * - JPEG: 像素數 × 壓縮係數
 * - PNG: 像素數 × 壓縮係數（較大）
 * - WebP: 像素數 × 壓縮係數（最小）
 */
export function estimateFileSize(
  width: number,
  height: number,
  format: OutputFormat,
  quality: number
): number {
  // 防禦性檢查
  if (width <= 0 || height <= 0) {
    return 0;
  }

  const totalPixels = width * height;
  const safeQuality = Math.max(0.1, Math.min(1, quality));

  // 基於經驗的壓縮比例估算
  const compressionRatios: Record<OutputFormat, number> = {
    jpeg: 0.15 + (safeQuality * 0.35),  // 0.15 ~ 0.5 bytes per pixel
    png: 0.8,                            // PNG 壓縮比較固定
    webp: 0.1 + (safeQuality * 0.25),   // 0.1 ~ 0.35 bytes per pixel
  };

  const ratio = compressionRatios[format] ?? compressionRatios.jpeg;
  return Math.round(totalPixels * ratio);
}

/**
 * 分析圖片特性
 */
export function analyzeImageCharacteristics(
  width: number,
  height: number
): ImageAnalysis {
  // 防禦性檢查
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);

  const totalPixels = safeWidth * safeHeight;
  const aspectRatio = safeHeight > 0 ? safeWidth / safeHeight : 1;

  // 尺寸分類
  let sizeCategory: 'small' | 'medium' | 'large';
  if (totalPixels < 250000) {        // < 500x500
    sizeCategory = 'small';
  } else if (totalPixels < 2000000) { // < 1414x1414
    sizeCategory = 'large';
  } else {
    sizeCategory = 'large';
  }

  // 修正：500x500 到 1414x1414 之間應該是 medium
  if (totalPixels >= 250000 && totalPixels < 2000000) {
    sizeCategory = 'medium';
  }

  // 正方形判定（允許 5% 誤差）
  const isSquare = Math.abs(aspectRatio - 1) < 0.05;

  // 方向判定
  let orientation: 'landscape' | 'portrait' | 'square';
  if (isSquare) {
    orientation = 'square';
  } else if (aspectRatio > 1) {
    orientation = 'landscape';
  } else {
    orientation = 'portrait';
  }

  return {
    totalPixels,
    aspectRatio,
    sizeCategory,
    isSquare,
    orientation,
  };
}

/**
 * 取得完整格式建議
 */
export function getFormatRecommendation(
  width: number,
  height: number,
  needsTransparency: boolean,
  purpose: ImagePurpose
): FormatRecommendation {
  const analysis = analyzeImageCharacteristics(width, height);

  // 如果需要透明背景，強制使用 PNG
  if (needsTransparency) {
    const quality = 1; // PNG 不需要品質設定
    return {
      format: 'png',
      quality,
      estimatedSize: estimateFileSize(width, height, 'png', quality),
      reason: '需要透明背景，使用 PNG 格式保留透明度',
    };
  }

  // 根據用途選擇格式
  const format = suggestOutputFormat(purpose);

  // 根據圖片大小調整品質
  let quality: number;
  let reason: string;

  switch (analysis.sizeCategory) {
    case 'small':
      quality = 0.9;
      reason = `小尺寸圖片，使用 ${format.toUpperCase()} 格式，高品質設定`;
      break;
    case 'medium':
      quality = 0.85;
      reason = `中等尺寸圖片，使用 ${format.toUpperCase()} 格式，平衡品質與檔案大小`;
      break;
    case 'large':
      quality = 0.8;
      reason = `大尺寸圖片，使用 ${format.toUpperCase()} 格式，適度壓縮以減少檔案大小`;
      break;
    default:
      quality = 0.85;
      reason = `使用 ${format.toUpperCase()} 格式`;
  }

  return {
    format,
    quality,
    estimatedSize: estimateFileSize(width, height, format, quality),
    reason,
  };
}
