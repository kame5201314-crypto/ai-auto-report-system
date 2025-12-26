import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Play,
  Clock,
  Eye,
  ChevronRight,
  Camera,
  Target,
  Mountain,
  Star,
  ThumbsUp
} from 'lucide-react'

interface Article {
  id: string
  title: string
  subtitle: string
  category: string
  icon: React.ElementType
  iconColor: string
  bgColor: string
  readTime: string
  views: string
  thumbnail: string
  tips: string[]
  relatedProduct: string
}

const articles: Article[] = [
  {
    id: 'macro',
    title: '為什麼你的微距照是模糊的？',
    subtitle: '3 個新手必犯的錯誤（附解決方案）',
    category: '微距鏡頭',
    icon: Target,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    readTime: '5 分鐘',
    views: '12.8K',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    tips: [
      '錯誤 1：距離太遠 - 微距需要 1-3 公分',
      '錯誤 2：沒拆手機殼 - 殼會干擾夾具',
      '錯誤 3：光線不足 - 建議使用補光'
    ],
    relatedProduct: 'macro-lens'
  },
  {
    id: 'telephoto',
    title: '手機也能拍月亮？',
    subtitle: 'iPhone 15 Pro 搭配長焦鏡頭實戰教學',
    category: '長焦鏡頭',
    icon: Camera,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    readTime: '8 分鐘',
    views: '23.5K',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    tips: [
      '秘訣 1：一定要用腳架，手震會放大 20 倍',
      '秘訣 2：使用專業模式，手動調整曝光',
      '秘訣 3：找好前景，讓月亮更有層次'
    ],
    relatedProduct: 'telephoto-20x'
  },
  {
    id: 'wide-angle',
    title: '風景照總是拍不出感覺？',
    subtitle: '廣角鏡頭 + CPL 濾鏡的完美組合',
    category: '廣角鏡頭',
    icon: Mountain,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    readTime: '6 分鐘',
    views: '18.2K',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    tips: [
      '技巧 1：三分法構圖，讓畫面更有張力',
      '技巧 2：CPL 濾鏡消除反光，天空更藍',
      '技巧 3：黃金時段拍攝，光線最美'
    ],
    relatedProduct: 'wide-angle'
  }
]

// 用戶作品
const userGallery = [
  { id: 1, image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80', author: '小明', lens: '長焦鏡頭' },
  { id: 2, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', author: '小美', lens: '微距鏡頭' },
  { id: 3, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', author: '阿翔', lens: '廣角鏡頭' },
  { id: 4, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', author: '小雯', lens: '微距鏡頭' },
]

export default function ClassroomPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">未來小教室</h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            從入門到進階，我們準備了豐富的教學內容，讓你快速掌握手機攝影技巧。
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 精選文章 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">精選教學</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(article => {
              const Icon = article.icon

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* 縮圖 */}
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${article.bgColor} ${article.iconColor}`}>
                        <Icon className="w-3 h-3" />
                        {article.category}
                      </span>
                    </div>
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                    </button>
                  </div>

                  {/* 內容 */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {article.subtitle}
                    </p>

                    {/* 重點提示 */}
                    <div className={`p-3 rounded-lg ${article.bgColor} mb-4`}>
                      <ul className="space-y-1 text-sm">
                        {article.tips.map((tip, index) => (
                          <li key={index} className="text-gray-700">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 統計 */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views}
                        </span>
                      </div>
                      <Link
                        to={`/lens-demo/product/${article.relatedProduct}`}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        查看產品
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* 用戶作品牆 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">看看學長姐們拍的作品</h2>
              <p className="text-gray-500 text-sm mt-1">
                別人用這顆鏡頭拍得出來，所以你也可以！
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              查看更多
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userGallery.map(item => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={`${item.author} 的作品`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-medium">{item.author}</p>
                    <p className="text-sm text-white/80">{item.lens}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 社群證明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center justify-center gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 text-sm">4.9 平均評分</p>
            </div>
            <div className="h-8 w-px bg-blue-200" />
            <div>
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <ThumbsUp className="w-5 h-5" />
                <span className="font-bold text-lg">98%</span>
              </div>
              <p className="text-gray-600 text-sm">用戶好評</p>
            </div>
            <div className="h-8 w-px bg-blue-200" />
            <div>
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Camera className="w-5 h-5" />
                <span className="font-bold text-lg">50K+</span>
              </div>
              <p className="text-gray-600 text-sm">滿意用戶</p>
            </div>
          </div>
        </section>

        {/* 急救包入口 */}
        <section className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
          <div className="md:flex items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                遇到問題？立即查看急救包
              </h2>
              <p className="text-white/80">
                90% 的問題都能在 30 秒內解決！
              </p>
            </div>
            <Link
              to="/lens-demo/first-aid/macro-lens"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-bold rounded-xl hover:shadow-lg transition-shadow"
            >
              立即查看
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
