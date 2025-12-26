import React, { useState, useEffect } from 'react';
import {
  X, Save, Plus, Trash2, User, Phone, Mail, MapPin,
  Car, Calendar, Tag
} from 'lucide-react';
import {
  Customer,
  Vehicle,
  CustomerSource,
  CustomerStatus,
  CustomerLevel,
  CUSTOMER_SOURCE_LABELS,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_LEVEL_LABELS
} from '../../types/autoCrm';
import { customerService } from '../../services/autoCrmService';

interface CustomerFormProps {
  customer?: Customer | null;
  onSave: () => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    lineId: '',
    address: '',
    birthday: '',
    source: 'walk_in',
    status: 'potential',
    level: 'general',
    tags: [],
    vehicles: [],
    totalSpent: 0,
    visitCount: 0,
    preferences: '',
    notes: ''
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    }
  }, [customer]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      color: '',
      mileage: 0
    };
    setFormData(prev => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), newVehicle]
    }));
  };

  const handleVehicleChange = (index: number, field: keyof Vehicle, value: string | number) => {
    setFormData(prev => {
      const vehicles = [...(prev.vehicles || [])];
      vehicles[index] = { ...vehicles[index], [field]: value };
      return { ...prev, vehicles };
    });
  };

  const handleRemoveVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles?.filter((_, i) => i !== index) || []
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '請輸入客戶姓名';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = '請輸入聯絡電話';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '電話格式不正確';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email格式不正確';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (customer) {
      customerService.update(customer.id, formData);
    } else {
      customerService.create(formData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>);
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 標題 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {customer ? '編輯客戶' : '新增客戶'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="p-6 space-y-6">
            {/* 基本資料 */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                <User className="w-5 h-5" />
                基本資料
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="請輸入客戶姓名"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    電話 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0912-345-678"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">LINE ID</label>
                  <input
                    type="text"
                    name="lineId"
                    value={formData.lineId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="LINE ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">生日</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday || ''}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">地址</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入地址"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 分類設定 */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                <Tag className="w-5 h-5" />
                分類設定
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">客戶來源</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CUSTOMER_SOURCE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">客戶狀態</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">會員等級</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CUSTOMER_LEVEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 標籤 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">客戶標籤</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入標籤後按Enter或點擊新增"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    新增
                  </button>
                </div>
              </div>
            </div>

            {/* 車輛資訊 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                  <Car className="w-5 h-5" />
                  車輛資訊
                </h3>
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  新增車輛
                </button>
              </div>

              <div className="space-y-4">
                {formData.vehicles?.map((vehicle, index) => (
                  <div key={vehicle.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">車輛 #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVehicle(index)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">品牌</label>
                        <input
                          type="text"
                          value={vehicle.brand}
                          onChange={(e) => handleVehicleChange(index, 'brand', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Toyota"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">車型</label>
                        <input
                          type="text"
                          value={vehicle.model}
                          onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Camry"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">年份</label>
                        <input
                          type="number"
                          value={vehicle.year}
                          onChange={(e) => handleVehicleChange(index, 'year', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">車牌</label>
                        <input
                          type="text"
                          value={vehicle.plateNumber}
                          onChange={(e) => handleVehicleChange(index, 'plateNumber', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="ABC-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">顏色</label>
                        <input
                          type="text"
                          value={vehicle.color}
                          onChange={(e) => handleVehicleChange(index, 'color', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="白色"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">里程數</label>
                        <input
                          type="number"
                          value={vehicle.mileage}
                          onChange={(e) => handleVehicleChange(index, 'mileage', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="公里"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">購車日期</label>
                        <input
                          type="date"
                          value={vehicle.purchaseDate || ''}
                          onChange={(e) => handleVehicleChange(index, 'purchaseDate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">下次保養</label>
                        <input
                          type="date"
                          value={vehicle.nextServiceDue || ''}
                          onChange={(e) => handleVehicleChange(index, 'nextServiceDue', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.vehicles || formData.vehicles.length === 0) && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                    <Car className="w-10 h-10 mx-auto mb-2" />
                    <p>尚未新增車輛資訊</p>
                  </div>
                )}
              </div>
            </div>

            {/* 備註 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">其他資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">客戶偏好</label>
                  <textarea
                    name="preferences"
                    value={formData.preferences || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="記錄客戶偏好，如預約時間、服務項目等..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">備註</label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="其他備註事項..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部按鈕 */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
