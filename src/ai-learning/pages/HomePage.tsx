import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const features = [
    {
      icon: '🤖',
      title: 'AI 智能家教',
      description: '24/7 全天候陪伴學習，引導式教學讓你真正理解概念'
    },
    {
      icon: '📚',
      title: '學習路徑規劃',
      description: '個人化學習計劃，AI 分析你的程度並推薦最適合的內容'
    },
    {
      icon: '💬',
      title: '社群討論區',
      description: '與其他學習者交流，AI 輔助回答，快速解決疑惑'
    },
    {
      icon: '📝',
      title: '筆記共享',
      description: '記錄學習心得，與社群分享，互相學習成長'
    }
  ]

  const subjects = [
    { name: '程式設計', icon: '💻', color: 'bg-blue-100 text-blue-600' },
    { name: '數學', icon: '📐', color: 'bg-green-100 text-green-600' },
    { name: '物理', icon: '⚛️', color: 'bg-purple-100 text-purple-600' },
    { name: '化學', icon: '🧪', color: 'bg-pink-100 text-pink-600' },
    { name: '英語', icon: '🌍', color: 'bg-yellow-100 text-yellow-600' },
    { name: '更多科目', icon: '📖', color: 'bg-gray-100 text-gray-600' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">AI 學習平台</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">功能特色</a>
              <a href="#subjects" className="text-gray-600 hover:text-blue-600 transition-colors">學科分類</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">方案價格</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                登入
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                免費註冊
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              讓 AI 成為你的
              <span className="text-blue-600">私人家教</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              不只是給答案，更是引導你思考。我們的 AI 助教會透過蘇格拉底式問答，
              幫助你真正理解知識，培養獨立解決問題的能力。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                開始免費學習
              </Link>
              <Link
                to="/demo"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-blue-200"
              >
                體驗 AI 家教
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">功能特色</h2>
            <p className="text-xl text-gray-600">全方位的 AI 學習體驗</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">學科分類</h2>
            <p className="text-xl text-gray-600">涵蓋各種學科，滿足你的學習需求</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className={`${subject.color} p-6 rounded-2xl text-center cursor-pointer hover:scale-105 transition-transform`}
              >
                <div className="text-4xl mb-2">{subject.icon}</div>
                <div className="font-semibold">{subject.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">方案價格</h2>
            <p className="text-xl text-gray-600">選擇適合你的學習方案</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">免費方案</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                $0<span className="text-lg font-normal text-gray-600">/月</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  每日 10 次 AI 對話
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  基礎學習資源
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  社群討論區
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                免費開始
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-blue-600 p-8 rounded-2xl shadow-xl transform scale-105">
              <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                最受歡迎
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">專業方案</h3>
              <div className="text-4xl font-bold text-white mb-6">
                $299<span className="text-lg font-normal text-blue-200">/月</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-blue-100">
                  <span className="text-yellow-400 mr-2">✓</span>
                  無限 AI 對話
                </li>
                <li className="flex items-center text-blue-100">
                  <span className="text-yellow-400 mr-2">✓</span>
                  完整學習資源
                </li>
                <li className="flex items-center text-blue-100">
                  <span className="text-yellow-400 mr-2">✓</span>
                  個人化學習計劃
                </li>
                <li className="flex items-center text-blue-100">
                  <span className="text-yellow-400 mr-2">✓</span>
                  進度追蹤與報告
                </li>
              </ul>
              <Link
                to="/register?plan=premium"
                className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                開始訂閱
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">企業方案</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                聯繫我們
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  專屬客服支援
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  團隊管理功能
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  自訂學習內容
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  API 整合
                </li>
              </ul>
              <Link
                to="/contact"
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                聯繫銷售
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-blue-400">AI 學習平台</span>
              <p className="mt-4 text-gray-400">
                讓每個人都能擁有專屬的 AI 家教，享受個人化的學習體驗。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">產品</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">功能介紹</a></li>
                <li><a href="#" className="hover:text-white transition-colors">價格方案</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API 文檔</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">支援</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">幫助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">聯繫我們</a></li>
                <li><a href="#" className="hover:text-white transition-colors">常見問題</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法律</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">服務條款</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隱私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI 學習平台. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
