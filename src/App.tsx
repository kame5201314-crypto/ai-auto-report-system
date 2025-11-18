import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import KOLManagementSystem from './components/KOLManagementSystem'
import Login from './components/Login'
import DealerSystemMain from './components/DealerSystemMain'
import RentSyncMain from './components/RentSyncMain'
import { LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const { user, loading, signOut } = useAuth()

  // 處理登入
  const handleLogin = (username: string, role: string) => {
    setUserName(username)
    setUserRole(role)
  }

  // 處理登出
  const handleLogout = async () => {
    await signOut()
    setUserName('')
    setUserRole('')
  }

  // 載入中顯示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  // 如果未登入，顯示登入頁面
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between h-20 pb-3">
              <div>
                <Link to="/" className="text-xl font-bold text-gray-800">系統主選單</Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {userName || user?.user_metadata?.username || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-gray-500 text-base">{userRole || 'user'}</div>
                </div>
                <button
                  onClick={async () => { await handleLogout(); window.location.href = '/' }}
                  className="flex items-center gap-2 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors text-lg"
                  title="登出"
                >
                  <LogOut size={22} />
                  登出
                </button>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">系統選單</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/dealer" className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold mb-2">經銷商系統</h2>
                  <p className="text-gray-600">管理經銷商資料與銷售</p>
                </Link>
                <Link to="/kol" className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold mb-2">KOL 管理系統</h2>
                  <p className="text-gray-600">管理 KOL、合作與分潤</p>
                </Link>
                <Link to="/rentsync" className="block bg-indigo-600 text-white rounded-lg shadow p-6 hover:shadow-lg hover:bg-indigo-700 transition">
                  <h2 className="text-xl font-semibold mb-2">RentSync 好住管家</h2>
                  <p className="text-indigo-100">租賃管理全方位平台</p>
                </Link>
              </div>
            </div>
          } />

          <Route path="/dealer" element={<DealerSystemMain />} />
          <Route path="/kol" element={<KOLManagementSystem />} />
          <Route path="/rentsync/*" element={<RentSyncMain />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
