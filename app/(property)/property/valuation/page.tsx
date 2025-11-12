'use client'

import { useState } from 'react'
import { Calculator, MapPin, Home, TrendingUp } from 'lucide-react'

export default function ValuationPage() {
  const [formData, setFormData] = useState({
    city: '台北市',
    district: '大安區',
    address: '',
    buildingType: 'BUILDING',
    area: '',
    floor: '',
    totalFloors: '',
    buildingAge: '',
    bedrooms: '',
    bathrooms: '',
    parkingSpaces: '',
    hasElevator: true
  })

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const cities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市']
  const buildingTypes = [
    { value: 'APARTMENT', label: '公寓' },
    { value: 'MANSION', label: '華廈' },
    { value: 'BUILDING', label: '大樓' },
    { value: 'TOWNHOUSE', label: '透天厝' },
    { value: 'VILLA', label: '別墅' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/property/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data)
      } else {
        alert('估價失敗: ' + data.error)
      }
    } catch (error) {
      alert('發生錯誤,請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI 智慧估價工具
          </h1>
          <p className="text-gray-600">
            填寫房屋資訊,立即獲得 AI 精準估價
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Home className="mr-2 text-blue-600" />
              填寫房屋資訊
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    縣市 *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    區域 *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例: 大安區"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細地址 (選填)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="例: 信義路四段"
                />
              </div>

              {/* Building Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  建物類型 *
                </label>
                <select
                  value={formData.buildingType}
                  onChange={(e) => handleChange('buildingType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {buildingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Area and Floors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    坪數 *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    樓層
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => handleChange('floor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    總樓層
                  </label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => handleChange('totalFloors', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    屋齡 (年)
                  </label>
                  <input
                    type="number"
                    value={formData.buildingAge}
                    onChange={(e) => handleChange('buildingAge', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    房數
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    衛浴數
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    車位數
                  </label>
                  <input
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) => handleChange('parkingSpaces', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    有無電梯
                  </label>
                  <select
                    value={formData.hasElevator.toString()}
                    onChange={(e) => handleChange('hasElevator', e.target.value === 'true')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="true">有</option>
                    <option value="false">無</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span>計算中...</span>
                ) : (
                  <>
                    <Calculator className="mr-2" size={20} />
                    立即估價
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Result */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">估價結果</h2>
                  <div className="mb-4">
                    <p className="text-blue-100 mb-2">AI 預估市值</p>
                    <p className="text-5xl font-bold">
                      {(result.valuation.estimatedPrice / 10000).toFixed(0)}
                      <span className="text-2xl ml-2">萬</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
                    <div>
                      <p className="text-blue-100 text-sm">每坪單價</p>
                      <p className="text-2xl font-bold">
                        {(result.valuation.unitPrice / 10000).toFixed(1)} 萬
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">信心度</p>
                      <p className="text-2xl font-bold">
                        {(result.valuation.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">價格區間</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">最低</p>
                      <p className="text-xl font-bold text-gray-800">
                        {(result.valuation.priceRange.min / 10000).toFixed(0)} 萬
                      </p>
                    </div>
                    <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-green-400 via-blue-500 to-red-400 rounded-full"></div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">最高</p>
                      <p className="text-xl font-bold text-gray-800">
                        {(result.valuation.priceRange.max / 10000).toFixed(0)} 萬
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analysis Factors */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">估價分析</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">估價方法</span>
                      <span className="font-medium">
                        {result.valuation.factors.method === 'comparable_sales' ? '相似物件比較法' : '區域平均法'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">參考案例數</span>
                      <span className="font-medium">{result.valuation.factors.sampleSize} 筆</span>
                    </div>
                    {result.valuation.factors.avgMonthsAgo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">案例平均時間</span>
                        <span className="font-medium">{result.valuation.factors.avgMonthsAgo} 個月前</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Similar Transactions */}
                {result.valuation.similarTransactions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-800 mb-4">相似成交案例</h3>
                    <div className="space-y-3">
                      {result.valuation.similarTransactions.map((tx: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="font-medium text-gray-800">{tx.address}</p>
                          <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>{tx.area} 坪</span>
                            <span className="font-bold text-blue-600">
                              {(Number(tx.price) / 10000).toFixed(0)} 萬
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <TrendingUp className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500">填寫左側表單並送出,即可獲得 AI 估價結果</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
