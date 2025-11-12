'use client'

import { useState } from 'react'
import { Search, TrendingUp, MapPin, Calculator, Building } from 'lucide-react'
import Link from 'next/link'

export default function PropertyHomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const popularDistricts = [
    { city: '台北市', district: '大安區', avgPrice: 850000, growth: 5.2 },
    { city: '台北市', district: '信義區', avgPrice: 920000, growth: 6.8 },
    { city: '新北市', district: '板橋區', avgPrice: 550000, growth: 4.1 },
    { city: '台中市', district: '西屯區', avgPrice: 380000, growth: 7.5 },
    { city: '高雄市', district: '左營區', avgPrice: 320000, growth: 3.9 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              台灣房產 AI 估價平台
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              整合實價登錄數據,運用 AI 技術提供精準房屋估價與市場分析
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex items-center">
              <Search className="text-gray-400 ml-4" size={24} />
              <input
                type="text"
                placeholder="輸入地址、社區名稱或路段查詢..."
                className="flex-1 px-4 py-3 text-gray-800 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Link
                href={`/property/search?q=${searchQuery}`}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition font-medium"
              >
                搜尋
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Link
                href="/property/valuation"
                className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2 rounded-full hover:bg-white/20 transition"
              >
                AI 估價工具
              </Link>
              <Link
                href="/property/analysis/trends"
                className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2 rounded-full hover:bg-white/20 transition"
              >
                市場趨勢分析
              </Link>
              <Link
                href="/property/calculator/mortgage"
                className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2 rounded-full hover:bg-white/20 transition"
              >
                房貸試算
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<TrendingUp size={32} />}
            title="AI 智慧估價"
            description="運用機器學習分析百萬筆交易數據,提供精準估價"
          />
          <FeatureCard
            icon={<MapPin size={32} />}
            title="地圖視覺化"
            description="互動式地圖呈現房價分布與熱點區域"
          />
          <FeatureCard
            icon={<TrendingUp size={32} />}
            title="趨勢分析"
            description="掌握歷史價格走勢,預測未來市場動向"
          />
          <FeatureCard
            icon={<Calculator size={32} />}
            title="投資試算"
            description="完整的投資報酬率與房貸試算工具"
          />
        </div>

        {/* Popular Districts */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            熱門區域行情
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {popularDistricts.map((area) => (
              <Link
                key={`${area.city}-${area.district}`}
                href={`/property/search?city=${area.city}&district=${area.district}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{area.district}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    area.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {area.growth > 0 ? '+' : ''}{area.growth}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{area.city}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {area.avgPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">萬/坪</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="2,500,000+" label="實價登錄筆數" />
            <StatCard number="15,000+" label="社區資料" />
            <StatCard number="50,000+" label="每日估價查詢" />
            <StatCard number="95%" label="估價準確度" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            立即開始使用
          </h2>
          <p className="text-gray-600 mb-8">
            每日 3 次免費估價查詢,升級會員享受更多進階功能
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/property/valuation"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              免費估價
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              查看方案
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">關於平台</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">關於我們</Link></li>
                <li><Link href="/contact" className="hover:text-white">聯絡我們</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API 文件</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">功能</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/property/valuation" className="hover:text-white">AI 估價</Link></li>
                <li><Link href="/property/analysis/trends" className="hover:text-white">市場分析</Link></li>
                <li><Link href="/property/calculator/mortgage" className="hover:text-white">房貸試算</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">會員</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white">方案價格</Link></li>
                <li><Link href="/login" className="hover:text-white">登入</Link></li>
                <li><Link href="/register" className="hover:text-white">註冊</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">資料來源</h3>
              <p className="text-sm">內政部不動產實價登錄</p>
              <p className="text-sm">地政資料開放平台</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 台灣房產 AI 估價平台. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-100">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-bold text-blue-600 mb-2">{number}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  )
}
