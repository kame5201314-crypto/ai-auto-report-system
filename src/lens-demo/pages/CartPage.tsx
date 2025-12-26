import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  Tag
} from 'lucide-react'
import { useCart } from '../components/CartContext'

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  } = useCart()

  const shipping = totalPrice >= 1000 ? 0 : 60
  const finalTotal = totalPrice + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            購物車是空的
          </h1>
          <p className="text-gray-500 mb-6">
            快去挑選喜歡的鏡頭吧！
          </p>
          <Link
            to="/lens-demo/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            開始購物
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/lens-demo"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              購物車 ({totalItems})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            清空購物車
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* 商品列表 */}
          <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
            {items.map(cartItem => {
              const { item, quantity, type } = cartItem
              const isProduct = type === 'product'
              const product = isProduct ? (item as any) : null

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* 圖片 */}
                    {product?.afterImage ? (
                      <Link to={`/lens-demo/product/${product.id}`}>
                        <img
                          src={product.afterImage}
                          alt={item.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-8 h-8 text-gray-300" />
                      </div>
                    )}

                    {/* 資訊 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {item.name}
                          </h3>
                          {!isProduct && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              配件
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* 數量控制 */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        {/* 價格 */}
                        <p className="font-bold text-gray-900">
                          NT${item.price * quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 訂單摘要 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
              <h2 className="font-bold text-gray-800 mb-4">訂單摘要</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>商品小計</span>
                  <span>NT${totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>運費</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">免運費</span>
                  ) : (
                    <span>NT${shipping}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-gray-500">
                    再消費 NT${1000 - totalPrice} 即可免運
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">總計</span>
                  <span className="text-2xl font-bold text-gray-900">
                    NT${finalTotal}
                  </span>
                </div>
              </div>

              {/* 服務保證 */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>1-3 天快速到貨</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>7 天無條件退貨</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span>安全加密付款</span>
                </div>
              </div>

              {/* 結帳按鈕 */}
              <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                前往結帳
              </button>

              <Link
                to="/lens-demo/products"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-4"
              >
                繼續購物
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
