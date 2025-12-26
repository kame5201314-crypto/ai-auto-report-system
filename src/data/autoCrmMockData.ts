import {
  Customer,
  Campaign,
  ServiceRecord,
  RevenueRecord,
  Reminder,
  Technician,
  DashboardStats
} from '../types/autoCrm';

// 技師資料
export const mockTechnicians: Technician[] = [
  {
    id: 'tech-1',
    name: '王師傅',
    phone: '0912-345-678',
    email: 'wang@example.com',
    specialties: ['maintenance', 'repair', 'inspection'],
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'tech-2',
    name: '李師傅',
    phone: '0923-456-789',
    email: 'lee@example.com',
    specialties: ['detailing', 'coating', 'ppf'],
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'tech-3',
    name: '陳師傅',
    phone: '0934-567-890',
    email: 'chen@example.com',
    specialties: ['tint', 'wrap', 'accessory'],
    isActive: true,
    createdAt: '2024-02-01'
  }
];

// 客戶資料
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: '張志明',
    phone: '0911-222-333',
    email: 'zhang@example.com',
    lineId: 'zhang_cm',
    address: '台北市信義區信義路五段100號',
    birthday: '1985-03-15',
    source: 'referral',
    status: 'vip',
    level: 'platinum',
    tags: ['保時捷車主', '高消費', '定期保養'],
    vehicles: [
      {
        id: 'veh-1',
        brand: 'Porsche',
        model: '911 Carrera',
        year: 2023,
        plateNumber: 'ABC-1234',
        vin: 'WP0AA2A90PS123456',
        color: '白色',
        mileage: 15000,
        purchaseDate: '2023-01-15',
        lastServiceDate: '2024-10-15',
        nextServiceDue: '2025-01-15'
      }
    ],
    totalSpent: 385000,
    visitCount: 12,
    lastVisitDate: '2024-10-15',
    preferences: '偏好早上10點預約，喜歡原廠零件',
    notes: 'VIP客戶，需要特別照顧',
    createdAt: '2023-01-20',
    updatedAt: '2024-10-15',
    assignedTo: 'sales-1'
  },
  {
    id: 'cust-2',
    name: '林美華',
    phone: '0922-333-444',
    email: 'lin.mh@example.com',
    lineId: 'lin_mh',
    address: '台北市大安區敦化南路二段50號',
    birthday: '1990-07-22',
    source: 'online',
    status: 'converted',
    level: 'gold',
    tags: ['BMW車主', '美容常客'],
    vehicles: [
      {
        id: 'veh-2',
        brand: 'BMW',
        model: 'X5',
        year: 2022,
        plateNumber: 'DEF-5678',
        color: '黑色',
        mileage: 28000,
        purchaseDate: '2022-06-10',
        lastServiceDate: '2024-09-20',
        nextServiceDue: '2024-12-20'
      }
    ],
    totalSpent: 156000,
    visitCount: 8,
    lastVisitDate: '2024-09-20',
    preferences: '喜歡全車鍍膜護理',
    createdAt: '2022-06-15',
    updatedAt: '2024-09-20',
    assignedTo: 'sales-2'
  },
  {
    id: 'cust-3',
    name: '陳大偉',
    phone: '0933-444-555',
    email: 'chen.dw@example.com',
    address: '新北市板橋區文化路一段200號',
    birthday: '1978-11-08',
    source: 'walk_in',
    status: 'converted',
    level: 'silver',
    tags: ['Toyota車主', '家庭用車'],
    vehicles: [
      {
        id: 'veh-3',
        brand: 'Toyota',
        model: 'Camry',
        year: 2021,
        plateNumber: 'GHI-9012',
        color: '銀色',
        mileage: 45000,
        purchaseDate: '2021-03-20',
        lastServiceDate: '2024-08-10',
        nextServiceDue: '2024-11-10'
      },
      {
        id: 'veh-4',
        brand: 'Toyota',
        model: 'RAV4',
        year: 2023,
        plateNumber: 'JKL-3456',
        color: '藍色',
        mileage: 12000,
        purchaseDate: '2023-08-01',
        lastServiceDate: '2024-10-01',
        nextServiceDue: '2025-01-01'
      }
    ],
    totalSpent: 78000,
    visitCount: 6,
    lastVisitDate: '2024-10-01',
    notes: '有兩台車，家庭客戶',
    createdAt: '2021-03-25',
    updatedAt: '2024-10-01',
    assignedTo: 'sales-1'
  },
  {
    id: 'cust-4',
    name: '黃小芳',
    phone: '0944-555-666',
    email: 'huang.xf@example.com',
    lineId: 'huang_xf',
    address: '台北市中山區南京東路三段100號',
    birthday: '1995-05-18',
    source: 'social_media',
    status: 'negotiating',
    level: 'general',
    tags: ['潛力客戶', 'Instagram來源'],
    vehicles: [
      {
        id: 'veh-5',
        brand: 'Mercedes-Benz',
        model: 'A-Class',
        year: 2024,
        plateNumber: 'MNO-7890',
        color: '紅色',
        mileage: 3000,
        purchaseDate: '2024-06-01'
      }
    ],
    totalSpent: 25000,
    visitCount: 2,
    lastVisitDate: '2024-10-20',
    preferences: '對車身貼膜有興趣',
    createdAt: '2024-08-01',
    updatedAt: '2024-10-20',
    assignedTo: 'sales-2'
  },
  {
    id: 'cust-5',
    name: '吳建國',
    phone: '0955-666-777',
    email: 'wu.jg@example.com',
    address: '台北市松山區南京東路五段250號',
    birthday: '1982-09-30',
    source: 'advertising',
    status: 'potential',
    level: 'general',
    tags: ['廣告來源', '待跟進'],
    vehicles: [
      {
        id: 'veh-6',
        brand: 'Lexus',
        model: 'ES300h',
        year: 2022,
        plateNumber: 'PQR-1234',
        color: '灰色',
        mileage: 35000,
        purchaseDate: '2022-01-15'
      }
    ],
    totalSpent: 0,
    visitCount: 1,
    lastVisitDate: '2024-11-01',
    notes: '詢問過隔熱紙價格，待回電',
    createdAt: '2024-11-01',
    updatedAt: '2024-11-01',
    assignedTo: 'sales-1'
  }
];

// 行銷活動
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: '雙11鍍膜特惠活動',
    type: 'promotion',
    status: 'active',
    title: '雙11限定！全車鍍膜85折優惠',
    content: '即日起至11/15，全車鍍膜服務享85折優惠！頂級陶瓷鍍膜，3年保固，讓您的愛車煥然一新。立即預約：02-1234-5678',
    targetCustomerLevels: ['platinum', 'gold', 'silver'],
    targetTags: ['美容常客', '定期保養'],
    targetCount: 150,
    scheduledDate: '2024-11-01',
    startDate: '2024-11-01',
    endDate: '2024-11-15',
    sentCount: 145,
    openCount: 98,
    clickCount: 45,
    conversionCount: 12,
    revenue: 180000,
    budget: 10000,
    actualCost: 8500,
    createdAt: '2024-10-25',
    updatedAt: '2024-11-10',
    createdBy: 'admin'
  },
  {
    id: 'camp-2',
    name: '冬季保養提醒',
    type: 'sms',
    status: 'completed',
    title: '愛車冬季保養提醒',
    content: '親愛的車主您好，冬季來臨，別忘了為愛車做好保養準備。現在預約冬季保養套餐，享9折優惠！',
    targetCustomerLevels: ['platinum', 'gold', 'silver', 'bronze'],
    targetCount: 200,
    scheduledDate: '2024-10-15',
    startDate: '2024-10-15',
    endDate: '2024-10-31',
    sentCount: 198,
    openCount: 156,
    clickCount: 67,
    conversionCount: 23,
    revenue: 115000,
    budget: 5000,
    actualCost: 4200,
    createdAt: '2024-10-10',
    updatedAt: '2024-11-01',
    createdBy: 'admin'
  },
  {
    id: 'camp-3',
    name: '會員生日禮',
    type: 'line',
    status: 'active',
    title: '生日快樂！專屬優惠送給您',
    content: '親愛的會員，祝您生日快樂！特別送上專屬優惠券：洗車美容免費乙次 + 下次消費88折！',
    targetCustomerLevels: ['platinum', 'gold', 'silver', 'bronze', 'general'],
    targetCount: 30,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    sentCount: 156,
    openCount: 142,
    clickCount: 89,
    conversionCount: 45,
    revenue: 225000,
    budget: 15000,
    actualCost: 12000,
    createdAt: '2024-01-01',
    updatedAt: '2024-11-15',
    createdBy: 'admin'
  },
  {
    id: 'camp-4',
    name: '新客戶推薦獎勵計畫',
    type: 'promotion',
    status: 'active',
    title: '推薦好友，雙方同享優惠',
    content: '推薦新客戶成功消費，推薦人獲得500元消費金，新客戶首次消費享9折優惠！',
    targetCustomerLevels: ['platinum', 'gold'],
    targetTags: ['高消費', 'VIP客戶'],
    targetCount: 50,
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    sentCount: 48,
    openCount: 45,
    clickCount: 28,
    conversionCount: 15,
    revenue: 450000,
    budget: 30000,
    actualCost: 22500,
    createdAt: '2024-05-25',
    updatedAt: '2024-11-15',
    createdBy: 'admin'
  }
];

// 施工記錄
export const mockServiceRecords: ServiceRecord[] = [
  {
    id: 'srv-1',
    customerId: 'cust-1',
    customerName: '張志明',
    vehicleId: 'veh-1',
    vehicleInfo: 'Porsche 911 Carrera (ABC-1234)',
    serviceType: 'coating',
    status: 'completed',
    items: [
      {
        id: 'item-1',
        name: '頂級陶瓷鍍膜',
        description: '9H硬度，3年保固',
        quantity: 1,
        unitPrice: 35000,
        discount: 0,
        subtotal: 35000,
        warranty: '3年'
      },
      {
        id: 'item-2',
        name: '漆面拋光',
        description: '深層拋光處理',
        quantity: 1,
        unitPrice: 8000,
        discount: 0,
        subtotal: 8000
      }
    ],
    appointmentDate: '2024-10-14',
    startDate: '2024-10-15',
    completedDate: '2024-10-15',
    estimatedHours: 6,
    actualHours: 5.5,
    subtotal: 43000,
    discount: 3000,
    tax: 0,
    total: 40000,
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    paidAmount: 40000,
    paidDate: '2024-10-15',
    technicianId: 'tech-2',
    technicianName: '李師傅',
    notes: 'VIP客戶，特別折扣',
    satisfactionRating: 5,
    feedback: '服務非常專業，效果很滿意！',
    createdAt: '2024-10-14',
    updatedAt: '2024-10-15',
    createdBy: 'admin'
  },
  {
    id: 'srv-2',
    customerId: 'cust-2',
    customerName: '林美華',
    vehicleId: 'veh-2',
    vehicleInfo: 'BMW X5 (DEF-5678)',
    serviceType: 'detailing',
    status: 'completed',
    items: [
      {
        id: 'item-3',
        name: '精緻美容洗車',
        description: '內外清潔 + 打蠟',
        quantity: 1,
        unitPrice: 2500,
        discount: 0,
        subtotal: 2500
      },
      {
        id: 'item-4',
        name: '內裝深層清潔',
        description: '皮椅保養 + 消毒',
        quantity: 1,
        unitPrice: 3500,
        discount: 0,
        subtotal: 3500
      }
    ],
    appointmentDate: '2024-09-19',
    startDate: '2024-09-20',
    completedDate: '2024-09-20',
    estimatedHours: 3,
    actualHours: 3,
    subtotal: 6000,
    discount: 0,
    tax: 0,
    total: 6000,
    paymentStatus: 'paid',
    paymentMethod: 'line_pay',
    paidAmount: 6000,
    paidDate: '2024-09-20',
    technicianId: 'tech-2',
    technicianName: '李師傅',
    satisfactionRating: 5,
    createdAt: '2024-09-18',
    updatedAt: '2024-09-20',
    createdBy: 'admin'
  },
  {
    id: 'srv-3',
    customerId: 'cust-3',
    customerName: '陳大偉',
    vehicleId: 'veh-3',
    vehicleInfo: 'Toyota Camry (GHI-9012)',
    serviceType: 'maintenance',
    status: 'completed',
    items: [
      {
        id: 'item-5',
        name: '定期保養套餐',
        description: '機油 + 機油芯 + 空氣芯 + 檢測',
        quantity: 1,
        unitPrice: 4500,
        discount: 10,
        subtotal: 4050
      },
      {
        id: 'item-6',
        name: '煞車油更換',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        subtotal: 1500
      }
    ],
    appointmentDate: '2024-08-09',
    startDate: '2024-08-10',
    completedDate: '2024-08-10',
    estimatedHours: 2,
    actualHours: 2,
    subtotal: 5550,
    discount: 0,
    tax: 0,
    total: 5550,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    paidAmount: 5550,
    paidDate: '2024-08-10',
    technicianId: 'tech-1',
    technicianName: '王師傅',
    satisfactionRating: 4,
    createdAt: '2024-08-08',
    updatedAt: '2024-08-10',
    createdBy: 'admin'
  },
  {
    id: 'srv-4',
    customerId: 'cust-4',
    customerName: '黃小芳',
    vehicleId: 'veh-5',
    vehicleInfo: 'Mercedes-Benz A-Class (MNO-7890)',
    serviceType: 'tint',
    status: 'in_progress',
    items: [
      {
        id: 'item-7',
        name: '前擋隔熱紙',
        description: 'V-KOOL 70 前擋',
        quantity: 1,
        unitPrice: 12000,
        discount: 0,
        subtotal: 12000,
        warranty: '5年'
      },
      {
        id: 'item-8',
        name: '車身隔熱紙',
        description: 'V-KOOL 40 車身',
        quantity: 1,
        unitPrice: 8000,
        discount: 0,
        subtotal: 8000,
        warranty: '5年'
      }
    ],
    appointmentDate: '2024-11-25',
    startDate: '2024-11-26',
    estimatedHours: 4,
    subtotal: 20000,
    discount: 2000,
    tax: 0,
    total: 18000,
    paymentStatus: 'partial',
    paymentMethod: 'credit_card',
    paidAmount: 9000,
    paidDate: '2024-11-25',
    technicianId: 'tech-3',
    technicianName: '陳師傅',
    notes: '客戶要求下午完成',
    createdAt: '2024-11-24',
    updatedAt: '2024-11-26',
    createdBy: 'admin'
  },
  {
    id: 'srv-5',
    customerId: 'cust-1',
    customerName: '張志明',
    vehicleId: 'veh-1',
    vehicleInfo: 'Porsche 911 Carrera (ABC-1234)',
    serviceType: 'ppf',
    status: 'pending',
    items: [
      {
        id: 'item-9',
        name: 'PPF車頭全包',
        description: 'XPEL Ultimate Plus',
        quantity: 1,
        unitPrice: 85000,
        discount: 0,
        subtotal: 85000,
        warranty: '10年'
      }
    ],
    appointmentDate: '2024-12-01',
    estimatedHours: 8,
    subtotal: 85000,
    discount: 5000,
    tax: 0,
    total: 80000,
    paymentStatus: 'unpaid',
    paidAmount: 0,
    technicianId: 'tech-2',
    technicianName: '李師傅',
    notes: 'VIP客戶預約，需準備特別材料',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-20',
    createdBy: 'admin'
  }
];

// 營收記錄
export const mockRevenueRecords: RevenueRecord[] = [
  {
    id: 'rev-1',
    date: '2024-11-01',
    category: 'service',
    serviceRecordId: 'srv-1',
    customerId: 'cust-1',
    customerName: '張志明',
    description: '頂級陶瓷鍍膜 + 漆面拋光',
    amount: 40000,
    cost: 12000,
    profit: 28000,
    paymentMethod: 'credit_card',
    createdAt: '2024-11-01'
  },
  {
    id: 'rev-2',
    date: '2024-11-02',
    category: 'service',
    serviceRecordId: 'srv-2',
    customerId: 'cust-2',
    customerName: '林美華',
    description: '精緻美容洗車 + 內裝深層清潔',
    amount: 6000,
    cost: 1500,
    profit: 4500,
    paymentMethod: 'line_pay',
    createdAt: '2024-11-02'
  },
  {
    id: 'rev-3',
    date: '2024-11-05',
    category: 'service',
    customerId: 'cust-3',
    customerName: '陳大偉',
    description: '定期保養套餐',
    amount: 5550,
    cost: 2200,
    profit: 3350,
    paymentMethod: 'cash',
    createdAt: '2024-11-05'
  },
  {
    id: 'rev-4',
    date: '2024-11-08',
    category: 'product',
    description: '汽車清潔用品銷售',
    amount: 3500,
    cost: 1800,
    profit: 1700,
    paymentMethod: 'cash',
    createdAt: '2024-11-08'
  },
  {
    id: 'rev-5',
    date: '2024-11-10',
    category: 'service',
    customerId: 'cust-2',
    customerName: '林美華',
    description: '快速洗車',
    amount: 500,
    cost: 150,
    profit: 350,
    paymentMethod: 'cash',
    createdAt: '2024-11-10'
  },
  {
    id: 'rev-6',
    date: '2024-11-12',
    category: 'service',
    description: '隔熱紙安裝 - 新客戶',
    amount: 15000,
    cost: 6000,
    profit: 9000,
    paymentMethod: 'credit_card',
    createdAt: '2024-11-12'
  },
  {
    id: 'rev-7',
    date: '2024-11-15',
    category: 'parts',
    description: '雨刷 + 空氣芯銷售',
    amount: 2800,
    cost: 1400,
    profit: 1400,
    paymentMethod: 'cash',
    createdAt: '2024-11-15'
  },
  {
    id: 'rev-8',
    date: '2024-11-18',
    category: 'service',
    customerId: 'cust-1',
    customerName: '張志明',
    description: '車身PPF局部修補',
    amount: 8000,
    cost: 3000,
    profit: 5000,
    paymentMethod: 'credit_card',
    createdAt: '2024-11-18'
  },
  {
    id: 'rev-9',
    date: '2024-11-20',
    category: 'service',
    description: '全車美容 - Walk-in客戶',
    amount: 4500,
    cost: 1200,
    profit: 3300,
    paymentMethod: 'line_pay',
    createdAt: '2024-11-20'
  },
  {
    id: 'rev-10',
    date: '2024-11-22',
    category: 'service',
    customerId: 'cust-3',
    customerName: '陳大偉',
    description: 'RAV4 輪胎更換',
    amount: 18000,
    cost: 12000,
    profit: 6000,
    paymentMethod: 'installment',
    createdAt: '2024-11-22'
  }
];

// 提醒記錄
export const mockReminders: Reminder[] = [
  {
    id: 'rem-1',
    type: 'service_due',
    customerId: 'cust-2',
    customerName: '林美華',
    title: '保養到期提醒',
    message: 'BMW X5 保養即將到期（12/20），建議盡快預約。',
    dueDate: '2024-12-15',
    isCompleted: false,
    createdAt: '2024-11-15'
  },
  {
    id: 'rem-2',
    type: 'birthday',
    customerId: 'cust-3',
    customerName: '陳大偉',
    title: '客戶生日提醒',
    message: '陳大偉先生生日即將到來（11/08），記得發送祝福。',
    dueDate: '2024-11-06',
    isCompleted: true,
    completedAt: '2024-11-06',
    createdAt: '2024-11-01'
  },
  {
    id: 'rem-3',
    type: 'follow_up',
    customerId: 'cust-5',
    customerName: '吳建國',
    title: '客戶跟進提醒',
    message: '吳建國先生詢問過隔熱紙價格，請致電跟進。',
    dueDate: '2024-11-05',
    isCompleted: false,
    createdAt: '2024-11-01'
  },
  {
    id: 'rem-4',
    type: 'appointment',
    customerId: 'cust-1',
    customerName: '張志明',
    title: '預約提醒',
    message: '張志明先生預約12/01進行PPF施工。',
    dueDate: '2024-11-30',
    isCompleted: false,
    createdAt: '2024-11-20'
  },
  {
    id: 'rem-5',
    type: 'payment',
    customerId: 'cust-4',
    customerName: '黃小芳',
    title: '尾款提醒',
    message: '黃小芳隔熱紙施工尾款 NT$9,000 待收取。',
    dueDate: '2024-11-26',
    isCompleted: false,
    createdAt: '2024-11-25'
  }
];

// 儀表板統計數據
export const mockDashboardStats: DashboardStats = {
  todayRevenue: 22500,
  todayServiceCount: 3,
  todayNewCustomers: 1,
  monthRevenue: 103850,
  monthServiceCount: 28,
  monthNewCustomers: 8,
  monthGrowth: 12.5,
  totalCustomers: 156,
  totalVehicles: 203,
  activeServices: 5,
  pendingPayments: 2,
  upcomingAppointments: 8,
  overdueServices: 1,
  birthdayReminders: 3,
  serviceReminders: 12
};
