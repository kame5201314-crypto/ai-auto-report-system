import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Star, ShoppingCart } from 'lucide-react'
import ScenarioNav from '../components/ScenarioNav'
import { products, accessories } from '../data/products'
import { useCart } from '../components/CartContext'

type FilterType = 'all' | 'telephoto' | 'macro' | 'wide-angle' | 'accessory'

export default function ProductsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const { addProduct, addAccessory } = useCart()

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'telephoto', label: '長焦鏡頭' },
    { value: 'macro', label: '微距鏡頭' },
    { value: 'wide-angle', label: '廣角鏡頭' },
    { value: 'accessory', label: '配件' },
  ]

  const filteredProducts = filter === 'all'
    ? products
    : filter === 'accessory'
    ? []
    : products.filter(p => p.category === filter)

  const filteredAccessories = filter === 'all' || filter === 'accessory'
    ? accessories
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 場景快捷導航 */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <ScenarioNav variant="compact" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 標題與篩選 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              全部產品
            </h1>
            <p className="text-gray-500 mt-1">
              {filteredProducts.length + filteredAccessories.length} 件商品
            </p>
          </div>

          {/* 篩選按鈕 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 鏡頭產品 */}
        {filteredProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">鏡頭</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <Link to={`/lens-demo/product/${product.id}`}>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={product.afterImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.originalPrice && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                          省 ${product.originalPrice - product.price}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                      <span className="text-gray-400 text-sm">(328)</span>
                    </div>

                    <Link to={`/lens-demo/product/${product.id}`}>
                      <h3 className="font-bold text-gray-800 text-lg mb-2 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

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
                      <button
                        onClick={() => addProduct(product)}
                        className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 配件 */}
        {filteredAccessories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">配件</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAccessories.map(accessory => (
                <div
                  key={accessory.id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {accessory.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {accessory.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      ${accessory.price}
                    </span>
                    <button
                      onClick={() => addAccessory(accessory)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      加入購物車
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 空狀態 */}
        {filteredProducts.length === 0 && filteredAccessories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">沒有找到符合條件的產品</p>
          </div>
        )}
      </div>
    </div>
  )
}
