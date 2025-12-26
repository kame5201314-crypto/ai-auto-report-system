import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: '學習天數', value: '15', icon: '📅' },
    { label: '完成課程', value: '8', icon: '✅' },
    { label: '學習時數', value: '24.5h', icon: '⏱️' },
    { label: '學習積分', value: '1,250', icon: '⭐' }
  ]

  const recentCourses = [
    { id: 1, title: 'Python 基礎入門', progress: 75, subject: '程式設計' },
    { id: 2, title: '微積分概論', progress: 45, subject: '數學' },
    { id: 3, title: '英文文法精華', progress: 30, subject: '英語' }
  ]

  const recommendations = [
    { id: 4, title: 'Python 進階：物件導向', subject: '程式設計', difficulty: '中級' },
    { id: 5, title: '線性代數基礎', subject: '數學', difficulty: '初級' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                歡迎回來，{user?.user_metadata?.username || '學習者'}！
              </h1>
              <p className="text-gray-600 mt-1">繼續你的學習之旅</p>
            </div>
            <Link
              to="/ai-tutor"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>🤖</span>
              開始 AI 對話
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">繼續學習</h2>
                <Link to="/courses" className="text-blue-600 hover:text-blue-800 font-medium">
                  查看全部
                </Link>
              </div>
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.subject}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tutor Quick Access */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 mt-6 text-white">
              <h2 className="text-xl font-bold mb-2">有學習問題嗎？</h2>
              <p className="text-blue-100 mb-4">AI 智能家教 24/7 全天候待命，隨時解答你的疑問</p>
              <Link
                to="/ai-tutor"
                className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                立即提問
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">推薦課程</h2>
              <div className="space-y-4">
                {recommendations.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {course.subject}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {course.difficulty}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">快速連結</h2>
              <div className="space-y-2">
                <Link to="/forum" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">💬</span>
                  <span className="font-medium text-gray-700">討論區</span>
                </Link>
                <Link to="/notes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">📝</span>
                  <span className="font-medium text-gray-700">我的筆記</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">👤</span>
                  <span className="font-medium text-gray-700">個人資料</span>
                </Link>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">訂閱狀態</h2>
              <div className="text-center">
                <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-medium mb-4">
                  免費方案
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  升級專業方案，享受無限 AI 對話和完整學習資源
                </p>
                <Link
                  to="/pricing"
                  className="block w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  升級方案
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
