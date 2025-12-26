import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink, Trash2, Search, BarChart3, ChevronDown } from 'lucide-react';
import { mockAffiliateLinks, mockProducts } from '../services/mockData';
import { AffiliateLink } from '../types';

export default function LinksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'clicks'>('date');

  const handleCopyLink = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allLinks: AffiliateLink[] = [
    ...mockAffiliateLinks,
    ...mockProducts.slice(2).map((product, index) => ({
      id: `mock-${index}`,
      productId: product.id,
      originUrl: product.sourceUrl,
      affiliateUrl: `https://shope.ee/AFF${Date.now() + index}`,
      shortUrl: `https://aff.tw/s/${product.id}${index}`,
      clicks: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    })),
  ];

  const filteredLinks = allLinks.filter((link) => {
    const product = mockProducts.find((p) => p.id === link.productId);
    return product?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => sortBy === 'clicks' ? b.clicks - a.clicks : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalClicks = allLinks.reduce((sum, link) => sum + link.clicks, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">聯盟連結管理</h1>
          <p className="text-gray-600">管理和追蹤你的所有聯盟連結</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Link2 className="w-6 h-6" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{allLinks.length}</p><p className="text-sm text-gray-500">總連結數</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{totalClicks}</p><p className="text-sm text-gray-500">總點擊數</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center"><span className="text-xl">💰</span></div>
            <div><p className="text-2xl font-bold text-gray-900">${Math.round(totalClicks * 0.5)}</p><p className="text-sm text-gray-500">預估收益</p></div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜尋商品名稱..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
        </div>
        <div className="relative">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
            <option value="date">依建立時間</option>
            <option value="clicks">依點擊數</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-500 border-b border-gray-200">
              <th className="px-6 py-3 font-medium">商品</th>
              <th className="px-6 py-3 font-medium">短網址</th>
              <th className="px-6 py-3 font-medium text-right">點擊數</th>
              <th className="px-6 py-3 font-medium text-right">建立時間</th>
              <th className="px-6 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedLinks.map((link) => {
              const product = mockProducts.find((p) => p.id === link.productId);
              return (
                <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product?.imageUrl} alt={product?.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div><p className="font-medium text-gray-900 line-clamp-1">{product?.name || '未知商品'}</p><p className="text-sm text-gray-500">${product?.price}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{link.shortUrl}</code></td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{link.clicks}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">{new Date(link.createdAt).toLocaleDateString('zh-TW')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleCopyLink(link.id, link.shortUrl)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition" title="複製連結">
                        {copiedId === link.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a href={link.originUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition" title="查看原始商品"><ExternalLink className="w-4 h-4" /></a>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="刪除"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedLinks.length === 0 && <div className="text-center py-12 text-gray-500"><Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>沒有找到符合條件的連結</p></div>}
      </div>
    </div>
  );
}
