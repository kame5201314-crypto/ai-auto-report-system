import React, { useState } from 'react';
import { KOL, Collaboration, SalesTracking, KOLRating } from '../types/kol';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Star, Youtube, Facebook, Instagram, Twitter, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Share2, FileText, Wallet } from 'lucide-react';
import { FaTiktok, FaLine } from 'react-icons/fa';

interface KOLDetailProps {
  kol: KOL;
  collaborations: Collaboration[];
  salesTracking: SalesTracking[];
  onEdit: () => void;
  onBack: () => void;
  onViewCollaboration?: (collab: Collaboration) => void;
  onViewProfitShares?: (collab: Collaboration) => void;
}

const KOLDetail: React.FC<KOLDetailProps> = ({ kol, collaborations, salesTracking, onEdit, onBack, onViewCollaboration, onViewProfitShares }) => {
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

  // 計算該 KOL 所有專案的總分潤
  const getTotalProfitShares = () => {
    let totalRecords = 0;
    let totalAmount = 0;
    collaborations.forEach(collab => {
      if (collab.profitShares) {
        totalRecords += collab.profitShares.length;
        collab.profitShares.forEach(ps => {
          totalAmount += ps.totalAmount || ps.profitAmount + (ps.bonusAmount || 0);
        });
      }
    });
    return { totalRecords, totalAmount };
  };

  const { totalRecords, totalAmount } = getTotalProfitShares();

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
            NT$ {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 分潤記錄詳情 */}
      {totalRecords > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            分潤記錄 ({totalRecords} 筆)
          </h3>

          {/* 總覽統計 */}
          <div className="bg-gradient-to-r from-green-50 to-purple-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">分潤記錄總數</p>
                <p className="text-2xl font-bold text-purple-600">{totalRecords} 筆</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">累計分潤金額</p>
                <p className="text-2xl font-bold text-green-600">NT$ {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 詳細記錄列表 */}
          <div className="space-y-4">
            {collaborations.map(collab => {
              if (!collab.profitShares || collab.profitShares.length === 0) return null;

              return (
                <div key={collab.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-3 pb-3 border-b border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-1">{collab.projectName}</h4>
                    <p className="text-sm text-gray-600">商品: {collab.productName}</p>
                    <p className="text-xs text-gray-500 mt-1">專案期間: {collab.startDate} ~ {collab.endDate}</p>
                  </div>

                  <div className="space-y-3">
                    {collab.profitShares.map((ps) => {
                      const profitAmount = ps.profitAmount || (ps.salesAmount * ps.profitShareRate) / 100;
                      const bonusAmount = ps.bonusAmount || 0;
                      const total = ps.totalAmount || (profitAmount + bonusAmount);

                      return (
                        <div key={ps.id} className="bg-white border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800">
                                  {ps.periodStart} ~ {ps.periodEnd}
                                </span>
                                <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                                  {ps.period === 'monthly' ? '每月' : ps.period === 'quarterly' ? '每季' : ps.period === 'semi-annual' ? '每半年' : '每年'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">結算日期: {ps.settlementDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">總分潤</p>
                              <p className="text-xl font-bold text-green-600">NT$ {total.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-blue-50 rounded p-2">
                              <p className="text-xs text-gray-600 mb-1">銷售金額</p>
                              <p className="font-semibold text-blue-700">NT$ {ps.salesAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-purple-50 rounded p-2">
                              <p className="text-xs text-gray-600 mb-1">分潤比例</p>
                              <p className="font-semibold text-purple-700">{ps.profitShareRate}%</p>
                            </div>
                            <div className="bg-green-50 rounded p-2">
                              <p className="text-xs text-gray-600 mb-1">分潤金額</p>
                              <p className="font-semibold text-green-700">NT$ {profitAmount.toLocaleString()}</p>
                            </div>
                            {bonusAmount > 0 && (
                              <div className="bg-orange-50 rounded p-2">
                                <p className="text-xs text-gray-600 mb-1">額外獎金</p>
                                <p className="font-semibold text-orange-700">NT$ {bonusAmount.toLocaleString()}</p>
                              </div>
                            )}
                          </div>

                          {ps.note && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600">備註</p>
                              <p className="text-sm text-gray-700 mt-1">{ps.note}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
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
                          <p className="text-sm text-gray-600">{collab.productName}</p>
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

                      {/* 操作按鈕 */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-blue-200">
                        {onViewCollaboration && (
                          <button
                            onClick={() => onViewCollaboration(collab)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 bg-white hover:bg-blue-100 border border-blue-300 rounded-md transition-colors"
                          >
                            <FileText size={16} />
                            查看專案
                          </button>
                        )}
                        {onViewProfitShares && collab.profitShares && collab.profitShares.length > 0 && (
                          <button
                            onClick={() => onViewProfitShares(collab)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-white hover:bg-green-100 border border-green-300 rounded-md transition-colors"
                          >
                            <Wallet size={16} />
                            查看分潤 ({collab.profitShares.length})
                          </button>
                        )}
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
                            <p className="text-sm text-gray-600">{collab.productName}</p>
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

                        {/* 操作按鈕 */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                          {onViewCollaboration && (
                            <button
                              onClick={() => onViewCollaboration(collab)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-md transition-colors"
                            >
                              <FileText size={16} />
                              查看專案
                            </button>
                          )}
                          {onViewProfitShares && collab.profitShares && collab.profitShares.length > 0 && (
                            <button
                              onClick={() => onViewProfitShares(collab)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-white hover:bg-green-100 border border-green-300 rounded-md transition-colors"
                            >
                              <Wallet size={16} />
                              查看分潤 ({collab.profitShares.length})
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KOLDetail;
