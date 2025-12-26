import React, { useState } from 'react';
import { User, CreditCard, Bell, Link2, Key, Check, Crown, Facebook, Instagram, MessageCircle, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pricingPlans } from '../services/mockData';

type Tab = 'profile' | 'plan' | 'affiliate' | 'notifications' | 'connections';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user, updatePlan } = useAuth();
  const [affiliateCode, setAffiliateCode] = useState('AFF123456');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs = [
    { id: 'profile' as Tab, label: '個人資料', icon: User },
    { id: 'plan' as Tab, label: '方案管理', icon: CreditCard },
    { id: 'affiliate' as Tab, label: '聯盟設定', icon: Link2 },
    { id: 'connections' as Tab, label: '帳號連結', icon: Key },
    { id: 'notifications' as Tab, label: '通知設定', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">帳號設定</h1><p className="text-gray-600">管理你的帳號和方案</p></div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                <tab.icon className="w-5 h-5" /><span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">個人資料</h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">{user?.name?.charAt(0) || 'U'}</div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">更換頭像</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">姓名</label><input type="text" defaultValue={user?.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label><input type="email" defaultValue={user?.email} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">密碼</label><button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">變更密碼</button></div>
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">{saved ? <Check className="w-4 h-4" /> : null}{saved ? '已儲存' : '儲存變更'}</button>
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">方案管理</h2>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-2"><Crown className="w-5 h-5" /><span className="text-sm opacity-80">目前方案</span></div>
                <h3 className="text-2xl font-bold capitalize">{user?.plan || 'Basic'}</h3>
                <p className="text-sm opacity-80 mt-1">{user?.plan === 'basic' ? '每月 10 次 AI 生成' : user?.plan === 'pro' ? '每月 100 次 AI 生成' : '無限 AI 生成'}</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {pricingPlans.map((plan) => {
                  const isCurrentPlan = user?.plan === plan.id;
                  return (
                    <div key={plan.id} className={`border rounded-xl p-4 ${isCurrentPlan ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price === 0 ? '免費' : `$${plan.price}`}{plan.price > 0 && <span className="text-sm font-normal text-gray-500">/月</span>}</p>
                      <ul className="mt-4 space-y-2">
                        {plan.features.slice(0, 4).map((feature, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" />{feature}</li>)}
                      </ul>
                      <button onClick={() => !isCurrentPlan && updatePlan(plan.id)} disabled={isCurrentPlan} className={`w-full mt-4 py-2 rounded-lg font-medium transition ${isCurrentPlan ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isCurrentPlan ? '目前方案' : '升級'}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">聯盟設定</h2>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-sm text-yellow-800">請先至蝦皮聯盟後台取得你的聯盟代碼，我們會使用此代碼生成你的專屬聯盟連結</p></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">蝦皮聯盟代碼</label>
                <input type="text" value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value)} placeholder="輸入你的蝦皮聯盟代碼" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                <p className="text-sm text-gray-500 mt-1">可在蝦皮聯盟後台的「帳戶設定」中找到</p>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-end"><button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">{saved ? <Check className="w-4 h-4" /> : null}{saved ? '已儲存' : '儲存設定'}</button></div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">帳號連結</h2>
              <p className="text-gray-600">連結你的社群帳號以啟用自動發文功能</p>
              <div className="space-y-4">
                {[
                  { icon: <Facebook className="w-6 h-6 text-blue-600" />, name: 'Facebook', description: '粉絲專頁：我的粉絲專頁', connected: true },
                  { icon: <Instagram className="w-6 h-6 text-pink-600" />, name: 'Instagram', description: '@myshop_tw', connected: true },
                  { icon: <MessageCircle className="w-6 h-6 text-green-600" />, name: 'LINE 官方帳號', description: '尚未連結', connected: false },
                ].map((conn, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">{conn.icon}</div>
                      <div><h3 className="font-medium text-gray-900">{conn.name}</h3><p className="text-sm text-gray-500">{conn.description}</p></div>
                    </div>
                    {conn.connected ? (
                      <div className="flex items-center gap-2"><span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">已連結</span><button className="text-sm text-gray-500 hover:text-red-500">斷開連結</button></div>
                    ) : <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"><Plus className="w-4 h-4" />連結</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">通知設定</h2>
              <div className="space-y-4">
                {[
                  { title: '貼文發佈通知', description: '當排程貼文成功發佈時收到通知', defaultChecked: true },
                  { title: '每週成效報告', description: '每週一收到上週的成效摘要', defaultChecked: true },
                  { title: '新功能通知', description: '收到產品更新和新功能通知', defaultChecked: false },
                ].map((notif, i) => {
                  const [checked, setChecked] = useState(notif.defaultChecked);
                  return (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div><h3 className="font-medium text-gray-900">{notif.title}</h3><p className="text-sm text-gray-500">{notif.description}</p></div>
                      <button onClick={() => setChecked(!checked)} className={`relative w-12 h-6 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
