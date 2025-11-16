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
  collaborationId: number; // 關聯的合作專案 ID
  kolId: number; // 關聯的 KOL ID
  settlementDate: string; // 結算日期
  period: ProfitSharePeriod; // 分潤週期：每月/每季/每年
  periodStart: string; // 開始時間
  periodEnd: string; // 結束時間
  month?: string; // 合作月份 (從 periodStart 自動計算，YYYY-MM 格式)
  salesAmount: number; // 銷售金額
  profitShareRate: number; // 分潤比例 (%)
  profitAmount: number; // 分潤金額 (自動計算)
  bonusAmount?: number; // 額外獎金
  totalAmount?: number; // 總分潤金額 (profitAmount + bonusAmount)
  note?: string; // 備註
  createdAt: string;
}

// 合作流程管理
export interface CollaborationProcess {
  negotiationStatus?: string; // 洽談情況
  needProduct?: 'yes' | 'no' | ''; // 是否需要寄商品給KOL
  productReturn?: 'yes' | 'no' | ''; // 商品是否要收回
  collaborationDetails?: string; // 合作細節
  deadline?: string; // 交稿期
  resultPublication?: string; // 成果發布
}

// KOL 基本資料
export interface KOL {
  id: number;
  name: string; // 真實姓名或藝名
  nickname: string; // 暱稱
  email: string;
  phone: string;
  address?: string; // 地址
  facebookUrl?: string; // Facebook 個人頁面或 Messenger 連結
  lineUrl?: string; // Line 聯絡連結
  category: string[]; // 內容類別：美妝、3C、美食、旅遊、時尚、生活、遊戲、運動等
  tags: string[]; // 自訂標籤
  rating: KOLRating; // 評級 S/A/B/C/D
  collaborationProcess?: CollaborationProcess; // 合作流程管理
  note: string; // 備註
  socialPlatforms: SocialPlatform[]; // 社群平台資料
  profitShares?: ProfitShareRecord[]; // 分潤記錄
  createdAt: string;
  updatedAt: string;
}

// 合作專案狀態
export type CollaborationStatus = 'pending' | 'negotiating' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

// 合約狀態
export type ContractStatus = 'none' | 'draft' | 'pending_signature' | 'signed' | 'expired';

// 提醒類型
export type ReminderType = 'deadline' | 'payment' | 'content_delivery' | 'follow_up' | 'other';

// 提醒週期類型
export type ReminderRecurringPeriod = 'none' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'yearly';

// 提醒記錄
export interface Reminder {
  id: string;
  collaborationId: number; // 關聯的合作專案 ID
  kolId: number; // 關聯的 KOL ID
  type: ReminderType;
  title: string; // 提醒標題
  description: string; // 提醒描述
  reminderDate: string; // 提醒日期
  recurringPeriod?: ReminderRecurringPeriod; // 提醒週期：無/每月/每季/每半年/每一年
  isCompleted: boolean; // 是否完成
  createdAt: string;
}

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
  contractStatus: ContractStatus; // 合約狀態：無/草稿/待簽署/已簽署/已過期
  collaborationProcess?: CollaborationProcess; // 合作流程管理
  note: string;
  profitShares?: ProfitShareRecord[]; // 該專案的分潤記錄
  reminders?: Reminder[]; // 該專案的提醒記錄
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
