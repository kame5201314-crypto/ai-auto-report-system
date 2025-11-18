import React, { useState } from 'react';
import { KOL, KOLRating, Collaboration } from '../types/kol';
import { Plus, Search, Edit2, Trash2, Eye, Star, Youtube, Facebook, Instagram, Twitter, DollarSign } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

interface KOLListProps {
  kols: KOL[];
  collaborations: Collaboration[];
  onAddKOL: () => void;
  onEditKOL: (kol: KOL) => void;
  onViewKOL: (kol: KOL) => void;
  onDeleteKOL: (id: number) => void;
}

const KOLList: React.FC<KOLListProps> = ({ kols, collaborations, onAddKOL, onEditKOL, onViewKOL, onDeleteKOL }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('全部');

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

  // 計算 KOL 的總分潤金額（從所有合作專案中）
  const getTotalProfitAmount = (kolId: number) => {
    const kolCollaborations = collaborations.filter(c => c.kolId === kolId);
    let total = 0;
    kolCollaborations.forEach(collab => {
      if (collab.profitShares) {
        collab.profitShares.forEach(ps => {
          total += ps.totalAmount || ps.profitAmount + (ps.bonusAmount || 0);
        });
      }
    });
    return total;
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
          <div
            key={kol.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
            onClick={() => onViewKOL(kol)}
          >
            {/* 卡片頭部 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{kol.name}</h3>
                  {kol.nickname && <p className="text-sm opacity-90">@{kol.nickname}</p>}
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
              <div className="pt-2 border-t grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">總粉絲數</p>
                  <p className="font-semibold text-gray-800">
                    {getTotalFollowers(kol).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <DollarSign size={12} />
                    總分潤金額
                  </p>
                  <p className="font-semibold text-green-600">
                    NT$ {getTotalProfitAmount(kol.id).toLocaleString()}
                  </p>
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
              <div className="flex justify-end gap-3 pt-2 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewKOL(kol);
                  }}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  title="查看"
                >
                  <Eye size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditKOL(kol);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="編輯"
                >
                  <Edit2 size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('確定要刪除此 KOL 嗎？相關的合作專案也會一併刪除。')) {
                      onDeleteKOL(kol.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="刪除"
                >
                  <Trash2 size={20} />
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

    </div>
  );
};

export default KOLList;
