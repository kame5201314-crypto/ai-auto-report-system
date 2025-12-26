import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, FileText, Calendar, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { pricingPlans } from '../services/mockData';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">AffiliateAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">功能</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">使用流程</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">方案</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">登入</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">免費試用</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            自動幫你產出蝦皮聯盟行銷<br />
            <span className="text-indigo-600">文案、圖片、短影音腳本</span><br />
            還會幫你自動發文
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            懂 AI 的電商老闆指定工具，1 分鐘產出一篇可賺錢的貼文
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              免費試用 7 天 <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition">看範例內容</a>
          </div>
          <p className="mt-4 text-sm text-gray-500">無需信用卡 · 隨時取消</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">三大核心功能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-4"><Zap className="w-12 h-12 text-indigo-600" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI 選品＋聯盟連結生成</h3>
              <p className="text-gray-600">貼上蝦皮網址，自動抓取商品資訊，一鍵生成專屬聯盟連結和短網址</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-4"><FileText className="w-12 h-12 text-indigo-600" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">一鍵產文案＋圖＋影片腳本</h3>
              <p className="text-gray-600">AI 自動生成吸睛文案、精美配圖、完整影片腳本，多種風格任你選</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition">
              <div className="flex justify-center mb-4"><Calendar className="w-12 h-12 text-indigo-600" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">自動排程發到 FB/IG/LINE</h3>
              <p className="text-gray-600">設定好時間，系統自動幫你發文到各平台，省時又省力</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">三步驟開始賺錢</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: '貼上蝦皮商品連結', desc: '複製任何蝦皮商品網址，系統自動抓取商品資訊' },
              { step: 2, title: '選擇內容類型', desc: '清單文、比較文、開箱文、Reels 腳本，多種格式任選' },
              { step: 3, title: '自動生成＋排程發文', desc: 'AI 產出高轉換內容，設定時間自動發佈' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">選擇適合你的方案</h2>
          <p className="text-center text-gray-600 mb-12">所有方案都包含 7 天免費試用</p>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => {
              const isPopular = plan.id === 'pro';
              return (
                <div key={plan.id} className={`bg-white rounded-2xl p-8 ${isPopular ? 'ring-2 ring-indigo-600 shadow-lg' : 'border border-gray-200'}`}>
                  {isPopular && <div className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">最受歡迎</div>}
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price === 0 ? '免費' : `$${plan.price}`}</span>
                    {plan.price > 0 && <span className="text-gray-600">/月</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600"><Check className="w-5 h-5 text-green-500 flex-shrink-0" />{feature}</li>
                    ))}
                  </ul>
                  <Link to="/register" className={`block w-full text-center py-3 rounded-lg font-semibold transition ${isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                    {plan.price === 0 ? '免費開始' : '開始試用'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">常見問題</h2>
          <div className="space-y-4">
            {[
              { q: '需要有蝦皮聯盟帳號嗎？', a: '是的，你需要先申請蝦皮聯盟帳號，取得專屬的聯盟代碼。' },
              { q: 'AI 生成的內容品質如何？', a: '我們使用最先進的 AI 模型，針對台灣電商市場優化。' },
              { q: '可以自動發文到哪些平台？', a: '目前支援 Facebook 粉專/社團、Instagram、LINE 官方帳號。' },
            ].map((item, i) => (
              <details key={i} className="border border-gray-200 rounded-lg bg-white">
                <summary className="p-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                  {item.q} <ChevronDown className="w-5 h-5 text-gray-500" />
                </summary>
                <div className="px-4 pb-4 text-gray-600">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">準備好開始你的聯盟行銷事業了嗎？</h2>
          <p className="text-indigo-100 mb-8">加入超過 1,000 位創作者的行列，讓 AI 幫你創造被動收入</p>
          <Link to="/register" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition">立即免費試用</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="w-6 h-6 text-indigo-400" />
            <span className="text-lg font-bold text-white">AffiliateAI</span>
          </div>
          <p className="text-sm">AI 驅動的蝦皮聯盟行銷自動化工具</p>
          <p className="mt-4 text-sm">&copy; 2025 AffiliateAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
