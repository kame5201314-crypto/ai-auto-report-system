// KOL 社群平台資料
export interface SocialPlatform {
  platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter';
  handle: string; // 帳號名稱
  url: string;
  followers: number; // 粉絲數
  lastUpdated: string; // 最後更新日期
}

// KOL 評級
export type KOLRating = 'S' | 'A' | 'B' | 'C' | 'D';

// 分潤週期類型
export type ProfitSharePeriod = 'monthly' | 'quarterly' | 'semi-annual' | 'yearly';

// 分潤記錄
export interface ProfitShareRecord {
  id: string; // 唯一識別碼
  settlementDate: string; // 結算日期
  period: ProfitSharePeriod; // 分潤週期：每月/每季/每年
  periodStart: string; // 期間開始日期
  month?: string; // 月份選擇 (YYYY-MM 格式)
  periodEnd: string; // 期間結束日期
  salesAmount: number; // 銷售金額
  profitShareRate: number; // 分潤比例 (%)
  profitAmount: number; // 分潤金額 (自動計算)
  note?: string; // 備註
  createdAt: string;
}

// KOL 基本資料
export interface KOL {
  id: number;
  name: string; // 真實姓名或藝名
  nickname: string; // 暱稱
  email: string;
  phone: string;
  facebookUrl?: string; // Facebook 個人頁面或 Messenger 連結
  lineUrl?: string; // Line 聯絡連結
  category: string[]; // 內容類別：美妝、3C、美食、旅遊、時尚、生活、遊戲、運動等
  tags: string[]; // 自訂標籤
  rating: KOLRating; // 評級 S/A/B/C/D
  note: string; // 備註
  socialPlatforms: SocialPlatform[]; // 社群平台資料
  profitShares?: ProfitShareRecord[]; // 分潤記錄
  createdAt: string;
  updatedAt: string;
}

// 合作專案狀態
export type CollaborationStatus = 'pending' | 'negotiating' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

// 合作專案
export interface Collaboration {
  id: number;
  kolId: number;
  projectName: string; // 專案名稱
  productName: string; // 商品名稱
  productCode?: string; // 商品編號
  status: CollaborationStatus;
  startDate: string;
  endDate: string;
  budget: number; // 合作預算
  actualCost: number; // 實際費用
  deliverables: string[]; // 交付內容：貼文數量、影片、限時動態等
  platforms: ('youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter')[]; // 合作平台
  contractUrl?: string; // 合約檔案連結
  note: string;
  createdAt: string;
  updatedAt: string;
}

// 銷售追蹤
export interface SalesTracking {
  id: number;
  collaborationId: number;
  kolId: number;
  discountCode?: string; // 折扣碼
  affiliateLink?: string; // 聯盟連結
  clicks: number; // 點擊數
  conversions: number; // 轉換數
  revenue: number; // 銷售額
  commission: number; // 佣金
  commissionRate: number; // 佣金比例 (%)
  trackingStartDate: string;
  trackingEndDate: string;
  createdAt: string;
  updatedAt: string;
}

// 內容成效
export interface ContentPerformance {
  id: number;
  collaborationId: number;
  platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'twitter';
  contentUrl: string;
  contentType: 'post' | 'video' | 'story' | 'reel' | 'short';
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number; // 互動率
  reach: number; // 觸及數
  createdAt: string;
}

// 統計摘要
export interface DashboardStats {
  totalKOLs: number;
  activeCollaborations: number;
  totalRevenue: number;
  totalBudget: number;
  avgEngagement: number;
  topPerformingKOLs: {
    kolId: number;
    name: string;
    revenue: number;
    engagement: number;
  }[];
}

// 篩選條件
export interface KOLFilter {
  searchTerm?: string;
  categories?: string[];
  regions?: string[];
  platforms?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  minRating?: number;
  tags?: string[];
}
