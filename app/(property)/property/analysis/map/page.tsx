'use client'

import { useState, useEffect } from 'react'
import { PropertyMap } from '@/components/property/PropertyMap'
import { Filter, Download } from 'lucide-react'

export default function MapAnalysisPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    city: '台北市',
    district: '',
    buildingType: '',
    minPrice: '',
    maxPrice: ''
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('limit', '500') // 地圖顯示較多資料

      const response = await fetch(`/api/property/transactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data.map((tx: any) => ({
          id: tx.id,
          lat: parseFloat(tx.lat),
          lng: parseFloat(tx.lng),
          address: tx.address,
          price: parseInt(tx.price),
          unitPrice: tx.unitPrice,
          area: parseFloat(tx.area),
          buildingType: tx.buildingType
        })))
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    fetchTransactions()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">房價地圖分析</h1>
          <p className="text-gray-600">視覺化呈現房地產交易分布與價格熱點</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-blue-600" />
            <h2 className="font-bold text-gray-800">篩選條件</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">縣市</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="台北市">台北市</option>
                <option value="新北市">新北市</option>
                <option value="桃園市">桃園市</option>
                <option value="台中市">台中市</option>
                <option value="台南市">台南市</option>
                <option value="高雄市">高雄市</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">區域</label>
              <input
                type="text"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例: 大安區"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">建物類型</label>
              <select
                value={filters.buildingType}
                onChange={(e) => setFilters({ ...filters, buildingType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">全部</option>
                <option value="APARTMENT">公寓</option>
                <option value="MANSION">華廈</option>
                <option value="BUILDING">大樓</option>
                <option value="TOWNHOUSE">透天厝</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">價格範圍 (萬)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="最低"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? '載入中...' : '套用篩選'}
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-gray-800">地圖視圖</h2>
              <p className="text-sm text-gray-600">顯示 {transactions.length} 筆交易記錄</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <Download size={18} />
              匯出數據
            </button>
          </div>

          <div className="h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">載入交易數據中...</p>
                </div>
              </div>
            ) : (
              <PropertyMap transactions={transactions} showHeatmap />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">交易筆數</p>
            <p className="text-3xl font-bold text-blue-600">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">平均單價</p>
            <p className="text-3xl font-bold text-green-600">
              {transactions.length > 0
                ? (transactions.reduce((sum, tx) => sum + tx.unitPrice, 0) / transactions.length / 10000).toFixed(1)
                : 0}
              <span className="text-lg ml-1">萬</span>
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">最高單價</p>
            <p className="text-3xl font-bold text-red-600">
              {transactions.length > 0
                ? (Math.max(...transactions.map(tx => tx.unitPrice)) / 10000).toFixed(1)
                : 0}
              <span className="text-lg ml-1">萬</span>
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">最低單價</p>
            <p className="text-3xl font-bold text-gray-600">
              {transactions.length > 0
                ? (Math.min(...transactions.map(tx => tx.unitPrice)) / 10000).toFixed(1)
                : 0}
              <span className="text-lg ml-1">萬</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
