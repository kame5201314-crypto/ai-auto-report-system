import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, TrendingUp, Users, Globe, Database,
  AlertTriangle, CheckCircle, Clock, Activity, Server,
  Cpu, HardDrive, Wifi, ChevronRight, Star, ArrowUpRight,
  PieChart, BarChart3, Calendar, RefreshCw
} from 'lucide-react';
import { DashboardStats, TrendData, TopSupplier, ProductCategory } from '../../types/sidas';
import { dashboardService } from '../../services/sidasService';

interface DashboardProps {
  onNavigate: (page: string, supplierId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<7 | 30>(7);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    setTrendData(dashboardService.getTrendData(trendPeriod, category));
  }, [trendPeriod, selectedCategory]);

  const loadDashboardData = () => {
    setStats(dashboardService.getStats());
    setTrendData(dashboardService.getTrendData(7));
    setTopSuppliers(dashboardService.getTopSuppliers(5));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-TW').format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  const getStatusBg = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-green-100';
      case 'degraded': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 計算趨勢圖最大值
  const maxTrendValue = Math.max(...trendData.map(d => d.count), 1);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SIDAS 儀表板</h1>
          <p className="text-gray-500 mt-1">供應商情報與數據採集系統總覽</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          刷新數據
        </button>
      </div>

      {/* 系統狀態總覽 */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-cyan-400" />
          <h2 className="font-semibold">系統狀態總覽</h2>
          <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-sm ${getStatusBg(stats.systemStatus.ipProxyPoolStatus)} ${getStatusColor(stats.systemStatus.ipProxyPoolStatus)}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {stats.systemStatus.ipProxyPoolStatus === 'healthy' ? '運行正常' :
             stats.systemStatus.ipProxyPoolStatus === 'degraded' ? '效能降低' : '緊急狀態'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="w-4 h-4" />
              上次採集
            </div>
            <p className="font-semibold">{formatDate(stats.systemStatus.lastAcquisitionTime)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Activity className="w-4 h-4" />
              成功率
            </div>
            <p className="font-semibold">{stats.systemStatus.acquisitionSuccessRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Wifi className="w-4 h-4" />
              代理池
            </div>
            <p className="font-semibold">{stats.systemStatus.activeProxies}/{stats.systemStatus.totalProxies}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Cpu className="w-4 h-4" />
              CPU
            </div>
            <p className="font-semibold">{stats.systemStatus.systemLoad}%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <HardDrive className="w-4 h-4" />
              記憶體
            </div>
            <p className="font-semibold">{stats.systemStatus.memoryUsage}%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              24h 錯誤
            </div>
            <p className={`font-semibold ${stats.systemStatus.errorsLast24h > 0 ? 'text-red-400' : ''}`}>
              {stats.systemStatus.errorsLast24h}
            </p>
          </div>
        </div>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">總供應商數</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(stats.totalSuppliers)}</p>
            </div>
            <Database className="w-10 h-10 text-cyan-200" />
          </div>
          <div className="mt-4 flex items-center text-cyan-100 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            本月新增 {stats.newSuppliersThisMonth}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">今日新發現</p>
              <p className="text-3xl font-bold mt-1">{stats.newSuppliersToday}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-emerald-200" />
          </div>
          <div className="mt-4 flex items-center text-emerald-100 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            本週 {stats.newSuppliersThisWeek}
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm">合作中</p>
              <p className="text-3xl font-bold mt-1">{stats.statusDistribution.cooperating}</p>
            </div>
            <Users className="w-10 h-10 text-violet-200" />
          </div>
          <div className="mt-4 flex items-center text-violet-100 text-sm">
            <Activity className="w-4 h-4 mr-1" />
            洽談中 {stats.statusDistribution.negotiating}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">待聯繫</p>
              <p className="text-3xl font-bold mt-1">{stats.statusDistribution.not_contacted}</p>
            </div>
            <Globe className="w-10 h-10 text-amber-200" />
          </div>
          <div className="mt-4 flex items-center text-amber-100 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            已聯繫 {stats.statusDistribution.contacted}
          </div>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 新名單趨勢分析 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              新名單趨勢分析
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
                className="text-sm border rounded-lg px-2 py-1"
              >
                <option value="all">全部類別</option>
                <option value="APEXEL">APEXEL</option>
                <option value="MEFU">MEFU</option>
                <option value="ACCESSORIES">配件</option>
                <option value="ELECTRONICS">電子</option>
                <option value="OTHER">其他</option>
              </select>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setTrendPeriod(7)}
                  className={`px-3 py-1 text-sm ${trendPeriod === 7 ? 'bg-cyan-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  7天
                </button>
                <button
                  onClick={() => setTrendPeriod(30)}
                  className={`px-3 py-1 text-sm ${trendPeriod === 30 ? 'bg-cyan-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  30天
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            {/* 簡易長條圖 */}
            <div className="flex items-end gap-1 h-48">
              {trendData.slice(-14).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t hover:from-cyan-600 hover:to-cyan-500 transition-colors cursor-pointer"
                    style={{ height: `${(d.count / maxTrendValue) * 100}%`, minHeight: '4px' }}
                    title={`${d.date}: ${d.count} 筆`}
                  />
                  <span className="text-xs text-gray-400 rotate-45 origin-left">
                    {new Date(d.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>平均: {Math.round(trendData.reduce((sum, d) => sum + d.count, 0) / trendData.length)} 筆/天</span>
              <span>總計: {trendData.reduce((sum, d) => sum + d.count, 0)} 筆</span>
            </div>
          </div>
        </div>

        {/* 高潛力供應商 Top 5 */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              高潛力供應商 Top 5
            </h2>
            <button
              onClick={() => onNavigate('suppliers')}
              className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            {topSuppliers.length > 0 ? (
              <div className="space-y-3">
                {topSuppliers.map((item, index) => (
                  <div
                    key={item.supplier.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('supplier-detail', item.supplier.id)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 truncate">
                          {item.supplier.companyName}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.supplier.aiScore)}`}>
                          {item.supplier.aiScore}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.supplier.country} · {item.supplier.productCategories.join(', ')}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.highlightReasons.slice(0, 2).map((reason, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-2" />
                <p>暫無高潛力供應商</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 數據分類分佈 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 產品類別分佈 */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 p-4 border-b">
            <PieChart className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-gray-800">產品類別分佈</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(stats.categoryDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => {
                  const percentage = (count / stats.totalSuppliers * 100).toFixed(1);
                  const colors: Record<string, string> = {
                    'APEXEL': 'bg-cyan-500',
                    'MEFU': 'bg-violet-500',
                    'ACCESSORIES': 'bg-amber-500',
                    'ELECTRONICS': 'bg-emerald-500',
                    'OTHER': 'bg-gray-500'
                  };
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{category}</span>
                        <span className="text-gray-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[category] || 'bg-gray-500'} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* 國家/地區分佈 */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 p-4 border-b">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-800">國家/地區分佈</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(stats.countryDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([country, count], index) => {
                  const percentage = (count / stats.totalSuppliers * 100).toFixed(1);
                  const colors = [
                    'bg-cyan-500',
                    'bg-emerald-500',
                    'bg-violet-500',
                    'bg-amber-500',
                    'bg-pink-500',
                    'bg-gray-500'
                  ];
                  return (
                    <div key={country}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{country}</span>
                        <span className="text-gray-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[index]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('suppliers')}
            className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors group"
          >
            <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">供應商名單</p>
              <p className="text-xs text-gray-500">查詢與篩選</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('acquisition')}
            className="flex items-center gap-3 p-4 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors group"
          >
            <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200">
              <Database className="w-6 h-6 text-violet-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">數據採集</p>
              <p className="text-xs text-gray-500">管理採集任務</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('ai-config')}
            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group"
          >
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">AI 模型</p>
              <p className="text-xs text-gray-500">配置與訓練</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('acquisition')}
            className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors group"
          >
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">合規報告</p>
              <p className="text-xs text-gray-500">採集合規檢視</p>
            </div>
          </button>
        </div>
      </div>

      {/* 採集統計摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Database className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.acquisitionStats.totalAcquisitions)}</p>
            <p className="text-sm text-gray-500">總採集次數</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.acquisitionStats.successfulAcquisitions)}</p>
            <p className="text-sm text-gray-500">成功採集</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.acquisitionStats.failedAcquisitions}</p>
            <p className="text-sm text-gray-500">失敗採集</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Activity className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {((stats.acquisitionStats.successfulAcquisitions / stats.acquisitionStats.totalAcquisitions) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">採集成功率</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
