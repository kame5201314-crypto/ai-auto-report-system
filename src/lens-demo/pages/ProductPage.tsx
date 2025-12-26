import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShoppingCart,
  Check,
  Star,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  HelpCircle,
  BookOpen
} from 'lucide-react'
import LensFilter from '../components/LensFilter'
import BundleBuilder from '../components/BundleBuilder'
import { useCart } from '../components/CartContext'
import { getProductById, products, getRelatedAccessories } from '../data/products'

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const product = productId ? getProductById(productId) : products[0]
  const { addProduct, showBundlePopup, setShowBundlePopup, lastAddedProduct } = useCart()

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">找不到產品</h1>
          <Link to="/lens-demo" className="text-blue-600 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  const relatedAccessories = getRelatedAccessories(product.id)

  const handleAddToCart = () => {
    addProduct(product)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 主要內容 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 麵包屑 */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/lens-demo" className="hover:text-blue-600">首頁</Link>
          <span className="mx-2">/</span>
          <Link to="/lens-demo/products" className="hover:text-blue-600">產品</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* 左側：實拍模擬濾鏡 */}
          <div className="mb-8 lg:mb-0">
            <LensFilter
              beforeImage={product.beforeImage}
              afterImage={product.afterImage}
              productName={product.name}
            />
          </div>

          {/* 右側：產品資訊 */}
          <div className="space-y-6">
            {/* 產品標題 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  熱銷
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">4.9</span>
                  <span className="text-gray-400 text-sm">(328)</span>
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-500">
                {product.description}
              </p>
            </div>

            {/* 價格 */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                NT${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  NT${product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                  省 ${product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* 產品特點 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">產品特點</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* 拍攝技巧 */}
            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                使用小技巧
              </h3>
              <ul className="space-y-2">
                {product.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-amber-700">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* 服務保證 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-xl">
                <Truck className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">免運費</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl">
                <Shield className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">一年保固</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl">
                <RotateCcw className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600">7天鑑賞</p>
              </div>
            </div>

            {/* 急救包入口 */}
            <Link
              to={`/lens-demo/first-aid/${product.id}`}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">產品急救包</p>
                  <p className="text-sm text-gray-500">遇到問題？30秒解決</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            {/* 推薦配件 */}
            {relatedAccessories.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">推薦搭配</h3>
                <div className="space-y-2">
                  {relatedAccessories.slice(0, 2).map(accessory => (
                    <div
                      key={accessory.id}
                      className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{accessory.name}</p>
                        <p className="text-sm text-gray-500">{accessory.description}</p>
                      </div>
                      <span className="text-blue-600 font-medium">
                        +${accessory.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 更多產品 */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4">其他鏡頭</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.filter(p => p.id !== product.id).map(p => (
              <Link
                key={p.id}
                to={`/lens-demo/product/${p.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={p.afterImage}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm">{p.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">NT${p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 固定底部：加入購物車按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">總價</p>
            <p className="text-2xl font-bold text-gray-900">NT${product.price}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            加入購物車
          </button>
        </div>
      </div>

      {/* Bundle Builder 彈窗 */}
      {showBundlePopup && lastAddedProduct && (
        <BundleBuilder
          product={lastAddedProduct}
          onClose={() => setShowBundlePopup(false)}
        />
      )}
    </div>
  )
}
