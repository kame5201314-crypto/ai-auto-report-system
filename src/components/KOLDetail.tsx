import React, { useState } from 'react';
import { KOL, Collaboration, SalesTracking, KOLRating } from '../types/kol';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Star, Youtube, Facebook, Instagram, Twitter, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Share2, FileText } from 'lucide-react';
import { FaTiktok, FaLine } from 'react-icons/fa';
import ContractGenerator from './ContractGenerator';

interface KOLDetailProps {
  kol: KOL;
  collaborations: Collaboration[];
  salesTracking: SalesTracking[];
  onEdit: () => void;
  onBack: () => void;
}

const KOLDetail: React.FC<KOLDetailProps> = ({ kol, collaborations, salesTracking, onEdit, onBack }) => {
  const [showContractGenerator, setShowContractGenerator] = useState(false);
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
  // 計算總粉絲數
  const totalFollowers = kol.socialPlatforms.reduce((sum, p) => sum + p.followers, 0);

  // 計算總收益
  const totalRevenue = salesTracking.reduce((sum, s) => sum + s.revenue, 0);

  // 計算總佣金
  const totalCommission = salesTracking.reduce((sum, s) => sum + s.commission, 0);

  // 進行中的合作
  const activeCollaborations = collaborations.filter(c => c.status === 'in_progress' || c.status === 'confirmed');

  // 已完成的合作
  const completedCollaborations = collaborations.filter(c => c.status === 'completed');

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

  // 取得狀態標籤顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-purple-100 text-purple-700';
      case 'negotiating': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 取得狀態文字
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '待確認',
      'negotiating': '洽談中',
      'confirmed': '已確認',
      'in_progress': '進行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* 返回按鈕 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={20} />
        返回列表
      </button>

      {/* KOL 基本資訊卡片 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{kol.name}</h1>
              {kol.nickname && <p className="text-lg opacity-90">@{kol.nickname}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowContractGenerator(true)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md transition-colors"
              >
                <FileText size={18} />
                生成合約
              </button>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md transition-colors"
              >
                <Edit size={18} />
                編輯
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getRatingStyle(kol.rating)}`}>
              {kol.rating} 級
            </div>
            <div className="flex flex-wrap gap-2">
              {kol.category.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 聯絡資訊 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">聯絡資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-blue-600" />
                <a href={`mailto:${kol.email}`} className="hover:underline">{kol.email}</a>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-green-600" />
                <a href={`tel:${kol.phone}`} className="hover:underline">{kol.phone}</a>
              </div>
              {kol.facebookUrl && (
                <div className="flex items-center gap-3">
                  <a
                    href={kol.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Facebook size={18} />
                    聯絡 Facebook
                  </a>
                </div>
              )}
              {kol.lineUrl && (
                <div className="flex items-center gap-3">
                  <a
                    href={kol.lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <FaLine size={18} />
                    聯絡 Line
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 標籤 */}
          {kol.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">標籤</h3>
              <div className="flex flex-wrap gap-2">
                {kol.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 備註 */}
          {kol.note && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">備註</h3>
              <p className="text-gray-600">{kol.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* 統計摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <span className="text-gray-600 text-sm">總粉絲數</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalFollowers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-gray-600 text-sm">總營業額</span>
          </div>
          <p className="text-2xl font-bold text-green-600">NT$ {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-purple-600" size={24} />
            <span className="text-gray-600 text-sm">總分潤金額</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            NT$ {kol.profitShares?.reduce((sum, ps) => sum + ps.profitAmount, 0).toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* 分潤記錄摘要 - 僅顯示連結 */}
      {kol.profitShares && kol.profitShares.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            分潤記錄
          </h3>
          <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">此 KOL 共有 {kol.profitShares.length} 筆分潤記錄</p>
              <p className="text-lg font-bold text-purple-600">
                總分潤金額：NT$ {kol.profitShares.reduce((sum, ps) => sum + (ps.totalAmount || ps.profitAmount), 0).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              <Eye size={18} />
              查看完整分潤記錄
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 提示：完整的分潤管理功能已移至「合作專案」模組</p>
        </div>
      )}

      {/* 社群平台資料 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">社群平台資料</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kol.socialPlatforms.map((platform, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                {getPlatformIcon(platform.platform, 24)}
                <div>
                  <p className="font-semibold text-gray-800">{platform.platform.toUpperCase()}</p>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {platform.handle}
                  </a>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">粉絲數:</span>
                  <span className="font-semibold">{platform.followers.toLocaleString()}</span>
                </div>
                {platform.avgViews !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均觀看:</span>
                    <span className="font-semibold">{platform.avgViews.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">更新日期:</span>
                  <span className="text-xs text-gray-500">{platform.lastUpdated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 合作專案 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          合作專案 ({collaborations.length})
        </h3>

        {collaborations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">尚無合作專案</p>
        ) : (
          <div className="space-y-4">
            {/* 進行中的合作 */}
            {activeCollaborations.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">進行中 ({activeCollaborations.length})</h4>
                <div className="space-y-3">
                  {activeCollaborations.map(collab => (
                    <div key={collab.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-gray-800">{collab.projectName}</h5>
                          <p className="text-sm text-gray-600">{collab.brand}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(collab.status)}`}>
                          {getStatusText(collab.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div>
                          <span className="text-gray-600">期間:</span>
                          <span className="ml-2 font-medium">{collab.startDate} ~ {collab.endDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">預算:</span>
                          <span className="ml-2 font-medium text-green-600">NT$ {collab.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-600">平台:</span>
                        <div className="flex gap-2 mt-1">
                          {collab.platforms.map((p, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {getPlatformIcon(p, 14)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 已完成的合作 */}
            {completedCollaborations.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">已完成 ({completedCollaborations.length})</h4>
                <div className="space-y-3">
                  {completedCollaborations.map(collab => {
                    const tracking = salesTracking.find(s => s.collaborationId === collab.id);
                    return (
                      <div key={collab.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-800">{collab.projectName}</h5>
                            <p className="text-sm text-gray-600">{collab.brand}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(collab.status)}`}>
                            {getStatusText(collab.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                          <div>
                            <span className="text-gray-600">期間:</span>
                            <span className="ml-2 font-medium">{collab.startDate} ~ {collab.endDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">預算:</span>
                            <span className="ml-2 font-medium text-green-600">NT$ {collab.budget.toLocaleString()}</span>
                          </div>
                        </div>
                        {tracking && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">銷售成效</p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">點擊:</span>
                                <span className="ml-1 font-medium">{tracking.clicks.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">轉換:</span>
                                <span className="ml-1 font-medium">{tracking.conversions.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">收益:</span>
                                <span className="ml-1 font-medium text-green-600">NT$ {tracking.revenue.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 合約生成器 */}
      {showContractGenerator && (
        <ContractGenerator
          kol={kol}
          onClose={() => setShowContractGenerator(false)}
        />
      )}
    </div>
  );
};

export default KOLDetail;
