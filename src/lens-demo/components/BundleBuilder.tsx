import React from 'react'
import { X, ShoppingBag, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { useCart } from './CartContext'
import { getRelatedAccessories, Product } from '../data/products'

interface BundleBuilderProps {
  product: Product
  onClose: () => void
}

export default function BundleBuilder({ product, onClose }: BundleBuilderProps) {
  const { addAccessory, setShowBundlePopup } = useCart()
  const relatedAccessories = getRelatedAccessories(product.id)

  const handleAddAccessory = (accessoryId: string) => {
    const accessory = relatedAccessories.find(a => a.id === accessoryId)
    if (accessory) {
      addAccessory(accessory)
    }
  }

  const handleClose = () => {
    setShowBundlePopup(false)
    onClose()
  }

  // 根據產品類型生成不同的提示訊息
  const getTipMessage = () => {
    switch (product.category) {
      case 'telephoto':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50',
          title: 'Andy 策略長提醒',
          message: '長焦拍攝時，微小的手震都會被放大 20 倍。建議您加購專業腳架，確保畫面清晰。'
        }
      case 'macro':
        return {
          icon: Lightbulb,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          title: '拍攝小技巧',
          message: '微距攝影時光線很重要！搭配 LED 補光環可以讓細節更清晰，色彩更鮮豔。'
        }
      case 'wide-angle':
        return {
          icon: Lightbulb,
          iconColor: 'text-emerald-500',
          bgColor: 'bg-emerald-50',
          title: '專業建議',
          message: '想讓風景照更出色？CPL 偏光濾鏡可以消除反光，讓天空更藍、水面更清澈。'
        }
      default:
        return {
          icon: Lightbulb,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          title: '推薦搭配',
          message: '搭配以下配件可以獲得更好的拍攝體驗。'
        }
    }
  }

  const tip = getTipMessage()
  const TipIcon = tip.icon

  if (relatedAccessories.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 彈窗內容 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-fade-in mx-4 sm:mx-0">
        {/* 關閉按鈕 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 成功圖示 */}
        <div className="flex justify-center pt-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* 標題 */}
        <div className="text-center px-6 pt-4">
          <h3 className="text-xl font-bold text-gray-800">
            已加入購物車！
          </h3>
          <p className="text-gray-500 mt-1">
            {product.name}
          </p>
        </div>

        {/* 提示區塊 */}
        <div className={`mx-6 mt-6 p-4 rounded-xl ${tip.bgColor}`}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <TipIcon className={`w-6 h-6 ${tip.iconColor}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">
                {tip.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {tip.message}
              </p>
            </div>
          </div>
        </div>

        {/* 配件推薦 */}
        <div className="px-6 pt-6 pb-8">
          <h4 className="text-sm font-medium text-gray-500 mb-3">
            推薦加購
          </h4>
          <div className="space-y-3">
            {relatedAccessories.map(accessory => (
              <div
                key={accessory.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">
                    {accessory.name}
                  </h5>
                  <p className="text-sm text-gray-500">
                    {accessory.description}
                  </p>
                </div>
                <button
                  onClick={() => handleAddAccessory(accessory.id)}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all whitespace-nowrap"
                >
                  +${accessory.price}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            繼續購物
          </button>
          <button
            onClick={() => {
              handleClose()
              window.location.href = '/lens-demo/cart'
            }}
            className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            前往結帳
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
