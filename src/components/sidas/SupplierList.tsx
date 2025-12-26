import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, Download, Tag, Trash2, ChevronDown, ChevronUp,
  Mail, Phone, Globe, Star, MapPin, Calendar, ExternalLink,
  CheckSquare, Square, MoreVertical, X, RefreshCw, Building2
} from 'lucide-react';
import { Supplier, SupplierFilters, ProductCategory, SupplierStatus, SourcePlatform } from '../../types/sidas';
import { supplierService } from '../../services/sidasService';

interface SupplierListProps {
  onSelectSupplier: (supplier: Supplier) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ onSelectSupplier }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'aiScore' | 'discoveredAt' | 'companyName'>('aiScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const pageSize = 10;

  // 獲取唯一值用於篩選選項
  const uniqueCountries = useMemo(() => supplierService.getUniqueCountries(), []);
  const uniqueTags = useMemo(() => supplierService.getUniqueTags(), []);

  useEffect(() => {
    loadSuppliers();
  }, [filters]);

  const loadSuppliers = () => {
    const result = supplierService.filter(filters);
    setSuppliers(result);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // 排序後的供應商
  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'aiScore':
          comparison = a.aiScore - b.aiScore;
          break;
        case 'discoveredAt':
          comparison = new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime();
          break;
        case 'companyName':
          comparison = a.companyName.localeCompare(b.companyName);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [suppliers, sortField, sortDirection]);

  // 分頁後的供應商
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSuppliers.slice(start, start + pageSize);
  }, [sortedSuppliers, currentPage]);

  const totalPages = Math.ceil(sortedSuppliers.length / pageSize);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedSuppliers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSuppliers.map(s => s.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchTag = () => {
    const tag = prompt('輸入標籤名稱:');
    if (tag) {
      supplierService.batchOperation({
        type: 'tag',
        supplierIds: Array.from(selectedIds),
        payload: { tags: [tag] }
      });
      loadSuppliers();
      setShowBatchMenu(false);
    }
  };

  const handleBatchStatus = (status: SupplierStatus) => {
    supplierService.batchOperation({
      type: 'status',
      supplierIds: Array.from(selectedIds),
      payload: { status }
    });
    loadSuppliers();
    setShowBatchMenu(false);
  };

  const handleExport = () => {
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : suppliers.map(s => s.id);
    const csv = supplierService.export(ids, 'csv');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suppliers_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: SupplierStatus) => {
    const styles: Record<SupplierStatus, string> = {
      not_contacted: 'bg-gray-100 text-gray-700',
      contacted: 'bg-blue-100 text-blue-700',
      negotiating: 'bg-yellow-100 text-yellow-700',
      cooperating: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      blacklisted: 'bg-black text-white'
    };
    const labels: Record<SupplierStatus, string> = {
      not_contacted: '未聯繫',
      contacted: '已聯繫',
      negotiating: '洽談中',
      cooperating: '合作中',
      rejected: '已拒絕',
      blacklisted: '黑名單'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getScoreBadge = (score: number) => {
    let color = 'bg-red-100 text-red-700';
    if (score >= 90) color = 'bg-green-100 text-green-700';
    else if (score >= 80) color = 'bg-blue-100 text-blue-700';
    else if (score >= 70) color = 'bg-yellow-100 text-yellow-700';
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
        {score}
      </span>
    );
  };

  const getPlatformLabel = (platform: SourcePlatform) => {
    const labels: Record<SourcePlatform, string> = {
      alibaba: 'Alibaba',
      made_in_china: 'Made in China',
      global_sources: 'Global Sources',
      dhgate: 'DHgate',
      indiamart: 'IndiaMart',
      ec21: 'EC21',
      manual: '手動輸入',
      other: '其他'
    };
    return labels[platform];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW');
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(v =>
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className="space-y-4">
      {/* 頁面標題和搜尋 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">供應商名單</h1>
          <p className="text-gray-500 mt-1">共 {suppliers.length} 筆供應商資料</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜尋公司名稱、Email、關鍵詞..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            篩選
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-cyan-500 rounded-full" />
            )}
          </button>
          <button
            onClick={loadSuppliers}
            className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 高級篩選器 */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">高級篩選</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除篩選
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI 評分範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI 評分範圍</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="最低"
                  value={filters.aiScoreRange?.min || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    aiScoreRange: {
                      min: parseInt(e.target.value) || 0,
                      max: prev.aiScoreRange?.max || 100
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="最高"
                  value={filters.aiScoreRange?.max || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    aiScoreRange: {
                      min: prev.aiScoreRange?.min || 0,
                      max: parseInt(e.target.value) || 100
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            {/* 聯繫狀態 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">聯繫狀態</label>
              <select
                multiple
                value={filters.statuses || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value as SupplierStatus);
                  setFilters(prev => ({ ...prev, statuses: selected }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm h-24"
              >
                <option value="not_contacted">未聯繫</option>
                <option value="contacted">已聯繫</option>
                <option value="negotiating">洽談中</option>
                <option value="cooperating">合作中</option>
                <option value="rejected">已拒絕</option>
                <option value="blacklisted">黑名單</option>
              </select>
            </div>

            {/* 產品類別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">產品類別</label>
              <select
                multiple
                value={filters.categories || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value as ProductCategory);
                  setFilters(prev => ({ ...prev, categories: selected }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm h-24"
              >
                <option value="APEXEL">APEXEL</option>
                <option value="MEFU">MEFU</option>
                <option value="ACCESSORIES">配件</option>
                <option value="ELECTRONICS">電子</option>
                <option value="OTHER">其他</option>
              </select>
            </div>

            {/* 國家 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">國家/地區</label>
              <select
                multiple
                value={filters.countries || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFilters(prev => ({ ...prev, countries: selected }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm h-24"
              >
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* 來源平台 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">來源平台</label>
              <select
                multiple
                value={filters.platforms || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value as SourcePlatform);
                  setFilters(prev => ({ ...prev, platforms: selected }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm h-24"
              >
                <option value="alibaba">Alibaba</option>
                <option value="made_in_china">Made in China</option>
                <option value="global_sources">Global Sources</option>
                <option value="dhgate">DHgate</option>
                <option value="indiamart">IndiaMart</option>
                <option value="ec21">EC21</option>
                <option value="manual">手動輸入</option>
              </select>
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
              <select
                multiple
                value={filters.tags || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFilters(prev => ({ ...prev, tags: selected }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm h-24"
              >
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* 聯繫方式篩選 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">聯繫方式</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasEmail === true}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasEmail: e.target.checked ? true : undefined }))}
                    className="rounded text-cyan-600"
                  />
                  <span className="text-sm">有 Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasPhone === true}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasPhone: e.target.checked ? true : undefined }))}
                    className="rounded text-cyan-600"
                  />
                  <span className="text-sm">有電話</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.hasWebsite === true}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasWebsite: e.target.checked ? true : undefined }))}
                    className="rounded text-cyan-600"
                  />
                  <span className="text-sm">有網站</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批次操作工具列 */}
      {selectedIds.size > 0 && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-cyan-800 font-medium">
            已選擇 {selectedIds.size} 筆供應商
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBatchMenu(!showBatchMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                批次操作
                <ChevronDown className="w-4 h-4" />
              </button>
              {showBatchMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={handleBatchTag}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Tag className="w-4 h-4" />
                    新增標籤
                  </button>
                  <div className="border-t">
                    <p className="px-4 py-1 text-xs text-gray-500">更改狀態為</p>
                    <button
                      onClick={() => handleBatchStatus('contacted')}
                      className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm"
                    >
                      已聯繫
                    </button>
                    <button
                      onClick={() => handleBatchStatus('negotiating')}
                      className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm"
                    >
                      洽談中
                    </button>
                    <button
                      onClick={() => handleBatchStatus('cooperating')}
                      className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm"
                    >
                      合作中
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50"
            >
              <Download className="w-4 h-4" />
              導出
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 供應商列表表格 */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={handleSelectAll} className="text-gray-500 hover:text-gray-700">
                    {selectedIds.size === paginatedSuppliers.length && paginatedSuppliers.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('companyName')}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    公司名稱
                    {sortField === 'companyName' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('aiScore')}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    AI 評分
                    {sortField === 'aiScore' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">聯繫方式</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">國家/地區</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">狀態</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('discoveredAt')}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    發現日期
                    {sortField === 'discoveredAt' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedSuppliers.map(supplier => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectSupplier(supplier)}
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleSelect(supplier.id)}>
                      {selectedIds.has(supplier.id) ? (
                        <CheckSquare className="w-5 h-5 text-cyan-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{supplier.companyName}</p>
                        {supplier.companyNameLocal && (
                          <p className="text-sm text-gray-500">{supplier.companyNameLocal}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {supplier.productCategories.slice(0, 2).map(cat => (
                            <span key={cat} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getScoreBadge(supplier.aiScore)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      {supplier.primaryEmail && <span title={supplier.primaryEmail}><Mail className="w-4 h-4" /></span>}
                      {supplier.phone && <span title={supplier.phone}><Phone className="w-4 h-4" /></span>}
                      {supplier.website && <span title={supplier.website}><Globe className="w-4 h-4" /></span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {supplier.country}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(supplier.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(supplier.discoveredAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {supplier.sourceUrl && (
                        <a
                          href={supplier.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-cyan-600"
                          title="查看來源"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onSelectSupplier(supplier)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="更多操作"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              顯示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedSuppliers.length)} 筆，共 {sortedSuppliers.length} 筆
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) page = currentPage - 2 + i;
                  if (currentPage > totalPages - 2) page = totalPages - 4 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page ? 'bg-cyan-600 text-white border-cyan-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 空狀態 */}
      {suppliers.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">沒有找到供應商</h3>
          <p className="text-gray-500">請嘗試調整篩選條件或搜尋關鍵詞</p>
        </div>
      )}
    </div>
  );
};

export default SupplierList;
