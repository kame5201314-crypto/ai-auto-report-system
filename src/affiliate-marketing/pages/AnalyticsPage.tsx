import React, { useState } from 'react';
import { BarChart3, TrendingUp, MousePointer, FileText, Calendar, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { mockAnalytics, mockProducts } from '../services/mockData';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const analytics = mockAnalytics;

  const dailyClicksData = [
    { day: '週一', clicks: 45, posts: 2 },
    { day: '週二', clicks: 52, posts: 3 },
    { day: '週三', clicks: 38, posts: 1 },
    { day: '週四', clicks: 65, posts: 4 },
    { day: '週五', clicks: 78, posts: 3 },
    { day: '週六', clicks: 92, posts: 2 },
    { day: '週日', clicks: 70, posts: 3 },
  ];

  const platformData = analytics.platformStats.map((stat) => ({
    name: stat.platform === 'facebook' ? 'FB' : stat.platform === 'instagram' ? 'IG' : 'LINE',
    value: stat.clicks,
    posts: stat.posts,
  }));

  const contentTypeData = analytics.contentTypeStats.map((stat) => ({
    name: stat.type === 'list' ? '清單文' : stat.type === 'single' ? '開箱文' : stat.type === 'compare' ? '比較文' : 'AI 選物',
    clicks: stat.clicks,
    posts: stat.posts,
  }));

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分析儀表板</h1>
          <p className="text-gray-600">追蹤你的聯盟行銷成效</p>
        </div>
        <div className="relative">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)} className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
            <option value="week">本週</option>
            <option value="month">本月</option>
            <option value="year">本年度</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <FileText className="w-6 h-6" />, label: dateRange === 'week' ? '本週貼文數' : '本月貼文數', value: dateRange === 'week' ? analytics.totalPostsThisWeek : analytics.totalPostsThisMonth, change: 12, positive: true },
          { icon: <MousePointer className="w-6 h-6" />, label: dateRange === 'week' ? '本週點擊數' : '本月點擊數', value: dateRange === 'week' ? analytics.totalClicksThisWeek : analytics.totalClicksThisMonth, change: 23, positive: true },
          { icon: <TrendingUp className="w-6 h-6" />, label: '平均點擊率', value: '3.2%', change: 8, positive: true },
          { icon: <Calendar className="w-6 h-6" />, label: '預估轉換', value: `$${Math.round((dateRange === 'week' ? analytics.totalClicksThisWeek : analytics.totalClicksThisMonth) * 0.5)}`, change: -5, positive: false },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">{metric.icon}</div>
              <div className={`flex items-center gap-1 text-sm font-medium ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}{Math.abs(metric.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">每日表現</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyClicksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="clicks" name="點擊數" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="posts" name="發文數" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">各平台成效</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {platformData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content Type Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">各內容類型成效</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={contentTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="clicks" name="點擊數" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="posts" name="發文數" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">商品表現排行</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">排名</th>
                <th className="pb-3 font-medium">商品名稱</th>
                <th className="pb-3 font-medium text-right">點擊數</th>
                <th className="pb-3 font-medium text-right">使用次數</th>
                <th className="pb-3 font-medium text-right">預估收益</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((product, index) => {
                const fullProduct = mockProducts.find((p) => p.id === product.productId);
                const usageCount = Math.floor(Math.random() * 10) + 1;
                const revenue = (product.clicks * (fullProduct?.commissionRate || 0.05) * 50).toFixed(0);
                return (
                  <tr key={product.productId} className="border-b border-gray-100">
                    <td className="py-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>{index + 1}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={fullProduct?.imageUrl} alt={product.productName} className="w-10 h-10 rounded object-cover" />
                        <div><p className="font-medium text-gray-900 line-clamp-1">{product.productName}</p><p className="text-sm text-gray-500">{fullProduct?.category}</p></div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-medium text-gray-900">{product.clicks}</td>
                    <td className="py-4 text-right text-gray-600">{usageCount} 篇</td>
                    <td className="py-4 text-right font-medium text-green-600">${revenue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4">AI 分析洞察</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: '最佳發文時間', content: '週六下午 2-4 點發文點擊率最高', icon: '📈' },
            { title: '內容建議', content: '清單文的轉換率比開箱文高 23%', icon: '💡' },
            { title: '商品推薦', content: '3C 類商品點擊率高，建議多製作相關內容', icon: '🎯' },
          ].map((insight, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"><span className="text-xl">{insight.icon}</span><h4 className="font-semibold">{insight.title}</h4></div>
              <p className="text-sm text-white/80">{insight.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
