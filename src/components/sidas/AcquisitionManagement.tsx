import React, { useState, useEffect } from 'react';
import {
  Database, Play, Pause, Power, Settings, Clock, CheckCircle,
  AlertTriangle, XCircle, Calendar, ChevronDown, ChevronUp,
  RefreshCw, FileText, ArrowRight, Globe, Shield, AlertOctagon,
  Zap, Eye, Edit, Save, X, Plus, Trash2
} from 'lucide-react';
import {
  AcquisitionPlatformConfig,
  AcquisitionTask,
  ComplianceReport,
  FieldMapping,
  SourcePlatform
} from '../../types/sidas';
import {
  platformConfigService,
  acquisitionTaskService,
  complianceService,
  fieldMappingService
} from '../../services/sidasService';

type TabType = 'platforms' | 'tasks' | 'compliance' | 'mapping';

const AcquisitionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('platforms');
  const [platformConfigs, setPlatformConfigs] = useState<AcquisitionPlatformConfig[]>([]);
  const [tasks, setTasks] = useState<AcquisitionTask[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedMappingPlatform, setSelectedMappingPlatform] = useState<SourcePlatform>('alibaba');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFieldMappings(fieldMappingService.getByPlatform(selectedMappingPlatform));
  }, [selectedMappingPlatform]);

  const loadData = () => {
    setPlatformConfigs(platformConfigService.getAll());
    setTasks(acquisitionTaskService.getAll());
    setComplianceReport(complianceService.getLatestReport());
  };

  const handleTogglePlatform = (id: string) => {
    platformConfigService.toggleEnabled(id);
    loadData();
  };

  const handleRunNow = (id: string) => {
    platformConfigService.runNow(id);
    loadData();
  };

  const handlePauseTask = (id: string) => {
    acquisitionTaskService.pause(id);
    loadData();
  };

  const handleResumeTask = (id: string) => {
    acquisitionTaskService.resume(id);
    loadData();
  };

  const handleCancelTask = (id: string) => {
    acquisitionTaskService.cancel(id);
    loadData();
  };

  const getStatusIcon = (status: AcquisitionPlatformConfig['lastRunStatus']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: AcquisitionPlatformConfig['lastRunStatus']) => {
    switch (status) {
      case 'success': return '成功';
      case 'partial': return '部分成功';
      case 'failed': return '失敗';
      default: return '從未執行';
    }
  };

  const getTaskStatusBadge = (status: AcquisitionTask['status']) => {
    const styles = {
      idle: 'bg-gray-100 text-gray-700',
      running: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700'
    };
    const labels = {
      idle: '閒置',
      running: '執行中',
      paused: '已暫停',
      completed: '已完成',
      error: '錯誤'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyLabel = (freq: AcquisitionPlatformConfig['frequency']) => {
    switch (freq) {
      case 'daily': return '每日';
      case 'weekly': return '每週';
      case 'biweekly': return '每兩週';
      case 'monthly': return '每月';
    }
  };

  const getDepthLabel = (depth: AcquisitionPlatformConfig['depth']) => {
    switch (depth) {
      case 'shallow': return '淺層';
      case 'medium': return '中等';
      case 'deep': return '深層';
    }
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">數據採集管理</h1>
          <p className="text-gray-500 mt-1">配置、監控和調整數據採集任務</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* 標籤頁 */}
      <div className="flex border-b">
        {[
          { id: 'platforms', label: '目標平台配置', icon: Globe },
          { id: 'tasks', label: '採集任務', icon: Zap },
          { id: 'compliance', label: '合規性報告', icon: Shield },
          { id: 'mapping', label: '字段映射工具', icon: ArrowRight }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 目標平台配置 */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          {platformConfigs.map(config => (
            <div
              key={config.id}
              className={`bg-white rounded-xl shadow overflow-hidden border-l-4 ${
                config.isEnabled ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              {/* 平台卡片標題 */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${config.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Database className={`w-6 h-6 ${config.isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{config.platformName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getFrequencyLabel(config.frequency)}
                        </span>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(config.lastRunStatus)}
                          {getStatusLabel(config.lastRunStatus)}
                        </span>
                        {config.lastRunTime && (
                          <span>上次執行: {formatDate(config.lastRunTime)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePlatform(config.id)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        config.isEnabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {config.isEnabled ? '停用' : '啟用'}
                    </button>
                    {config.isEnabled && (
                      <button
                        onClick={() => handleRunNow(config.id)}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        立即執行
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedPlatform(expandedPlatform === config.id ? null : config.id)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      {expandedPlatform === config.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 展開的詳細配置 */}
              {expandedPlatform === config.id && (
                <div className="border-t bg-gray-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 採集設定 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">採集設定</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">採集頻率</label>
                          <select className="w-full px-3 py-2 border rounded-lg bg-white">
                            <option value="daily">每日</option>
                            <option value="weekly" selected={config.frequency === 'weekly'}>每週</option>
                            <option value="biweekly" selected={config.frequency === 'biweekly'}>每兩週</option>
                            <option value="monthly" selected={config.frequency === 'monthly'}>每月</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">採集深度</label>
                          <select className="w-full px-3 py-2 border rounded-lg bg-white">
                            <option value="shallow" selected={config.depth === 'shallow'}>淺層 (快速)</option>
                            <option value="medium" selected={config.depth === 'medium'}>中等 (平衡)</option>
                            <option value="deep" selected={config.depth === 'deep'}>深層 (完整)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">最大頁數</label>
                          <input
                            type="number"
                            defaultValue={config.maxPages}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 目標關鍵詞 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">目標關鍵詞</h4>
                      <div className="space-y-2">
                        {config.targetKeywords.map((kw, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={kw}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            />
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700">
                          <Plus className="w-4 h-4" />
                          新增關鍵詞
                        </button>
                      </div>
                    </div>

                    {/* 進階設定 */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">進階設定</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={config.settings.respectRobotsTxt}
                            className="rounded text-cyan-600"
                          />
                          <span className="text-sm text-gray-700">遵守 robots.txt</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={config.settings.useProxy}
                            className="rounded text-cyan-600"
                          />
                          <span className="text-sm text-gray-700">使用代理 IP</span>
                        </label>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">請求延遲 (ms)</label>
                          <input
                            type="number"
                            defaultValue={config.settings.requestDelay}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">最大重試次數</label>
                          <input
                            type="number"
                            defaultValue={config.settings.maxRetries}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center gap-2 hover:bg-cyan-700">
                      <Save className="w-4 h-4" />
                      儲存設定
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 採集任務 */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* 執行中的任務 */}
          {tasks.filter(t => t.status === 'running' || t.status === 'paused').length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-600" />
                進行中的任務
              </h3>
              <div className="space-y-4">
                {tasks.filter(t => t.status === 'running' || t.status === 'paused').map(task => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{task.platform}</span>
                        {getTaskStatusBadge(task.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === 'running' ? (
                          <button
                            onClick={() => handlePauseTask(task.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="暫停"
                          >
                            <Pause className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResumeTask(task.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="繼續"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="取消"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* 進度條 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>進度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            task.status === 'paused' ? 'bg-yellow-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 統計數據 */}
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">掃描頁數</p>
                        <p className="font-medium">{task.stats.pagesScanned}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">發現供應商</p>
                        <p className="font-medium">{task.stats.suppliersFound}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">新增</p>
                        <p className="font-medium text-green-600">{task.stats.newSuppliers}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">重複</p>
                        <p className="font-medium text-gray-500">{task.stats.duplicates}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">錯誤</p>
                        <p className={`font-medium ${task.stats.errors > 0 ? 'text-red-600' : ''}`}>
                          {task.stats.errors}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 歷史任務 */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                歷史任務記錄
              </h3>
            </div>
            <div className="divide-y">
              {tasks.filter(t => t.status !== 'running' && t.status !== 'paused').map(task => (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-800">{task.platform}</span>
                        <p className="text-sm text-gray-500">
                          {task.startedAt && formatDate(task.startedAt)}
                          {task.completedAt && ` - ${formatDate(task.completedAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-800">
                          發現 <span className="font-medium">{task.stats.suppliersFound}</span> 筆
                        </p>
                        <p className="text-green-600">
                          新增 {task.stats.newSuppliers} 筆
                        </p>
                      </div>
                      {getTaskStatusBadge(task.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 合規性報告 */}
      {activeTab === 'compliance' && complianceReport && (
        <div className="space-y-6">
          {/* 總覽 */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-600" />
                  合規性報告
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  報告期間: {formatDate(complianceReport.period.start)} - {formatDate(complianceReport.period.end)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">總體合規分數</p>
                <p className={`text-3xl font-bold ${
                  complianceReport.overallCompliance >= 90 ? 'text-green-600' :
                  complianceReport.overallCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {complianceReport.overallCompliance.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 各平台狀態 */}
            <div className="space-y-4">
              {complianceReport.platforms.map(platform => (
                <div key={platform.platform} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{platform.platform}</span>
                      {platform.robotsTxtCompliance ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          遵守 robots.txt
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-red-600">
                          <XCircle className="w-4 h-4" />
                          違反 robots.txt
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${
                      platform.successRate >= 90 ? 'text-green-600' :
                      platform.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {platform.successRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">被封鎖次數</p>
                      <p className={`font-medium ${platform.blockedCount > 0 ? 'text-red-600' : ''}`}>
                        {platform.blockedCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">速率限制觸發</p>
                      <p className={`font-medium ${platform.rateLimitHits > 10 ? 'text-yellow-600' : ''}`}>
                        {platform.rateLimitHits}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">成功率</p>
                      <p className="font-medium">{platform.successRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {platform.issues.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-800 mb-1">問題:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {platform.issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 建議 */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-cyan-600" />
              改善建議
            </h3>
            <ul className="space-y-3">
              {complianceReport.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 生成新報告 */}
          <div className="flex justify-center">
            <button
              onClick={() => setComplianceReport(complianceService.generateReport())}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              生成新報告
            </button>
          </div>
        </div>
      )}

      {/* 字段映射工具 */}
      {activeTab === 'mapping' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-cyan-600" />
                  字段映射配置
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  將數據來源的原始字段映射到系統標準化字段
                </p>
              </div>
              <select
                value={selectedMappingPlatform}
                onChange={(e) => setSelectedMappingPlatform(e.target.value as SourcePlatform)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="alibaba">Alibaba</option>
                <option value="made_in_china">Made in China</option>
                <option value="global_sources">Global Sources</option>
                <option value="dhgate">DHgate</option>
                <option value="indiamart">IndiaMart</option>
                <option value="ec21">EC21</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">來源字段</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700"></th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">目標字段</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">轉換函數</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">必填</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">預設值</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fieldMappings.map(mapping => (
                    <tr key={mapping.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={mapping.sourceField}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ArrowRight className="w-4 h-4 text-gray-400 mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <select defaultValue={mapping.targetField} className="w-full px-2 py-1 border rounded text-sm">
                          <option value="companyName">公司名稱</option>
                          <option value="primaryEmail">主要 Email</option>
                          <option value="phone">電話</option>
                          <option value="website">網站</option>
                          <option value="country">國家</option>
                          <option value="address">地址</option>
                          <option value="keywords">關鍵詞</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={mapping.transformFunction || ''}
                          placeholder="無"
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={mapping.isRequired}
                          className="rounded text-cyan-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={mapping.defaultValue || ''}
                          placeholder="無"
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4" />
                新增映射規則
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                <Save className="w-4 h-4" />
                儲存所有變更
              </button>
            </div>
          </div>

          {/* 說明 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-800 mb-3">使用說明</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                <span><strong>來源字段</strong>: 數據來源平台中的原始字段名稱</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                <span><strong>目標字段</strong>: SIDAS 系統中的標準化字段</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                <span><strong>轉換函數</strong>: 可選的數據轉換函數，如 extractCountry, splitByComma 等</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                <span><strong>預設值</strong>: 當來源數據為空時使用的預設值</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcquisitionManagement;
