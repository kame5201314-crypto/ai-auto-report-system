/**
 * 圖片處理核心服務
 *
 * 資安規範：
 * - 所有非同步操作包裹在 try-catch 區塊中
 * - 嚴格執行 null/undefined 檢查
 * - 輸入驗證
 * - 錯誤遮蔽
 */

import { removeBackground, Config } from '@imgly/background-removal';
import type { ProcessingOptions, WatermarkPosition, BackgroundRemovalModel } from '../types';
import { removeBackgroundWithApi } from './removeBgApi';
import {
  validateImageDimensions,
  validatePercentage,
  validateFile,
  sanitizeFileName,
} from '../utils/validation';
import {
  SafeError,
  toSafeError,
  logError,
  assertDefined,
  isBlob,
} from '../utils/errorHandler';

let watermarkImage: HTMLImageElement | null = null;

/**
 * 取得模型配置
 *
 * 可用模型：
 * - isnet: 完整精度 IS-Net，品質最高
 * - isnet_fp16: 半精度，速度較快
 * - isnet_quint8: 8位量化，最快最小
 *
 * 另外支援 GPU 加速（需要 WebGPU 支援的瀏覽器）
 */
function getModelConfig(model: BackgroundRemovalModel): Partial<Config> {
  switch (model) {
    case 'fast':
      return {
        model: 'isnet_quint8',  // 量化模型，最快
        device: 'cpu',
        output: {
          format: 'image/png',
          quality: 0.8,
        },
      };
    case 'quality':
      return {
        model: 'isnet',  // 完整精度，品質最佳
        device: 'gpu',   // 嘗試使用 GPU 加速
        output: {
          format: 'image/png',
          quality: 1,
        },
      };
    case 'balanced':
    default:
      return {
        model: 'isnet_fp16',  // 半精度，平衡
        device: 'cpu',
        output: {
          format: 'image/png',
          quality: 0.9,
        },
      };
  }
}

/**
 * 載入浮水印圖片
 */
export async function loadWatermark(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof url !== 'string' || url.length === 0) {
        reject(new SafeError('無效的浮水印網址', 'WATERMARK_ERROR'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        watermarkImage = img;
        resolve(img);
      };

      img.onerror = () => {
        reject(new SafeError('浮水印圖片載入失敗', 'WATERMARK_ERROR'));
      };

      img.src = url;
    } catch (error) {
      logError('loadWatermark', error);
      reject(toSafeError(error, 'WATERMARK_ERROR'));
    }
  });
}

/**
 * 設定浮水印圖片（從 base64 或 blob）
 */
export function setWatermarkImage(img: HTMLImageElement | null): void {
  if (img !== null && !(img instanceof HTMLImageElement)) {
    logError('setWatermarkImage', new Error('Invalid image element'));
    return;
  }
  watermarkImage = img;
}

/**
 * 從 Blob 轉換為 Image Element
 */
async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    try {
      // 輸入驗證
      if (!isBlob(blob)) {
        reject(new SafeError('無效的圖片資料', 'FILE_READ_ERROR'));
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new SafeError('圖片載入失敗', 'FILE_READ_ERROR'));
      };

      img.src = url;
    } catch (error) {
      logError('blobToImage', error);
      reject(toSafeError(error, 'FILE_READ_ERROR'));
    }
  });
}

/**
 * 去背功能
 * @param file - 要處理的圖片檔案
 * @param model - 模型品質：'fast' | 'balanced' | 'quality'
 * @param onProgress - 進度回調
 */
export async function removeBackgroundFromImage(
  file: File,
  model: BackgroundRemovalModel = 'balanced',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    // 輸入驗證
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new SafeError(validation.error ?? '檔案驗證失敗', 'FILE_TYPE_INVALID');
    }

    // 取得模型配置
    const modelConfig = getModelConfig(model);

    const blob = await removeBackground(file, {
      ...modelConfig,
      progress: (key, current, total) => {
        if (onProgress && typeof total === 'number' && total > 0) {
          const progress = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
          onProgress(progress);
        }
      },
    });

    // 結果驗證
    if (!isBlob(blob)) {
      throw new SafeError('去背處理結果無效', 'BACKGROUND_REMOVAL_ERROR');
    }

    return blob;
  } catch (error) {
    logError('removeBackgroundFromImage', error);
    throw toSafeError(error, 'BACKGROUND_REMOVAL_ERROR');
  }
}

/**
 * 計算浮水印位置
 */
function calculateWatermarkPosition(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPosition,
  padding: number = 20
): { x: number; y: number } {
  // 防禦性檢查
  const safeCanvasWidth = Math.max(1, canvasWidth);
  const safeCanvasHeight = Math.max(1, canvasHeight);
  const safeWatermarkWidth = Math.max(1, watermarkWidth);
  const safeWatermarkHeight = Math.max(1, watermarkHeight);
  const safePadding = Math.max(0, padding);

  switch (position) {
    case 'top-left':
      return { x: safePadding, y: safePadding };
    case 'top-right':
      return { x: safeCanvasWidth - safeWatermarkWidth - safePadding, y: safePadding };
    case 'bottom-left':
      return { x: safePadding, y: safeCanvasHeight - safeWatermarkHeight - safePadding };
    case 'bottom-right':
      return {
        x: safeCanvasWidth - safeWatermarkWidth - safePadding,
        y: safeCanvasHeight - safeWatermarkHeight - safePadding,
      };
    case 'center':
      return {
        x: (safeCanvasWidth - safeWatermarkWidth) / 2,
        y: (safeCanvasHeight - safeWatermarkHeight) / 2,
      };
    default:
      // 預設右下角
      return {
        x: safeCanvasWidth - safeWatermarkWidth - safePadding,
        y: safeCanvasHeight - safeWatermarkHeight - safePadding,
      };
  }
}

/**
 * 添加浮水印到畫布
 */
function addWatermarkToCanvas(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  options: ProcessingOptions
): void {
  try {
    // 空值檢查
    if (!watermarkImage) {
      return;
    }

    // 驗證透明度
    const opacityValidation = validatePercentage(options.watermarkOpacity, '透明度');
    const opacity = opacityValidation.isValid ? options.watermarkOpacity : 0.3;

    // 計算浮水印大小（最大為畫布的 15%）
    const maxSize = Math.min(canvasWidth, canvasHeight) * 0.15;
    const scale = Math.min(
      maxSize / Math.max(1, watermarkImage.width),
      maxSize / Math.max(1, watermarkImage.height)
    );
    const watermarkWidth = watermarkImage.width * scale;
    const watermarkHeight = watermarkImage.height * scale;

    const position = calculateWatermarkPosition(
      canvasWidth,
      canvasHeight,
      watermarkWidth,
      watermarkHeight,
      options.watermarkPosition ?? 'bottom-right'
    );

    ctx.globalAlpha = opacity;
    ctx.drawImage(
      watermarkImage,
      position.x,
      position.y,
      watermarkWidth,
      watermarkHeight
    );
    ctx.globalAlpha = 1;
  } catch (error) {
    logError('addWatermarkToCanvas', error);
    // 浮水印失敗不中斷整個流程
  }
}

/**
 * 計算保持比例的目標尺寸
 */
function calculateTargetSize(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  // 防禦性檢查
  const safeOrigWidth = Math.max(1, originalWidth);
  const safeOrigHeight = Math.max(1, originalHeight);
  const safeTargetWidth = Math.max(1, targetWidth);
  const safeTargetHeight = Math.max(1, targetHeight);

  if (!maintainAspectRatio) {
    return { width: safeTargetWidth, height: safeTargetHeight };
  }

  const aspectRatio = safeOrigWidth / safeOrigHeight;
  const targetAspectRatio = safeTargetWidth / safeTargetHeight;

  if (aspectRatio > targetAspectRatio) {
    return {
      width: safeTargetWidth,
      height: Math.max(1, Math.round(safeTargetWidth / aspectRatio)),
    };
  } else {
    return {
      width: Math.max(1, Math.round(safeTargetHeight * aspectRatio)),
      height: safeTargetHeight,
    };
  }
}

/**
 * 主要處理函數
 */
export async function processImage(
  inputBlob: Blob,
  options: ProcessingOptions
): Promise<Blob> {
  try {
    // 輸入驗證
    if (!isBlob(inputBlob)) {
      throw new SafeError('無效的輸入資料', 'IMAGE_PROCESS_ERROR');
    }

    const img = await blobToImage(inputBlob);

    // 計算最終尺寸
    let finalWidth = img.width;
    let finalHeight = img.height;

    if (options.resizeEnabled) {
      // 驗證尺寸參數
      const dimValidation = validateImageDimensions(
        options.targetWidth,
        options.targetHeight
      );

      if (dimValidation.isValid) {
        const targetSize = calculateTargetSize(
          img.width,
          img.height,
          options.targetWidth,
          options.targetHeight,
          options.maintainAspectRatio ?? true
        );
        finalWidth = targetSize.width;
        finalHeight = targetSize.height;
      }
    }

    // 創建畫布
    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;

    const ctx = canvas.getContext('2d');
    assertDefined(ctx, '無法建立畫布上下文');

    // 如果輸出是 JPEG，填充白色背景
    if (options.outputFormat === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, finalWidth, finalHeight);
    }

    // 繪製調整大小後的圖片
    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

    // 添加浮水印
    if (options.addWatermark && watermarkImage) {
      addWatermarkToCanvas(ctx, finalWidth, finalHeight, options);
    }

    // 輸出 Blob
    return new Promise((resolve, reject) => {
      try {
        const mimeType =
          options.outputFormat === 'png'
            ? 'image/png'
            : options.outputFormat === 'webp'
              ? 'image/webp'
              : 'image/jpeg';

        // 驗證壓縮品質
        const qualityValidation = validatePercentage(options.compressionQuality, '壓縮品質');
        const quality = options.compressionEnabled && qualityValidation.isValid
          ? options.compressionQuality
          : 0.9;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new SafeError('圖片輸出失敗', 'COMPRESSION_ERROR'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        logError('processImage:toBlob', error);
        reject(toSafeError(error, 'COMPRESSION_ERROR'));
      }
    });
  } catch (error) {
    logError('processImage', error);
    throw toSafeError(error, 'IMAGE_PROCESS_ERROR');
  }
}

/**
 * 完整處理流程
 */
export async function processImageComplete(
  file: File,
  options: ProcessingOptions,
  onProgress?: (stage: string, progress: number) => void
): Promise<Blob> {
  try {
    // 輸入驗證
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new SafeError(validation.error ?? '檔案驗證失敗', 'FILE_TYPE_INVALID');
    }

    let currentBlob: Blob = file;

    // 階段 1: 去背
    if (options.removeBackground) {
      const provider = options.backgroundRemovalProvider ?? 'local';

      if (provider === 'removebg') {
        // 使用 Remove.bg API
        if (!options.removeBgApiKey) {
          throw new SafeError('請先設定 Remove.bg API Key', 'API_KEY_MISSING');
        }

        onProgress?.('去背處理中 (Remove.bg)', 0);
        currentBlob = await removeBackgroundWithApi(
          file,
          {
            apiKey: options.removeBgApiKey,
            size: options.removeBgSize ?? 'auto',
            type: options.removeBgType ?? 'auto',
            format: 'png',
          },
          (progress) => {
            onProgress?.('去背處理中 (Remove.bg)', Math.min(70, progress * 0.7));
          }
        );
      } else {
        // 使用本地處理
        const modelName = options.backgroundRemovalModel === 'fast' ? '快速' :
                          options.backgroundRemovalModel === 'quality' ? '高品質' : '平衡';
        onProgress?.(`去背處理中 (${modelName}模式)`, 0);
        currentBlob = await removeBackgroundFromImage(
          file,
          options.backgroundRemovalModel ?? 'balanced',
          (progress) => {
            onProgress?.(`去背處理中 (${modelName}模式)`, Math.min(70, progress * 0.7));
          }
        );
      }
    }

    // 階段 2: 調整大小 + 浮水印 + 壓縮
    onProgress?.('套用設定中', 80);
    const result = await processImage(currentBlob, options);
    onProgress?.('完成', 100);

    return result;
  } catch (error) {
    logError('processImageComplete', error);
    throw toSafeError(error, 'IMAGE_PROCESS_ERROR');
  }
}

/**
 * 生成安全的檔名
 */
export function generateFileName(
  originalName: string,
  format: 'png' | 'jpeg' | 'webp'
): string {
  const safeName = sanitizeFileName(originalName);
  const baseName = safeName.replace(/\.[^/.]+$/, '') || 'image';
  const extension = format === 'jpeg' ? 'jpg' : format;
  return `${baseName}_processed.${extension}`;
}
