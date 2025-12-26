import React, { useState } from 'react'
import { ChevronDown, CheckCircle, AlertTriangle, Lightbulb, Play } from 'lucide-react'

interface TroubleshootItem {
  id: string
  issue: string
  icon: React.ElementType
  iconColor: string
  solutions: {
    title: string
    description: string
    hasAnimation?: boolean
  }[]
}

const troubleshootItems: TroubleshootItem[] = [
  {
    id: 'blurry',
    issue: '畫面模糊不清？',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    solutions: [
      {
        title: '靠近！再靠近！',
        description: '微距鏡頭需要保持 1-3 公分的距離才能對焦清晰。這比你想像的還要近！',
        hasAnimation: true
      },
      {
        title: '保持穩定',
        description: '微距攝影對手震非常敏感，請將手肘靠在桌面上，或使用腳架。'
      },
      {
        title: '確保光線充足',
        description: '光線不足會導致相機自動降低快門速度，容易產生模糊。建議使用 LED 補光環。'
      }
    ]
  },
  {
    id: 'black-corners',
    issue: '畫面有黑角？',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    solutions: [
      {
        title: '調整夾具位置',
        description: '確保鏡頭正對準手機相機鏡頭的中心，偏移會導致黑角。'
      },
      {
        title: '取下手機殼',
        description: '較厚的手機殼會影響鏡頭夾具的安裝，建議先取下手機殼再安裝鏡頭。'
      },
      {
        title: '檢查鏡頭距離',
        description: '鏡頭要緊貼手機鏡頭，太遠會產生暗角。'
      }
    ]
  },
  {
    id: 'clip-issue',
    issue: '夾具夾不穩？',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    solutions: [
      {
        title: '找到正確位置',
        description: '夾具應該夾在手機背面的相機模組旁邊，確保鏡頭對準相機。'
      },
      {
        title: '調整夾具鬆緊',
        description: '旋轉夾具調整螺絲，找到適合您手機厚度的夾緊程度。'
      },
      {
        title: '清潔接觸面',
        description: '確保手機背面和夾具接觸面乾淨無灰塵，增加摩擦力。'
      }
    ]
  },
  {
    id: 'focus-issue',
    issue: '無法自動對焦？',
    icon: Lightbulb,
    iconColor: 'text-blue-500',
    solutions: [
      {
        title: '使用手動對焦',
        description: '點擊螢幕上的拍攝對象進行對焦，或使用相機 App 的手動對焦功能。'
      },
      {
        title: '增加對比度',
        description: '在純色背景上拍攝時，相機可能難以對焦。試著在有紋理的背景上拍攝。'
      },
      {
        title: '鎖定對焦',
        description: '長按螢幕鎖定對焦和曝光，可以獲得更穩定的拍攝效果。'
      }
    ]
  }
]

interface TroubleshooterProps {
  productType?: 'macro' | 'telephoto' | 'wide-angle'
}

export default function Troubleshooter({ productType = 'macro' }: TroubleshooterProps) {
  const [expandedId, setExpandedId] = useState<string | null>('blurry')
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const toggleCheck = (itemId: string, solutionIndex: number) => {
    const key = `${itemId}-${solutionIndex}`
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const isChecked = (itemId: string, solutionIndex: number) => {
    return checkedItems.has(`${itemId}-${solutionIndex}`)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-3">
        {troubleshootItems.map(item => {
          const Icon = item.icon
          const isExpanded = expandedId === item.id

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* 標題列 */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <span className="font-medium text-gray-800">{item.issue}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* 展開內容 */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {item.solutions.map((solution, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg transition-colors ${
                        isChecked(item.id, index) ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 勾選框 */}
                        <button
                          onClick={() => toggleCheck(item.id, index)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isChecked(item.id, index)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isChecked(item.id, index) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>

                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            isChecked(item.id, index) ? 'text-green-700' : 'text-gray-800'
                          }`}>
                            {solution.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {solution.description}
                          </p>

                          {/* 動畫按鈕 */}
                          {solution.hasAnimation && (
                            <button className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                              <Play className="w-4 h-4" />
                              觀看動畫說明
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 進度指示 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">檢查進度</span>
          <span className="text-sm text-gray-500">
            {checkedItems.size} / {troubleshootItems.reduce((sum, item) => sum + item.solutions.length, 0)} 項
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${(checkedItems.size / troubleshootItems.reduce((sum, item) => sum + item.solutions.length, 0)) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}
