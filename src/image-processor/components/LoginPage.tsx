/**
 * 登入頁面元件
 */
import { useState } from 'react';
import { Lock, User, Eye, EyeOff, ImageIcon, AlertCircle } from 'lucide-react';
import { login } from '../services/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = login(username, password);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || '登入失敗');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 區域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">圖片批量處理工具</h1>
          <p className="text-gray-500 mt-2">請登入以繼續使用</p>
        </div>

        {/* 登入表單 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 錯誤訊息 */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 帳號輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                帳號
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                           placeholder-gray-400 transition-colors"
                  placeholder="請輸入帳號"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 密碼輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                           placeholder-gray-400 transition-colors"
                  placeholder="請輸入密碼"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 登入按鈕 */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600
                       text-white font-medium rounded-lg shadow-md
                       hover:from-purple-600 hover:to-blue-700
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  登入中...
                </span>
              ) : (
                '登入'
              )}
            </button>
          </form>

          {/* 提示資訊 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              如需帳號請聯絡管理員
            </p>
          </div>
        </div>

        {/* 版權資訊 */}
        <p className="text-center text-gray-400 text-sm mt-6">
          &copy; 2024 圖片批量處理工具
        </p>
      </div>
    </div>
  );
}
