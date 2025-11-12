import React, { useState } from 'react';
import { KOL, KOLRating } from '../types/kol';
import { Plus, Search, Edit2, Trash2, Eye, Star, Youtube, Facebook, Instagram, Twitter, Bell } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { getPendingProfitShares, getDaysUntilEnd, getPeriodLabel } from '../utils/profitShareUtils';

interface KOLListProps {
  kols: KOL[];
  onAddKOL: () => void;
  onEditKOL: (kol: KOL) => void;
  onViewKOL: (kol: KOL) => void;
  onDeleteKOL: (id: number) => void;
}

const KOLList: React.FC<KOLListProps> = ({ kols, onAddKOL, onEditKOL, onViewKOL, onDeleteKOL }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('全部');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedKOLForReminder, setSelectedKOLForReminder] = useState<KOL | null>(null);

  // 取得評級樣式
  const getRatingStyle = (rating: KOLRating) => {
    const styles = {
      'S': 'bg-purple-600 text-white',
      'A': 'bg-green-600 text-white',
      'B': 'bg-blue-600 text-white',
      'C': 'bg-yellow-600 text-white',
      'D': 'bg-gray-600 text-white'
    };
    return styles[rating] || styles['C'];
  };

  // 取得所有分類
  const allCategories = ['全部', ...Array.from(new Set(kols.flatMap(k => k.category)))];

  // 取得所有平台
  const allPlatforms = ['全部', 'youtube', 'instagram', 'facebook', 'tiktok', 'twitter'];

  // 篩選 KOL
  const filteredKOLs = kols.filter(kol => {
    const matchesSearch =
      kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kol.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kol.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === '全部' || kol.category.includes(selectedCategory);

    const matchesPlatform = selectedPlatform === '全部' ||
      kol.socialPlatforms.some(p => p.platform === selectedPlatform);

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  // 計算總粉絲數
  const getTotalFollowers = (kol: KOL) => {
    return kol.socialPlatforms.reduce((sum, p) => sum + p.followers, 0);
  };

  // 計算平均互動率
  const getAvgEngagement = (kol: KOL) => {
    if (kol.socialPlatforms.length === 0) return 0;
    const total = kol.socialPlatforms.reduce((sum, p) => sum + p.engagement, 0);
    return (total / kol.socialPlatforms.length).toFixed(1);
  };

  // 取得平台圖示
  const getPlatformIcon = (platform: string, size: number = 16) => {
    const iconProps = { size, className: 'text-gray-600' };
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
      {/* 頂部操作區 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">KOL 列表</h2>
          <button
            onClick={onAddKOL}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新增 KOL
          </button>
        </div>

        {/* 搜尋與篩選 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜尋 KOL 名稱、暱稱或標籤..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allPlatforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === '全部' ? '全部平台' : platform.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* 統計資訊 */}
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span>總計: <strong className="text-gray-800">{kols.length}</strong> 位 KOL</span>
          <span>|</span>
          <span>搜尋結果: <strong className="text-blue-600">{filteredKOLs.length}</strong> 位</span>
        </div>
      </div>

      {/* KOL 卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKOLs.map(kol => (
          <div key={kol.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            {/* 卡片頭部 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 flex-1">
                  <div>
                    <h3 className="text-xl font-bold">{kol.name}</h3>
                    <p className="text-sm opacity-90">@{kol.nickname}</p>
                  </div>
                  {getPendingProfitShares(kol.profitShares).length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedKOLForReminder(kol);
                        setShowReminderModal(true);
                      }}
                      className="relative p-1.5 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-300 transition-colors animate-pulse"
                      title="有待處理的分潤提醒"
                    >
                      <Bell size={18} />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {getPendingProfitShares(kol.profitShares).length}
                      </span>
                    </button>
                  )}
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm ${getRatingStyle(kol.rating)}`}>
                  {kol.rating} 級
                </div>
              </div>
            </div>

            {/* 卡片內容 */}
            <div className="p-4 space-y-3">
              {/* 分類標籤 */}
              <div className="flex flex-wrap gap-2">
                {kol.category.slice(0, 3).map((cat, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>

              {/* 社群平台 */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">社群平台</p>
                <div className="flex flex-wrap gap-3">
                  {kol.socialPlatforms.map((platform, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      {getPlatformIcon(platform.platform, 14)}
                      <span className="text-xs text-gray-600">
                        {platform.followers >= 1000000
                          ? `${(platform.followers / 1000000).toFixed(1)}M`
                          : platform.followers >= 1000
                          ? `${(platform.followers / 1000).toFixed(0)}K`
                          : platform.followers}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 統計資料 */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-500">總粉絲數</p>
                  <p className="font-semibold text-gray-800">
                    {getTotalFollowers(kol).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">平均互動率</p>
                  <p className="font-semibold text-green-600">{getAvgEngagement(kol)}%</p>
                </div>
              </div>

              {/* 標籤 */}
              {kol.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {kol.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onViewKOL(kol)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
                >
                  <Eye size={16} />
                  查看
                </button>
                <button
                  onClick={() => onEditKOL(kol)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                  title="編輯"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteKOL(kol.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  title="刪除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空狀態 */}
      {filteredKOLs.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">找不到符合條件的 KOL</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('全部');
              setSelectedPlatform('全部');
            }}
            className="mt-4 text-blue-600 hover:underline"
          >
            清除篩選條件
          </button>
        </div>
      )}

      {/* 分潤提醒彈窗 */}
      {showReminderModal && selectedKOLForReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell size={28} />
                  <div>
                    <h2 className="text-2xl font-bold">分潤提醒</h2>
                    <p className="text-sm opacity-90">{selectedKOLForReminder.name} (@{selectedKOLForReminder.nickname})</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReminderModal(false);
                    setSelectedKOLForReminder(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <p className="text-gray-600 mb-4">以下分潤記錄即將到期，請及時處理：</p>
              <div className="space-y-4">
                {getPendingProfitShares(selectedKOLForReminder.profitShares).map(share => {
                  const daysLeft = getDaysUntilEnd(share.periodEnd);
                  return (
                    <div key={share.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {getPeriodLabel(share.period)} 分潤
                          </h4>
                          <p className="text-sm text-gray-600">
                            期間：{share.periodStart} ~ {share.periodEnd}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          daysLeft <= 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {daysLeft} 天後到期
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">銷售金額</p>
                          <p className="font-semibold text-gray-800">NT$ {share.salesAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">分潤金額</p>
                          <p className="font-semibold text-green-600">NT$ {share.profitAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      {share.note && (
                        <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                          <span className="font-medium">備註：</span>{share.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setSelectedKOLForReminder(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                關閉
              </button>
              <button
                onClick={() => {
                  onEditKOL(selectedKOLForReminder);
                  setShowReminderModal(false);
                  setSelectedKOLForReminder(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                前往處理分潤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KOLList;
