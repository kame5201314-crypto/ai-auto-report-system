'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Layers } from 'lucide-react'

interface Transaction {
  id: string
  lat: number
  lng: number
  address: string
  price: number
  unitPrice: number
  area: number
  buildingType: string
}

interface PropertyMapProps {
  transactions: Transaction[]
  center?: [number, number]
  zoom?: number
  showHeatmap?: boolean
}

export function PropertyMap({
  transactions,
  center = [25.0330, 121.5654], // 預設台北市中心
  zoom = 12,
  showHeatmap = false
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers')

  useEffect(() => {
    if (!mapContainer.current) return

    // 使用 Leaflet (開源替代方案)
    const initLeafletMap = async () => {
      // 動態導入 Leaflet
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (map.current) return

      // 初始化地圖
      map.current = L.map(mapContainer.current!).setView([center[0], center[1]], zoom)

      // 添加地圖圖層
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.current)

      setMapLoaded(true)
    }

    initLeafletMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || transactions.length === 0) return

    const L = require('leaflet')

    // 清除現有圖層
    map.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.current.removeLayer(layer)
      }
    })

    if (viewMode === 'markers') {
      // 標記模式
      transactions.forEach((tx) => {
        if (!tx.lat || !tx.lng) return

        // 根據單價決定顏色
        const getColor = (unitPrice: number) => {
          if (unitPrice > 800000) return '#ef4444' // 紅色 - 高價
          if (unitPrice > 600000) return '#f59e0b' // 橙色 - 中高價
          if (unitPrice > 400000) return '#eab308' // 黃色 - 中價
          if (unitPrice > 200000) return '#22c55e' // 綠色 - 低價
          return '#3b82f6' // 藍色 - 超低價
        }

        const marker = L.circleMarker([tx.lat, tx.lng], {
          radius: 8,
          fillColor: getColor(tx.unitPrice),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        }).addTo(map.current)

        // 彈出視窗
        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-gray-800 mb-2">${tx.address}</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">成交價</span>
                <span class="font-bold text-blue-600">${(tx.price / 10000).toFixed(0)} 萬</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">單價</span>
                <span class="font-medium">${(tx.unitPrice / 10000).toFixed(1)} 萬/坪</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">坪數</span>
                <span>${tx.area} 坪</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">類型</span>
                <span>${tx.buildingType}</span>
              </div>
            </div>
          </div>
        `)
      })

      // 自動調整視野
      if (transactions.length > 0) {
        const bounds = L.latLngBounds(
          transactions
            .filter(tx => tx.lat && tx.lng)
            .map(tx => [tx.lat, tx.lng])
        )
        map.current.fitBounds(bounds, { padding: [50, 50] })
      }
    } else {
      // 熱力圖模式 (簡易版 - 使用密度圈)
      const heatmapData = transactions.filter(tx => tx.lat && tx.lng)

      heatmapData.forEach((tx) => {
        // 根據價格計算圈的大小和透明度
        const intensity = Math.min(tx.unitPrice / 1000000, 1)
        const radius = 50 + intensity * 100

        L.circle([tx.lat, tx.lng], {
          radius: radius,
          fillColor: '#ef4444',
          color: 'transparent',
          fillOpacity: 0.1 + intensity * 0.3
        }).addTo(map.current)
      })
    }
  }, [mapLoaded, transactions, viewMode])

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />

      {/* 控制面板 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setViewMode('markers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
            viewMode === 'markers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MapPin size={18} />
          <span className="text-sm font-medium">標記</span>
        </button>
        <button
          onClick={() => setViewMode('heatmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
            viewMode === 'heatmap'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Layers size={18} />
          <span className="text-sm font-medium">熱力圖</span>
        </button>
      </div>

      {/* 圖例 */}
      {viewMode === 'markers' && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <h4 className="text-sm font-bold text-gray-800 mb-2">單價圖例 (萬/坪)</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
              <span>&gt; 80</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
              <span>60 - 80</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#eab308]"></div>
              <span>40 - 60</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
              <span>20 - 40</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
              <span>&lt; 20</span>
            </div>
          </div>
        </div>
      )}

      {/* 載入中提示 */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">地圖載入中...</p>
          </div>
        </div>
      )}
    </div>
  )
}
