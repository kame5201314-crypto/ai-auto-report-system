import React from 'react';
import {
  X, Edit, Phone, Mail, MapPin, Calendar, Car, Star,
  DollarSign, Clock, FileText, Tag, MessageSquare
} from 'lucide-react';
import {
  Customer,
  CUSTOMER_SOURCE_LABELS,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_LEVEL_LABELS
} from '../../types/autoCrm';
import { serviceRecordService } from '../../services/autoCrmService';

interface CustomerDetailProps {
  customer: Customer;
  onEdit: () => void;
  onClose: () => void;
  onCreateService: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  onEdit,
  onClose,
  onCreateService
}) => {
  const serviceHistory = serviceRecordService.getByCustomer(customer.id);

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

  const getStatusColor = (status: Customer['status']) => {
    const colors = {
      potential: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      negotiating: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
      vip: 'bg-purple-100 text-purple-700'
    };
    return colors[status];
  };

  const getLevelColor = (level: Customer['level']) => {
    const colors = {
      platinum: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
      gold: 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800',
      silver: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700',
      bronze: 'bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800',
      general: 'bg-gray-100 text-gray-600'
    };
    return colors[level];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 標題列 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">{customer.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{customer.name}</h2>
                {customer.status === 'vip' && (
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(customer.status)}`}>
                  {CUSTOMER_STATUS_LABELS[customer.status]}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelColor(customer.level)}`}>
                  {CUSTOMER_LEVEL_LABELS[customer.level]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Edit className="w-4 h-4" />
              編輯
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 內容區 */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：聯絡資訊和統計 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 聯絡資訊 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-4">聯絡資訊</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  )}
                  {customer.lineId && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">LINE: {customer.lineId}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{customer.address}</span>
                    </div>
                  )}
                  {customer.birthday && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">生日: {formatDate(customer.birthday)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 消費統計 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-4">消費統計</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">累計消費</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">來店次數</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {customer.visitCount} 次
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">平均消費</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {customer.visitCount > 0
                        ? formatCurrency(customer.totalSpent / customer.visitCount)
                        : '-'}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">最後來店</span>
                      <span className="text-gray-600">{formatDate(customer.lastVisitDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-500">客戶來源</span>
                      <span className="text-gray-600">{CUSTOMER_SOURCE_LABELS[customer.source]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 標籤 */}
              {customer.tags.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                    <Tag className="w-4 h-4" />
                    客戶標籤
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 快速操作 */}
              <div className="space-y-2">
                <button
                  onClick={onCreateService}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  建立施工單
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  發送訊息
                </button>
              </div>
            </div>

            {/* 右側：車輛和服務歷史 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 車輛資訊 */}
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
                  <Car className="w-5 h-5" />
                  車輛資訊 ({customer.vehicles.length})
                </h3>
                <div className="space-y-3">
                  {customer.vehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {vehicle.brand} {vehicle.model}
                            </span>
                            <span className="text-sm text-gray-500">({vehicle.year})</span>
                          </div>
                          <div className="text-lg font-mono text-blue-600 mt-1">
                            {vehicle.plateNumber}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vehicle.color === '白色' ? 'bg-gray-100' :
                          vehicle.color === '黑色' ? 'bg-gray-800 text-white' :
                          vehicle.color === '紅色' ? 'bg-red-100 text-red-700' :
                          vehicle.color === '藍色' ? 'bg-blue-100 text-blue-700' :
                          vehicle.color === '銀色' ? 'bg-gray-200' :
                          'bg-gray-100'
                        }`}>
                          {vehicle.color}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t text-sm">
                        <div>
                          <span className="text-gray-500">里程數：</span>
                          <span className="text-gray-700">{vehicle.mileage.toLocaleString()} km</span>
                        </div>
                        <div>
                          <span className="text-gray-500">購車日期：</span>
                          <span className="text-gray-700">{formatDate(vehicle.purchaseDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">最後服務：</span>
                          <span className="text-gray-700">{formatDate(vehicle.lastServiceDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">下次保養：</span>
                          <span className={`${
                            vehicle.nextServiceDue && new Date(vehicle.nextServiceDue) < new Date()
                              ? 'text-red-600 font-medium'
                              : 'text-gray-700'
                          }`}>
                            {formatDate(vehicle.nextServiceDue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 服務歷史 */}
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
                  <Clock className="w-5 h-5" />
                  服務歷史 ({serviceHistory.length})
                </h3>
                {serviceHistory.length > 0 ? (
                  <div className="space-y-3">
                    {serviceHistory.slice(0, 5).map(service => (
                      <div
                        key={service.id}
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">
                              {service.items.map(i => i.name).join('、')}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {service.vehicleInfo}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {formatCurrency(service.total)}
                            </div>
                            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                              service.status === 'completed' ? 'bg-green-100 text-green-700' :
                              service.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              service.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {service.status === 'completed' ? '已完成' :
                               service.status === 'in_progress' ? '施工中' :
                               service.status === 'pending' ? '待處理' : service.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>{formatDate(service.completedDate || service.startDate || service.appointmentDate)}</span>
                          {service.technicianName && (
                            <span>技師: {service.technicianName}</span>
                          )}
                          {service.satisfactionRating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {service.satisfactionRating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border rounded-lg">
                    <FileText className="w-10 h-10 mx-auto mb-2" />
                    <p>尚無服務記錄</p>
                  </div>
                )}
              </div>

              {/* 備註 */}
              {(customer.preferences || customer.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.preferences && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">客戶偏好</h4>
                      <p className="text-sm text-yellow-700">{customer.preferences}</p>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">備註</h4>
                      <p className="text-sm text-gray-600">{customer.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
