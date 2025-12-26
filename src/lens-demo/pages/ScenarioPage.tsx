import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  ShoppingCart,
  BookOpen
} from 'lucide-react'
import { scenarios, Scenario } from '../components/ScenarioNav'
import { products, accessories, Product, Accessory } from '../data/products'
import { useCart } from '../components/CartContext'

// 場景對應的產品和配件
const scenarioProducts: Record<string, string[]> = {
  travel: ['wide-angle', 'cpl-filter'],
  concert: ['telephoto-20x', 'tripod-pro'],
  food: ['macro-lens', 'led-ring'],
  vlog: ['wide-angle', 'phone-mount']
}

// 教學內容
const scenarioTips: Record<string, { title: string; tips: string[] }> = {
  travel: {
    title: '旅遊風景攝影三大秘訣',
    tips: [
      '使用廣角鏡頭時，將主體放在畫面下三分之一處',
      'CPL 濾鏡可以消除水面反光，讓天空更藍',
      '黃金時段（日出日落）是最佳拍攝時機'
    ]
  },
  concert: {
    title: '演唱會拍攝三個秘訣',
    tips: [
      '長焦鏡頭一定要搭配腳架，否則手震會讓照片模糊',
      '提前找好拍攝位置，避免前方有遮擋物',
      '關閉閃光燈，使用場館現有燈光拍攝效果更自然'
    ]
  },
  food: {
    title: '美食攝影三大技巧',
    tips: [
      '微距鏡頭需要非常靠近（1-3公分），這是清晰的關鍵',
      '自然光是最好的光源，盡量在窗邊拍攝',
      '45度角是最經典的美食拍攝角度'
    ]
  },
  vlog: {
    title: 'Vlog 直播三大要點',
    tips: [
      '廣角鏡頭可以納入更多背景，讓畫面更豐富',
      '穩定的畫面比高畫質更重要',
      '注意光線方向，避免逆光拍攝'
    ]
  }
}

export default function ScenarioPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const scenario = scenarios.find(s => s.id === scenarioId)
  const { addProduct, addAccessory } = useCart()

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">找不到場景</h1>
          <Link to="/lens-demo" className="text-blue-600 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  const Icon = scenario.icon
  const productIds = scenarioProducts[scenario.id] || []
  const tips = scenarioTips[scenario.id]

  // 獲取推薦產品
  const recommendedProducts = productIds
    .map(id => products.find(p => p.id === id) || accessories.find(a => a.id === id))
    .filter(Boolean) as (Product | Accessory)[]

  const handleAddToCart = (item: Product | Accessory) => {
    if ('category' in item) {
      addProduct(item as Product)
    } else {
      addAccessory(item as Accessory)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${scenario.bgGradient} pt-6 pb-12`}>
        <div className="max-w-4xl mx-auto px-4">
          {/* 返回連結 */}
          <Link
            to="/lens-demo"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </Link>

          {/* 場景標題 */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${scenario.color}`} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {scenario.title}
              </h1>
              <p className={`font-medium ${scenario.color}`}>
                {scenario.subtitle}
              </p>
            </div>
          </div>

          <p className="text-gray-600 max-w-2xl">
            {scenario.tip}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {/* 教學精華 */}
        {tips && (
          <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className={`w-5 h-5 ${scenario.color}`} />
              <h2 className="font-bold text-gray-800">未來小教室</h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                {tips.title}
              </h3>
              <ul className="space-y-3">
                {tips.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/lens-demo/classroom"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-4"
            >
              查看更多教學
              <ChevronRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* 推薦產品 */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className={`w-5 h-5 ${scenario.color}`} />
            <h2 className="font-bold text-gray-800">推薦裝備</h2>
          </div>

          <div className="space-y-4">
            {recommendedProducts.map(item => {
              const isProduct = 'category' in item
              const product = isProduct ? (item as Product) : null

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* 圖片 */}
                  {product && (
                    <Link to={`/lens-demo/product/${product.id}`}>
                      <img
                        src={product.afterImage}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </Link>
                  )}
                  {!product && (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* 資訊 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      {!isProduct && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          配件
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                    <p className="font-bold text-gray-900 mt-2">
                      NT${item.price}
                    </p>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex flex-col gap-2">
                    {product && (
                      <Link
                        to={`/lens-demo/product/${product.id}`}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors text-center"
                      >
                        查看詳情
                      </Link>
                    )}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                    >
                      加入購物車
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 套裝優惠 */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-xl mb-2">
                {scenario.title}套裝優惠
              </h2>
              <p className="text-white/80 mb-4">
                一次購買所有推薦裝備，立省 $200！
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  NT${recommendedProducts.reduce((sum, item) => sum + item.price, 0) - 200}
                </span>
                <span className="text-white/60 line-through">
                  NT${recommendedProducts.reduce((sum, item) => sum + item.price, 0)}
                </span>
              </div>
            </div>
            <button
              onClick={() => recommendedProducts.forEach(item => handleAddToCart(item))}
              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:shadow-lg transition-shadow"
            >
              一鍵加入
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
