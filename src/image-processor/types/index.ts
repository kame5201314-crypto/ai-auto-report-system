// 圖片處理工具類型定義

// 去背提供者
export type BackgroundRemovalProvider = 'local' | 'removebg';

// 去背模型品質（本地處理用）
export type BackgroundRemovalModel = 'fast' | 'balanced' | 'quality';

// Remove.bg API 尺寸選項
export type RemoveBgSize = 'preview' | 'full' | 'auto';

// Remove.bg 圖片類型
export type RemoveBgType = 'auto' | 'person' | 'product' | 'car';

export interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  progress: number;
}

export interface ProcessingOptions {
  removeBackground: boolean;
  backgroundRemovalProvider: BackgroundRemovalProvider;
  backgroundRemovalModel: BackgroundRemovalModel;
  // Remove.bg API 設定
  removeBgApiKey: string;
  removeBgSize: RemoveBgSize;
  removeBgType: RemoveBgType;
  addWatermark: boolean;
  watermarkPosition: WatermarkPosition;
  watermarkOpacity: number;
  resizeEnabled: boolean;
  targetWidth: number;
  targetHeight: number;
  maintainAspectRatio: boolean;
  compressionEnabled: boolean;
  compressionQuality: number; // 0-1
  outputFormat: 'png' | 'jpeg' | 'webp';
}

export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export interface PresetConfig {
  name: string;
  description: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
}

// 預設的電商平台規格
export const PLATFORM_PRESETS: Record<string, PresetConfig> = {
  shopee: {
    name: '蝦皮 Shopee',
    description: '正方形 800x800',
    width: 800,
    height: 800,
    format: 'jpeg',
    quality: 0.85,
  },
  shopeeHD: {
    name: '蝦皮 HD',
    description: '高清 1024x1024',
    width: 1024,
    height: 1024,
    format: 'jpeg',
    quality: 0.9,
  },
  official: {
    name: '官網商品圖',
    description: '1200x1200 高品質',
    width: 1200,
    height: 1200,
    format: 'png',
    quality: 1,
  },
  instagram: {
    name: 'Instagram',
    description: '正方形 1080x1080',
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 0.9,
  },
  facebook: {
    name: 'Facebook',
    description: '1200x630',
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 0.85,
  },
  custom: {
    name: '自訂尺寸',
    description: '自訂寬高',
    width: 800,
    height: 800,
    format: 'png',
    quality: 0.9,
  },
};

export const DEFAULT_OPTIONS: ProcessingOptions = {
  removeBackground: true,
  backgroundRemovalProvider: 'local',
  backgroundRemovalModel: 'balanced',
  removeBgApiKey: '',
  removeBgSize: 'auto',
  removeBgType: 'auto',
  addWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 0.3,
  resizeEnabled: true,
  targetWidth: 800,
  targetHeight: 800,
  maintainAspectRatio: true,
  compressionEnabled: true,
  compressionQuality: 0.85,
  outputFormat: 'jpeg',
};
