import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Filter, Phone, Mail, Car,
  Star, Edit, Trash2, Eye, ChevronDown, Tag
} from 'lucide-react';
import {
  Customer,
  CustomerStatus,
  CustomerLevel,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_LEVEL_LABELS,
  CUSTOMER_SOURCE_LABELS
} from '../../types/autoCrm';
import { customerService } from '../../services/autoCrmService';

interface CustomerListProps {
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  onSelectCustomer,
  onEditCustomer,
  onAddCustomer
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CustomerLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const data = customerService.getAll();
    setCustomers(data);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除此客戶嗎？')) {
      customerService.delete(id);
      loadCustomers();
    }
  };

  const filteredCustomers = customers.filter(customer => {
    // 搜尋過濾
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.vehicles.some(v =>
          v.plateNumber.toLowerCase().includes(query) ||
          v.brand.toLowerCase().includes(query)
        );
      if (!matchesSearch) return false;
    }

    // 狀態過濾
    if (statusFilter !== 'all' && customer.status !== statusFilter) {
      return false;
    }

    // 等級過濾
    if (levelFilter !== 'all' && customer.level !== levelFilter) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: CustomerStatus) => {
    const colors: Record<CustomerStatus, string> = {
      potential: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      negotiating: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
      vip: 'bg-purple-100 text-purple-700'
    };
    return colors[status];
  };

  const getLevelColor = (level: CustomerLevel) => {
    const colors: Record<CustomerLevel, string> = {
      platinum: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
      gold: 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800',
      silver: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700',
      bronze: 'bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800',
      general: 'bg-gray-100 text-gray-600'
    };
    return colors[level];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* 標題和操作列 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">客戶管理</h2>
          <span className="text-sm text-gray-500">({filteredCustomers.length} 位客戶)</span>
        </div>
        <button
          onClick={onAddCustomer}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增客戶
        </button>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4">
          {/* 搜尋框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋客戶名稱、電話、車牌..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* 篩選按鈕 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            篩選
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 篩選選項 */}
        {showFilters && (
          <div className="flex gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">客戶狀態</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部狀態</option>
                {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">會員等級</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as CustomerLevel | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部等級</option>
                {Object.entries(CUSTOMER_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 客戶列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客戶資料
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  聯繫方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  車輛
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態/等級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  消費統計
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{customer.name}</span>
                        {customer.status === 'vip' && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {CUSTOMER_SOURCE_LABELS[customer.source]}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {customer.vehicles.slice(0, 2).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-1 text-sm">
                          <Car className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">{vehicle.brand} {vehicle.model}</span>
                          <span className="text-gray-400">({vehicle.plateNumber})</span>
                        </div>
                      ))}
                      {customer.vehicles.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{customer.vehicles.length - 2} 輛車
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                        {CUSTOMER_STATUS_LABELS[customer.status]}
                      </span>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(customer.level)}`}>
                          {CUSTOMER_LEVEL_LABELS[customer.level]}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                      <div className="text-xs text-gray-500">
                        來店 {customer.visitCount} 次
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(customer);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="檢視詳情"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCustomer(customer);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="編輯"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(customer.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">尚無符合條件的客戶</p>
          </div>
        )}
      </div>

      {/* 標籤統計 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">常用標籤</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(customers.flatMap(c => c.tags))).slice(0, 10).map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 cursor-pointer"
              onClick={() => setSearchQuery(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
