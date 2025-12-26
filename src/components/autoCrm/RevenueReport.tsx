import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users,
  Calendar, ChevronLeft, ChevronRight, Download, Filter,
  PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  MonthlyReport,
  RevenueRecord,
  SERVICE_TYPE_LABELS,
  RevenueCategory
} from '../../types/autoCrm';
import { revenueService, customerService, serviceRecordService } from '../../services/autoCrmService';

const RevenueReport: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');

  useEffect(() => {
    loadReportData();
  }, [selectedYear, selectedMonth]);

  const loadReportData = () => {
    const report = revenueService.getMonthlyReport(selectedYear, selectedMonth);
    setMonthlyReport(report);

    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;
    const records = revenueService.getByDateRange(startDate, endDate);
    setRevenueRecords(records);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getCategoryLabel = (category: RevenueCategory) => {
    const labels = {
      service: '服務收入',
      parts: '零件收入',
      product: '產品銷售',
      other: '其他收入'
    };
    return labels[category];
  };

  const getCategoryColor = (category: RevenueCategory) => {
    const colors = {
      service: 'bg-blue-500',
      parts: 'bg-green-500',
      product: 'bg-purple-500',
      other: 'bg-gray-500'
    };
    return colors[category];
  };

  // 計算圓餅圖數據
  const pieChartData = monthlyReport?.revenueByCategory.map(item => ({
    ...item,
    percentage: monthlyReport.totalRevenue > 0
      ? (item.amount / monthlyReport.totalRevenue * 100).toFixed(1)
      : 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* 標題和操作列 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">營收報表</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* 月份選擇器 */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 font-medium text-gray-700 min-w-[120px] text-center">
              {selectedYear} 年 {selectedMonth} 月
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* 檢視模式切換 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'overview' ? 'bg-white shadow text-gray-800' : 'text-gray-600'
              }`}
            >
              總覽
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'details' ? 'bg-white shadow text-gray-800' : 'text-gray-600'
              }`}
            >
              明細
            </button>
          </div>
        </div>
      </div>

      {monthlyReport && viewMode === 'overview' && (
        <>
          {/* 主要指標 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本月營收</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(monthlyReport.totalRevenue)}
                  </p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    monthlyReport.revenueGrowthMoM >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {monthlyReport.revenueGrowthMoM >= 0
                      ? <ArrowUpRight className="w-4 h-4" />
                      : <ArrowDownRight className="w-4 h-4" />}
                    <span>{formatPercent(monthlyReport.revenueGrowthMoM)} 環比</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">毛利</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(monthlyReport.grossProfit)}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    毛利率 {monthlyReport.grossMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">服務數</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {monthlyReport.totalServiceCount}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    平均單價 {formatCurrency(monthlyReport.averageServiceValue)}
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">客戶數</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {monthlyReport.totalCustomerCount}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    新客戶 {monthlyReport.newCustomerCount} 位
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 分類營收和服務類型 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 營收分類 */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">營收分類</h3>
              <div className="flex items-center gap-8">
                {/* 圓餅圖視覺化 */}
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      let currentAngle = 0;
                      return pieChartData.map((item, index) => {
                        const percentage = parseFloat(item.percentage as string) || 0;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const endX = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                        const endY = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const colors = ['#3B82F6', '#22C55E', '#A855F7', '#6B7280'];

                        return (
                          <path
                            key={item.category}
                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                            fill={colors[index % colors.length]}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">總營收</p>
                      <p className="text-sm font-bold">{formatCurrency(monthlyReport.totalRevenue)}</p>
                    </div>
                  </div>
                </div>

                {/* 圖例 */}
                <div className="flex-1 space-y-3">
                  {pieChartData.map(item => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`} />
                        <span className="text-sm text-gray-600">{getCategoryLabel(item.category)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-800">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 服務類型營收 */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">服務類型營收</h3>
              <div className="space-y-4">
                {monthlyReport.revenueByServiceType.map(item => {
                  const maxAmount = Math.max(...monthlyReport.revenueByServiceType.map(i => i.amount));
                  const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

                  return (
                    <div key={item.serviceType}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {SERVICE_TYPE_LABELS[item.serviceType]}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-800">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({item.count} 筆)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {monthlyReport.revenueByServiceType.length === 0 && (
                  <p className="text-center text-gray-400 py-8">本月無服務記錄</p>
                )}
              </div>
            </div>
          </div>

          {/* 行銷成效 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">行銷成效</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">行銷支出</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {formatCurrency(monthlyReport.marketingCost)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">行銷 ROI</p>
                <p className={`text-2xl font-bold mt-2 ${
                  monthlyReport.marketingROI >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(monthlyReport.marketingROI)}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">客戶獲取成本</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {monthlyReport.newCustomerCount > 0
                    ? formatCurrency(monthlyReport.marketingCost / monthlyReport.newCustomerCount)
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 同比/環比分析 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">趨勢分析</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">環比增長（上月對比）</p>
                    <p className={`text-3xl font-bold mt-2 ${
                      monthlyReport.revenueGrowthMoM >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(monthlyReport.revenueGrowthMoM)}
                    </p>
                  </div>
                  {monthlyReport.revenueGrowthMoM >= 0
                    ? <TrendingUp className="w-12 h-12 text-green-200" />
                    : <TrendingDown className="w-12 h-12 text-red-200" />}
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">同比增長（去年同期）</p>
                    <p className={`text-3xl font-bold mt-2 ${
                      monthlyReport.revenueGrowthYoY >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(monthlyReport.revenueGrowthYoY)}
                    </p>
                  </div>
                  {monthlyReport.revenueGrowthYoY >= 0
                    ? <TrendingUp className="w-12 h-12 text-green-200" />
                    : <TrendingDown className="w-12 h-12 text-red-200" />}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 明細檢視 */}
      {viewMode === 'details' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              營收明細 ({revenueRecords.length} 筆記錄)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客戶</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">營收</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">成本</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">毛利</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {revenueRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getCategoryColor(record.category)} text-white`}>
                        {getCategoryLabel(record.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {record.customerName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {formatCurrency(record.cost)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${
                      record.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(record.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-sm text-gray-700">合計</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-800">
                    {formatCurrency(revenueRecords.reduce((sum, r) => sum + r.amount, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">
                    {formatCurrency(revenueRecords.reduce((sum, r) => sum + r.cost, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">
                    {formatCurrency(revenueRecords.reduce((sum, r) => sum + r.profit, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {revenueRecords.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">本月尚無營收記錄</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RevenueReport;
