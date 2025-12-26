import React, { useState, useEffect } from 'react';
import {
  Wrench, Plus, Search, Filter, Calendar, Clock,
  DollarSign, User, Car, Edit, Trash2, Eye,
  CheckCircle, AlertCircle, PlayCircle, PauseCircle,
  Star, ChevronDown
} from 'lucide-react';
import {
  ServiceRecord,
  ServiceType,
  ServiceStatus,
  PaymentStatus,
  ServiceItem,
  SERVICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  Customer,
  Vehicle
} from '../../types/autoCrm';
import { serviceRecordService, customerService, technicianService } from '../../services/autoCrmService';

const ServiceRecordManagement: React.FC = () => {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const data = serviceRecordService.getAll();
    setRecords(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此施工單嗎？')) {
      serviceRecordService.delete(id);
      loadRecords();
    }
  };

  const filteredRecords = records.filter(record => {
    if (statusFilter !== 'all' && record.status !== statusFilter) return false;
    if (typeFilter !== 'all' && record.serviceType !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        record.customerName.toLowerCase().includes(query) ||
        record.vehicleInfo.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <PauseCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
      warranty: 'bg-orange-100 text-orange-700'
    };
    return colors[status];
  };

  const getStatusLabel = (status: ServiceStatus) => {
    const labels = {
      pending: '待處理',
      confirmed: '已確認',
      in_progress: '施工中',
      completed: '已完成',
      cancelled: '已取消',
      warranty: '保固處理'
    };
    return labels[status];
  };

  const getPaymentColor = (status: PaymentStatus) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-gray-100 text-gray-700'
    };
    return colors[status];
  };

  const getPaymentLabel = (status: PaymentStatus) => {
    const labels = {
      unpaid: '未付款',
      partial: '部分付款',
      paid: '已付清',
      refunded: '已退款'
    };
    return labels[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-TW');
  };

  // 計算統計數據
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    inProgress: records.filter(r => r.status === 'in_progress').length,
    completed: records.filter(r => r.status === 'completed').length,
    unpaidAmount: records
      .filter(r => r.paymentStatus !== 'paid')
      .reduce((sum, r) => sum + (r.total - r.paidAmount), 0)
  };

  return (
    <div className="space-y-6">
      {/* 標題和操作列 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">施工記錄</h2>
        </div>
        <button
          onClick={() => { setEditingRecord(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增施工單
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">總施工單</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Wrench className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待處理</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">施工中</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
            </div>
            <PlayCircle className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待收款</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.unpaidAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋客戶名稱、車輛..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部狀態</option>
              <option value="pending">待處理</option>
              <option value="confirmed">已確認</option>
              <option value="in_progress">施工中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ServiceType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部類型</option>
              {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 施工記錄列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客戶/車輛</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">服務類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">項目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">預約日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額/付款</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{record.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Car className="w-3 h-3" />
                        {record.vehicleInfo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {SERVICE_TYPE_LABELS[record.serviceType]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {record.items.slice(0, 2).map(item => item.name).join('、')}
                      {record.items.length > 2 && ` +${record.items.length - 2} 項`}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(record.appointmentDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{formatCurrency(record.total)}</div>
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full mt-1 ${getPaymentColor(record.paymentStatus)}`}>
                        {getPaymentLabel(record.paymentStatus)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="檢視"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => { setEditingRecord(record); setShowForm(true); }}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="編輯"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="刪除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">尚無施工記錄</p>
          </div>
        )}
      </div>

      {/* 施工單詳情彈窗 */}
      {selectedRecord && (
        <ServiceRecordDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={() => { setEditingRecord(selectedRecord); setSelectedRecord(null); setShowForm(true); }}
        />
      )}

      {/* 新增/編輯表單 */}
      {showForm && (
        <ServiceRecordForm
          record={editingRecord}
          onSave={() => { setShowForm(false); loadRecords(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

// 施工單詳情元件
interface ServiceRecordDetailProps {
  record: ServiceRecord;
  onClose: () => void;
  onEdit: () => void;
}

const ServiceRecordDetail: React.FC<ServiceRecordDetailProps> = ({ record, onClose, onEdit }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-TW');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-purple-50">
          <h2 className="text-xl font-bold text-gray-800">施工單詳情</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1 text-purple-600 hover:bg-purple-100 rounded-lg">
              編輯
            </button>
            <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg">
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
          {/* 基本資訊 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">客戶</p>
              <p className="font-medium text-gray-800">{record.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">車輛</p>
              <p className="font-medium text-gray-800">{record.vehicleInfo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">服務類型</p>
              <p className="font-medium text-gray-800">{SERVICE_TYPE_LABELS[record.serviceType]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">技師</p>
              <p className="font-medium text-gray-800">{record.technicianName || '-'}</p>
            </div>
          </div>

          {/* 時間資訊 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-3">時間資訊</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">預約日期</p>
                <p className="font-medium">{formatDate(record.appointmentDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">開始日期</p>
                <p className="font-medium">{formatDate(record.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">完成日期</p>
                <p className="font-medium">{formatDate(record.completedDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">實際工時</p>
                <p className="font-medium">{record.actualHours || '-'} 小時</p>
              </div>
            </div>
          </div>

          {/* 服務項目 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">服務項目</h3>
            <div className="space-y-2">
              {record.items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                    {item.warranty && <p className="text-sm text-purple-600">保固: {item.warranty}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{formatCurrency(item.subtotal)}</p>
                    {item.discount > 0 && (
                      <p className="text-sm text-red-500">-{item.discount}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 金額資訊 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-3">金額資訊</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">小計</span>
                <span className="text-gray-800">{formatCurrency(record.subtotal)}</span>
              </div>
              {record.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>折扣</span>
                  <span>-{formatCurrency(record.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>總計</span>
                <span className="text-blue-600">{formatCurrency(record.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">已付金額</span>
                <span className="text-green-600">{formatCurrency(record.paidAmount)}</span>
              </div>
              {record.total - record.paidAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">待收金額</span>
                  <span className="text-red-600">{formatCurrency(record.total - record.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 滿意度 */}
          {record.satisfactionRating && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">客戶評價:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i <= record.satisfactionRating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              {record.feedback && (
                <span className="text-gray-500 text-sm ml-2">"{record.feedback}"</span>
              )}
            </div>
          )}

          {/* 備註 */}
          {record.notes && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">備註</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{record.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 施工單表單元件
interface ServiceRecordFormProps {
  record?: ServiceRecord | null;
  onSave: () => void;
  onCancel: () => void;
}

const ServiceRecordForm: React.FC<ServiceRecordFormProps> = ({ record, onSave, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const technicians = technicianService.getActive();

  const [formData, setFormData] = useState<Partial<ServiceRecord>>({
    customerId: '',
    customerName: '',
    vehicleId: '',
    vehicleInfo: '',
    serviceType: 'maintenance',
    status: 'pending',
    items: [],
    appointmentDate: new Date().toISOString().split('T')[0],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paymentStatus: 'unpaid',
    paidAmount: 0,
    notes: ''
  });

  useEffect(() => {
    const allCustomers = customerService.getAll();
    setCustomers(allCustomers);

    if (record) {
      setFormData(record);
      const customer = allCustomers.find(c => c.id === record.customerId);
      if (customer) {
        setSelectedCustomer(customer);
        const vehicle = customer.vehicles.find(v => v.id === record.vehicleId);
        if (vehicle) setSelectedVehicle(vehicle);
      }
    }
  }, [record]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setSelectedVehicle(null);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        vehicleId: '',
        vehicleInfo: ''
      }));
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    if (!selectedCustomer) return;
    const vehicle = selectedCustomer.vehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle || null);
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleId: vehicle.id,
        vehicleInfo: `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`
      }));
    }
  };

  const handleAddItem = () => {
    const newItem: ServiceItem = {
      id: `item-${Date.now()}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      subtotal: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const handleItemChange = (index: number, field: keyof ServiceItem, value: string | number) => {
    setFormData(prev => {
      const items = [...(prev.items || [])];
      items[index] = { ...items[index], [field]: value };
      // 計算小計
      const item = items[index];
      item.subtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      // 計算總計
      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const discount = prev.discount || 0;
      const total = subtotal - discount;
      return { ...prev, items, subtotal, total };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const items = (prev.items || []).filter((_, i) => i !== index);
      const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
      const discount = prev.discount || 0;
      const total = subtotal - discount;
      return { ...prev, items, subtotal, total };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record) {
      serviceRecordService.update(record.id, formData);
    } else {
      serviceRecordService.create(formData as Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-purple-50">
          <h2 className="text-xl font-bold text-gray-800">
            {record ? '編輯施工單' : '新增施工單'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-purple-100 rounded-lg">
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)] p-6 space-y-6">
          {/* 客戶和車輛選擇 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">客戶 *</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">選擇客戶</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">車輛 *</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
                disabled={!selectedCustomer}
              >
                <option value="">選擇車輛</option>
                {selectedCustomer?.vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.plateNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 服務類型和狀態 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">服務類型</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as ServiceType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">狀態</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ServiceStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">待處理</option>
                <option value="confirmed">已確認</option>
                <option value="in_progress">施工中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">技師</label>
              <select
                value={formData.technicianId || ''}
                onChange={(e) => {
                  const tech = technicians.find(t => t.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    technicianId: e.target.value,
                    technicianName: tech?.name || ''
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">選擇技師</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 預約日期 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">預約日期</label>
              <input
                type="date"
                value={formData.appointmentDate?.split('T')[0] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">開始日期</label>
              <input
                type="date"
                value={formData.startDate?.split('T')[0] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">預估工時</label>
              <input
                type="number"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="小時"
              />
            </div>
          </div>

          {/* 服務項目 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-600">服務項目</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                新增項目
              </button>
            </div>
            <div className="space-y-3">
              {formData.items?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="項目名稱"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="數量"
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="單價"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-gray-700">
                      ${item.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 金額資訊 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">小計</label>
                <p className="text-lg font-medium">${(formData.subtotal || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">折扣金額</label>
                <input
                  type="number"
                  value={formData.discount || 0}
                  onChange={(e) => {
                    const discount = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      discount,
                      total: (prev.subtotal || 0) - discount
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">總計</label>
                <p className="text-2xl font-bold text-purple-600">${(formData.total || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">已付金額</label>
                <input
                  type="number"
                  value={formData.paidAmount || 0}
                  onChange={(e) => {
                    const paidAmount = parseInt(e.target.value) || 0;
                    const total = formData.total || 0;
                    let paymentStatus: PaymentStatus = 'unpaid';
                    if (paidAmount >= total) paymentStatus = 'paid';
                    else if (paidAmount > 0) paymentStatus = 'partial';
                    setFormData(prev => ({ ...prev, paidAmount, paymentStatus }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">備註</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="施工備註..."
            />
          </div>

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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRecordManagement;
