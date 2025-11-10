import { useState, useEffect } from 'react'
import KOLManagementSystem from './components/KOLManagementSystem'
import Login from './components/Login'
import { LogOut } from 'lucide-react'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')

  // 檢查登入狀態
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const name = localStorage.getItem('userName') || ''
    const role = localStorage.getItem('userRole') || ''

    setIsLoggedIn(loggedIn)
    setUserName(name)
    setUserRole(role)
  }, [])

  // 處理登入
  const handleLogin = (username: string, role: string) => {
    setIsLoggedIn(true)
    setUserName(localStorage.getItem('userName') || username)
    setUserRole(role)
  }

  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    setUserName('')
    setUserRole('')
  }

  // 如果未登入，顯示登入頁面
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-end h-20 pb-3">
            <div className="flex items-center gap-4">
              <div className="text-xl">
                <div className="font-bold text-gray-800">{userName}</div>
                <div className="text-gray-500 text-base">{userRole}</div>
              </div>
              <button
                onClick={handleLogout}
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

      <KOLManagementSystem />
    </div>
  )
}
