/**
 * AI 自動檢舉系統 (Image Guardian) - 服務層
 *
 * 提供前端與後端 API 的整合
 * 優先使用 Python 後端 API，若後端不可用則降級使用本地 localStorage
 */

/// <reference types="vite/client" />

import {
  DigitalAsset,
  WhitelistEntry,
  ScanTask,
  ScanConfig,
  ScanResult,
  Violation,
  InfringerProfile,
  LegalCase,
  CaseEvent,
  WarningLetter,
  OfficialReport,
  WarningLetterTemplate,
  ReportTemplate,
  ImageGuardianStats,
  AssetStatus,
  CaseStatus,
  ScanStatus,
  PlatformType,
  generateCaseNumber
} from '../types/imageGuardian';

import {
  mockDigitalAssets,
  mockWhitelist,
  mockScanTasks,
  mockViolations,
  mockInfringers,
  mockLegalCases,
  mockCaseEvents,
  mockWarningLetters,
  mockWarningLetterTemplates,
  mockReportTemplates,
  mockImageGuardianStats
} from '../data/imageGuardianMockData';

import { imageGuardianApi, checkApiAvailability, ScanProgress } from './imageGuardianApi';
import type { UploadAssetResponse, ScanTaskResponse, ViolationData } from './imageGuardianApi';

// ==================== API 狀態管理 ====================

let _isApiAvailable: boolean | null = null;
let _apiCheckPromise: Promise<boolean> | null = null;

/** 檢查並快取 API 可用性 */
async function isApiAvailable(): Promise<boolean> {
  if (_isApiAvailable !== null) {
    return _isApiAvailable;
  }

  if (_apiCheckPromise) {
    return _apiCheckPromise;
  }

  _apiCheckPromise = checkApiAvailability().then(available => {
    _isApiAvailable = available;
    console.log(`[Image Guardian] Backend API ${available ? '可用 ✓' : '不可用，使用本地模式'}`);
    return available;
  });

  return _apiCheckPromise;
}

/** 重置 API 狀態檢查（用於重試連接） */
export function resetApiCheck(): void {
  _isApiAvailable = null;
  _apiCheckPromise = null;
}

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  ASSETS: 'imageGuardian_assets',
  WHITELIST: 'imageGuardian_whitelist',
  SCAN_TASKS: 'imageGuardian_scanTasks',
  VIOLATIONS: 'imageGuardian_violations',
  CASES: 'imageGuardian_cases',
  LETTERS: 'imageGuardian_letters',
  REPORTS: 'imageGuardian_reports'
};

// ==================== Helper Functions ====================

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to storage: ${key}`, error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** 將檔案轉換為 base64 Data URL（用於本地儲存） */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 獲取圖片尺寸 */
async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

// ==================== 資產服務 (Asset Service) ====================

/** 將後端資產回應轉換為前端格式 */
function convertApiAsset(apiAsset: UploadAssetResponse): DigitalAsset {
  return {
    id: apiAsset.id,
    userId: apiAsset.user_id,
    fileName: apiAsset.file_name,
    originalUrl: apiAsset.original_url,
    thumbnailUrl: apiAsset.thumbnail_url,
    fileSize: apiAsset.file_size,
    dimensions: apiAsset.dimensions,
    fingerprint: {
      pHash: apiAsset.fingerprint.pHash,
      orbDescriptors: apiAsset.fingerprint.orbDescriptors,
      colorHistogram: apiAsset.fingerprint.colorHistogram,
      featureCount: apiAsset.fingerprint.featureCount
    },
    metadata: {
      uploadedBy: apiAsset.metadata.uploadedBy,
      uploadedAt: apiAsset.metadata.uploadedAt,
      tags: apiAsset.metadata.tags,
      description: apiAsset.metadata.description,
      productSku: apiAsset.metadata.productSku,
      brandName: apiAsset.metadata.brandName
    },
    status: apiAsset.status as AssetStatus,
    scanStats: {
      totalScans: apiAsset.scan_stats.totalScans,
      violationsFound: apiAsset.scan_stats.violationsFound
    },
    createdAt: apiAsset.created_at,
    updatedAt: apiAsset.updated_at
  };
}

export const assetService = {
  /** 獲取所有資產 */
  getAll(): DigitalAsset[] {
    return getFromStorage(STORAGE_KEYS.ASSETS, mockDigitalAssets);
  },

  /** 從後端 API 獲取所有資產（異步） */
  async getAllAsync(): Promise<DigitalAsset[]> {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      try {
        const apiAssets = await imageGuardianApi.getAssets();
        const assets = apiAssets.map(convertApiAsset);
        // 同步到本地 storage
        saveToStorage(STORAGE_KEYS.ASSETS, assets);
        return assets;
      } catch (error) {
        console.warn('[Asset] API 呼叫失敗，使用本地資料:', error);
      }
    }
    return this.getAll();
  },

  /** 根據 ID 獲取資產 */
  getById(id: string): DigitalAsset | undefined {
    const assets = this.getAll();
    return assets.find(a => a.id === id);
  },

  /** 根據狀態篩選資產 */
  getByStatus(status: AssetStatus): DigitalAsset[] {
    return this.getAll().filter(a => a.status === status);
  },

  /** 上傳新資產到後端 */
  async upload(
    file: File,
    metadata: { tags?: string[]; description?: string; productSku?: string; brandName?: string } = {}
  ): Promise<DigitalAsset> {
    const apiAvailable = await isApiAvailable();

    if (apiAvailable) {
      try {
        const apiAsset = await imageGuardianApi.uploadAsset(file, {
          tags: metadata.tags?.join(','),
          description: metadata.description,
          productSku: metadata.productSku,
          brandName: metadata.brandName
        });

        const asset = convertApiAsset(apiAsset);

        // 同步到本地 storage
        const assets = this.getAll();
        assets.push(asset);
        saveToStorage(STORAGE_KEYS.ASSETS, assets);

        return asset;
      } catch (error) {
        console.error('[Asset] 上傳失敗:', error);
        throw error;
      }
    }

    // 本地模式：創建資產並儲存 base64 圖片
    const dataUrl = await fileToDataUrl(file);
    const dimensions = await getImageDimensions(dataUrl);

    return this.create({
      userId: 'user-001',
      fileName: file.name,
      originalUrl: dataUrl,
      thumbnailUrl: dataUrl,
      fileSize: file.size,
      dimensions,
      fingerprint: {
        pHash: `local-${Date.now()}`,
        orbDescriptors: '0',
        colorHistogram: 'computed',
        featureCount: 0
      },
      metadata: {
        uploadedBy: 'admin',
        uploadedAt: new Date().toISOString(),
        tags: metadata.tags || [],
        description: metadata.description,
        productSku: metadata.productSku,
        brandName: metadata.brandName
      },
      status: 'indexed',
      scanStats: {
        totalScans: 0,
        violationsFound: 0
      }
    });
  },

  /** 建立新資產（本地模式） */
  create(asset: Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt'>): DigitalAsset {
    const assets = this.getAll();
    const newAsset: DigitalAsset = {
      ...asset,
      id: generateId('asset'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    assets.push(newAsset);
    saveToStorage(STORAGE_KEYS.ASSETS, assets);
    return newAsset;
  },

  /** 更新資產 */
  update(id: string, updates: Partial<DigitalAsset>): DigitalAsset | undefined {
    const assets = this.getAll();
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    assets[index] = {
      ...assets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.ASSETS, assets);
    return assets[index];
  },

  /** 刪除資產 */
  delete(id: string): boolean {
    const assets = this.getAll();
    const filtered = assets.filter(a => a.id !== id);
    if (filtered.length === assets.length) return false;
    saveToStorage(STORAGE_KEYS.ASSETS, filtered);
    return true;
  },

  /** 更新資產狀態 */
  updateStatus(id: string, status: AssetStatus): DigitalAsset | undefined {
    return this.update(id, { status });
  },

  /** 更新掃描統計 */
  updateScanStats(id: string, violationsFound: number): DigitalAsset | undefined {
    const asset = this.getById(id);
    if (!asset) return undefined;

    return this.update(id, {
      scanStats: {
        lastScanAt: new Date().toISOString(),
        totalScans: asset.scanStats.totalScans + 1,
        violationsFound: asset.scanStats.violationsFound + violationsFound
      }
    });
  },

  /** 搜尋資產 */
  search(query: string): DigitalAsset[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(a =>
      a.fileName.toLowerCase().includes(lowerQuery) ||
      a.metadata.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      a.metadata.description?.toLowerCase().includes(lowerQuery) ||
      a.metadata.productSku?.toLowerCase().includes(lowerQuery)
    );
  }
};

// ==================== 白名單服務 (Whitelist Service) ====================

export const whitelistService = {
  /** 獲取所有白名單 */
  getAll(): WhitelistEntry[] {
    return getFromStorage(STORAGE_KEYS.WHITELIST, mockWhitelist);
  },

  /** 根據資產 ID 獲取白名單 */
  getByAssetId(assetId: string): WhitelistEntry[] {
    return this.getAll().filter(w => w.assetId === assetId);
  },

  /** 新增白名單條目 */
  add(entry: Omit<WhitelistEntry, 'id' | 'createdAt'>): WhitelistEntry {
    const whitelist = this.getAll();
    const newEntry: WhitelistEntry = {
      ...entry,
      id: generateId('wl'),
      createdAt: new Date().toISOString()
    };
    whitelist.push(newEntry);
    saveToStorage(STORAGE_KEYS.WHITELIST, whitelist);
    return newEntry;
  },

  /** 移除白名單條目 */
  remove(id: string): boolean {
    const whitelist = this.getAll();
    const filtered = whitelist.filter(w => w.id !== id);
    if (filtered.length === whitelist.length) return false;
    saveToStorage(STORAGE_KEYS.WHITELIST, filtered);
    return true;
  },

  /** 檢查賣家是否在白名單中 */
  isWhitelisted(assetId: string, sellerId: string): boolean {
    return this.getByAssetId(assetId).some(w => w.sellerId === sellerId);
  }
};

// ==================== 掃描服務 (Scan Service) ====================

/** 將後端掃描任務轉換為前端格式 */
function convertApiScanTask(apiTask: ScanTaskResponse): ScanTask {
  // 轉換平台字串為 PlatformType
  const convertPlatform = (p: string): PlatformType => {
    if (['shopee', 'ruten', 'yahoo'].includes(p)) return p as PlatformType;
    return 'other';
  };

  return {
    id: apiTask.id,
    userId: apiTask.user_id,
    type: apiTask.type as 'keyword' | 'visual' | 'hybrid',
    status: apiTask.status as ScanStatus,
    config: {
      assetIds: apiTask.config.asset_ids,
      platforms: apiTask.config.platforms.map(convertPlatform),
      keywords: apiTask.config.keywords,
      similarityThreshold: apiTask.config.similarity_threshold,
      maxResults: apiTask.config.max_results,
      scanDepth: apiTask.config.scan_depth
    },
    progress: apiTask.progress,
    totalScanned: apiTask.total_scanned,
    violationsFound: apiTask.violations_found,
    createdAt: apiTask.created_at,
    startedAt: apiTask.started_at,
    completedAt: apiTask.completed_at
  };
}

/** 將後端侵權資料轉換為前端格式 */
function convertApiViolation(apiVio: ViolationData): Violation {
  // 轉換平台字串為 PlatformType
  const convertPlatform = (p: string): PlatformType => {
    if (['shopee', 'ruten', 'yahoo'].includes(p)) return p as PlatformType;
    return 'other';
  };

  // 計算 pHash 距離（基於分數估算）
  const pHashDistance = Math.round((100 - apiVio.similarity.phash_score) * 0.64);

  return {
    id: apiVio.id,
    taskId: apiVio.task_id,
    assetId: apiVio.asset_id,
    assetFileName: '',  // 需要從資產獲取
    assetThumbnail: '', // 需要從資產獲取
    platform: convertPlatform(apiVio.platform),
    listing: {
      listingId: apiVio.listing.id,
      title: apiVio.listing.title,
      url: apiVio.listing.url,
      imageUrl: apiVio.listing.thumbnail_url,
      thumbnailUrl: apiVio.listing.thumbnail_url,
      price: apiVio.listing.price,
      currency: apiVio.listing.currency,
      sellerId: apiVio.listing.seller_id,
      sellerName: apiVio.listing.seller_name,
      sellerUrl: apiVio.listing.seller_url,
      salesCount: apiVio.listing.sales_count,
      rating: apiVio.listing.rating
    },
    similarity: {
      overall: apiVio.similarity.overall,
      pHashScore: apiVio.similarity.phash_score,
      pHashDistance,
      orbScore: apiVio.similarity.orb_score,
      colorScore: apiVio.similarity.color_score,
      level: apiVio.similarity.level
    },
    evidence: {},
    detectedAt: apiVio.detected_at,
    isWhitelisted: apiVio.is_whitelisted,
    caseId: apiVio.case_id,
    createdAt: apiVio.detected_at
  };
}

export const scanService = {
  /** 獲取所有掃描任務 */
  getTasks(): ScanTask[] {
    return getFromStorage(STORAGE_KEYS.SCAN_TASKS, mockScanTasks);
  },

  /** 從後端獲取掃描任務（異步） */
  async getTasksAsync(): Promise<ScanTask[]> {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      try {
        const apiTasks = await imageGuardianApi.getScans();
        const tasks = apiTasks.map(convertApiScanTask);
        saveToStorage(STORAGE_KEYS.SCAN_TASKS, tasks);
        return tasks;
      } catch (error) {
        console.warn('[Scan] API 呼叫失敗，使用本地資料:', error);
      }
    }
    return this.getTasks();
  },

  /** 根據 ID 獲取任務 */
  getTaskById(id: string): ScanTask | undefined {
    return this.getTasks().find(t => t.id === id);
  },

  /** 根據狀態篩選任務 */
  getTasksByStatus(status: ScanStatus): ScanTask[] {
    return this.getTasks().filter(t => t.status === status);
  },

  /** 建立掃描任務 */
  createTask(config: ScanConfig, type: 'keyword' | 'visual' | 'hybrid' = 'hybrid'): ScanTask {
    const tasks = this.getTasks();
    const newTask: ScanTask = {
      id: generateId('scan'),
      userId: 'user-001',
      type,
      status: 'queued',
      config,
      progress: 0,
      totalScanned: 0,
      violationsFound: 0,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveToStorage(STORAGE_KEYS.SCAN_TASKS, tasks);
    return newTask;
  },

  /** 更新任務進度（本地） */
  updateProgress(id: string, progress: number, scanned: number, violations: number): ScanTask | undefined {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    tasks[index] = {
      ...tasks[index],
      progress,
      totalScanned: scanned,
      violationsFound: violations,
      status: progress >= 100 ? 'completed' : 'running',
      startedAt: tasks[index].startedAt || new Date().toISOString(),
      completedAt: progress >= 100 ? new Date().toISOString() : undefined
    };
    saveToStorage(STORAGE_KEYS.SCAN_TASKS, tasks);
    return tasks[index];
  },

  /** 取消任務 */
  async cancelTask(id: string): Promise<boolean> {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      try {
        await imageGuardianApi.cancelScan(id);
      } catch (error) {
        console.warn('[Scan] 取消任務 API 呼叫失敗:', error);
      }
    }

    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1 || tasks[index].status === 'completed') return false;

    tasks[index].status = 'cancelled';
    saveToStorage(STORAGE_KEYS.SCAN_TASKS, tasks);
    return true;
  },

  /**
   * 啟動掃描任務
   * 如果後端 API 可用，則使用真實的電商平台爬蟲和 AI 圖片比對
   * 否則使用本地模擬模式
   */
  async startScan(
    taskId: string,
    onProgress?: (progress: number, message: string, scanned: number, violations: number) => void
  ): Promise<ScanTask> {
    const apiAvailable = await isApiAvailable();
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    // ===== 使用真實後端 API =====
    if (apiAvailable) {
      console.log('[Scan] 使用後端 API 進行真實掃描');

      try {
        // 創建後端掃描任務
        const apiTask = await imageGuardianApi.createScan({
          asset_ids: task.config.assetIds,
          platforms: task.config.platforms,
          keywords: task.config.keywords,
          similarity_threshold: task.config.similarityThreshold,
          max_results: task.config.maxResults,
          scan_depth: task.config.scanDepth ?? 5  // 預設掃描深度為 5 頁
        });

        // 更新本地任務 ID 映射
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks[index].id = apiTask.id; // 使用後端生成的 ID
          saveToStorage(STORAGE_KEYS.SCAN_TASKS, tasks);
        }

        // 使用 WebSocket 監聽進度
        return new Promise((resolve, reject) => {
          let ws: WebSocket | null = null;
          let pollInterval: ReturnType<typeof setInterval> | null = null;
          let resolved = false;

          const cleanup = () => {
            if (ws) {
              ws.close();
              ws = null;
            }
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          };

          const handleComplete = async () => {
            if (resolved) return;
            resolved = true;
            cleanup();

            try {
              // 獲取最終結果和侵權記錄
              const results = await imageGuardianApi.getScanResults(apiTask.id);
              const finalTask = await imageGuardianApi.getScan(apiTask.id);

              // 轉換並儲存侵權記錄
              if (results.violations) {
                const violations = results.violations.map(convertApiViolation);
                const existingViolations = violationService.getAll();
                saveToStorage(STORAGE_KEYS.VIOLATIONS, [...existingViolations, ...violations]);
              }

              // 更新本地任務狀態
              const updatedTask = convertApiScanTask(finalTask);
              const localTasks = this.getTasks();
              const taskIndex = localTasks.findIndex(t => t.id === apiTask.id);
              if (taskIndex !== -1) {
                localTasks[taskIndex] = updatedTask;
              } else {
                localTasks.push(updatedTask);
              }
              saveToStorage(STORAGE_KEYS.SCAN_TASKS, localTasks);

              if (onProgress) {
                onProgress(100, '✅ 掃描完成！', results.total_scanned, results.violations_found);
              }

              resolve(updatedTask);
            } catch (error) {
              console.error('[Scan] 獲取結果失敗:', error);
              reject(error);
            }
          };

          // 嘗試使用 WebSocket
          try {
            ws = imageGuardianApi.createProgressWebSocket(apiTask.id, (data: ScanProgress) => {
              if (onProgress) {
                onProgress(data.progress, data.message, data.scanned, data.violations);
              }

              // 更新本地進度
              this.updateProgress(apiTask.id, data.progress, data.scanned, data.violations);

              if (data.progress >= 100) {
                handleComplete();
              }
            });

            ws.onerror = () => {
              console.warn('[Scan] WebSocket 連接失敗，改用輪詢');
              ws = null;
              startPolling();
            };
          } catch {
            console.warn('[Scan] WebSocket 不可用，使用輪詢');
            startPolling();
          }

          // 輪詢進度（作為備用方案）
          function startPolling() {
            if (pollInterval) return;

            pollInterval = setInterval(async () => {
              try {
                const progress = await imageGuardianApi.getScanProgress(apiTask.id);

                if (onProgress) {
                  onProgress(progress.progress, progress.message, progress.scanned, progress.violations);
                }

                if (progress.progress >= 100) {
                  handleComplete();
                }
              } catch (error) {
                console.error('[Scan] 輪詢進度失敗:', error);
              }
            }, 2000);
          }

          // 超時處理（10 分鐘）
          setTimeout(() => {
            if (!resolved) {
              cleanup();
              reject(new Error('掃描超時'));
            }
          }, 10 * 60 * 1000);
        });
      } catch (error) {
        console.error('[Scan] 後端掃描失敗，降級使用本地模式:', error);
        // 降級到本地模式
      }
    }

    // ===== 本地模擬模式 =====
    console.log('[Scan] 使用本地模擬模式');

    const assets = assetService.getAll().filter(a => task.config.assetIds.includes(a.id));
    if (assets.length === 0) {
      throw new Error('No assets found for scanning');
    }

    const stages = [
      { progress: 10, message: '🔍 正在連接電商平台...' },
      { progress: 20, message: '📡 正在搜尋相關商品...' },
      { progress: 35, message: '🖼️ 正在下載商品圖片...' },
      { progress: 50, message: '🧠 AI 正在比對圖片指紋...' },
      { progress: 65, message: '📊 正在計算相似度分數...' },
      { progress: 80, message: '🎯 正在篩選可疑結果...' },
      { progress: 90, message: '📝 正在生成掃描報告...' },
      { progress: 100, message: '✅ 掃描完成！(本地模式)' }
    ];

    let totalScanned = 0;
    let violationsCreated = 0;

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 800));

      // 在比對階段生成模擬侵權結果
      if (stage.progress === 65) {
        for (const asset of assets) {
          const numViolations = Math.floor(Math.random() * 3);

          for (let i = 0; i < numViolations; i++) {
            const platform = task.config.platforms[Math.floor(Math.random() * task.config.platforms.length)];
            const similarity = 60 + Math.random() * 35;

            const pHashScore = similarity + (Math.random() * 5 - 2.5);
            violationService.create({
              taskId,
              assetId: asset.id,
              assetFileName: asset.fileName,
              assetThumbnail: asset.thumbnailUrl,
              platform,
              listing: {
                listingId: `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                title: `【熱賣】${asset.metadata.tags[0] || '商品'}相關產品 特價優惠`,
                url: `https://${platform}.example.com/item/${Math.random().toString(36).substring(2, 10)}`,
                imageUrl: asset.thumbnailUrl,
                thumbnailUrl: asset.thumbnailUrl,
                price: Math.floor(100 + Math.random() * 2000),
                currency: 'TWD',
                sellerId: `seller-${Math.random().toString(36).substring(2, 8)}`,
                sellerName: `賣家${Math.floor(Math.random() * 9000) + 1000}`,
                sellerUrl: `https://${platform}.example.com/shop/${Math.random().toString(36).substring(2, 8)}`,
                salesCount: Math.floor(Math.random() * 100),
                rating: 3.5 + Math.random() * 1.5
              },
              similarity: {
                overall: similarity,
                pHashScore,
                pHashDistance: Math.round((100 - pHashScore) * 0.64),
                orbScore: similarity + (Math.random() * 10 - 5),
                colorScore: similarity + (Math.random() * 8 - 4),
                level: similarity >= 90 ? 'exact' : similarity >= 80 ? 'high' : similarity >= 70 ? 'medium' : 'low'
              },
              evidence: {},
              detectedAt: new Date().toISOString(),
              isWhitelisted: false
            });

            violationsCreated++;
          }

          assetService.updateScanStats(asset.id, numViolations);
        }
      }

      totalScanned = Math.floor((stage.progress / 100) * task.config.maxResults * task.config.platforms.length);
      this.updateProgress(taskId, stage.progress, totalScanned, violationsCreated);

      if (onProgress) {
        onProgress(stage.progress, stage.message, totalScanned, violationsCreated);
      }
    }

    return this.getTaskById(taskId)!;
  }
};

// ==================== 侵權服務 (Violation Service) ====================

export const violationService = {
  /** 獲取所有侵權記錄（同步，從本地 storage） */
  getAll(): Violation[] {
    return getFromStorage(STORAGE_KEYS.VIOLATIONS, mockViolations);
  },

  /** 從後端 API 獲取所有侵權記錄（異步） */
  async getAllAsync(): Promise<Violation[]> {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      try {
        const apiViolations = await imageGuardianApi.getViolations();
        const violations = apiViolations.map(convertApiViolation);
        // 合併本地和遠端資料（避免重複）
        const localViolations = this.getAll();
        const allViolations = [...violations];
        for (const local of localViolations) {
          if (!allViolations.find(v => v.id === local.id)) {
            allViolations.push(local);
          }
        }
        saveToStorage(STORAGE_KEYS.VIOLATIONS, allViolations);
        return allViolations;
      } catch (error) {
        console.warn('[Violation] API 呼叫失敗，使用本地資料:', error);
      }
    }
    return this.getAll();
  },

  /** 根據 ID 獲取侵權記錄 */
  getById(id: string): Violation | undefined {
    return this.getAll().find(v => v.id === id);
  },

  /** 根據資產 ID 獲取侵權記錄 */
  getByAssetId(assetId: string): Violation[] {
    return this.getAll().filter(v => v.assetId === assetId);
  },

  /** 根據任務 ID 獲取侵權記錄 */
  getByTaskId(taskId: string): Violation[] {
    return this.getAll().filter(v => v.taskId === taskId);
  },

  /** 根據賣家 ID 獲取侵權記錄 */
  getBySellerId(sellerId: string): Violation[] {
    return this.getAll().filter(v => v.listing.sellerId === sellerId);
  },

  /** 新增侵權記錄（本地） */
  create(violation: Omit<Violation, 'id' | 'createdAt'>): Violation {
    const violations = this.getAll();
    const newViolation: Violation = {
      ...violation,
      id: generateId('vio'),
      createdAt: new Date().toISOString()
    };
    violations.push(newViolation);
    saveToStorage(STORAGE_KEYS.VIOLATIONS, violations);
    return newViolation;
  },

  /** 更新白名單狀態 */
  async updateWhitelistStatus(id: string, isWhitelisted: boolean): Promise<Violation | undefined> {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      try {
        await imageGuardianApi.toggleWhitelist(id, isWhitelisted);
      } catch (error) {
        console.warn('[Violation] 更新白名單 API 呼叫失敗:', error);
      }
    }

    const violations = this.getAll();
    const index = violations.findIndex(v => v.id === id);
    if (index === -1) return undefined;

    violations[index].isWhitelisted = isWhitelisted;
    saveToStorage(STORAGE_KEYS.VIOLATIONS, violations);
    return violations[index];
  },

  /** 關聯案件 */
  async linkToCase(violationId: string, caseId: string): Promise<Violation | undefined> {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      try {
        await imageGuardianApi.linkViolationToCase(violationId, caseId);
      } catch (error) {
        console.warn('[Violation] 關聯案件 API 呼叫失敗:', error);
      }
    }

    const violations = this.getAll();
    const index = violations.findIndex(v => v.id === violationId);
    if (index === -1) return undefined;

    violations[index].caseId = caseId;
    saveToStorage(STORAGE_KEYS.VIOLATIONS, violations);
    return violations[index];
  }
};

// ==================== 盜圖者服務 (Infringer Service) ====================

export const infringerService = {
  /** 獲取盜圖者畫像 */
  getProfile(sellerId: string): InfringerProfile | undefined {
    const violations = violationService.getBySellerId(sellerId);
    if (violations.length === 0) return undefined;

    const firstViolation = violations[0];
    const totalRevenue = violations.reduce((sum, v) =>
      sum + (v.listing.price * (v.listing.salesCount || 0)), 0
    );

    return {
      sellerId,
      sellerName: firstViolation.listing.sellerName,
      platform: firstViolation.platform,
      profileUrl: firstViolation.listing.sellerUrl,
      stats: {
        totalListings: 0, // 需要從爬蟲獲取
        violatingListings: violations.length,
        estimatedRevenue: totalRevenue,
        averagePrice: violations.reduce((sum, v) => sum + v.listing.price, 0) / violations.length,
        totalSales: violations.reduce((sum, v) => sum + (v.listing.salesCount || 0), 0),
        firstDetectedAt: violations.sort((a, b) =>
          new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime()
        )[0].detectedAt,
        lastDetectedAt: violations.sort((a, b) =>
          new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
        )[0].detectedAt
      },
      riskLevel: this.calculateRiskLevel(violations.length, totalRevenue),
      riskScore: this.calculateRiskScore(violations.length, totalRevenue),
      violations
    };
  },

  /** 計算風險等級 */
  calculateRiskLevel(violations: number, revenue: number): 'low' | 'medium' | 'high' | 'critical' {
    const score = this.calculateRiskScore(violations, revenue);
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  },

  /** 計算風險分數 */
  calculateRiskScore(violations: number, revenue: number): number {
    return Math.min(100, (violations * 15) + (revenue / 5000));
  },

  /** 獲取所有盜圖者列表 */
  getAllProfiles(): InfringerProfile[] {
    const violations = violationService.getAll();
    const sellerIds = [...new Set(violations.map(v => v.listing.sellerId))];
    return sellerIds
      .map(id => this.getProfile(id))
      .filter((p): p is InfringerProfile => p !== undefined)
      .sort((a, b) => b.riskScore - a.riskScore);
  }
};

// ==================== 案件服務 (Case Service) ====================

export const caseService = {
  /** 獲取所有案件 */
  getAll(): LegalCase[] {
    return getFromStorage(STORAGE_KEYS.CASES, mockLegalCases);
  },

  /** 根據 ID 獲取案件 */
  getById(id: string): LegalCase | undefined {
    return this.getAll().find(c => c.id === id);
  },

  /** 根據狀態篩選案件 */
  getByStatus(status: CaseStatus): LegalCase[] {
    return this.getAll().filter(c => c.status === status);
  },

  /** 建立案件 */
  create(
    infringer: InfringerProfile,
    violations: Violation[],
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): LegalCase {
    const cases = this.getAll();
    const now = new Date().toISOString();

    const newCase: LegalCase = {
      id: generateId('case'),
      userId: 'user-001', // TODO: 從認證獲取
      caseNumber: generateCaseNumber(),
      status: 'detected',
      priority,
      infringer,
      violations,
      timeline: [{
        id: generateId('event'),
        caseId: '', // 會在下面更新
        eventType: 'created',
        description: `案件已建立，偵測到 ${violations.length} 個侵權商品`,
        createdBy: 'system',
        createdAt: now
      }],
      letters: [],
      reports: [],
      notes: '',
      createdAt: now,
      updatedAt: now
    };

    // 更新 timeline 中的 caseId
    newCase.timeline[0].caseId = newCase.id;

    // 關聯侵權記錄
    violations.forEach(v => {
      violationService.linkToCase(v.id, newCase.id);
    });

    cases.push(newCase);
    saveToStorage(STORAGE_KEYS.CASES, cases);
    return newCase;
  },

  /** 更新案件狀態 */
  updateStatus(id: string, status: CaseStatus, note?: string): LegalCase | undefined {
    const cases = this.getAll();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const oldStatus = cases[index].status;
    cases[index].status = status;
    cases[index].updatedAt = new Date().toISOString();

    if (status === 'resolved') {
      cases[index].resolvedAt = new Date().toISOString();
    }

    // 新增狀態變更事件
    const event: CaseEvent = {
      id: generateId('event'),
      caseId: id,
      eventType: 'status_changed',
      description: note || `案件狀態從「${oldStatus}」變更為「${status}」`,
      metadata: { oldStatus, newStatus: status },
      createdBy: 'admin',
      createdAt: new Date().toISOString()
    };
    cases[index].timeline.push(event);

    saveToStorage(STORAGE_KEYS.CASES, cases);
    return cases[index];
  },

  /** 新增備註 */
  addNote(id: string, note: string): LegalCase | undefined {
    const cases = this.getAll();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    cases[index].notes = note;
    cases[index].updatedAt = new Date().toISOString();

    const event: CaseEvent = {
      id: generateId('event'),
      caseId: id,
      eventType: 'note_added',
      description: `新增備註：${note.substring(0, 50)}${note.length > 50 ? '...' : ''}`,
      createdBy: 'admin',
      createdAt: new Date().toISOString()
    };
    cases[index].timeline.push(event);

    saveToStorage(STORAGE_KEYS.CASES, cases);
    return cases[index];
  },

  /** 新增事件 */
  addEvent(id: string, event: Omit<CaseEvent, 'id' | 'caseId' | 'createdAt'>): LegalCase | undefined {
    const cases = this.getAll();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const newEvent: CaseEvent = {
      ...event,
      id: generateId('event'),
      caseId: id,
      createdAt: new Date().toISOString()
    };
    cases[index].timeline.push(newEvent);
    cases[index].updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.CASES, cases);
    return cases[index];
  }
};

// ==================== 警告信服務 (Letter Service) ====================

export const letterService = {
  /** 獲取所有警告信 */
  getAll(): WarningLetter[] {
    return getFromStorage(STORAGE_KEYS.LETTERS, mockWarningLetters);
  },

  /** 根據案件 ID 獲取警告信 */
  getByCaseId(caseId: string): WarningLetter[] {
    return this.getAll().filter(l => l.caseId === caseId);
  },

  /** 獲取模板 */
  getTemplates(): WarningLetterTemplate[] {
    return mockWarningLetterTemplates;
  },

  /** 根據等級獲取模板 */
  getTemplateByLevel(level: 'friendly' | 'formal' | 'legal'): WarningLetterTemplate | undefined {
    return mockWarningLetterTemplates.find(t => t.level === level);
  },

  /** 生成警告信 */
  generate(
    caseId: string,
    level: 'friendly' | 'formal' | 'legal',
    variables: Record<string, string>
  ): WarningLetter {
    const template = this.getTemplateByLevel(level);
    if (!template) throw new Error('Template not found');

    // 替換變數
    let content = template.content;
    let subject = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const letters = this.getAll();
    const newLetter: WarningLetter = {
      id: generateId('letter'),
      caseId,
      level,
      templateId: template.id,
      subject,
      content,
      variables,
      sentVia: 'draft',
      status: 'draft',
      attachments: [],
      createdAt: new Date().toISOString()
    };

    letters.push(newLetter);
    saveToStorage(STORAGE_KEYS.LETTERS, letters);

    // 更新案件
    const cases = caseService.getAll();
    const caseIndex = cases.findIndex(c => c.id === caseId);
    if (caseIndex !== -1) {
      cases[caseIndex].letters.push(newLetter);
      saveToStorage(STORAGE_KEYS.CASES, cases);
    }

    return newLetter;
  },

  /** 發送警告信 */
  send(letterId: string, sentVia: 'email' | 'platform_message' | 'manual'): WarningLetter | undefined {
    const letters = this.getAll();
    const index = letters.findIndex(l => l.id === letterId);
    if (index === -1) return undefined;

    letters[index].sentAt = new Date().toISOString();
    letters[index].sentVia = sentVia;
    letters[index].status = 'sent';

    saveToStorage(STORAGE_KEYS.LETTERS, letters);

    // 更新案件狀態
    caseService.updateStatus(letters[index].caseId, 'warning_sent', '已發送警告信');
    caseService.addEvent(letters[index].caseId, {
      eventType: 'letter_sent',
      description: `已發送${letters[index].level === 'friendly' ? '友善提醒' : letters[index].level === 'formal' ? '正式警告' : '法律警告'}`,
      metadata: { letterLevel: letters[index].level },
      createdBy: 'admin'
    });

    return letters[index];
  }
};

// ==================== 檢舉服務 (Report Service) ====================

export const reportService = {
  /** 獲取所有檢舉 */
  getAll(): OfficialReport[] {
    return getFromStorage(STORAGE_KEYS.REPORTS, []);
  },

  /** 獲取檢舉模板 */
  getTemplates(): ReportTemplate[] {
    return mockReportTemplates;
  },

  /** 根據平台獲取模板 */
  getTemplateByPlatform(platform: 'shopee' | 'ruten' | 'yahoo'): ReportTemplate | undefined {
    return mockReportTemplates.find(t => t.platform === platform);
  },

  /** 生成檢舉內容 */
  generate(
    caseId: string,
    platform: 'shopee' | 'ruten' | 'yahoo',
    variables: Record<string, string>
  ): OfficialReport {
    const template = this.getTemplateByPlatform(platform);
    if (!template) throw new Error('Template not found');

    // 替換變數
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const reports = this.getAll();
    const newReport: OfficialReport = {
      id: generateId('report'),
      caseId,
      platform,
      reportType: 'copyright',
      reportContent: content,
      attachments: [],
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    reports.push(newReport);
    saveToStorage(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },

  /** 提交檢舉 */
  submit(reportId: string): OfficialReport | undefined {
    const reports = this.getAll();
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1) return undefined;

    reports[index].submittedAt = new Date().toISOString();
    reports[index].status = 'submitted';
    reports[index].confirmationNumber = `RPT-${Date.now()}`;

    saveToStorage(STORAGE_KEYS.REPORTS, reports);

    // 更新案件狀態
    caseService.updateStatus(reports[index].caseId, 'reported', '已向平台提交檢舉');
    caseService.addEvent(reports[index].caseId, {
      eventType: 'report_filed',
      description: `已向 ${reports[index].platform} 提交著作權檢舉`,
      metadata: { platform: reports[index].platform, confirmationNumber: reports[index].confirmationNumber },
      createdBy: 'admin'
    });

    return reports[index];
  }
};

// ==================== 統計服務 (Stats Service) ====================

export const statsService = {
  /** 獲取儀表板統計 */
  getStats(): ImageGuardianStats {
    const assets = assetService.getAll();
    const violations = violationService.getAll();
    const cases = caseService.getAll();
    const tasks = scanService.getTasks();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      assets: {
        total: assets.length,
        monitoring: assets.filter(a => a.status === 'monitoring').length,
        archived: assets.filter(a => a.status === 'archived').length,
        newThisMonth: assets.filter(a => new Date(a.createdAt) > monthAgo).length
      },
      scans: {
        totalScans: tasks.length,
        scansThisMonth: tasks.filter(t => new Date(t.createdAt) > monthAgo).length,
        lastScanAt: tasks.length > 0 ? tasks.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0].createdAt : undefined,
        averageScanTime: tasks.filter(t => t.executionTimeMs)
          .reduce((sum, t) => sum + (t.executionTimeMs || 0), 0) / Math.max(1, tasks.filter(t => t.executionTimeMs).length),
        successRate: (tasks.filter(t => t.status === 'completed').length / Math.max(1, tasks.length)) * 100
      },
      violations: {
        total: violations.length,
        newThisWeek: violations.filter(v => new Date(v.detectedAt) > weekAgo).length,
        newThisMonth: violations.filter(v => new Date(v.detectedAt) > monthAgo).length,
        byPlatform: {
          shopee: violations.filter(v => v.platform === 'shopee').length,
          ruten: violations.filter(v => v.platform === 'ruten').length,
          yahoo: violations.filter(v => v.platform === 'yahoo').length,
          other: violations.filter(v => v.platform === 'other').length
        },
        bySimilarity: {
          exact: violations.filter(v => v.similarity.level === 'exact').length,
          high: violations.filter(v => v.similarity.level === 'high').length,
          medium: violations.filter(v => v.similarity.level === 'medium').length,
          low: violations.filter(v => v.similarity.level === 'low').length
        }
      },
      cases: {
        total: cases.length,
        active: cases.filter(c => !['resolved', 'dismissed'].includes(c.status)).length,
        resolved: cases.filter(c => c.status === 'resolved').length,
        warningsSent: letterService.getAll().filter(l => l.status !== 'draft').length,
        reportsField: reportService.getAll().filter(r => r.status !== 'draft').length,
        resolutionRate: (cases.filter(c => c.status === 'resolved').length / Math.max(1, cases.length)) * 100
      },
      topInfringers: infringerService.getAllProfiles().slice(0, 5),
      recentActivity: cases.flatMap(c => c.timeline).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10)
    };
  }
};

// ==================== 統一導出 ====================

export const imageGuardianService = {
  assets: assetService,
  whitelist: whitelistService,
  scan: scanService,
  violations: violationService,
  infringers: infringerService,
  cases: caseService,
  letters: letterService,
  reports: reportService,
  stats: statsService
};

/** 檢查後端 API 是否可用 */
export { isApiAvailable as checkBackendStatus };

/** 獲取後端 API 基礎 URL */
export function getBackendUrl(): string {
  return (import.meta.env?.VITE_IMAGE_GUARDIAN_API_URL as string) || 'http://localhost:8000';
}

export default imageGuardianService;
