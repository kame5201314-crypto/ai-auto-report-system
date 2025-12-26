import React, { useState, useEffect, useCallback } from 'react'
import { Target, CheckCircle, AlertCircle, RotateCcw, Ruler } from 'lucide-react'

interface MacroDistanceGameProps {
  onComplete?: () => void
}

export default function MacroDistanceGame({ onComplete }: MacroDistanceGameProps) {
  const [distance, setDistance] = useState(20) // 距離：1-30 cm
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // 最佳對焦範圍：1-3cm
  const MIN_FOCUS = 1
  const MAX_FOCUS = 3
  const isFocused = distance >= MIN_FOCUS && distance <= MAX_FOCUS

  // 計算模糊程度 (0-100%)
  const getBlurAmount = useCallback(() => {
    if (isFocused) return 0
    if (distance < MIN_FOCUS) {
      return Math.min((MIN_FOCUS - distance) * 30, 100)
    }
    return Math.min((distance - MAX_FOCUS) * 5, 100)
  }, [distance, isFocused])

  const blurAmount = getBlurAmount()

  // 獲取狀態訊息
  const getStatusMessage = () => {
    if (isFocused) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-50',
        title: '完美對焦！',
        message: '就是這個距離！畫面超清晰！'
      }
    }
    if (distance < MIN_FOCUS) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        title: '太近了！',
        message: '稍微後退一點點...'
      }
    }
    if (distance <= 10) {
      return {
        icon: Target,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        title: '快到了！',
        message: '再靠近一點...'
      }
    }
    return {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      title: '距離太遠',
      message: '微距需要非常靠近拍攝對象（1-3公分）'
    }
  }

  const status = getStatusMessage()
  const StatusIcon = status.icon

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDistance(Number(e.target.value))
    if (!isPlaying) setIsPlaying(true)
    setShowResult(false)
  }

  const handleCapture = () => {
    setShowResult(true)
    setAttempts(prev => prev + 1)
    if (isFocused && onComplete) {
      onComplete()
    }
  }

  const handleReset = () => {
    setDistance(20)
    setIsPlaying(false)
    setShowResult(false)
    setAttempts(0)
  }

  // 自動聚焦動畫效果
  useEffect(() => {
    if (isFocused && isPlaying) {
      const timer = setTimeout(() => {
        setShowResult(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isFocused, isPlaying])

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* 標題 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
          <Ruler className="w-4 h-4" />
          微距距離檢測儀
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          找到最佳對焦距離
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          拖動滑桿，模擬鏡頭與拍攝對象的距離
        </p>
      </div>

      {/* 模擬畫面 */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-6">
        {/* 拍攝對象（花朵圖示） */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{
            filter: `blur(${blurAmount * 0.15}px)`,
            transform: `scale(${1 + (30 - distance) * 0.03})`
          }}
        >
          <div className="text-center">
            <div className="text-8xl mb-2">🌸</div>
            <span className="text-gray-500 text-sm">拍攝對象</span>
          </div>
        </div>

        {/* 對焦框 */}
        <div className={`absolute inset-8 border-2 rounded-lg transition-colors duration-300 ${
          isFocused ? 'border-green-500' : 'border-white/50'
        }`}>
          {/* 四角對焦點 */}
          <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 transition-colors ${
            isFocused ? 'border-green-500' : 'border-white'
          }`} />
          <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 transition-colors ${
            isFocused ? 'border-green-500' : 'border-white'
          }`} />
          <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 transition-colors ${
            isFocused ? 'border-green-500' : 'border-white'
          }`} />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 transition-colors ${
            isFocused ? 'border-green-500' : 'border-white'
          }`} />
        </div>

        {/* 距離顯示 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono">
          距離：{distance} cm
        </div>

        {/* 成功特效 */}
        {isFocused && showResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 animate-pulse">
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              ✓ 對焦成功！
            </div>
          </div>
        )}
      </div>

      {/* 距離滑桿 */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>1 cm（最近）</span>
          <span>30 cm（較遠）</span>
        </div>
        <div className="relative">
          {/* 最佳範圍指示 */}
          <div
            className="absolute h-2 bg-green-200 rounded-full top-1/2 -translate-y-1/2"
            style={{
              left: `${(MIN_FOCUS / 30) * 100}%`,
              width: `${((MAX_FOCUS - MIN_FOCUS) / 30) * 100}%`
            }}
          />
          <input
            type="range"
            min="1"
            max="30"
            value={distance}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer relative z-10
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-4
              [&::-webkit-slider-thumb]:border-blue-500
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            最佳範圍：1-3 cm
          </span>
        </div>
      </div>

      {/* 狀態訊息 */}
      <div className={`p-4 rounded-xl ${status.bg} mb-4`}>
        <div className="flex items-start gap-3">
          <StatusIcon className={`w-5 h-5 ${status.color} flex-shrink-0 mt-0.5`} />
          <div>
            <h4 className={`font-semibold ${status.color}`}>{status.title}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{status.message}</p>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重新開始
        </button>
        <button
          onClick={handleCapture}
          disabled={showResult && isFocused}
          className={`flex-1 py-3 font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
            isFocused
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Target className="w-4 h-4" />
          拍攝
        </button>
      </div>

      {/* 嘗試次數 */}
      {attempts > 0 && (
        <p className="text-center text-sm text-gray-400 mt-4">
          嘗試次數：{attempts}
        </p>
      )}
    </div>
  )
}
