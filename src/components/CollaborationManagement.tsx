import React, { useState } from 'react';
import { KOL, Collaboration, SalesTracking, ProfitShareRecord, Reminder, ContractStatus, CollaborationProcess } from '../types/kol';
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, TrendingUp, Eye } from 'lucide-react';
import CollaborationDetail from './CollaborationDetail';

interface CollaborationManagementProps {
  kols: KOL[];
  collaborations: Collaboration[];
  salesTracking: SalesTracking[];
  onSaveCollaboration: (collaboration: Partial<Collaboration>) => void;
  onDeleteCollaboration: (id: number) => void;
  onSaveProfitShare: (collaborationId: number, profitShare: Partial<ProfitShareRecord>) => void;
  onDeleteProfitShare: (collaborationId: number, profitShareId: string) => void;
  onSaveReminder: (collaborationId: number, reminder: Partial<Reminder>) => void;
  onDeleteReminder: (collaborationId: number, reminderId: string) => void;
  onToggleReminderComplete: (collaborationId: number, reminderId: string) => void;
  onUpdateContractStatus?: (collaborationId: number, status: ContractStatus) => void;
}

const CollaborationManagement: React.FC<CollaborationManagementProps> = ({
  kols,
  collaborations,
  salesTracking,
  onSaveCollaboration,
  onDeleteCollaboration,
  onSaveProfitShare,
  onDeleteProfitShare,
  onSaveReminder,
  onDeleteReminder,
  onToggleReminderComplete,
  onUpdateContractStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');
  const [showForm, setShowForm] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);
  const [viewingCollab, setViewingCollab] = useState<Collaboration | null>(null);

  const [formData, setFormData] = useState<Partial<Collaboration>>({
    kolId: 0,
    projectName: '',
    productName: '',
    productCode: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    budget: 0,
    actualCost: 0,
    deliverables: [],
    platforms: [],
    contractStatus: 'none',
    note: '',
    profitShares: []
  });

  // 分潤表單資料
  const [profitShareFormData, setProfitShareFormData] = useState({
    period: 'monthly' as any,
    month: new Date().getMonth() + 1, // 當前月份 (1-12)
    periodStart: '',
    periodEnd: '',
    salesAmount: 0,
    profitShareRate: 0,
    bonusAmount: 0,
    note: ''
  });

  const [showProfitShareForm, setShowProfitShareForm] = useState(false);

  // 篩選合作專案
  const filteredCollaborations = collaborations.filter(collab => {
    const kol = kols.find(k => k.id === collab.kolId);
    const matchesSearch =
      collab.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kol?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === '全部' || collab.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAddCollaboration = () => {
    setEditingCollab(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      kolId: kols.length > 0 ? kols[0].id : 0,
      projectName: '',
      productName: '',
      productCode: '',
      status: 'pending',
      startDate: today,
      endDate: '',
      budget: 0,
      actualCost: 0,
      deliverables: [],
      platforms: [],
      contractStatus: 'none',
      note: '',
      profitShares: []
    });
    setProfitShareFormData({
      period: 'monthly',
      month: new Date().getMonth() + 1,
      periodStart: today,
      periodEnd: '',
      salesAmount: 0,
      profitShareRate: 0,
      bonusAmount: 0,
      note: ''
    });
    setShowProfitShareForm(false);
    setShowForm(true);
  };

  const handleEditCollaboration = (collab: Collaboration) => {
    setEditingCollab(collab);
    setFormData(collab);
    setProfitShareFormData({
      period: 'monthly',
      month: new Date().getMonth() + 1,
      periodStart: collab.startDate,
      periodEnd: collab.endDate,
      salesAmount: 0,
      profitShareRate: 0,
      bonusAmount: 0,
      note: ''
    });
    setShowProfitShareForm(false);
    setShowForm(true);
  };

  const handleAddProfitShareToForm = () => {
    // 驗證必填欄位
    if (!profitShareFormData.periodStart || !profitShareFormData.periodEnd) {
      alert('請填寫開始時間和結束日期');
      return;
    }

    const profitAmount = (profitShareFormData.salesAmount * profitShareFormData.profitShareRate) / 100;
    const totalAmount = profitAmount + profitShareFormData.bonusAmount;
    const month = profitShareFormData.periodStart.substring(0, 7);

    const newProfitShare: any = {
      id: `temp-ps-${Date.now()}`,
      settlementDate: profitShareFormData.periodStart, // 使用開始時間作為結算日期
      period: profitShareFormData.period,
      periodStart: profitShareFormData.periodStart,
      periodEnd: profitShareFormData.periodEnd,
      month: month,
      salesAmount: profitShareFormData.salesAmount,
      profitShareRate: profitShareFormData.profitShareRate,
      profitAmount: profitAmount,
      bonusAmount: profitShareFormData.bonusAmount,
      totalAmount: totalAmount,
      note: profitShareFormData.note,
      createdAt: new Date().toISOString()
    };

    setFormData({
      ...formData,
      profitShares: [...(formData.profitShares || []), newProfitShare]
    });

    // 重置表單
    setProfitShareFormData({
      period: 'monthly',
      month: new Date().getMonth() + 1,
      periodStart: formData.startDate || '',
      periodEnd: formData.endDate || '',
      salesAmount: 0,
      profitShareRate: 0,
      bonusAmount: 0,
      note: ''
    });
    setShowProfitShareForm(false);
  };

  const handleRemoveProfitShareFromForm = (id: string) => {
    setFormData({
      ...formData,
      profitShares: formData.profitShares?.filter(ps => ps.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollab) {
      onSaveCollaboration({ ...formData, id: editingCollab.id });
    } else {
      onSaveCollaboration(formData);
    }
    setShowForm(false);
  };

  const getKOLName = (kolId: number) => {
    return kols.find(k => k.id === kolId)?.name || '未知';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'confirmed': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'negotiating': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '待確認',
      'negotiating': '洽談中',
      'confirmed': '已確認',
      'in_progress': '進行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getSalesData = (collabId: number) => {
    return salesTracking.find(s => s.collaborationId === collabId);
  };

  const handleViewCollaboration = (collab: Collaboration) => {
    setViewingCollab(collab);
  };

  // 如果正在查看專案詳情
  if (viewingCollab) {
    const kol = kols.find(k => k.id === viewingCollab.kolId);
    const sales = getSalesData(viewingCollab.id);

    if (!kol) return null;

    return (
      <CollaborationDetail
        collaboration={viewingCollab}
        kol={kol}
        salesTracking={sales}
        onBack={() => setViewingCollab(null)}
        onSaveProfitShare={onSaveProfitShare}
        onDeleteProfitShare={onDeleteProfitShare}
        onSaveReminder={onSaveReminder}
        onDeleteReminder={onDeleteReminder}
        onToggleReminderComplete={onToggleReminderComplete}
        onUpdateContractStatus={onUpdateContractStatus}
      />
    );
  }

  if (showForm) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingCollab ? '編輯合作專案' : '新增合作專案'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">選擇 KOL *</label>
              <select
                required
                value={formData.kolId}
                onChange={(e) => setFormData({ ...formData, kolId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {kols.map(kol => (
                  <option key={kol.id} value={kol.id}>{kol.name} (@{kol.nickname})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">專案名稱 *</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品名稱 *</label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品編號</label>
              <input
                type="text"
                value={formData.productCode || ''}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日期 *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">結束日期 *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">預算 (NT$) *</label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">實際費用 (NT$)</label>
              <input
                type="number"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">狀態 *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">待確認</option>
              <option value="negotiating">洽談中</option>
              <option value="confirmed">已確認</option>
              <option value="in_progress">進行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">合約狀態</label>
            <select
              value={formData.contractStatus}
              onChange={(e) => setFormData({ ...formData, contractStatus: e.target.value as ContractStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">尚未準備</option>
              <option value="draft">草稿</option>
              <option value="pending_signature">待簽署</option>
              <option value="signed">已簽署</option>
              <option value="expired">已過期</option>
            </select>
          </div>

          {/* 合作流程管理 */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">合作流程管理</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1. 洽談情況</label>
                <textarea
                  value={formData.collaborationProcess?.negotiationStatus || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    collaborationProcess: {
                      ...formData.collaborationProcess,
                      negotiationStatus: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入洽談情況..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2. 是否需要寄商品給KOL?</label>
                  <select
                    value={formData.collaborationProcess?.needProduct || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      collaborationProcess: {
                        ...formData.collaborationProcess,
                        needProduct: e.target.value as 'yes' | 'no' | ''
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">請選擇</option>
                    <option value="yes">需要</option>
                    <option value="no">不需要</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">3. 商品是否要收回?</label>
                  <select
                    value={formData.collaborationProcess?.productReturn || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      collaborationProcess: {
                        ...formData.collaborationProcess,
                        productReturn: e.target.value as 'yes' | 'no' | ''
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">請選擇</option>
                    <option value="yes">需要</option>
                    <option value="no">不需要</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">4. 合作細節</label>
                <textarea
                  value={formData.collaborationProcess?.collaborationDetails || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    collaborationProcess: {
                      ...formData.collaborationProcess,
                      collaborationDetails: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入合作細節..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">5. 交稿期</label>
                <textarea
                  value={formData.collaborationProcess?.deadline || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    collaborationProcess: {
                      ...formData.collaborationProcess,
                      deadline: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入交稿期..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6. 成果發布</label>
                <textarea
                  value={formData.collaborationProcess?.resultPublication || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    collaborationProcess: {
                      ...formData.collaborationProcess,
                      resultPublication: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入成果發布資訊..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入備註資訊..."
                />
              </div>
            </div>
          </div>

          {/* 分潤管理區塊 */}
          <div className="border-t pt-6 mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="text-green-600" size={20} />
                分潤管理
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                管理合作專案的分潤記錄
              </p>
            </div>

            {/* 新增分潤表單 */}
            {showProfitShareForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <h4 className="font-medium text-gray-700 mb-3">新增分潤記錄</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">月份 *</label>
                    <select
                      value={profitShareFormData.month}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                        <option key={m} value={m}>{m}月</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始時間 *</label>
                    <input
                      type="date"
                      required
                      value={profitShareFormData.periodStart}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, periodStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">結束日期 *</label>
                    <input
                      type="date"
                      required
                      value={profitShareFormData.periodEnd}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, periodEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤週期 *</label>
                    <select
                      value={profitShareFormData.period}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="monthly">每月</option>
                      <option value="quarterly">每季</option>
                      <option value="semi-annual">每半年</option>
                      <option value="yearly">每年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">銷售金額 (NT$) *</label>
                    <input
                      type="number"
                      value={profitShareFormData.salesAmount}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, salesAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分潤比例 (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profitShareFormData.profitShareRate}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, profitShareRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">額外獎金 (NT$)</label>
                    <input
                      type="number"
                      value={profitShareFormData.bonusAmount}
                      onChange={(e) => setProfitShareFormData({ ...profitShareFormData, bonusAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">預估分潤金額</label>
                    <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-blue-700 font-semibold">
                      NT$ {((profitShareFormData.salesAmount * profitShareFormData.profitShareRate) / 100 + profitShareFormData.bonusAmount).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <input
                    type="text"
                    value={profitShareFormData.note}
                    onChange={(e) => setProfitShareFormData({ ...profitShareFormData, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProfitShareToForm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus size={20} />
                  加入分潤記錄
                </button>
              </div>
            )}

            {/* 分潤記錄列表 */}
            {formData.profitShares && formData.profitShares.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-gray-700">已新增的分潤記錄 ({formData.profitShares.length} 筆)</h4>
                <div className="space-y-2">
                  {formData.profitShares.map((ps) => (
                    <div key={ps.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-semibold text-gray-700">
                            {ps.periodStart} ~ {ps.periodEnd}
                          </span>
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                            {ps.period === 'monthly' ? '每月' : ps.period === 'quarterly' ? '每季' : ps.period === 'semi-annual' ? '每半年' : '每年'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>銷售額: NT$ {ps.salesAmount.toLocaleString()}</span>
                          <span>分潤率: {ps.profitShareRate}%</span>
                          <span className="font-semibold text-green-600">總分潤: NT$ {(ps.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProfitShareFromForm(ps.id)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.profitShares && formData.profitShares.length === 0 && !showProfitShareForm && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <p className="text-gray-500">尚未新增分潤記錄</p>
                <p className="text-sm text-gray-400 mt-1">點擊下方「新增分潤」按鈕開始新增</p>
              </div>
            )}

            {/* 新增分潤按鈕 */}
            <button
              type="button"
              onClick={() => setShowProfitShareForm(!showProfitShareForm)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              {showProfitShareForm ? '收起分潤表單' : '新增分潤記錄'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              {showProfitShareForm ? '點擊收起分潤表單' : '點擊新增此專案的分潤記錄'}
            </p>
          </div>

          <div className="flex gap-3 pt-6 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingCollab ? '更新' : '新增'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頂部操作區 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">合作專案管理</h2>
          <button
            onClick={handleAddCollaboration}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新增專案
          </button>
        </div>

        {/* 搜尋與篩選 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋專案名稱、品牌或 KOL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="全部">全部狀態</option>
            <option value="pending">待確認</option>
            <option value="negotiating">洽談中</option>
            <option value="confirmed">已確認</option>
            <option value="in_progress">進行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          總計: <strong className="text-gray-800">{collaborations.length}</strong> 個專案 |
          搜尋結果: <strong className="text-blue-600">{filteredCollaborations.length}</strong> 個
        </div>
      </div>

      {/* 專案列表 */}
      <div className="space-y-4">
        {filteredCollaborations.map(collab => {
          const salesData = getSalesData(collab.id);
          return (
            <div key={collab.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{collab.projectName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(collab.status)}`}>
                    {getStatusText(collab.status)}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">商品: {collab.productName}</p>
                <p className="text-gray-600">KOL: {getKOLName(collab.kolId)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">專案期間</p>
                    <p className="text-sm font-medium text-gray-800">{collab.startDate} ~ {collab.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="text-green-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">預算</p>
                    <p className="text-sm font-medium text-green-600">NT$ {collab.budget.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="text-purple-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">實際費用</p>
                    <p className="text-sm font-medium text-purple-600">NT$ {collab.actualCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {salesData && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    銷售成效
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">點擊數</p>
                      <p className="text-lg font-bold text-blue-600">{salesData.clicks.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">轉換數</p>
                      <p className="text-lg font-bold text-green-600">{salesData.conversions.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">收益</p>
                      <p className="text-lg font-bold text-purple-600">NT$ {salesData.revenue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600">佣金</p>
                      <p className="text-lg font-bold text-orange-600">NT$ {salesData.commission.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {collab.note && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-gray-600"><span className="text-xs text-gray-500">備註: </span>{collab.note}</p>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleViewCollaboration(collab)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  title="查看詳情"
                >
                  <Eye size={24} />
                </button>
                <button
                  onClick={() => handleEditCollaboration(collab)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="編輯"
                >
                  <Edit2 size={24} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('確定要刪除此合作專案嗎？相關的分潤記錄和提醒也會一併刪除。')) {
                      onDeleteCollaboration(collab.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="刪除"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCollaborations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">找不到符合條件的合作專案</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationManagement;
