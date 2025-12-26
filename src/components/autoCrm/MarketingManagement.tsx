import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Search, Filter, Calendar, Users,
  TrendingUp, DollarSign, Eye, Edit, Trash2, Send,
  Mail, MessageSquare, Share2, ChevronDown, BarChart3
} from 'lucide-react';
import {
  Campaign,
  CampaignType,
  CampaignStatus,
  CAMPAIGN_TYPE_LABELS,
  CustomerLevel,
  CUSTOMER_LEVEL_LABELS
} from '../../types/autoCrm';
import { campaignService, customerService } from '../../services/autoCrmService';

const MarketingManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const data = campaignService.getAll();
    setCampaigns(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此活動嗎？')) {
      campaignService.delete(id);
      loadCampaigns();
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
    if (typeFilter !== 'all' && campaign.type !== typeFilter) return false;
    return true;
  });

  const getStatusColor = (status: CampaignStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  const getStatusLabel = (status: CampaignStatus) => {
    const labels = {
      draft: '草稿',
      scheduled: '已排程',
      active: '進行中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return labels[status];
  };

  const getTypeIcon = (type: CampaignType) => {
    const icons = {
      sms: MessageSquare,
      email: Mail,
      line: MessageSquare,
      social_post: Share2,
      promotion: Megaphone,
      event: Calendar
    };
    return icons[type];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW');
  };

  // 計算統計數據
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    totalCost: campaigns.reduce((sum, c) => sum + c.actualCost, 0),
    avgConversionRate: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + (c.sentCount > 0 ? c.conversionCount / c.sentCount : 0), 0) / campaigns.length * 100
      : 0
  };

  return (
    <div className="space-y-6">
      {/* 標題和操作列 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-800">行銷管理</h2>
        </div>
        <button
          onClick={() => { setEditingCampaign(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增活動
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">總活動數</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Megaphone className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">進行中</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">帶來營收</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">行銷成本</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalCost)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-gray-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均轉換率</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgConversionRate.toFixed(1)}%</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">活動狀態</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">全部狀態</option>
              <option value="draft">草稿</option>
              <option value="scheduled">已排程</option>
              <option value="active">進行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">活動類型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CampaignType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">全部類型</option>
              {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 活動列表 */}
      <div className="space-y-4">
        {filteredCampaigns.map(campaign => {
          const TypeIcon = getTypeIcon(campaign.type);
          const openRate = campaign.sentCount > 0 ? (campaign.openCount / campaign.sentCount * 100).toFixed(1) : 0;
          const clickRate = campaign.openCount > 0 ? (campaign.clickCount / campaign.openCount * 100).toFixed(1) : 0;
          const conversionRate = campaign.sentCount > 0 ? (campaign.conversionCount / campaign.sentCount * 100).toFixed(1) : 0;
          const roi = campaign.actualCost > 0 ? ((campaign.revenue - campaign.actualCost) / campaign.actualCost * 100).toFixed(1) : 0;

          return (
            <div key={campaign.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      campaign.type === 'sms' ? 'bg-blue-100' :
                      campaign.type === 'email' ? 'bg-purple-100' :
                      campaign.type === 'line' ? 'bg-green-100' :
                      campaign.type === 'social_post' ? 'bg-pink-100' :
                      campaign.type === 'promotion' ? 'bg-orange-100' :
                      'bg-yellow-100'
                    }`}>
                      <TypeIcon className={`w-6 h-6 ${
                        campaign.type === 'sms' ? 'text-blue-600' :
                        campaign.type === 'email' ? 'text-purple-600' :
                        campaign.type === 'line' ? 'text-green-600' :
                        campaign.type === 'social_post' ? 'text-pink-600' :
                        campaign.type === 'promotion' ? 'text-orange-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{CAMPAIGN_TYPE_LABELS[campaign.type]}</p>
                      <p className="text-sm text-gray-600 mt-2">{campaign.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingCampaign(campaign); setShowForm(true); }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="編輯"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 活動時間 */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(campaign.startDate)} ~ {formatDate(campaign.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    目標 {campaign.targetCount} 人
                  </span>
                </div>

                {/* 成效數據 */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">發送數</p>
                    <p className="text-lg font-semibold text-gray-800">{campaign.sentCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">開啟率</p>
                    <p className="text-lg font-semibold text-blue-600">{openRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">點擊率</p>
                    <p className="text-lg font-semibold text-purple-600">{clickRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">轉換數</p>
                    <p className="text-lg font-semibold text-green-600">{campaign.conversionCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">帶來營收</p>
                    <p className="text-lg font-semibold text-orange-600">{formatCurrency(campaign.revenue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">ROI</p>
                    <p className={`text-lg font-semibold ${Number(roi) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {roi}%
                    </p>
                  </div>
                </div>

                {/* 預算資訊 */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">
                      預算: {formatCurrency(campaign.budget)}
                    </span>
                    <span className="text-gray-500">
                      實際花費: {formatCurrency(campaign.actualCost)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min((campaign.actualCost / campaign.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-600">
                      {((campaign.actualCost / campaign.budget) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCampaigns.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">尚無行銷活動</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              建立第一個活動
            </button>
          </div>
        )}
      </div>

      {/* 新增/編輯活動表單 */}
      {showForm && (
        <CampaignForm
          campaign={editingCampaign}
          onSave={() => { setShowForm(false); loadCampaigns(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

// 活動表單元件
interface CampaignFormProps {
  campaign?: Campaign | null;
  onSave: () => void;
  onCancel: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    type: 'promotion',
    status: 'draft',
    title: '',
    content: '',
    targetCustomerLevels: [],
    targetTags: [],
    targetCount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    sentCount: 0,
    openCount: 0,
    clickCount: 0,
    conversionCount: 0,
    revenue: 0,
    budget: 0,
    actualCost: 0
  });

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (campaign) {
      campaignService.update(campaign.id, formData);
    } else {
      campaignService.create(formData as Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onSave();
  };

  const handleLevelToggle = (level: CustomerLevel) => {
    setFormData(prev => {
      const levels = prev.targetCustomerLevels || [];
      if (levels.includes(level)) {
        return { ...prev, targetCustomerLevels: levels.filter(l => l !== level) };
      } else {
        return { ...prev, targetCustomerLevels: [...levels, level] };
      }
    });
  };

  // 計算目標人數
  useEffect(() => {
    const customers = customerService.getAll();
    const targetLevels = formData.targetCustomerLevels || [];
    const filtered = targetLevels.length > 0
      ? customers.filter(c => targetLevels.includes(c.level))
      : customers;
    setFormData(prev => ({ ...prev, targetCount: filtered.length }));
  }, [formData.targetCustomerLevels]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-orange-50">
          <h2 className="text-xl font-bold text-gray-800">
            {campaign ? '編輯行銷活動' : '新增行銷活動'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-orange-100 rounded-lg">
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)] p-6 space-y-6">
          {/* 基本資訊 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">活動名稱</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="例：雙11鍍膜特惠活動"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">活動類型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CampaignType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">狀態</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CampaignStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="draft">草稿</option>
                <option value="scheduled">已排程</option>
                <option value="active">進行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>

          {/* 活動內容 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">活動標題</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="顯示給客戶的標題"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">活動內容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="活動詳細內容..."
            />
          </div>

          {/* 目標對象 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">目標會員等級</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CUSTOMER_LEVEL_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleLevelToggle(value as CustomerLevel)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.targetCustomerLevels?.includes(value as CustomerLevel)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              目標人數: <span className="font-semibold text-orange-600">{formData.targetCount}</span> 人
            </p>
          </div>

          {/* 時間設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">開始日期</label>
              <input
                type="date"
                value={formData.startDate?.split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">結束日期</label>
              <input
                type="date"
                value={formData.endDate?.split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* 預算 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">預算</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">實際花費</label>
              <input
                type="number"
                value={formData.actualCost}
                onChange={(e) => setFormData(prev => ({ ...prev, actualCost: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* 成效數據 (編輯時) */}
          {campaign && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">發送數</label>
                <input
                  type="number"
                  value={formData.sentCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, sentCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">轉換數</label>
                <input
                  type="number"
                  value={formData.conversionCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, conversionCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">帶來營收</label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, revenue: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketingManagement;
