import React, { useState } from 'react';
import {
  Database, LayoutDashboard, Users, Settings as SettingsIcon,
  Menu, X, LogOut, Bell, ChevronDown, Brain, Zap
} from 'lucide-react';
import Dashboard from './Dashboard';
import SupplierList from './SupplierList';
import SupplierDetail from './SupplierDetail';
import AcquisitionManagement from './AcquisitionManagement';
import AIConfiguration from './AIConfiguration';
import { Supplier } from '../../types/sidas';
import { supplierService } from '../../services/sidasService';

type PageType = 'dashboard' | 'suppliers' | 'acquisition' | 'ai-config' | 'settings';

interface SIDASSystemProps {
  onLogout?: () => void;
}

const SIDASSystem: React.FC<SIDASSystemProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const menuItems = [
    { id: 'dashboard', label: '儀表板', icon: LayoutDashboard, color: 'text-cyan-600' },
    { id: 'suppliers', label: '供應商名單', icon: Users, color: 'text-emerald-600' },
    { id: 'acquisition', label: '數據採集管理', icon: Database, color: 'text-violet-600' },
    { id: 'ai-config', label: 'AI 模型配置', icon: Brain, color: 'text-amber-600' },
  ];

  const handleNavigate = (page: string, supplierId?: string) => {
    if (page === 'supplier-detail' && supplierId) {
      const supplier = supplierService.getById(supplierId);
      if (supplier) {
        setSelectedSupplier(supplier);
      }
      return;
    }
    setCurrentPage(page as PageType);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleCloseSupplierDetail = () => {
    setSelectedSupplier(null);
  };

  const handleSupplierUpdate = () => {
    if (selectedSupplier) {
      const updated = supplierService.getById(selectedSupplier.id);
      if (updated) {
        setSelectedSupplier(updated);
      }
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'suppliers':
        return <SupplierList onSelectSupplier={handleSelectSupplier} />;
      case 'acquisition':
        return <AcquisitionManagement />;
      case 'ai-config':
        return <AIConfiguration />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            {/* 手機版選單按鈕 */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* 桌面版收合按鈕 */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 hover:bg-white/10 rounded-lg text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">SIDAS</h1>
                <p className="text-xs text-gray-400 hidden sm:block">供應商情報與數據採集系統</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 通知 */}
            <button className="relative p-2 hover:bg-white/10 rounded-lg text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            {/* 用戶選單 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="hidden sm:block text-sm font-medium text-white">管理員</span>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
            {/* 登出按鈕 */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                title="返回系統選擇"
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
                    ? 'bg-cyan-50 text-cyan-600'
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
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">系統設定</span>
            </button>

            {/* 系統狀態指示 */}
            <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-gray-700">系統運行正常</span>
              </div>
              <p className="text-xs text-gray-500">
                v1.0.0 | Phase I
              </p>
            </div>
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
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">SIDAS</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white"
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
                        ? 'bg-cyan-50 text-cyan-600'
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

      {/* 供應商詳細頁面 Modal */}
      {selectedSupplier && (
        <SupplierDetail
          supplier={selectedSupplier}
          onClose={handleCloseSupplierDetail}
          onUpdate={handleSupplierUpdate}
        />
      )}
    </div>
  );
};

export default SIDASSystem;
