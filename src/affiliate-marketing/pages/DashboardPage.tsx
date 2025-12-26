import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, MousePointer, TrendingUp, ArrowRight, Calendar, Lightbulb, Clock } from 'lucide-react';
import { mockAnalytics, mockPosts } from '../services/mockData';

export default function DashboardPage() {
  const analytics = mockAnalytics;
  const upcomingPosts = mockPosts.filter((p) => p.status === 'scheduled');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">歡迎回來！這是你的聯盟行銷數據總覽</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <FileText className="w-6 h-6" />, label: '本週產出內容', value: analytics.totalPostsThisWeek, change: '+23%' },
          { icon: <Send className="w-6 h-6" />, label: '本週發文數', value: analytics.totalPostsThisWeek, change: '+12%' },
          { icon: <MousePointer className="w-6 h-6" />, label: '聯盟連結點擊', value: analytics.totalClicksThisWeek, change: '+45%' },
          { icon: <TrendingUp className="w-6 h-6" />, label: '本月預估收益', value: `$${Math.round(analytics.totalClicksThisMonth * 0.5)}`, change: '+18%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">{stat.icon}</div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">即將發佈的貼文</h2>
            <Link to="/schedule" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">查看全部<ArrowRight className="w-4 h-4" /></Link>
          </div>
          {upcomingPosts.length > 0 ? (
            <div className="space-y-4">
              {upcomingPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0"><Calendar className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="capitalize">{post.platform}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(post.scheduledTime!).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">已排程</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>目前沒有排程的貼文</p>
              <Link to="/content" className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">建立新內容</Link>
            </div>
          )}
        </div>

        {/* Suggested Topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">建議主題</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">AI 根據趨勢推薦的內容方向</p>
          <div className="space-y-3">
            {[
              { title: '生活好物清單', desc: '居家辦公必備 5 樣好物', hot: true },
              { title: '3C 私藏比較', desc: '真無線耳機大比拼', hot: false },
              { title: '換季保養推薦', desc: '秋冬保濕精華評測', hot: false },
              { title: '雙11 必買清單', desc: '錯過再等一年的優惠', hot: true },
            ].map((topic, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{topic.title}</span>
                  {topic.hot && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">熱門</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{topic.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/content" className="mt-4 block w-full text-center py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition">開始創作</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/products', icon: <FileText className="w-6 h-6" />, title: '新增商品', desc: '貼上蝦皮連結開始' },
          { to: '/content', icon: <Lightbulb className="w-6 h-6" />, title: 'AI 生成內容', desc: '文案、圖片、腳本' },
          { to: '/schedule', icon: <Calendar className="w-6 h-6" />, title: '排程發文', desc: '自動發到各平台' },
        ].map((action, i) => (
          <Link key={i} to={action.to} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">{action.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
