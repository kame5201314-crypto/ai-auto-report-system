import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertTriangle,
  Play,
  MessageCircle,
  Phone,
  ChevronRight,
  CheckSquare,
  Square,
  ArrowLeft,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import MacroDistanceGame from '../components/MacroDistanceGame'
import Troubleshooter from '../components/Troubleshooter'
import { getProductById } from '../data/products'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export default function FirstAidPage() {
  const { productId = 'macro-lens' } = useParams<{ productId: string }>()
  const product = getProductById(productId)

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: '手機殼拆了嗎？', checked: false },
    { id: '2', text: '鏡頭貼到 3 公分內了嗎？', checked: false },
    { id: '3', text: '畫面黑圈消除了嗎？', checked: false },
    { id: '4', text: '光線充足嗎？', checked: false },
    { id: '5', text: '手持穩定嗎？', checked: false },
  ])

  const [showGame, setShowGame] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  const toggleCheckItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const checkedCount = checklist.filter(item => item.checked).length
  const allChecked = checkedCount === checklist.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* 頂部警示區 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* 返回連結 */}
          <Link
            to={`/lens-demo/product/${productId}`}
            className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回產品頁
          </Link>

          {/* 主標題 */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                先別急著退貨！
              </h1>
              <p className="text-white/90">
                90% 的問題 30 秒能解決
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 產品資訊 */}
        {product && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <img
              src={product.afterImage}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-800">{product.name}</h2>
              <p className="text-sm text-gray-500">產品急救包</p>
            </div>
          </div>
        )}

        {/* 30秒影片區 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/30 transition-colors">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <p className="text-lg font-medium">30秒快速教學</p>
              <p className="text-sm text-white/70">點擊播放</p>
            </div>
            {/* 時間標籤 */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
              0:30
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-1">
              微距鏡頭這樣用才對！
            </h3>
            <p className="text-sm text-gray-500">
              Andy 策略長親自示範：3 個關鍵步驟讓你拍出清晰照片
            </p>
          </div>
        </section>

        {/* 常見狀況檢核表 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              快速檢核表
            </h3>
            <span className="text-sm text-gray-500">
              {checkedCount}/{checklist.length}
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map(item => (
              <button
                key={item.id}
                onClick={() => toggleCheckItem(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  item.checked ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {item.checked ? (
                  <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className={item.checked ? 'text-green-700' : 'text-gray-700'}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>

          {/* 進度條 */}
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${(checkedCount / checklist.length) * 100}%` }}
            />
          </div>

          {allChecked && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">太棒了！你已經完成所有檢查</span>
            </div>
          )}
        </section>

        {/* 微距距離檢測儀 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              互動教學：找到正確距離
            </h3>
            {!showGame && (
              <button
                onClick={() => setShowGame(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                開始體驗
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {showGame ? (
            <MacroDistanceGame onComplete={() => setGameCompleted(true)} />
          ) : (
            <div
              onClick={() => setShowGame(true)}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-4xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                微距距離檢測儀
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                用動畫模擬「從模糊到清晰」的過程<br />
                讓你理解「原來要這麼近」
              </p>
              <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                點擊開始
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          )}

          {gameCompleted && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl text-center">
              <span className="text-2xl mb-2 block">🎉</span>
              <p className="font-medium text-green-700">
                恭喜你掌握了正確的對焦距離！
              </p>
            </div>
          )}
        </section>

        {/* 問題排解 */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-4">
            常見問題排解
          </h3>
          <Troubleshooter productType="macro" />
        </section>

        {/* 聯繫客服 */}
        <section className="bg-gray-900 text-white rounded-xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">還是不行？</h3>
            <p className="text-gray-400">
              別擔心，我們的客服團隊隨時為您服務
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="https://line.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-4 bg-[#06C755] rounded-xl hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Line 客服</p>
                  <p className="text-sm text-white/80">即時回覆，最快速</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5" />
            </a>

            <a
              href="tel:0800-000-000"
              className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">電話客服</p>
                  <p className="text-sm text-gray-400">0800-000-000</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </a>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            服務時間：週一至週五 9:00-18:00
          </p>
        </section>

        {/* 底部間距 */}
        <div className="h-8" />
      </div>

      {/* 固定底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <a
            href="https://line.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#06C755] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            直接聯繫真人客服
          </a>
        </div>
      </div>
    </div>
  )
}
