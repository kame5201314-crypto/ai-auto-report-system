import React from 'react'
import { Link } from 'react-router-dom'
import {
  Plane,
  Music,
  UtensilsCrossed,
  Video,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface Scenario {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
  bgGradient: string
  products: string[]
  tip: string
}

const scenarios: Scenario[] = [
  {
    id: 'travel',
    title: '旅遊風景',
    subtitle: '廣角 + CPL 濾鏡',
    icon: Plane,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    products: ['wide-angle', 'cpl-filter'],
    tip: '拍出壯闘的風景照，讓天空更藍、水面更清澈'
  },
  {
    id: 'concert',
    title: '演唱會追星',
    subtitle: '長焦 + 腳架',
    icon: Music,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    products: ['telephoto-20x', 'tripod-pro'],
    tip: '拉近與偶像的距離，清晰捕捉舞台每一刻'
  },
  {
    id: 'food',
    title: '美食 / 飾品',
    subtitle: '微距鏡頭',
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-50',
    products: ['macro-lens', 'led-ring'],
    tip: '拍出誘人的美食細節，讓每道料理都是藝術品'
  },
  {
    id: 'vlog',
    title: 'Vlog 直播',
    subtitle: '手持穩定器',
    icon: Video,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    products: ['wide-angle', 'phone-mount'],
    tip: '穩定流暢的畫面，讓你的內容更專業'
  }
]

interface ScenarioNavProps {
  variant?: 'full' | 'compact'
}

export default function ScenarioNav({ variant = 'full' }: ScenarioNavProps) {
  if (variant === 'compact') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {scenarios.map(scenario => (
          <Link
            key={scenario.id}
            to={`/lens-demo/scenario/${scenario.id}`}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${scenario.bgGradient} border border-gray-100 hover:shadow-md transition-shadow`}
          >
            <scenario.icon className={`w-4 h-4 ${scenario.color}`} />
            <span className="text-sm font-medium text-gray-700">{scenario.title}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          你想拍什麼？
        </h2>
        <p className="text-gray-500">
          選擇你的拍攝場景，我們幫你找到最適合的鏡頭
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {scenarios.map(scenario => (
          <Link
            key={scenario.id}
            to={`/lens-demo/scenario/${scenario.id}`}
            className={`group relative p-6 rounded-2xl bg-gradient-to-br ${scenario.bgGradient} border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            {/* 圖示 */}
            <div className={`w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <scenario.icon className={`w-7 h-7 ${scenario.color}`} />
            </div>

            {/* 標題 */}
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {scenario.title}
            </h3>
            <p className={`text-sm font-medium ${scenario.color} mb-3`}>
              {scenario.subtitle}
            </p>

            {/* 提示 */}
            <p className="text-sm text-gray-500 mb-4">
              {scenario.tip}
            </p>

            {/* 箭頭 */}
            <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-900">
              查看推薦
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* 裝飾 */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className={`w-5 h-5 ${scenario.color}`} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { scenarios }
export type { Scenario }
