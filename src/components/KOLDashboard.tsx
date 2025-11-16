import React from 'react';
import { KOL, Collaboration, SalesTracking } from '../types/kol';
import { Users, Briefcase, DollarSign, TrendingUp, Star, Youtube, Facebook, Instagram, Twitter, BarChart } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

interface KOLDashboardProps {
  kols: KOL[];
  collaborations: Collaboration[];
  salesTracking: SalesTracking[];
}

const KOLDashboard: React.FC<KOLDashboardProps> = ({ kols, collaborations, salesTracking }) => {
  // 獲取當前月份
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM 格式

  // 計算總粉絲數
  const totalFollowers = kols.reduce((sum, kol) => {
    return sum + kol.socialPlatforms.reduce((s, p) => s + p.followers, 0);
  }, 0);

  // 計算總收益
  const totalRevenue = salesTracking.reduce((sum, s) => sum + s.revenue, 0);

  // 計算本月銷售金額
  const monthlyRevenue = salesTracking
    .filter(s => s.createdAt.startsWith(currentMonth))
    .reduce((sum, s) => sum + s.revenue, 0);

  // 計算總預算
  const totalBudget = collaborations.reduce((sum, c) => sum + c.budget, 0);

  // 計算本月合作花費 (當月開始的合作)
  const monthlySpending = collaborations
    .filter(c => c.startDate.startsWith(currentMonth))
    .reduce((sum, c) => sum + c.actualCost, 0);

  // 進行中的合作
  const activeCollaborations = collaborations.filter(c => c.status === 'in_progress' || c.status === 'confirmed');

  // 已完成的合作
  const completedCollaborations = collaborations.filter(c => c.status === 'completed');

  // 計算總 ROI
  const roi = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget * 100).toFixed(1) : 0;

  // 計算本月 ROI
  const monthlyROI = monthlySpending > 0 ? ((monthlyRevenue - monthlySpending) / monthlySpending * 100).toFixed(1) : 0;

  // 取得表現最佳的前 10 位 KOL
  const topPerformingKOLs = kols
    .map(kol => {
      const kolTracking = salesTracking.filter(s => s.kolId === kol.id);
      const revenue = kolTracking.reduce((sum, s) => sum + s.revenue, 0);
      const kolCollaborations = collaborations.filter(c => c.kolId === kol.id);
      const cost = kolCollaborations.reduce((sum, c) => sum + c.actualCost, 0);
      const kolROI = cost > 0 ? ((revenue - cost) / cost * 100) : 0;
      return { kol, revenue, cost, roi: kolROI };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // 按分類統計 KOL
  const categoryStats = kols.reduce((acc, kol) => {
    kol.category.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 按平台統計
  const platformStats = kols.reduce((acc, kol) => {
    kol.socialPlatforms.forEach(p => {
      if (!acc[p.platform]) {
        acc[p.platform] = { count: 0, followers: 0 };
      }
      acc[p.platform].count++;
      acc[p.platform].followers += p.followers;
    });
    return acc;
  }, {} as Record<string, { count: number; followers: number }>);

  // 取得平台圖示
  const getPlatformIcon = (platform: string, size: number = 20) => {
    const iconProps = { size };
    switch (platform) {
      case 'youtube': return <Youtube {...iconProps} className="text-red-600" />;
      case 'facebook': return <Facebook {...iconProps} className="text-blue-600" />;
      case 'instagram': return <Instagram {...iconProps} className="text-pink-600" />;
      case 'tiktok': return <FaTiktok size={size} className="text-black" />;
      case 'twitter': return <Twitter {...iconProps} className="text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">統計儀表板</h2>

      {/* 核心指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">KOL 數量</span>
            <Users className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{kols.length}</p>
          <p className="text-sm text-gray-500 mt-1">位合作 KOL</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">總粉絲數</span>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {totalFollowers >= 1000000
              ? `${(totalFollowers / 1000000).toFixed(1)}M`
              : totalFollowers >= 1000
              ? `${(totalFollowers / 1000).toFixed(0)}K`
              : totalFollowers}
          </p>
          <p className="text-sm text-gray-500 mt-1">跨所有平台</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">進行中合作</span>
            <Briefcase className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{activeCollaborations.length}</p>
          <p className="text-sm text-gray-500 mt-1">個專案進行中</p>
        </div>
      </div>

      {/* 本月財務指標 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-5 flex items-center gap-2">
          <BarChart className="text-blue-600" size={26} />
          本月財務數據
          <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{currentMonth}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <DollarSign size={24} className="text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">本月銷售金額</span>
            </div>
            <p className="text-3xl font-bold text-cyan-700">NT$ {monthlyRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">當月業績表現</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign size={24} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">本月合作花費</span>
            </div>
            <p className="text-3xl font-bold text-amber-700">NT$ {monthlySpending.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">當月行銷投入</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp size={24} className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">本月 ROI</span>
            </div>
            <p className="text-3xl font-bold text-indigo-700">{monthlyROI}%</p>
            <p className="text-xs text-gray-500 mt-2">當月投資回報率</p>
          </div>
        </div>
      </div>

      {/* 總體財務指標 */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg shadow-md p-6 border-2 border-gray-300">
        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <TrendingUp className="text-gray-700" size={26} />
          累計財務數據
          <span className="ml-2 text-sm font-normal text-gray-600 bg-gray-200 px-3 py-1 rounded-full">總計</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign size={24} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">總銷售金額</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">NT$ {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">來自 {salesTracking.length} 筆追蹤</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-rose-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <DollarSign size={24} className="text-rose-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">總行銷預算</span>
            </div>
            <p className="text-3xl font-bold text-rose-700">NT$ {totalBudget.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">共 {collaborations.length} 個專案</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-violet-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <TrendingUp size={24} className="text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">總 ROI</span>
            </div>
            <p className="text-3xl font-bold text-violet-700">{roi}%</p>
            <p className="text-xs text-gray-500 mt-2">總投資回報率</p>
          </div>
        </div>
      </div>

      {/* 成效最佳前 10 位 KOL */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" size={24} />
          成效最佳前 10 位 KOL
        </h3>
        <div className="space-y-2">
          {topPerformingKOLs.map(({ kol, revenue, cost, roi }, idx) => (
            <div key={kol.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                  idx === 1 ? 'bg-gray-100 text-gray-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{kol.name}</p>
                  {kol.nickname && <p className="text-xs text-gray-500">@{kol.nickname}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">NT$ {revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">成本: NT$ {cost.toLocaleString()}</p>
                <p className={`text-xs font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ROI: {roi.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
          {topPerformingKOLs.length === 0 && (
            <p className="text-gray-500 text-center py-8">尚無數據</p>
          )}
        </div>
      </div>

      {/* 兩欄佈局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 熱門分類 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">KOL 分類分布</h3>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">{category}</span>
                  <span className="text-gray-600">{count} 位</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(count / kols.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-gray-500 text-center py-8">尚無數據</p>
            )}
          </div>
        </div>

        {/* 平台分布 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">社群平台統計</h3>
          <div className="space-y-4">
            {Object.entries(platformStats).map(([platform, stats]) => (
              <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getPlatformIcon(platform, 24)}
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">{platform}</p>
                    <p className="text-sm text-gray-500">{stats.count} 個帳號</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {stats.followers >= 1000000
                      ? `${(stats.followers / 1000000).toFixed(1)}M`
                      : stats.followers >= 1000
                      ? `${(stats.followers / 1000).toFixed(0)}K`
                      : stats.followers}
                  </p>
                  <p className="text-xs text-gray-500">總粉絲</p>
                </div>
              </div>
            ))}
            {Object.keys(platformStats).length === 0 && (
              <p className="text-gray-500 text-center py-8">尚無數據</p>
            )}
          </div>
        </div>

        {/* 合作專案狀態 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">合作專案狀態</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <div>
                <p className="text-sm text-gray-600">進行中</p>
                <p className="text-2xl font-bold text-blue-600">{activeCollaborations.length}</p>
              </div>
              <Briefcase className="text-blue-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">{completedCollaborations.length}</p>
              </div>
              <BarChart className="text-green-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
              <div>
                <p className="text-sm text-gray-600">總計</p>
                <p className="text-2xl font-bold text-purple-600">{collaborations.length}</p>
              </div>
              <Briefcase className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOLDashboard;
