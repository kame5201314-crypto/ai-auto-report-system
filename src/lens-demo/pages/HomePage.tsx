import React from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  ArrowRight,
  Star,
  Zap,
  Award,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import ScenarioNav from '../components/ScenarioNav'
import LensFilter from '../components/LensFilter'
import { products } from '../data/products'

export default function HomePage() {
  const featuredProduct = products[0] // 長焦鏡頭

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>讓你的手機變身專業相機</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              未來鏡頭<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                拍出驚豔照片
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              專為手機設計的專業鏡頭，從微距到長焦，讓每一張照片都成為藝術品。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/lens-demo/products"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                探索產品
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/lens-demo/classroom"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
              >
                觀看教學
              </Link>
            </div>
          </div>

          {/* 統計數據 */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-gray-400">滿意用戶</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9</div>
              <div className="text-sm text-gray-400">平均評分</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-gray-400">好評率</div>
            </div>
          </div>
        </div>
      </section>

      {/* 情境導航 */}
      <section className="max-w-6xl mx-auto px-4">
        <ScenarioNav />
      </section>

      {/* 實拍模擬濾鏡展示 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              親眼見證驚人效果
            </h2>
            <p className="text-gray-500">
              點擊切換，體驗鏡頭帶來的震撼視覺效果
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <LensFilter
              beforeImage={featuredProduct.beforeImage}
              afterImage={featuredProduct.afterImage}
              productName={featuredProduct.name}
            />
          </div>

          <div className="text-center mt-8">
            <Link
              to={`/lens-demo/product/${featuredProduct.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              查看 {featuredProduct.name}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 產品展示 */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            熱門產品
          </h2>
          <Link
            to="/lens-demo/products"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <Link
              key={product.id}
              to={`/lens-demo/product/${product.id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={product.afterImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                    限時優惠
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">4.9</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    查看
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 為什麼選擇我們 */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              為什麼選擇未來鏡頭？
            </h2>
            <p className="text-gray-500">
              我們專注於為手機攝影愛好者打造最佳體驗
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                專業光學品質
              </h3>
              <p className="text-gray-500">
                多層鍍膜技術，有效減少眩光和色差，呈現真實色彩。
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                一年保固服務
              </h3>
              <p className="text-gray-500">
                全產品享有一年保固，專業客服團隊隨時為您服務。
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                豐富教學資源
              </h3>
              <p className="text-gray-500">
                免費線上教學、急救包支援，讓你快速上手，拍出大片。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 用戶評價 */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            看看學長姐們拍的作品
          </h2>
          <p className="text-gray-500">
            來自真實用戶的好評與作品分享
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: '小明',
              avatar: '👨',
              rating: 5,
              comment: '用長焦鏡頭拍演唱會，終於可以清楚看到偶像了！效果超乎預期。',
              product: '20X 長焦望遠鏡頭'
            },
            {
              name: '小美',
              avatar: '👩',
              rating: 5,
              comment: '微距鏡頭讓我的美食照片提升了一個檔次，朋友都問我用什麼相機拍的！',
              product: '4K 微距鏡頭'
            },
            {
              name: '阿翔',
              avatar: '🧑',
              rating: 5,
              comment: '廣角鏡頭太實用了，旅遊拍風景再也不用退後三步。',
              product: '0.6X 超廣角鏡頭'
            }
          ].map((review, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.product}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            準備好升級你的手機攝影了嗎？
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            立即選購，享受免運費和 7 天無條件退貨保障。
          </p>
          <Link
            to="/lens-demo/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <Camera className="w-5 h-5" />
            立即選購
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800">未來鏡頭</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/lens-demo" className="hover:text-gray-800">首頁</Link>
              <Link to="/lens-demo/products" className="hover:text-gray-800">產品</Link>
              <Link to="/lens-demo/classroom" className="hover:text-gray-800">教學</Link>
              <Link to="/lens-demo/first-aid/macro-lens" className="hover:text-gray-800">急救包</Link>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 未來鏡頭. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
