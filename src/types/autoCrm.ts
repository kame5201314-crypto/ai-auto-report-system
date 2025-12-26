// 汽車 CRM 系統類型定義

// 客戶來源
export type CustomerSource =
  | 'walk_in'      // 自來客
  | 'referral'     // 轉介紹
  | 'online'       // 網路行銷
  | 'social_media' // 社群媒體
  | 'advertising'  // 廣告
  | 'exhibition'   // 展覽活動
  | 'other';       // 其他

// 客戶狀態
export type CustomerStatus =
  | 'potential'    // 潛在客戶
  | 'contacted'    // 已聯繫
  | 'negotiating'  // 洽談中
  | 'converted'    // 已成交
  | 'lost'         // 流失
  | 'vip';         // VIP客戶

// 客戶等級
export type CustomerLevel = 'platinum' | 'gold' | 'silver' | 'bronze' | 'general';

// 車輛資訊
export interface Vehicle {
  id: string;
  brand: string;           // 品牌
  model: string;           // 車型
  year: number;            // 年份
  plateNumber: string;     // 車牌號碼
  vin?: string;            // 車身號碼
  color: string;           // 顏色
  mileage: number;         // 里程數
  purchaseDate?: string;   // 購車日期
  lastServiceDate?: string; // 最後服務日期
  nextServiceDue?: string;  // 下次保養到期日
}

// 客戶資料
export interface Customer {
  id: string;
  // 基本資料
  name: string;
  phone: string;
  email?: string;
  lineId?: string;
  address?: string;
  birthday?: string;

  // 客戶分類
  source: CustomerSource;
  status: CustomerStatus;
  level: CustomerLevel;
  tags: string[];

  // 車輛資訊
  vehicles: Vehicle[];

  // 統計資料
  totalSpent: number;           // 累計消費
  visitCount: number;           // 來店次數
  lastVisitDate?: string;       // 最後來店日期

  // 偏好與備註
  preferences?: string;         // 偏好
  notes?: string;               // 備註

  // 系統欄位
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  assignedTo?: string;          // 負責業務
}

// 行銷活動類型
export type CampaignType =
  | 'sms'           // 簡訊行銷
  | 'email'         // Email行銷
  | 'line'          // LINE推播
  | 'social_post'   // 社群貼文
  | 'promotion'     // 促銷活動
  | 'event';        // 線下活動

// 行銷活動狀態
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

// 行銷活動
export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;

  // 活動內容
  title: string;
  content: string;
  imageUrl?: string;

  // 目標對象
  targetCustomerLevels?: CustomerLevel[];
  targetTags?: string[];
  targetCount: number;          // 目標人數

  // 時間設定
  scheduledDate?: string;       // 排程日期
  startDate: string;
  endDate: string;

  // 成效追蹤
  sentCount: number;            // 發送數
  openCount: number;            // 開啟數
  clickCount: number;           // 點擊數
  conversionCount: number;      // 轉換數
  revenue: number;              // 帶來營收

  // 預算
  budget: number;
  actualCost: number;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 服務類型
export type ServiceType =
  | 'maintenance'       // 保養
  | 'repair'            // 維修
  | 'detailing'         // 美容
  | 'coating'           // 鍍膜
  | 'ppf'               // 犀牛皮/PPF
  | 'tint'              // 隔熱紙
  | 'wrap'              // 車身貼膜
  | 'accessory'         // 配件安裝
  | 'inspection'        // 檢測
  | 'other';            // 其他

// 施工狀態
export type ServiceStatus =
  | 'pending'           // 待處理
  | 'confirmed'         // 已確認
  | 'in_progress'       // 施工中
  | 'completed'         // 已完成
  | 'cancelled'         // 已取消
  | 'warranty';         // 保固處理

// 付款狀態
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

// 付款方式
export type PaymentMethod = 'cash' | 'credit_card' | 'transfer' | 'line_pay' | 'installment' | 'other';

// 施工項目
export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;           // 折扣百分比
  subtotal: number;
  warranty?: string;          // 保固期限
}

// 施工記錄
export interface ServiceRecord {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleInfo: string;        // 車輛簡述 (品牌 車型 車牌)

  // 服務內容
  serviceType: ServiceType;
  status: ServiceStatus;
  items: ServiceItem[];

  // 時間
  appointmentDate?: string;   // 預約日期
  startDate?: string;         // 開始日期
  completedDate?: string;     // 完成日期
  estimatedHours?: number;    // 預估工時
  actualHours?: number;       // 實際工時

  // 金額
  subtotal: number;           // 小計
  discount: number;           // 折扣金額
  tax: number;                // 稅金
  total: number;              // 總計

  // 付款
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
  paidDate?: string;

  // 其他
  technicianId?: string;      // 技師
  technicianName?: string;
  notes?: string;             // 備註
  beforePhotos?: string[];    // 施工前照片
  afterPhotos?: string[];     // 施工後照片

  // 滿意度
  satisfactionRating?: number; // 1-5
  feedback?: string;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 營收類別
export type RevenueCategory =
  | 'service'         // 服務收入
  | 'parts'           // 零件收入
  | 'product'         // 產品銷售
  | 'other';          // 其他收入

// 營收記錄
export interface RevenueRecord {
  id: string;
  date: string;
  category: RevenueCategory;
  serviceRecordId?: string;
  customerId?: string;
  customerName?: string;
  description: string;
  amount: number;
  cost: number;               // 成本
  profit: number;             // 毛利
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

// 月度營收報表
export interface MonthlyReport {
  year: number;
  month: number;

  // 營收統計
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;        // 毛利率

  // 分類營收
  revenueByCategory: {
    category: RevenueCategory;
    amount: number;
    count: number;
  }[];

  // 服務類型統計
  revenueByServiceType: {
    serviceType: ServiceType;
    amount: number;
    count: number;
  }[];

  // 客戶統計
  newCustomerCount: number;
  returningCustomerCount: number;
  totalCustomerCount: number;

  // 服務統計
  totalServiceCount: number;
  averageServiceValue: number;

  // 行銷統計
  marketingCost: number;
  marketingROI: number;

  // 同比/環比
  revenueGrowthMoM: number;   // 環比增長率
  revenueGrowthYoY: number;   // 同比增長率
}

// 儀表板統計
export interface DashboardStats {
  // 今日統計
  todayRevenue: number;
  todayServiceCount: number;
  todayNewCustomers: number;

  // 本月統計
  monthRevenue: number;
  monthServiceCount: number;
  monthNewCustomers: number;
  monthGrowth: number;

  // 總計
  totalCustomers: number;
  totalVehicles: number;
  activeServices: number;
  pendingPayments: number;

  // 待辦事項
  upcomingAppointments: number;
  overdueServices: number;
  birthdayReminders: number;
  serviceReminders: number;
}

// 提醒類型
export type ReminderType =
  | 'appointment'     // 預約提醒
  | 'service_due'     // 保養到期
  | 'birthday'        // 生日祝福
  | 'follow_up'       // 跟進提醒
  | 'payment'         // 付款提醒
  | 'warranty';       // 保固到期

// 提醒記錄
export interface Reminder {
  id: string;
  type: ReminderType;
  customerId: string;
  customerName: string;
  title: string;
  message: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

// 技師資料
export interface Technician {
  id: string;
  name: string;
  phone: string;
  email?: string;
  specialties: ServiceType[];
  isActive: boolean;
  createdAt: string;
}

// 服務類型標籤對應
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: '保養',
  repair: '維修',
  detailing: '美容',
  coating: '鍍膜',
  ppf: '犀牛皮/PPF',
  tint: '隔熱紙',
  wrap: '車身貼膜',
  accessory: '配件安裝',
  inspection: '檢測',
  other: '其他'
};

// 客戶來源標籤對應
export const CUSTOMER_SOURCE_LABELS: Record<CustomerSource, string> = {
  walk_in: '自來客',
  referral: '轉介紹',
  online: '網路行銷',
  social_media: '社群媒體',
  advertising: '廣告',
  exhibition: '展覽活動',
  other: '其他'
};

// 客戶狀態標籤對應
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  potential: '潛在客戶',
  contacted: '已聯繫',
  negotiating: '洽談中',
  converted: '已成交',
  lost: '流失',
  vip: 'VIP客戶'
};

// 客戶等級標籤對應
export const CUSTOMER_LEVEL_LABELS: Record<CustomerLevel, string> = {
  platinum: '白金會員',
  gold: '金卡會員',
  silver: '銀卡會員',
  bronze: '銅卡會員',
  general: '一般會員'
};

// 行銷活動類型標籤對應
export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  sms: '簡訊行銷',
  email: 'Email行銷',
  line: 'LINE推播',
  social_post: '社群貼文',
  promotion: '促銷活動',
  event: '線下活動'
};

// 付款方式標籤對應
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '現金',
  credit_card: '信用卡',
  transfer: '匯款',
  line_pay: 'LINE Pay',
  installment: '分期付款',
  other: '其他'
};
