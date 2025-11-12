'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, MapPin, Home } from 'lucide-react'
import Link from 'next/link'

function SearchContent() {
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    district: searchParams.get('district') || '',
    buildingType: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await fetch(`/api/property/transactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 })
    fetchTransactions()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">縣市</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="台北市"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">區域</label>
              <input
                type="text"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="大安區"
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
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <Search className="mr-2" size={18} />
                搜尋
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              進階篩選
            </summary>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最低價格 (萬)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最高價格 (萬)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="3000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最小坪數</label>
                <input
                  type="number"
                  value={filters.minArea}
                  onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大坪數</label>
                <input
                  type="number"
                  value={filters.maxArea}
                  onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="50"
                />
              </div>
            </div>
          </details>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              搜尋結果 ({pagination.total.toLocaleString()} 筆)
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">載入中...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Home className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-600">沒有找到符合條件的交易記錄</p>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <MapPin className="text-blue-600 mr-2" size={18} />
                        <h3 className="font-bold text-gray-800">{tx.address}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tx.buildingType}
                        </span>
                        <span>{tx.area} 坪</span>
                        {tx.floor && tx.totalFloors && (
                          <span>{tx.floor}/{tx.totalFloors} 樓</span>
                        )}
                        {tx.buildingAge && <span>屋齡 {tx.buildingAge} 年</span>}
                        {tx.bedrooms && <span>{tx.bedrooms} 房</span>}
                        {tx.bathrooms && <span>{tx.bathrooms} 衛</span>}
                      </div>
                      {tx.community && (
                        <Link
                          href={`/property/community/${tx.community.id}`}
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          {tx.community.name}
                        </Link>
                      )}
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-blue-600">
                        {(Number(tx.price) / 10000).toFixed(0)} 萬
                      </p>
                      <p className="text-sm text-gray-600">
                        {(tx.unitPrice / 10000).toFixed(1)} 萬/坪
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(tx.transactionDate).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t flex justify-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>
              <span className="px-4 py-2">
                第 {pagination.page} / {pagination.totalPages} 頁
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <SearchContent />
    </Suspense>
  )
}
