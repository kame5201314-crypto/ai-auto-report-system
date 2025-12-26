// SIDAS Mock 數據

import {
  Supplier,
  ContactRecord,
  DashboardStats,
  SystemStatus,
  TrendData,
  AcquisitionPlatformConfig,
  ComplianceReport,
  FieldMapping,
  AIModelConfig,
  UserFeedback,
  AcquisitionTask,
  ProductCategory,
  SourcePlatform
} from '../types/sidas';

// 供應商 Mock 數據
export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    companyName: 'Shenzhen APEXEL Technology Co., Ltd.',
    companyNameLocal: '深圳愛派科技有限公司',
    country: 'China',
    region: 'Guangdong',
    address: 'Building A, Tech Park, Nanshan District, Shenzhen',
    aiScore: 92,
    aiScoreDetails: {
      qualityScore: 95,
      priceScore: 88,
      reliabilityScore: 94,
      customizationScore: 90,
      communicationScore: 93
    },
    primaryEmail: 'sales@apexel-tech.com',
    emails: ['sales@apexel-tech.com', 'export@apexel-tech.com'],
    phone: '+86-755-8888-1234',
    website: 'https://www.apexel-tech.com',
    socialMedia: {
      linkedin: 'linkedin.com/company/apexel-tech',
      wechat: 'apexel_official'
    },
    productCategories: ['APEXEL'],
    keywords: ['手機鏡頭', '望遠鏡', '廣角鏡頭', 'phone lens', 'telescope'],
    sourcePlatform: 'alibaba',
    sourceUrl: 'https://apexel-tech.alibaba.com',
    status: 'cooperating',
    rating: 'A',
    discoveredAt: '2024-01-15T08:00:00Z',
    lastContactedAt: '2024-11-20T14:30:00Z',
    lastUpdatedAt: '2024-11-25T10:00:00Z',
    notes: '優質供應商，合作穩定，回覆迅速',
    tags: ['優先合作', 'ODM能力', '快速交貨'],
    riskAnalysis: {
      overallRisk: 'low',
      factors: ['公司成立超過10年', '通過ISO9001認證', '良好的付款記錄'],
      lastAnalyzedAt: '2024-11-01T00:00:00Z'
    }
  },
  {
    id: 'sup-002',
    companyName: 'Guangzhou MEFU Optical Equipment Co., Ltd.',
    companyNameLocal: '廣州美孚光學設備有限公司',
    country: 'China',
    region: 'Guangdong',
    address: '123 Optical Industry Park, Huangpu District, Guangzhou',
    aiScore: 88,
    aiScoreDetails: {
      qualityScore: 90,
      priceScore: 85,
      reliabilityScore: 88,
      customizationScore: 92,
      communicationScore: 85
    },
    primaryEmail: 'info@mefu-optical.cn',
    emails: ['info@mefu-optical.cn', 'sales@mefu-optical.cn'],
    phone: '+86-20-3333-5678',
    website: 'https://www.mefu-optical.cn',
    productCategories: ['MEFU'],
    keywords: ['光學鏡頭', '護目鏡', '放大鏡', 'optical lens', 'magnifier'],
    sourcePlatform: 'made_in_china',
    sourceUrl: 'https://mefu-optical.made-in-china.com',
    status: 'negotiating',
    rating: 'B',
    discoveredAt: '2024-02-20T10:00:00Z',
    lastContactedAt: '2024-11-18T09:00:00Z',
    lastUpdatedAt: '2024-11-24T16:00:00Z',
    notes: '價格有競爭力，正在討論客製化需求',
    tags: ['價格優勢', '待評估'],
    riskAnalysis: {
      overallRisk: 'medium',
      factors: ['公司成立3年', '首次合作需謹慎'],
      lastAnalyzedAt: '2024-10-15T00:00:00Z'
    }
  },
  {
    id: 'sup-003',
    companyName: 'Yiwu Electronics Trading Co., Ltd.',
    companyNameLocal: '義烏電子貿易有限公司',
    country: 'China',
    region: 'Zhejiang',
    address: 'International Trade City, Yiwu',
    aiScore: 75,
    aiScoreDetails: {
      qualityScore: 72,
      priceScore: 92,
      reliabilityScore: 70,
      customizationScore: 65,
      communicationScore: 78
    },
    primaryEmail: 'trade@yiwu-electronics.com',
    emails: ['trade@yiwu-electronics.com'],
    phone: '+86-579-8888-9999',
    productCategories: ['ELECTRONICS', 'ACCESSORIES'],
    keywords: ['電子配件', '手機配件', 'mobile accessories'],
    sourcePlatform: 'dhgate',
    status: 'contacted',
    discoveredAt: '2024-03-10T14:00:00Z',
    lastContactedAt: '2024-11-10T11:00:00Z',
    lastUpdatedAt: '2024-11-22T08:00:00Z',
    notes: '價格非常低，但品質需進一步確認',
    tags: ['低價', '需樣品確認'],
    riskAnalysis: {
      overallRisk: 'medium',
      factors: ['品質不穩定報告', '溝通回覆較慢'],
      lastAnalyzedAt: '2024-11-01T00:00:00Z'
    }
  },
  {
    id: 'sup-004',
    companyName: 'Mumbai Optical Industries Pvt. Ltd.',
    country: 'India',
    region: 'Maharashtra',
    address: 'Industrial Area, Andheri East, Mumbai',
    aiScore: 82,
    aiScoreDetails: {
      qualityScore: 85,
      priceScore: 88,
      reliabilityScore: 80,
      customizationScore: 78,
      communicationScore: 85
    },
    primaryEmail: 'export@mumbai-optical.in',
    emails: ['export@mumbai-optical.in', 'sales@mumbai-optical.in'],
    phone: '+91-22-1234-5678',
    website: 'https://www.mumbai-optical.in',
    productCategories: ['APEXEL', 'ACCESSORIES'],
    keywords: ['optical products', 'lens accessories', 'India manufacturer'],
    sourcePlatform: 'indiamart',
    sourceUrl: 'https://www.indiamart.com/mumbai-optical',
    status: 'not_contacted',
    discoveredAt: '2024-11-20T06:00:00Z',
    lastUpdatedAt: '2024-11-20T06:00:00Z',
    tags: ['新發現', '印度供應商'],
  },
  {
    id: 'sup-005',
    companyName: 'Vietnam Precision Optics JSC',
    country: 'Vietnam',
    region: 'Ho Chi Minh City',
    address: 'Tan Thuan Export Processing Zone',
    aiScore: 79,
    aiScoreDetails: {
      qualityScore: 80,
      priceScore: 85,
      reliabilityScore: 78,
      customizationScore: 75,
      communicationScore: 80
    },
    primaryEmail: 'contact@vn-precision-optics.com',
    emails: ['contact@vn-precision-optics.com'],
    phone: '+84-28-3333-4444',
    website: 'https://www.vn-precision-optics.com',
    productCategories: ['MEFU', 'ELECTRONICS'],
    keywords: ['precision optics', 'camera lens', 'Vietnam manufacturer'],
    sourcePlatform: 'global_sources',
    status: 'not_contacted',
    discoveredAt: '2024-11-22T09:00:00Z',
    lastUpdatedAt: '2024-11-22T09:00:00Z',
    tags: ['新發現', '越南供應商', '東南亞'],
  },
  {
    id: 'sup-006',
    companyName: 'Taiwan Optical Innovation Corp.',
    companyNameLocal: '台灣光學創新股份有限公司',
    country: 'Taiwan',
    region: 'Taichung',
    address: '台中市西屯區工業區路100號',
    aiScore: 95,
    aiScoreDetails: {
      qualityScore: 98,
      priceScore: 75,
      reliabilityScore: 96,
      customizationScore: 95,
      communicationScore: 98
    },
    primaryEmail: 'sales@tw-optical-innovation.com.tw',
    emails: ['sales@tw-optical-innovation.com.tw', 'rd@tw-optical-innovation.com.tw'],
    phone: '+886-4-2222-3333',
    website: 'https://www.tw-optical-innovation.com.tw',
    socialMedia: {
      linkedin: 'linkedin.com/company/tw-optical-innovation'
    },
    productCategories: ['APEXEL', 'MEFU'],
    keywords: ['高端光學', 'precision lens', 'Taiwan quality', 'R&D capability'],
    sourcePlatform: 'manual',
    status: 'cooperating',
    rating: 'A',
    discoveredAt: '2023-06-01T00:00:00Z',
    lastContactedAt: '2024-11-25T10:00:00Z',
    lastUpdatedAt: '2024-11-25T10:00:00Z',
    notes: '頂級品質，適合高端產品線',
    tags: ['頂級品質', '長期合作', 'R&D夥伴'],
    riskAnalysis: {
      overallRisk: 'low',
      factors: ['上市公司', '多項國際認證', '合作多年'],
      lastAnalyzedAt: '2024-11-01T00:00:00Z'
    }
  },
  {
    id: 'sup-007',
    companyName: 'Korea Lens Tech Co., Ltd.',
    companyNameLocal: '한국렌즈테크',
    country: 'South Korea',
    region: 'Gyeonggi-do',
    address: 'Suwon Industrial Complex',
    aiScore: 91,
    aiScoreDetails: {
      qualityScore: 94,
      priceScore: 78,
      reliabilityScore: 92,
      customizationScore: 90,
      communicationScore: 92
    },
    primaryEmail: 'global@kr-lenstech.co.kr',
    emails: ['global@kr-lenstech.co.kr'],
    phone: '+82-31-222-3333',
    website: 'https://www.kr-lenstech.co.kr',
    productCategories: ['APEXEL', 'ELECTRONICS'],
    keywords: ['Korea lens', 'smartphone lens', 'premium quality'],
    sourcePlatform: 'ec21',
    status: 'contacted',
    discoveredAt: '2024-08-15T00:00:00Z',
    lastContactedAt: '2024-11-15T14:00:00Z',
    lastUpdatedAt: '2024-11-20T08:00:00Z',
    notes: '韓國高品質供應商，價格較高但品質穩定',
    tags: ['韓國品質', '待報價確認'],
  },
  {
    id: 'sup-008',
    companyName: 'Dongguan Smart Accessories Factory',
    companyNameLocal: '東莞智能配件廠',
    country: 'China',
    region: 'Guangdong',
    address: 'Changan Town, Dongguan City',
    aiScore: 68,
    aiScoreDetails: {
      qualityScore: 65,
      priceScore: 95,
      reliabilityScore: 62,
      customizationScore: 70,
      communicationScore: 68
    },
    primaryEmail: 'factory@dg-smart-acc.com',
    emails: ['factory@dg-smart-acc.com'],
    phone: '+86-769-8888-7777',
    productCategories: ['ACCESSORIES', 'ELECTRONICS'],
    keywords: ['phone accessories', 'cheap manufacturer', 'bulk order'],
    sourcePlatform: 'alibaba',
    status: 'rejected',
    rating: 'D',
    discoveredAt: '2024-04-01T00:00:00Z',
    lastContactedAt: '2024-06-15T10:00:00Z',
    lastUpdatedAt: '2024-06-15T10:00:00Z',
    notes: '品質不符標準，已終止洽談',
    tags: ['品質問題', '已拒絕'],
    riskAnalysis: {
      overallRisk: 'high',
      factors: ['品質投訴', '交貨延遲記錄', '無法提供認證'],
      lastAnalyzedAt: '2024-06-15T00:00:00Z'
    }
  },
  {
    id: 'sup-009',
    companyName: 'Ningbo Ocean Trade Co., Ltd.',
    companyNameLocal: '寧波海洋貿易有限公司',
    country: 'China',
    region: 'Zhejiang',
    address: 'Ningbo Free Trade Zone',
    aiScore: 84,
    aiScoreDetails: {
      qualityScore: 82,
      priceScore: 88,
      reliabilityScore: 85,
      customizationScore: 80,
      communicationScore: 86
    },
    primaryEmail: 'export@nb-ocean-trade.com',
    emails: ['export@nb-ocean-trade.com', 'sales@nb-ocean-trade.com'],
    phone: '+86-574-8888-6666',
    website: 'https://www.nb-ocean-trade.com',
    productCategories: ['MEFU', 'OTHER'],
    keywords: ['trade company', 'sourcing agent', 'multi-product'],
    sourcePlatform: 'made_in_china',
    status: 'negotiating',
    discoveredAt: '2024-09-01T00:00:00Z',
    lastContactedAt: '2024-11-22T16:00:00Z',
    lastUpdatedAt: '2024-11-24T10:00:00Z',
    notes: '貿易公司，可協助多種產品採購',
    tags: ['貿易商', '多產品線'],
  },
  {
    id: 'sup-010',
    companyName: 'Bangkok Optic Solutions Ltd.',
    country: 'Thailand',
    region: 'Bangkok',
    address: 'Bangna Industrial Estate',
    aiScore: 77,
    aiScoreDetails: {
      qualityScore: 78,
      priceScore: 82,
      reliabilityScore: 75,
      customizationScore: 74,
      communicationScore: 79
    },
    primaryEmail: 'info@bangkok-optic.co.th',
    emails: ['info@bangkok-optic.co.th'],
    phone: '+66-2-333-4444',
    website: 'https://www.bangkok-optic.co.th',
    productCategories: ['APEXEL', 'ACCESSORIES'],
    keywords: ['Thailand manufacturer', 'optic solutions', 'ASEAN'],
    sourcePlatform: 'global_sources',
    status: 'not_contacted',
    discoveredAt: '2024-11-25T08:00:00Z',
    lastUpdatedAt: '2024-11-25T08:00:00Z',
    tags: ['新發現', '泰國供應商', '東南亞'],
  }
];

// 聯繫記錄 Mock 數據
export const mockContactRecords: ContactRecord[] = [
  {
    id: 'contact-001',
    supplierId: 'sup-001',
    contactType: 'email',
    subject: '2024年度合作方案討論',
    content: '討論了2024年度的合作計劃，包括新產品開發和價格調整...',
    outcome: 'positive',
    nextAction: '等待對方回覆報價單',
    contactedBy: 'admin',
    contactedAt: '2024-11-20T14:30:00Z',
  },
  {
    id: 'contact-002',
    supplierId: 'sup-001',
    contactType: 'video_call',
    subject: '新產品線展示會議',
    content: '線上會議查看最新產品樣品，品質符合預期...',
    outcome: 'positive',
    nextAction: '安排樣品寄送',
    contactedBy: 'admin',
    contactedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'contact-003',
    supplierId: 'sup-002',
    contactType: 'email',
    subject: '客製化需求詢問',
    content: '詢問關於產品客製化的可行性和價格...',
    outcome: 'neutral',
    nextAction: '等待技術部門評估',
    contactedBy: 'admin',
    contactedAt: '2024-11-18T09:00:00Z',
  },
  {
    id: 'contact-004',
    supplierId: 'sup-003',
    contactType: 'email',
    subject: '首次聯繫 - 產品詢價',
    content: '首次聯繫，詢問產品目錄和價格表...',
    outcome: 'neutral',
    contactedBy: 'admin',
    contactedAt: '2024-11-10T11:00:00Z',
  },
  {
    id: 'contact-005',
    supplierId: 'sup-007',
    contactType: 'email',
    subject: '產品規格確認',
    content: '確認產品規格和MOQ要求...',
    outcome: 'positive',
    nextAction: '準備正式報價',
    contactedBy: 'admin',
    contactedAt: '2024-11-15T14:00:00Z',
  }
];

// 系統狀態
export const mockSystemStatus: SystemStatus = {
  lastAcquisitionTime: '2024-11-27T02:00:00Z',
  acquisitionSuccessRate: 94.5,
  ipProxyPoolStatus: 'healthy',
  activeProxies: 48,
  totalProxies: 50,
  systemLoad: 35,
  memoryUsage: 62,
  storageUsage: 45,
  errorsLast24h: 3,
  warningsLast24h: 12
};

// 儀表板統計
export const mockDashboardStats: DashboardStats = {
  totalSuppliers: 1247,
  newSuppliersToday: 15,
  newSuppliersThisWeek: 89,
  newSuppliersThisMonth: 312,
  statusDistribution: {
    not_contacted: 456,
    contacted: 312,
    negotiating: 89,
    cooperating: 156,
    rejected: 198,
    blacklisted: 36
  },
  categoryDistribution: {
    'APEXEL': 423,
    'MEFU': 356,
    'ACCESSORIES': 234,
    'ELECTRONICS': 178,
    'OTHER': 56
  },
  countryDistribution: {
    'China': 856,
    'India': 123,
    'Vietnam': 89,
    'Taiwan': 67,
    'South Korea': 45,
    'Thailand': 34,
    'Japan': 23,
    'Others': 10
  },
  acquisitionStats: {
    totalAcquisitions: 2456,
    successfulAcquisitions: 2321,
    failedAcquisitions: 135,
    lastSuccessTime: '2024-11-27T02:00:00Z'
  },
  systemStatus: mockSystemStatus
};

// 趨勢數據 (過去30天)
export const mockTrendData: TrendData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    count: Math.floor(Math.random() * 20) + 5,
    category: (['APEXEL', 'MEFU', 'ACCESSORIES', 'ELECTRONICS', 'OTHER'] as ProductCategory[])[Math.floor(Math.random() * 5)]
  };
});

// 採集平台配置
export const mockPlatformConfigs: AcquisitionPlatformConfig[] = [
  {
    id: 'platform-001',
    platform: 'alibaba',
    platformName: 'Alibaba.com',
    isEnabled: true,
    frequency: 'weekly',
    nextScheduledRun: '2024-12-01T02:00:00Z',
    lastRunTime: '2024-11-24T02:00:00Z',
    lastRunStatus: 'success',
    depth: 'deep',
    maxPages: 100,
    targetKeywords: ['phone lens', 'camera lens', 'optical equipment', 'smartphone accessories'],
    settings: {
      respectRobotsTxt: true,
      requestDelay: 2000,
      maxRetries: 3,
      useProxy: true
    }
  },
  {
    id: 'platform-002',
    platform: 'made_in_china',
    platformName: 'Made-in-China.com',
    isEnabled: true,
    frequency: 'weekly',
    nextScheduledRun: '2024-12-01T03:00:00Z',
    lastRunTime: '2024-11-24T03:00:00Z',
    lastRunStatus: 'success',
    depth: 'medium',
    maxPages: 50,
    targetKeywords: ['optical lens', 'magnifier', 'telescope'],
    settings: {
      respectRobotsTxt: true,
      requestDelay: 3000,
      maxRetries: 3,
      useProxy: true
    }
  },
  {
    id: 'platform-003',
    platform: 'global_sources',
    platformName: 'GlobalSources.com',
    isEnabled: true,
    frequency: 'biweekly',
    nextScheduledRun: '2024-12-08T02:00:00Z',
    lastRunTime: '2024-11-24T04:00:00Z',
    lastRunStatus: 'partial',
    depth: 'medium',
    maxPages: 30,
    targetKeywords: ['camera accessories', 'mobile lens'],
    settings: {
      respectRobotsTxt: true,
      requestDelay: 2500,
      maxRetries: 2,
      useProxy: true
    }
  },
  {
    id: 'platform-004',
    platform: 'dhgate',
    platformName: 'DHgate.com',
    isEnabled: false,
    frequency: 'monthly',
    lastRunTime: '2024-10-15T02:00:00Z',
    lastRunStatus: 'failed',
    depth: 'shallow',
    maxPages: 20,
    targetKeywords: ['phone accessories'],
    settings: {
      respectRobotsTxt: true,
      requestDelay: 5000,
      maxRetries: 2,
      useProxy: true
    }
  },
  {
    id: 'platform-005',
    platform: 'indiamart',
    platformName: 'IndiaMart.com',
    isEnabled: true,
    frequency: 'monthly',
    nextScheduledRun: '2024-12-15T02:00:00Z',
    lastRunTime: '2024-11-15T02:00:00Z',
    lastRunStatus: 'success',
    depth: 'medium',
    maxPages: 40,
    targetKeywords: ['optical products', 'lens manufacturer India'],
    settings: {
      respectRobotsTxt: true,
      requestDelay: 3000,
      maxRetries: 3,
      useProxy: true
    }
  },
  {
    id: 'platform-006',
    platform: 'ec21',
    platformName: 'EC21.com',
    isEnabled: true,
    frequency: 'biweekly',
    nextScheduledRun: '2024-12-08T05:00:00Z',
    lastRunTime: '2024-11-24T05:00:00Z',
    lastRunStatus: 'success',
    depth: 'shallow',
    maxPages: 25,
    targetKeywords: ['Korea lens', 'optical equipment Korea'],
    settings: {
      respectRobotsTxt: true,
      requestDelay: 2000,
      maxRetries: 3,
      useProxy: true
    }
  }
];

// 合規性報告
export const mockComplianceReport: ComplianceReport = {
  id: 'report-001',
  generatedAt: '2024-11-27T00:00:00Z',
  period: {
    start: '2024-11-01T00:00:00Z',
    end: '2024-11-30T23:59:59Z'
  },
  platforms: [
    {
      platform: 'alibaba',
      robotsTxtCompliance: true,
      blockedCount: 2,
      rateLimitHits: 15,
      successRate: 96.5,
      issues: ['部分頁面需要登入', '偶發性IP限制']
    },
    {
      platform: 'made_in_china',
      robotsTxtCompliance: true,
      blockedCount: 0,
      rateLimitHits: 5,
      successRate: 98.2,
      issues: []
    },
    {
      platform: 'global_sources',
      robotsTxtCompliance: true,
      blockedCount: 8,
      rateLimitHits: 22,
      successRate: 89.5,
      issues: ['反爬蟲機制較強', '建議降低採集頻率']
    }
  ],
  overallCompliance: 94.7,
  recommendations: [
    '建議增加請求間隔以降低被封鎖風險',
    '考慮為 GlobalSources 平台啟用更多代理IP',
    '定期更新目標關鍵詞以提高採集效率'
  ]
};

// 字段映射
export const mockFieldMappings: FieldMapping[] = [
  {
    id: 'mapping-001',
    platform: 'alibaba',
    sourceField: 'company_name',
    targetField: 'companyName',
    isRequired: true
  },
  {
    id: 'mapping-002',
    platform: 'alibaba',
    sourceField: 'contact_email',
    targetField: 'primaryEmail',
    isRequired: true
  },
  {
    id: 'mapping-003',
    platform: 'alibaba',
    sourceField: 'country_region',
    targetField: 'country',
    transformFunction: 'extractCountry',
    isRequired: true
  },
  {
    id: 'mapping-004',
    platform: 'alibaba',
    sourceField: 'main_products',
    targetField: 'keywords',
    transformFunction: 'splitByComma',
    isRequired: false
  },
  {
    id: 'mapping-005',
    platform: 'made_in_china',
    sourceField: 'supplier_name',
    targetField: 'companyName',
    isRequired: true
  },
  {
    id: 'mapping-006',
    platform: 'made_in_china',
    sourceField: 'email',
    targetField: 'primaryEmail',
    isRequired: true
  }
];

// AI 模型配置
export const mockAIModelConfig: AIModelConfig = {
  version: '2.1.0',
  lastUpdated: '2024-11-15T00:00:00Z',
  featureWeights: {
    quality: 0.25,
    price: 0.15,
    reliability: 0.20,
    customization: 0.15,
    communication: 0.10,
    geography: 0.05,
    experience: 0.05,
    certifications: 0.05
  },
  performance: {
    accuracy: 0.87,
    precision: 0.84,
    recall: 0.89,
    f1Score: 0.865,
    lastEvaluatedAt: '2024-11-20T00:00:00Z',
    sampleSize: 500
  },
  trainingStats: {
    totalFeedbacks: 892,
    positiveOutcomes: 456,
    negativeOutcomes: 234,
    neutralOutcomes: 202,
    lastTrainedAt: '2024-11-15T00:00:00Z'
  }
};

// 用戶反饋
export const mockUserFeedbacks: UserFeedback[] = [
  {
    id: 'feedback-001',
    supplierId: 'sup-001',
    supplierName: 'Shenzhen APEXEL Technology Co., Ltd.',
    outcome: 'success',
    originalScore: 88,
    feedbackDetails: {
      qualityMatch: 5,
      priceMatch: 4,
      communicationQuality: 5,
      deliveryReliability: 5,
      overallSatisfaction: 5
    },
    comments: '非常滿意，品質穩定，交貨準時',
    submittedBy: 'admin',
    submittedAt: '2024-11-01T10:00:00Z',
    isUsedForTraining: true
  },
  {
    id: 'feedback-002',
    supplierId: 'sup-008',
    supplierName: 'Dongguan Smart Accessories Factory',
    outcome: 'failure',
    originalScore: 72,
    feedbackDetails: {
      qualityMatch: 2,
      priceMatch: 5,
      communicationQuality: 2,
      deliveryReliability: 1,
      overallSatisfaction: 1
    },
    comments: '品質不符合樣品標準，溝通困難',
    submittedBy: 'admin',
    submittedAt: '2024-06-15T10:00:00Z',
    isUsedForTraining: true
  },
  {
    id: 'feedback-003',
    supplierId: 'sup-006',
    supplierName: 'Taiwan Optical Innovation Corp.',
    outcome: 'success',
    originalScore: 92,
    feedbackDetails: {
      qualityMatch: 5,
      priceMatch: 3,
      communicationQuality: 5,
      deliveryReliability: 5,
      overallSatisfaction: 5
    },
    comments: '頂級品質，價格較高但物有所值',
    submittedBy: 'admin',
    submittedAt: '2024-10-15T14:00:00Z',
    isUsedForTraining: true
  }
];

// 採集任務
export const mockAcquisitionTasks: AcquisitionTask[] = [
  {
    id: 'task-001',
    platform: 'alibaba',
    status: 'completed',
    startedAt: '2024-11-24T02:00:00Z',
    completedAt: '2024-11-24T04:35:00Z',
    progress: 100,
    stats: {
      pagesScanned: 100,
      suppliersFound: 245,
      newSuppliers: 32,
      duplicates: 213,
      errors: 3
    },
    logs: [
      { timestamp: '2024-11-24T02:00:00Z', level: 'info', message: '開始採集任務' },
      { timestamp: '2024-11-24T02:15:00Z', level: 'info', message: '已掃描 25 頁' },
      { timestamp: '2024-11-24T02:45:00Z', level: 'warning', message: '遇到速率限制，暫停 30 秒' },
      { timestamp: '2024-11-24T04:35:00Z', level: 'info', message: '採集任務完成' }
    ]
  },
  {
    id: 'task-002',
    platform: 'made_in_china',
    status: 'completed',
    startedAt: '2024-11-24T03:00:00Z',
    completedAt: '2024-11-24T04:20:00Z',
    progress: 100,
    stats: {
      pagesScanned: 50,
      suppliersFound: 128,
      newSuppliers: 18,
      duplicates: 110,
      errors: 0
    },
    logs: [
      { timestamp: '2024-11-24T03:00:00Z', level: 'info', message: '開始採集任務' },
      { timestamp: '2024-11-24T04:20:00Z', level: 'info', message: '採集任務完成' }
    ]
  }
];

// 輔助函數：獲取高潛力供應商
export const getTopPotentialSuppliers = (limit: number = 5) => {
  return mockSuppliers
    .filter(s => s.status === 'not_contacted' || s.status === 'contacted')
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, limit)
    .map(supplier => ({
      supplier,
      highlightReasons: generateHighlightReasons(supplier)
    }));
};

const generateHighlightReasons = (supplier: Supplier): string[] => {
  const reasons: string[] = [];

  if (supplier.aiScore >= 90) {
    reasons.push('AI 評分優秀 (90+)');
  } else if (supplier.aiScore >= 80) {
    reasons.push('AI 評分良好 (80+)');
  }

  if (supplier.aiScoreDetails?.qualityScore && supplier.aiScoreDetails.qualityScore >= 90) {
    reasons.push('品質評分突出');
  }

  if (supplier.aiScoreDetails?.customizationScore && supplier.aiScoreDetails.customizationScore >= 90) {
    reasons.push('客製化能力強');
  }

  if (supplier.website) {
    reasons.push('資料完整度高');
  }

  if (supplier.riskAnalysis?.overallRisk === 'low') {
    reasons.push('風險評級低');
  }

  if (reasons.length === 0) {
    reasons.push('新發現的潛在供應商');
  }

  return reasons;
};
