import React, { useState } from 'react';
import { KOL, Collaboration, SalesTracking } from '../types/kol';
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface CollaborationManagementProps {
  kols: KOL[];
  collaborations: Collaboration[];
  salesTracking: SalesTracking[];
  onSaveCollaboration: (collaboration: Partial<Collaboration>) => void;
  onDeleteCollaboration: (id: number) => void;
}

const CollaborationManagement: React.FC<CollaborationManagementProps> = ({
  kols,
  collaborations,
  salesTracking,
  onSaveCollaboration,
  onDeleteCollaboration
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');
  const [showForm, setShowForm] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaboration | null>(null);

  const [formData, setFormData] = useState<Partial<Collaboration>>({
    kolId: 0,
    projectName: '',
    productName: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    budget: 0,
    actualCost: 0,
    deliverables: [],
    platforms: [],
    note: ''
  });

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
    setFormData({
      kolId: kols.length > 0 ? kols[0].id : 0,
      projectName: '',
      productName: '',
      status: 'pending',
      startDate: '',
      endDate: '',
      budget: 0,
      actualCost: 0,
      deliverables: [],
      platforms: [],
      note: ''
    });
    setShowForm(true);
  };

  const handleEditCollaboration = (collab: Collaboration) => {
    setEditingCollab(collab);
    setFormData(collab);
    setShowForm(true);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{collab.projectName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(collab.status)}`}>
                      {getStatusText(collab.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">商品: {collab.productName}</p>
                  <p className="text-gray-600">KOL: {getKOLName(collab.kolId)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCollaboration(collab)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="編輯"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteCollaboration(collab.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="刪除"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
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
                  {salesData.discountCode && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-600">折扣碼:</span>
                      <span className="ml-2 font-mono font-semibold text-blue-600">{salesData.discountCode}</span>
                    </div>
                  )}
                </div>
              )}

              {collab.note && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-gray-600"><span className="text-xs text-gray-500">備註: </span>{collab.note}</p>
                </div>
              )}
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
