import React, { useState } from 'react';
import {
  Car, LayoutDashboard, Users, Megaphone, Wrench, BarChart3,
  Menu, X, LogOut, Settings, Bell, ChevronDown
} from 'lucide-react';
import Dashboard from './Dashboard';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';
import MarketingManagement from './MarketingManagement';
import ServiceRecordManagement from './ServiceRecordManagement';
import RevenueReport from './RevenueReport';
import { Customer } from '../../types/autoCrm';

type PageType = 'dashboard' | 'customers' | 'marketing' | 'services' | 'reports' | 'settings';

interface AutoCrmSystemProps {
  onLogout?: () => void;
}

const AutoCrmSystem: React.FC<AutoCrmSystemProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 客戶管理狀態
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const menuItems = [
    { id: 'dashboard', label: '儀表板', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'customers', label: '客戶管理', icon: Users, color: 'text-green-600' },
    { id: 'services', label: '施工記錄', icon: Wrench, color: 'text-purple-600' },
    { id: 'marketing', label: '行銷管理', icon: Megaphone, color: 'text-orange-600' },
    { id: 'reports', label: '營收報表', icon: BarChart3, color: 'text-cyan-600' },
  ];

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    setIsMobileSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'customers':
        return (
          <>
            <CustomerList
              onSelectCustomer={(customer) => setSelectedCustomer(customer)}
              onEditCustomer={(customer) => {
                setEditingCustomer(customer);
                setShowCustomerForm(true);
              }}
              onAddCustomer={() => {
                setEditingCustomer(null);
                setShowCustomerForm(true);
              }}
            />
            {showCustomerForm && (
              <CustomerForm
                customer={editingCustomer}
                onSave={() => {
                  setShowCustomerForm(false);
                  setEditingCustomer(null);
                }}
                onCancel={() => {
                  setShowCustomerForm(false);
                  setEditingCustomer(null);
                }}
              />
            )}
            {selectedCustomer && !showCustomerForm && (
              <CustomerDetail
                customer={selectedCustomer}
                onEdit={() => {
                  setEditingCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                  setShowCustomerForm(true);
                }}
                onClose={() => setSelectedCustomer(null)}
                onCreateService={() => {
                  setSelectedCustomer(null);
                  setCurrentPage('services');
                }}
              />
            )}
          </>
        );
      case 'marketing':
        return <MarketingManagement />;
      case 'services':
        return <ServiceRecordManagement />;
      case 'reports':
        return <RevenueReport />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">系統設定</h2>
            <p className="text-gray-500">設定功能開發中...</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頂部導航欄 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            {/* 手機版選單按鈕 */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* 桌面版收合按鈕 */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">汽車美容 CRM</h1>
                <p className="text-xs text-gray-500 hidden sm:block">客戶關係管理系統</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 通知 */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* 用戶選單 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">管理員</span>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
            {/* 登出按鈕 */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg"
                title="登出"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 側邊欄 - 桌面版 */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white shadow-lg transition-all duration-300 z-30 hidden lg:block ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as PageType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                {isSidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 側邊欄底部 */}
        {isSidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setCurrentPage('settings')}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">系統設定</span>
            </button>
          </div>
        )}
      </aside>

      {/* 側邊欄 - 手機版 */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">汽車美容 CRM</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* 主內容區 */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AutoCrmSystem;
