import {
  Customer,
  Campaign,
  ServiceRecord,
  RevenueRecord,
  MonthlyReport,
  DashboardStats,
  Reminder,
  Technician,
  RevenueCategory,
  ServiceType
} from '../types/autoCrm';
import {
  mockCustomers,
  mockCampaigns,
  mockServiceRecords,
  mockRevenueRecords,
  mockReminders,
  mockTechnicians,
  mockDashboardStats
} from '../data/autoCrmMockData';

// 本地儲存 key
const STORAGE_KEYS = {
  CUSTOMERS: 'autoCrm_customers',
  CAMPAIGNS: 'autoCrm_campaigns',
  SERVICE_RECORDS: 'autoCrm_serviceRecords',
  REVENUE_RECORDS: 'autoCrm_revenueRecords',
  REMINDERS: 'autoCrm_reminders',
  TECHNICIANS: 'autoCrm_technicians'
};

// 初始化本地儲存
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(mockCustomers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(mockCampaigns));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(mockServiceRecords));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVENUE_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.REVENUE_RECORDS, JSON.stringify(mockRevenueRecords));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(mockReminders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(mockTechnicians));
  }
}

// 確保已初始化
initializeStorage();

// 通用讀取函數
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// 通用儲存函數
function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// 生成 UUID
function generateId(): string {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ==================== 客戶服務 ====================

export const customerService = {
  getAll: (): Customer[] => {
    return getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
  },

  getById: (id: string): Customer | undefined => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.find(c => c.id === id);
  },

  create: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },

  update: (id: string, data: Partial<Customer>): Customer | null => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    customers[index] = {
      ...customers[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[index];
  },

  delete: (id: string): boolean => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const filtered = customers.filter(c => c.id !== id);
    if (filtered.length === customers.length) return false;
    saveToStorage(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  },

  search: (query: string): Customer[] => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const lowerQuery = query.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.vehicles.some(v =>
        v.plateNumber.toLowerCase().includes(lowerQuery) ||
        v.brand.toLowerCase().includes(lowerQuery) ||
        v.model.toLowerCase().includes(lowerQuery)
      )
    );
  },

  getByStatus: (status: Customer['status']): Customer[] => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.filter(c => c.status === status);
  },

  getByLevel: (level: Customer['level']): Customer[] => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.filter(c => c.level === level);
  }
};

// ==================== 行銷活動服務 ====================

export const campaignService = {
  getAll: (): Campaign[] => {
    return getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
  },

  getById: (id: string): Campaign | undefined => {
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    return campaigns.find(c => c.id === id);
  },

  create: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign => {
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    const newCampaign: Campaign = {
      ...campaign,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    campaigns.push(newCampaign);
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    return newCampaign;
  },

  update: (id: string, data: Partial<Campaign>): Campaign | null => {
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) return null;

    campaigns[index] = {
      ...campaigns[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    return campaigns[index];
  },

  delete: (id: string): boolean => {
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    const filtered = campaigns.filter(c => c.id !== id);
    if (filtered.length === campaigns.length) return false;
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, filtered);
    return true;
  },

  getByStatus: (status: Campaign['status']): Campaign[] => {
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    return campaigns.filter(c => c.status === status);
  },

  getActiveCampaigns: (): Campaign[] => {
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    const now = new Date().toISOString();
    return campaigns.filter(c =>
      c.status === 'active' &&
      c.startDate <= now &&
      c.endDate >= now
    );
  }
};

// ==================== 施工記錄服務 ====================

export const serviceRecordService = {
  getAll: (): ServiceRecord[] => {
    return getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
  },

  getById: (id: string): ServiceRecord | undefined => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    return records.find(r => r.id === id);
  },

  create: (record: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>): ServiceRecord => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    const newRecord: ServiceRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, records);
    return newRecord;
  },

  update: (id: string, data: Partial<ServiceRecord>): ServiceRecord | null => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, records);
    return records[index];
  },

  delete: (id: string): boolean => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    saveToStorage(STORAGE_KEYS.SERVICE_RECORDS, filtered);
    return true;
  },

  getByCustomer: (customerId: string): ServiceRecord[] => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    return records.filter(r => r.customerId === customerId);
  },

  getByStatus: (status: ServiceRecord['status']): ServiceRecord[] => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    return records.filter(r => r.status === status);
  },

  getByDateRange: (startDate: string, endDate: string): ServiceRecord[] => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    return records.filter(r =>
      r.createdAt >= startDate && r.createdAt <= endDate
    );
  },

  getTodayServices: (): ServiceRecord[] => {
    const records = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    const today = new Date().toISOString().split('T')[0];
    return records.filter(r =>
      r.appointmentDate === today ||
      r.startDate === today ||
      (r.status === 'in_progress')
    );
  }
};

// ==================== 營收記錄服務 ====================

export const revenueService = {
  getAll: (): RevenueRecord[] => {
    return getFromStorage<RevenueRecord>(STORAGE_KEYS.REVENUE_RECORDS);
  },

  create: (record: Omit<RevenueRecord, 'id' | 'createdAt'>): RevenueRecord => {
    const records = getFromStorage<RevenueRecord>(STORAGE_KEYS.REVENUE_RECORDS);
    const newRecord: RevenueRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    saveToStorage(STORAGE_KEYS.REVENUE_RECORDS, records);
    return newRecord;
  },

  getByDateRange: (startDate: string, endDate: string): RevenueRecord[] => {
    const records = getFromStorage<RevenueRecord>(STORAGE_KEYS.REVENUE_RECORDS);
    return records.filter(r => r.date >= startDate && r.date <= endDate);
  },

  getMonthlyReport: (year: number, month: number): MonthlyReport => {
    const records = getFromStorage<RevenueRecord>(STORAGE_KEYS.REVENUE_RECORDS);
    const services = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const monthRecords = records.filter(r => r.date >= startDate && r.date <= endDate);
    const monthServices = services.filter(s =>
      s.completedDate && s.completedDate >= startDate && s.completedDate <= endDate
    );

    // 計算營收統計
    const totalRevenue = monthRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalCost = monthRecords.reduce((sum, r) => sum + r.cost, 0);
    const grossProfit = totalRevenue - totalCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // 分類營收
    const categoryMap = new Map<RevenueCategory, { amount: number; count: number }>();
    monthRecords.forEach(r => {
      const existing = categoryMap.get(r.category) || { amount: 0, count: 0 };
      categoryMap.set(r.category, {
        amount: existing.amount + r.amount,
        count: existing.count + 1
      });
    });

    const revenueByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    }));

    // 服務類型統計
    const serviceTypeMap = new Map<ServiceType, { amount: number; count: number }>();
    monthServices.forEach(s => {
      const existing = serviceTypeMap.get(s.serviceType) || { amount: 0, count: 0 };
      serviceTypeMap.set(s.serviceType, {
        amount: existing.amount + s.total,
        count: existing.count + 1
      });
    });

    const revenueByServiceType = Array.from(serviceTypeMap.entries()).map(([serviceType, data]) => ({
      serviceType,
      ...data
    }));

    // 客戶統計
    const monthCustomers = customers.filter(c =>
      c.createdAt >= startDate && c.createdAt <= endDate
    );
    const newCustomerCount = monthCustomers.length;

    const returningCustomerIds = new Set(
      monthServices
        .filter(s => {
          const customer = customers.find(c => c.id === s.customerId);
          return customer && customer.createdAt < startDate;
        })
        .map(s => s.customerId)
    );
    const returningCustomerCount = returningCustomerIds.size;

    // 計算上月數據以計算環比
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`;
    const prevMonthRecords = records.filter(r => r.date >= prevStartDate && r.date <= prevEndDate);
    const prevTotalRevenue = prevMonthRecords.reduce((sum, r) => sum + r.amount, 0);
    const revenueGrowthMoM = prevTotalRevenue > 0
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
      : 0;

    // 計算去年同期數據以計算同比
    const lastYearStartDate = `${year - 1}-${String(month).padStart(2, '0')}-01`;
    const lastYearEndDate = `${year - 1}-${String(month).padStart(2, '0')}-31`;
    const lastYearRecords = records.filter(r => r.date >= lastYearStartDate && r.date <= lastYearEndDate);
    const lastYearRevenue = lastYearRecords.reduce((sum, r) => sum + r.amount, 0);
    const revenueGrowthYoY = lastYearRevenue > 0
      ? ((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100
      : 0;

    // 行銷統計
    const campaigns = getFromStorage<Campaign>(STORAGE_KEYS.CAMPAIGNS);
    const monthCampaigns = campaigns.filter(c =>
      c.startDate >= startDate && c.startDate <= endDate
    );
    const marketingCost = monthCampaigns.reduce((sum, c) => sum + c.actualCost, 0);
    const marketingRevenue = monthCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const marketingROI = marketingCost > 0
      ? ((marketingRevenue - marketingCost) / marketingCost) * 100
      : 0;

    return {
      year,
      month,
      totalRevenue,
      totalCost,
      grossProfit,
      grossMargin,
      revenueByCategory,
      revenueByServiceType,
      newCustomerCount,
      returningCustomerCount,
      totalCustomerCount: newCustomerCount + returningCustomerCount,
      totalServiceCount: monthServices.length,
      averageServiceValue: monthServices.length > 0
        ? totalRevenue / monthServices.length
        : 0,
      marketingCost,
      marketingROI,
      revenueGrowthMoM,
      revenueGrowthYoY
    };
  }
};

// ==================== 提醒服務 ====================

export const reminderService = {
  getAll: (): Reminder[] => {
    return getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
  },

  create: (reminder: Omit<Reminder, 'id' | 'createdAt'>): Reminder => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    reminders.push(newReminder);
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
    return newReminder;
  },

  complete: (id: string): boolean => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return false;

    reminders[index].isCompleted = true;
    reminders[index].completedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
    return true;
  },

  delete: (id: string): boolean => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const filtered = reminders.filter(r => r.id !== id);
    if (filtered.length === reminders.length) return false;
    saveToStorage(STORAGE_KEYS.REMINDERS, filtered);
    return true;
  },

  getPending: (): Reminder[] => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    return reminders.filter(r => !r.isCompleted);
  },

  getUpcoming: (days: number = 7): Reminder[] => {
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return reminders.filter(r =>
      !r.isCompleted &&
      new Date(r.dueDate) <= futureDate
    );
  }
};

// ==================== 技師服務 ====================

export const technicianService = {
  getAll: (): Technician[] => {
    return getFromStorage<Technician>(STORAGE_KEYS.TECHNICIANS);
  },

  getActive: (): Technician[] => {
    const technicians = getFromStorage<Technician>(STORAGE_KEYS.TECHNICIANS);
    return technicians.filter(t => t.isActive);
  },

  getById: (id: string): Technician | undefined => {
    const technicians = getFromStorage<Technician>(STORAGE_KEYS.TECHNICIANS);
    return technicians.find(t => t.id === id);
  }
};

// ==================== 儀表板服務 ====================

export const dashboardService = {
  getStats: (): DashboardStats => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const services = getFromStorage<ServiceRecord>(STORAGE_KEYS.SERVICE_RECORDS);
    const revenues = getFromStorage<RevenueRecord>(STORAGE_KEYS.REVENUE_RECORDS);
    const reminders = getFromStorage<Reminder>(STORAGE_KEYS.REMINDERS);

    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    // 今日統計
    const todayRevenues = revenues.filter(r => r.date === today);
    const todayServices = services.filter(s =>
      s.appointmentDate === today || s.startDate === today
    );
    const todayCustomers = customers.filter(c =>
      c.createdAt.startsWith(today)
    );

    // 本月統計
    const monthRevenues = revenues.filter(r => r.date >= monthStart);
    const monthServices = services.filter(s =>
      s.createdAt >= monthStart
    );
    const monthCustomers = customers.filter(c =>
      c.createdAt >= monthStart
    );

    // 計算上月營收以計算成長率
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStart = lastMonth.toISOString().substring(0, 7) + '-01';
    const lastMonthEnd = today.substring(0, 7) + '-01';
    const lastMonthRevenues = revenues.filter(r =>
      r.date >= lastMonthStart && r.date < lastMonthEnd
    );
    const lastMonthTotal = lastMonthRevenues.reduce((sum, r) => sum + r.amount, 0);
    const monthTotal = monthRevenues.reduce((sum, r) => sum + r.amount, 0);
    const monthGrowth = lastMonthTotal > 0
      ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // 待辦統計
    const pendingReminders = reminders.filter(r => !r.isCompleted);
    const upcomingAppointments = services.filter(s =>
      s.status === 'pending' || s.status === 'confirmed'
    ).length;
    const overdueServices = services.filter(s =>
      s.status === 'in_progress' &&
      s.appointmentDate &&
      s.appointmentDate < today
    ).length;

    // 提醒統計
    const birthdayReminders = pendingReminders.filter(r => r.type === 'birthday').length;
    const serviceReminders = pendingReminders.filter(r => r.type === 'service_due').length;

    // 付款統計
    const pendingPayments = services.filter(s =>
      s.paymentStatus === 'unpaid' || s.paymentStatus === 'partial'
    ).length;

    // 車輛統計
    const totalVehicles = customers.reduce((sum, c) => sum + c.vehicles.length, 0);

    return {
      todayRevenue: todayRevenues.reduce((sum, r) => sum + r.amount, 0),
      todayServiceCount: todayServices.length,
      todayNewCustomers: todayCustomers.length,
      monthRevenue: monthTotal,
      monthServiceCount: monthServices.length,
      monthNewCustomers: monthCustomers.length,
      monthGrowth,
      totalCustomers: customers.length,
      totalVehicles,
      activeServices: services.filter(s => s.status === 'in_progress').length,
      pendingPayments,
      upcomingAppointments,
      overdueServices,
      birthdayReminders,
      serviceReminders
    };
  }
};

// 重置所有數據（用於測試）
export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
  localStorage.removeItem(STORAGE_KEYS.SERVICE_RECORDS);
  localStorage.removeItem(STORAGE_KEYS.REVENUE_RECORDS);
  localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  localStorage.removeItem(STORAGE_KEYS.TECHNICIANS);
  initializeStorage();
};
