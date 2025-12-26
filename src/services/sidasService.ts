// SIDAS 服務層

import {
  Supplier,
  ContactRecord,
  DashboardStats,
  TrendData,
  TopSupplier,
  AcquisitionPlatformConfig,
  ComplianceReport,
  FieldMapping,
  AIModelConfig,
  UserFeedback,
  AcquisitionTask,
  SupplierFilters,
  BatchOperation,
  ProductCategory,
  SupplierStatus,
  SourcePlatform
} from '../types/sidas';

import {
  mockSuppliers,
  mockContactRecords,
  mockDashboardStats,
  mockTrendData,
  mockPlatformConfigs,
  mockComplianceReport,
  mockFieldMappings,
  mockAIModelConfig,
  mockUserFeedbacks,
  mockAcquisitionTasks,
  getTopPotentialSuppliers
} from '../data/sidasMockData';

// 模擬本地存儲
let suppliers = [...mockSuppliers];
let contactRecords = [...mockContactRecords];
let platformConfigs = [...mockPlatformConfigs];
let fieldMappings = [...mockFieldMappings];
let aiModelConfig = { ...mockAIModelConfig };
let userFeedbacks = [...mockUserFeedbacks];
let acquisitionTasks = [...mockAcquisitionTasks];

// ==================== 儀表板服務 ====================

export const dashboardService = {
  getStats(): DashboardStats {
    // 動態計算統計數據
    const statusDistribution = suppliers.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<SupplierStatus, number>);

    const categoryDistribution = suppliers.reduce((acc, s) => {
      s.productCategories.forEach(cat => {
        acc[cat] = (acc[cat] || 0) + 1;
      });
      return acc;
    }, {} as Record<ProductCategory, number>);

    const countryDistribution = suppliers.reduce((acc, s) => {
      acc[s.country] = (acc[s.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...mockDashboardStats,
      totalSuppliers: suppliers.length,
      statusDistribution: statusDistribution as DashboardStats['statusDistribution'],
      categoryDistribution,
      countryDistribution
    };
  },

  getTrendData(days: number = 30, category?: ProductCategory): TrendData[] {
    let data = mockTrendData.slice(-days);
    if (category) {
      data = data.filter(d => d.category === category);
    }
    return data;
  },

  getTopSuppliers(limit: number = 5): TopSupplier[] {
    return getTopPotentialSuppliers(limit);
  }
};

// ==================== 供應商服務 ====================

export const supplierService = {
  getAll(): Supplier[] {
    return suppliers;
  },

  getById(id: string): Supplier | undefined {
    return suppliers.find(s => s.id === id);
  },

  filter(filters: SupplierFilters): Supplier[] {
    let result = [...suppliers];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s =>
        s.companyName.toLowerCase().includes(searchLower) ||
        s.companyNameLocal?.toLowerCase().includes(searchLower) ||
        s.primaryEmail.toLowerCase().includes(searchLower) ||
        s.keywords.some(k => k.toLowerCase().includes(searchLower))
      );
    }

    if (filters.aiScoreRange) {
      result = result.filter(s =>
        s.aiScore >= filters.aiScoreRange!.min &&
        s.aiScore <= filters.aiScoreRange!.max
      );
    }

    if (filters.statuses && filters.statuses.length > 0) {
      result = result.filter(s => filters.statuses!.includes(s.status));
    }

    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(s =>
        s.productCategories.some(c => filters.categories!.includes(c))
      );
    }

    if (filters.countries && filters.countries.length > 0) {
      result = result.filter(s => filters.countries!.includes(s.country));
    }

    if (filters.platforms && filters.platforms.length > 0) {
      result = result.filter(s => filters.platforms!.includes(s.sourcePlatform));
    }

    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(s =>
        s.tags.some(t => filters.tags!.includes(t))
      );
    }

    if (filters.hasEmail !== undefined) {
      result = result.filter(s => filters.hasEmail ? !!s.primaryEmail : !s.primaryEmail);
    }

    if (filters.hasPhone !== undefined) {
      result = result.filter(s => filters.hasPhone ? !!s.phone : !s.phone);
    }

    if (filters.hasWebsite !== undefined) {
      result = result.filter(s => filters.hasWebsite ? !!s.website : !s.website);
    }

    return result;
  },

  create(supplier: Omit<Supplier, 'id' | 'discoveredAt' | 'lastUpdatedAt'>): Supplier {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      discoveredAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    return newSupplier;
  },

  update(id: string, updates: Partial<Supplier>): Supplier | undefined {
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    suppliers[index] = {
      ...suppliers[index],
      ...updates,
      lastUpdatedAt: new Date().toISOString()
    };
    return suppliers[index];
  },

  delete(id: string): boolean {
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return false;
    suppliers.splice(index, 1);
    return true;
  },

  batchOperation(operation: BatchOperation): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    operation.supplierIds.forEach(id => {
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) {
        failed++;
        return;
      }

      switch (operation.type) {
        case 'tag':
          if (operation.payload?.tags) {
            supplier.tags = [...new Set([...supplier.tags, ...operation.payload.tags])];
            supplier.lastUpdatedAt = new Date().toISOString();
            success++;
          }
          break;
        case 'status':
          if (operation.payload?.status) {
            supplier.status = operation.payload.status;
            supplier.lastUpdatedAt = new Date().toISOString();
            success++;
          }
          break;
        case 'delete':
          const index = suppliers.findIndex(s => s.id === id);
          if (index !== -1) {
            suppliers.splice(index, 1);
            success++;
          }
          break;
        default:
          success++;
      }
    });

    return { success, failed };
  },

  export(supplierIds: string[], format: 'csv' | 'excel' | 'json'): string {
    const exportData = suppliers.filter(s => supplierIds.includes(s.id));

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    // CSV/Excel 格式
    const headers = ['ID', '公司名稱', '國家', 'AI評分', 'Email', '電話', '狀態', '標籤'];
    const rows = exportData.map(s => [
      s.id,
      s.companyName,
      s.country,
      s.aiScore.toString(),
      s.primaryEmail,
      s.phone || '',
      s.status,
      s.tags.join('; ')
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  getUniqueCountries(): string[] {
    return [...new Set(suppliers.map(s => s.country))].sort();
  },

  getUniqueTags(): string[] {
    return [...new Set(suppliers.flatMap(s => s.tags))].sort();
  }
};

// ==================== 聯繫記錄服務 ====================

export const contactRecordService = {
  getBySupplier(supplierId: string): ContactRecord[] {
    return contactRecords
      .filter(r => r.supplierId === supplierId)
      .sort((a, b) => new Date(b.contactedAt).getTime() - new Date(a.contactedAt).getTime());
  },

  create(record: Omit<ContactRecord, 'id'>): ContactRecord {
    const newRecord: ContactRecord = {
      ...record,
      id: `contact-${Date.now()}`
    };
    contactRecords.push(newRecord);

    // 更新供應商的最後聯繫時間
    const supplier = suppliers.find(s => s.id === record.supplierId);
    if (supplier) {
      supplier.lastContactedAt = record.contactedAt;
      supplier.lastUpdatedAt = new Date().toISOString();
    }

    return newRecord;
  },

  update(id: string, updates: Partial<ContactRecord>): ContactRecord | undefined {
    const index = contactRecords.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    contactRecords[index] = {
      ...contactRecords[index],
      ...updates
    };
    return contactRecords[index];
  },

  delete(id: string): boolean {
    const index = contactRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    contactRecords.splice(index, 1);
    return true;
  }
};

// ==================== 採集平台配置服務 ====================

export const platformConfigService = {
  getAll(): AcquisitionPlatformConfig[] {
    return platformConfigs;
  },

  getById(id: string): AcquisitionPlatformConfig | undefined {
    return platformConfigs.find(p => p.id === id);
  },

  update(id: string, updates: Partial<AcquisitionPlatformConfig>): AcquisitionPlatformConfig | undefined {
    const index = platformConfigs.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    platformConfigs[index] = {
      ...platformConfigs[index],
      ...updates
    };
    return platformConfigs[index];
  },

  toggleEnabled(id: string): boolean {
    const config = platformConfigs.find(p => p.id === id);
    if (!config) return false;
    config.isEnabled = !config.isEnabled;
    return config.isEnabled;
  },

  runNow(id: string): AcquisitionTask {
    const config = platformConfigs.find(p => p.id === id);
    if (!config) throw new Error('Platform not found');

    const task: AcquisitionTask = {
      id: `task-${Date.now()}`,
      platform: config.platform,
      status: 'running',
      startedAt: new Date().toISOString(),
      progress: 0,
      stats: {
        pagesScanned: 0,
        suppliersFound: 0,
        newSuppliers: 0,
        duplicates: 0,
        errors: 0
      },
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `開始採集 ${config.platformName}`
        }
      ]
    };

    acquisitionTasks.push(task);
    return task;
  }
};

// ==================== 合規性報告服務 ====================

export const complianceService = {
  getLatestReport(): ComplianceReport {
    return mockComplianceReport;
  },

  generateReport(): ComplianceReport {
    // 模擬生成新報告
    return {
      ...mockComplianceReport,
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString()
    };
  }
};

// ==================== 字段映射服務 ====================

export const fieldMappingService = {
  getByPlatform(platform: SourcePlatform): FieldMapping[] {
    return fieldMappings.filter(m => m.platform === platform);
  },

  create(mapping: Omit<FieldMapping, 'id'>): FieldMapping {
    const newMapping: FieldMapping = {
      ...mapping,
      id: `mapping-${Date.now()}`
    };
    fieldMappings.push(newMapping);
    return newMapping;
  },

  update(id: string, updates: Partial<FieldMapping>): FieldMapping | undefined {
    const index = fieldMappings.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    fieldMappings[index] = {
      ...fieldMappings[index],
      ...updates
    };
    return fieldMappings[index];
  },

  delete(id: string): boolean {
    const index = fieldMappings.findIndex(m => m.id === id);
    if (index === -1) return false;
    fieldMappings.splice(index, 1);
    return true;
  }
};

// ==================== AI 模型服務 ====================

export const aiModelService = {
  getConfig(): AIModelConfig {
    return aiModelConfig;
  },

  updateWeights(weights: Partial<AIModelConfig['featureWeights']>): AIModelConfig {
    aiModelConfig = {
      ...aiModelConfig,
      featureWeights: {
        ...aiModelConfig.featureWeights,
        ...weights
      },
      lastUpdated: new Date().toISOString()
    };
    return aiModelConfig;
  },

  submitFeedback(feedback: Omit<UserFeedback, 'id' | 'submittedAt' | 'isUsedForTraining'>): UserFeedback {
    const newFeedback: UserFeedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      isUsedForTraining: false
    };
    userFeedbacks.push(newFeedback);

    // 更新訓練統計
    aiModelConfig.trainingStats.totalFeedbacks++;
    switch (feedback.outcome) {
      case 'success':
        aiModelConfig.trainingStats.positiveOutcomes++;
        break;
      case 'failure':
        aiModelConfig.trainingStats.negativeOutcomes++;
        break;
      default:
        aiModelConfig.trainingStats.neutralOutcomes++;
    }

    return newFeedback;
  },

  getFeedbacks(): UserFeedback[] {
    return userFeedbacks.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },

  trainModel(): { success: boolean; message: string } {
    // 模擬訓練過程
    const unusedFeedbacks = userFeedbacks.filter(f => !f.isUsedForTraining);

    if (unusedFeedbacks.length < 10) {
      return {
        success: false,
        message: `需要至少 10 條新反饋才能訓練模型，當前只有 ${unusedFeedbacks.length} 條`
      };
    }

    // 標記反饋為已使用
    unusedFeedbacks.forEach(f => {
      f.isUsedForTraining = true;
    });

    // 模擬性能提升
    aiModelConfig.performance = {
      ...aiModelConfig.performance,
      accuracy: Math.min(0.99, aiModelConfig.performance.accuracy + 0.01),
      precision: Math.min(0.99, aiModelConfig.performance.precision + 0.01),
      recall: Math.min(0.99, aiModelConfig.performance.recall + 0.01),
      f1Score: Math.min(0.99, aiModelConfig.performance.f1Score + 0.01),
      lastEvaluatedAt: new Date().toISOString(),
      sampleSize: aiModelConfig.performance.sampleSize + unusedFeedbacks.length
    };

    aiModelConfig.trainingStats.lastTrainedAt = new Date().toISOString();

    return {
      success: true,
      message: `成功使用 ${unusedFeedbacks.length} 條新反饋訓練模型`
    };
  }
};

// ==================== 採集任務服務 ====================

export const acquisitionTaskService = {
  getAll(): AcquisitionTask[] {
    return acquisitionTasks.sort((a, b) => {
      const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return bTime - aTime;
    });
  },

  getById(id: string): AcquisitionTask | undefined {
    return acquisitionTasks.find(t => t.id === id);
  },

  getRunning(): AcquisitionTask[] {
    return acquisitionTasks.filter(t => t.status === 'running');
  },

  pause(id: string): boolean {
    const task = acquisitionTasks.find(t => t.id === id);
    if (!task || task.status !== 'running') return false;
    task.status = 'paused';
    task.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '任務已暫停'
    });
    return true;
  },

  resume(id: string): boolean {
    const task = acquisitionTasks.find(t => t.id === id);
    if (!task || task.status !== 'paused') return false;
    task.status = 'running';
    task.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '任務已恢復'
    });
    return true;
  },

  cancel(id: string): boolean {
    const task = acquisitionTasks.find(t => t.id === id);
    if (!task || (task.status !== 'running' && task.status !== 'paused')) return false;
    task.status = 'error';
    task.completedAt = new Date().toISOString();
    task.logs.push({
      timestamp: new Date().toISOString(),
      level: 'warning',
      message: '任務已取消'
    });
    return true;
  }
};
