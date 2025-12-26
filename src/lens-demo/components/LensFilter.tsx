import React, { useState, useCallback } from 'react'
import { Smartphone, Sparkles } from 'lucide-react'

interface LensFilterProps {
  beforeImage: string
  afterImage: string
  productName: string
}

export default function LensFilter({ beforeImage, afterImage, productName }: LensFilterProps) {
  const [showAfter, setShowAfter] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleToggle = useCallback(() => {
    setShowAfter(prev => !prev)
  }, [])

  const handlePressStart = useCallback(() => {
    setIsPressed(true)
    setShowAfter(true)
  }, [])

  const handlePressEnd = useCallback(() => {
    setIsPressed(false)
    setShowAfter(false)
  }, [])

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* 圖片容器 */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
        {/* Before Image (手機原圖) */}
        <img
          src={beforeImage}
          alt="手機原圖"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            showAfter ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* After Image (鏡頭效果) */}
        <img
          src={afterImage}
          alt={`${productName} 效果`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            showAfter ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* 狀態標籤 */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          showAfter
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            : 'bg-white/90 text-gray-700 backdrop-blur-sm'
        }`}>
          {showAfter ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {productName} 效果
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              手機原圖
            </span>
          )}
        </div>

        {/* 震撼效果指示器 */}
        {showAfter && (
          <div className="absolute bottom-4 right-4 animate-pulse">
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
              WOW!
            </div>
          </div>
        )}
      </div>

      {/* 互動按鈕 */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* 切換開關 */}
        <button
          onClick={handleToggle}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={() => isPressed && handlePressEnd()}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative w-72 h-14 rounded-full transition-all duration-300 ${
            showAfter
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {/* 滑動指示器 */}
          <div
            className={`absolute top-1 w-12 h-12 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
              showAfter ? 'left-[calc(100%-52px)]' : 'left-1'
            }`}
          >
            {showAfter ? (
              <Sparkles className="w-6 h-6 text-purple-600" />
            ) : (
              <Smartphone className="w-6 h-6 text-gray-500" />
            )}
          </div>

          {/* 按鈕文字 */}
          <span className={`absolute inset-0 flex items-center justify-center font-medium transition-colors duration-300 ${
            showAfter ? 'text-white pl-8' : 'text-gray-600 pr-8'
          }`}>
            {showAfter ? '鏡頭效果 ON' : '點擊體驗效果'}
          </span>
        </button>

        {/* 提示文字 */}
        <p className="text-sm text-gray-500 text-center">
          點擊切換 · 長按體驗
        </p>
      </div>
    </div>
  )
}
