import React, { useState } from 'react';
import { KOL, SocialPlatform, KOLRating, ProfitShareRecord, ProfitSharePeriod } from '../types/kol';
import { ArrowLeft, Plus, Trash2, Youtube, Facebook, Instagram, Twitter, DollarSign } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

interface KOLFormProps {
  kol: KOL | null;
  onSave: (kol: Partial<KOL>) => void;
  onCancel: () => void;
}

const KOLForm: React.FC<KOLFormProps> = ({ kol, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<KOL>>(
    kol || {
      name: '',
      nickname: '',
      email: '',
      phone: '',
      category: [],
      tags: [],
      rating: 'A' as KOLRating,
      note: '',
      socialPlatforms: [],
      profitShares: []
    }
  );

  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  // 分潤表單狀態
  const [newProfitShare, setNewProfitShare] = useState({
    period: 'monthly' as ProfitSharePeriod,
    periodStart: '',
    periodEnd: '',
    salesAmount: '',
    profitShareRate: '',
    note: ''
  });

  // 常用分類選項
  const categoryOptions = ['美妝', '時尚', '3C', '科技', '美食', '旅遊', '生活', '運動', '健身', '遊戲', '電競', '娛樂', '親子', '寵物', '財經', '教育'];

  // 評級選項
  const ratingOptions: KOLRating[] = ['S', 'A', 'B', 'C', 'D'];

  // 分潤週期選項
  const periodOptions = [
    { value: 'monthly', label: '每月' },
    { value: 'quarterly', label: '每季' },
    { value: 'yearly', label: '每年' }
  ];

  const handleAddCategory = () => {
    if (newCategory && !formData.category?.includes(newCategory)) {
      setFormData({
        ...formData,
        category: [...(formData.category || []), newCategory]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData({
      ...formData,
      category: formData.category?.filter(c => c !== category)
    });
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    });
  };

  const handleAddSocialPlatform = () => {
    const newPlatform: SocialPlatform = {
      platform: 'youtube',
      handle: '',
      url: '',
      followers: 0,
      engagement: 0,
      avgViews: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setFormData({
      ...formData,
      socialPlatforms: [...(formData.socialPlatforms || []), newPlatform]
    });
  };

  const handleUpdateSocialPlatform = (index: number, field: keyof SocialPlatform, value: any) => {
    const updatedPlatforms = [...(formData.socialPlatforms || [])];
    updatedPlatforms[index] = {
      ...updatedPlatforms[index],
      [field]: value
    };
    setFormData({
      ...formData,
      socialPlatforms: updatedPlatforms
    });
  };

  const handleRemoveSocialPlatform = (index: number) => {
    setFormData({
      ...formData,
      socialPlatforms: formData.socialPlatforms?.filter((_, i) => i !== index)
    });
  };

  const handleAddProfitShare = () => {
    const salesAmount = parseFloat(newProfitShare.salesAmount);
    const profitShareRate = parseFloat(newProfitShare.profitShareRate);

    if (!newProfitShare.periodStart || !newProfitShare.periodEnd || !salesAmount || !profitShareRate) {
      alert('請填寫完整的分潤資訊');
      return;
    }

    if (profitShareRate < 0 || profitShareRate > 100) {
      alert('分潤比例必須在 0-100 之間');
      return;
    }

    // 計算分潤金額
    const profitAmount = Math.round(salesAmount * (profitShareRate / 100));

    const newRecord: ProfitShareRecord = {
      id: Date.now().toString(),
      settlementDate: new Date().toISOString().split('T')[0],
      period: newProfitShare.period,
      periodStart: newProfitShare.periodStart,
      periodEnd: newProfitShare.periodEnd,
      salesAmount: salesAmount,
      profitShareRate: profitShareRate,
      profitAmount: profitAmount,
      note: newProfitShare.note,
      createdAt: new Date().toISOString()
    };

    setFormData({
      ...formData,
      profitShares: [...(formData.profitShares || []), newRecord]
    });

    // 重置表單
    setNewProfitShare({
      period: 'monthly',
      periodStart: '',
      periodEnd: '',
      salesAmount: '',
      profitShareRate: '',
      note: ''
    });
  };

  const handleRemoveProfitShare = (id: string) => {
    setFormData({
      ...formData,
      profitShares: formData.profitShares?.filter(ps => ps.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getPlatformIcon = (platform: string) => {
    const iconProps = { size: 18, className: 'text-gray-600' };
    switch (platform) {
      case 'youtube': return <Youtube {...iconProps} className="text-red-600" />;
      case 'facebook': return <Facebook {...iconProps} className="text-blue-600" />;
      case 'instagram': return <Instagram {...iconProps} className="text-pink-600" />;
      case 'tiktok': return <FaTiktok size={18} className="text-black" />;
      case 'twitter': return <Twitter {...iconProps} className="text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {kol ? '編輯 KOL' : '新增 KOL'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資料 */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">基本資料</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">真實姓名 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">暱稱/藝名 *</label>
              <input
                type="text"
                required
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話 *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">評級 *</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value as KOLRating })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ratingOptions.map(rating => (
                  <option key={rating} value={rating}>
                    {rating} 級 {rating === 'S' && '(最優)'}
                    {rating === 'A' && '(優秀)'}
                    {rating === 'B' && '(良好)'}
                    {rating === 'C' && '(普通)'}
                    {rating === 'D' && '(待加強)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 內容分類 */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">內容分類</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇分類</option>
                {categoryOptions.filter(c => !formData.category?.includes(c)).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.category?.map((cat, idx) => (
                <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {cat}
                  <button type="button" onClick={() => handleRemoveCategory(cat)}>
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 標籤 */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">標籤</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="輸入標籤"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, idx) => (
                <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 社群平台 */}
        <div className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">社群平台</h3>
            <button
              type="button"
              onClick={handleAddSocialPlatform}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} />
              新增平台
            </button>
          </div>
          <div className="space-y-4">
            {formData.socialPlatforms?.map((platform, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(platform.platform)}
                    <select
                      value={platform.platform}
                      onChange={(e) => handleUpdateSocialPlatform(idx, 'platform', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitter">Twitter</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialPlatform(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">帳號名稱</label>
                    <input
                      type="text"
                      value={platform.handle}
                      onChange={(e) => handleUpdateSocialPlatform(idx, 'handle', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">網址</label>
                    <input
                      type="url"
                      value={platform.url}
                      onChange={(e) => handleUpdateSocialPlatform(idx, 'url', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">粉絲數</label>
                    <input
                      type="number"
                      value={platform.followers}
                      onChange={(e) => handleUpdateSocialPlatform(idx, 'followers', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">互動率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={platform.engagement}
                      onChange={(e) => handleUpdateSocialPlatform(idx, 'engagement', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {platform.platform === 'youtube' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">平均觀看數</label>
                      <input
                        type="number"
                        value={platform.avgViews || 0}
                        onChange={(e) => handleUpdateSocialPlatform(idx, 'avgViews', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分潤管理 */}
        <div className="border-b pb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              分潤管理
            </h3>
          </div>

          {/* 新增分潤表單 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
            <h4 className="font-medium text-gray-700 mb-3">新增分潤記錄</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分潤週期 *</label>
                <select
                  value={newProfitShare.period}
                  onChange={(e) => setNewProfitShare({ ...newProfitShare, period: e.target.value as ProfitSharePeriod })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {periodOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期間開始 *</label>
                <input
                  type="date"
                  value={newProfitShare.periodStart}
                  onChange={(e) => setNewProfitShare({ ...newProfitShare, periodStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期間結束 *</label>
                <input
                  type="date"
                  value={newProfitShare.periodEnd}
                  onChange={(e) => setNewProfitShare({ ...newProfitShare, periodEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">銷售金額 (元) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newProfitShare.salesAmount}
                  onChange={(e) => setNewProfitShare({ ...newProfitShare, salesAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入銷售金額"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分潤比例 (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newProfitShare.profitShareRate}
                  onChange={(e) => setNewProfitShare({ ...newProfitShare, profitShareRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入分潤比例"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  預估分潤金額
                </label>
                <div className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-md text-green-700 font-semibold">
                  NT$ {newProfitShare.salesAmount && newProfitShare.profitShareRate
                    ? Math.round(parseFloat(newProfitShare.salesAmount) * (parseFloat(newProfitShare.profitShareRate) / 100)).toLocaleString()
                    : '0'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
              <input
                type="text"
                value={newProfitShare.note}
                onChange={(e) => setNewProfitShare({ ...newProfitShare, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="選填：輸入備註說明"
              />
            </div>

            <button
              type="button"
              onClick={handleAddProfitShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              結算並新增分潤記錄
            </button>
          </div>

          {/* 分潤記錄列表 */}
          {formData.profitShares && formData.profitShares.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">分潤歷史記錄</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">結算日期</th>
                      <th className="px-3 py-2 text-left">週期</th>
                      <th className="px-3 py-2 text-left">期間</th>
                      <th className="px-3 py-2 text-right">銷售金額</th>
                      <th className="px-3 py-2 text-right">分潤%</th>
                      <th className="px-3 py-2 text-right">分潤金額</th>
                      <th className="px-3 py-2 text-left">備註</th>
                      <th className="px-3 py-2 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.profitShares.map((ps) => (
                      <tr key={ps.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{ps.settlementDate}</td>
                        <td className="px-3 py-2">
                          {periodOptions.find(p => p.value === ps.period)?.label}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {ps.periodStart} ~ {ps.periodEnd}
                        </td>
                        <td className="px-3 py-2 text-right">
                          NT$ {ps.salesAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right">{ps.profitShareRate}%</td>
                        <td className="px-3 py-2 text-right font-semibold text-green-600">
                          NT$ {ps.profitAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">{ps.note || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProfitShare(ps.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-right">總計分潤金額：</td>
                      <td className="px-3 py-2 text-right text-green-700">
                        NT$ {formData.profitShares.reduce((sum, ps) => sum + ps.profitAmount, 0).toLocaleString()}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 備註 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">備註</h3>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="輸入備註資訊..."
          />
        </div>

        {/* 提交按鈕 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {kol ? '更新' : '新增'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export default KOLForm;
