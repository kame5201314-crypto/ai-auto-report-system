// SIDAS - 供應商情報與數據採集系統類型定義

// 供應商狀態
export type SupplierStatus = 'not_contacted' | 'contacted' | 'negotiating' | 'cooperating' | 'rejected' | 'blacklisted';

// 供應商評級
export type SupplierRating = 'A' | 'B' | 'C' | 'D' | 'F';

// 產品類別
export type ProductCategory = 'APEXEL' | 'MEFU' | 'ACCESSORIES' | 'ELECTRONICS' | 'OTHER';

// 數據來源平台
export type SourcePlatform = 'alibaba' | 'made_in_china' | 'global_sources' | 'dhgate' | 'indiamart' | 'ec21' | 'manual' | 'other';

// 採集任務狀態
export type AcquisitionStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';

// 供應商基本信息
export interface Supplier {
  id: string;
  companyName: string;
  companyNameLocal?: string; // 當地語言名稱
  country: string;
  region?: string;
  address?: string;

  // AI 評分
  aiScore: number; // 0-100
  aiScoreDetails?: {
    qualityScore: number;
    priceScore: number;
    reliabilityScore: number;
    customizationScore: number;
    communicationScore: number;
  };

  // 聯繫方式
  primaryEmail: string;
  emails: string[];
  phone?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    wechat?: string;
    whatsapp?: string;
  };

  // 分類
  productCategories: ProductCategory[];
  keywords: string[];

  // 來源
  sourcePlatform: SourcePlatform;
  sourceUrl?: string;

  // 狀態
  status: SupplierStatus;
  rating?: SupplierRating;

  // 時間戳
  discoveredAt: string;
  lastContactedAt?: string;
  lastUpdatedAt: string;

  // 其他
  notes?: string;
  tags: string[];

  // 風險分析 (Phase III)
  riskAnalysis?: {
    overallRisk: 'low' | 'medium' | 'high';
    factors: string[];
    lastAnalyzedAt: string;
  };
}

// 供應商聯繫記錄
export interface ContactRecord {
  id: string;
  supplierId: string;
  contactType: 'email' | 'phone' | 'meeting' | 'video_call' | 'other';
  subject: string;
  content: string;
  outcome?: 'positive' | 'neutral' | 'negative';
  nextAction?: string;
  contactedBy: string;
  contactedAt: string;
  attachments?: string[];
}

// 系統狀態
export interface SystemStatus {
  lastAcquisitionTime: string;
  acquisitionSuccessRate: number;
  ipProxyPoolStatus: 'healthy' | 'degraded' | 'critical';
  activeProxies: number;
  totalProxies: number;
  systemLoad: number; // CPU 使用率百分比
  memoryUsage: number; // 記憶體使用率百分比
  storageUsage: number; // 存儲使用率百分比
  errorsLast24h: number;
  warningsLast24h: number;
}

// 儀表板統計
export interface DashboardStats {
  // 供應商統計
  totalSuppliers: number;
  newSuppliersToday: number;
  newSuppliersThisWeek: number;
  newSuppliersThisMonth: number;

  // 狀態分佈
  statusDistribution: {
    not_contacted: number;
    contacted: number;
    negotiating: number;
    cooperating: number;
    rejected: number;
    blacklisted: number;
  };

  // 類別分佈
  categoryDistribution: Record<ProductCategory, number>;

  // 國家/地區分佈
  countryDistribution: Record<string, number>;

  // 採集統計
  acquisitionStats: {
    totalAcquisitions: number;
    successfulAcquisitions: number;
    failedAcquisitions: number;
    lastSuccessTime: string;
  };

  // 系統狀態
  systemStatus: SystemStatus;
}

// 新名單趨勢數據
export interface TrendData {
  date: string;
  count: number;
  category?: ProductCategory;
}

// 高潛力供應商
export interface TopSupplier {
  supplier: Supplier;
  highlightReasons: string[];
}

// 數據採集平台配置
export interface AcquisitionPlatformConfig {
  id: string;
  platform: SourcePlatform;
  platformName: string;
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextScheduledRun?: string;
  lastRunTime?: string;
  lastRunStatus: 'success' | 'partial' | 'failed' | 'never';
  depth: 'shallow' | 'medium' | 'deep'; // 採集深度
  maxPages: number;
  targetKeywords: string[];
  settings: {
    respectRobotsTxt: boolean;
    requestDelay: number; // ms
    maxRetries: number;
    useProxy: boolean;
  };
}

// 合規性報告
export interface ComplianceReport {
  id: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  platforms: {
    platform: SourcePlatform;
    robotsTxtCompliance: boolean;
    blockedCount: number;
    rateLimitHits: number;
    successRate: number;
    issues: string[];
  }[];
  overallCompliance: number; // 百分比
  recommendations: string[];
}

// 字段映射配置
export interface FieldMapping {
  id: string;
  platform: SourcePlatform;
  sourceField: string;
  targetField: keyof Supplier | string;
  transformFunction?: string;
  isRequired: boolean;
  defaultValue?: string;
}

// AI 模型參數
export interface AIModelConfig {
  version: string;
  lastUpdated: string;

  // 特徵權重
  featureWeights: {
    quality: number; // 品質權重
    price: number; // 價格權重
    reliability: number; // 可靠性權重
    customization: number; // 客製化能力權重
    communication: number; // 溝通能力權重
    geography: number; // 地理位置權重
    experience: number; // 經驗年限權重
    certifications: number; // 認證權重
  };

  // 模型性能
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastEvaluatedAt: string;
    sampleSize: number;
  };

  // 訓練數據統計
  trainingStats: {
    totalFeedbacks: number;
    positiveOutcomes: number;
    negativeOutcomes: number;
    neutralOutcomes: number;
    lastTrainedAt: string;
  };
}

// 用戶反饋
export interface UserFeedback {
  id: string;
  supplierId: string;
  supplierName: string;
  outcome: 'success' | 'failure' | 'problematic';
  originalScore: number;
  feedbackDetails: {
    qualityMatch: 1 | 2 | 3 | 4 | 5;
    priceMatch: 1 | 2 | 3 | 4 | 5;
    communicationQuality: 1 | 2 | 3 | 4 | 5;
    deliveryReliability: 1 | 2 | 3 | 4 | 5;
    overallSatisfaction: 1 | 2 | 3 | 4 | 5;
  };
  comments?: string;
  submittedBy: string;
  submittedAt: string;
  isUsedForTraining: boolean;
}

// 篩選條件
export interface SupplierFilters {
  search?: string;
  aiScoreRange?: { min: number; max: number };
  statuses?: SupplierStatus[];
  categories?: ProductCategory[];
  countries?: string[];
  platforms?: SourcePlatform[];
  tags?: string[];
  discoveredDateRange?: { start: string; end: string };
  hasEmail?: boolean;
  hasPhone?: boolean;
  hasWebsite?: boolean;
}

// 批次操作
export interface BatchOperation {
  type: 'tag' | 'status' | 'export' | 'delete' | 'push_to_crm';
  supplierIds: string[];
  payload?: {
    tags?: string[];
    status?: SupplierStatus;
    exportFormat?: 'csv' | 'excel' | 'json';
    crmTarget?: string;
  };
}

// 導出配置
export interface ExportConfig {
  format: 'csv' | 'excel' | 'json';
  fields: (keyof Supplier)[];
  filters?: SupplierFilters;
  includeContactRecords: boolean;
}

// 通知設定
export interface NotificationSettings {
  emailAlerts: boolean;
  alertThresholds: {
    systemErrorCount: number;
    lowProxyPoolSize: number;
    acquisitionFailureRate: number;
  };
  dailyDigest: boolean;
  weeklyReport: boolean;
}

// 採集任務
export interface AcquisitionTask {
  id: string;
  platform: SourcePlatform;
  status: AcquisitionStatus;
  startedAt?: string;
  completedAt?: string;
  progress: number; // 0-100
  stats: {
    pagesScanned: number;
    suppliersFound: number;
    newSuppliers: number;
    duplicates: number;
    errors: number;
  };
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
}
