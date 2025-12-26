import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) { setError('請填寫所有欄位'); return; }
    if (password !== confirmPassword) { setError('兩次輸入的密碼不一致'); return; }
    if (password.length < 8) { setError('密碼至少需要 8 個字元'); return; }
    if (!agreeTerms) { setError('請同意服務條款'); return; }
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError('註冊失敗，請稍後再試');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Zap className="w-10 h-10 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">AffiliateAI</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">免費註冊</h1>
          <p className="text-gray-600 text-center mb-8">開始你的 7 天免費試用</p>

          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="你的名字" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="至少 8 個字元" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">確認密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="再次輸入密碼" />
                {confirmPassword && password === confirmPassword && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
              </div>
            </div>

            <label className="flex items-start gap-3">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-600">我同意 <a href="#" className="text-indigo-600 hover:text-indigo-700">服務條款</a> 和 <a href="#" className="text-indigo-600 hover:text-indigo-700">隱私政策</a></span>
            </label>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? '註冊中...' : '免費註冊'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">已經有帳號？</span>
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">登入</Link>
          </div>
        </div>

        <div className="mt-6 bg-white/50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">註冊即可享有：</p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />7 天免費試用 Pro 方案</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />無限 AI 文案生成</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />全平台發文支援</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
