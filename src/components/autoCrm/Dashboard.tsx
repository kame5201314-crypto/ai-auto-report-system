import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, DollarSign, Users, Car, Wrench, Calendar,
  TrendingUp, Bell, Clock, AlertTriangle, CheckCircle,
  Gift, ArrowRight, ChevronRight
} from 'lucide-react';
import { DashboardStats, Reminder, ServiceRecord } from '../../types/autoCrm';
import { dashboardService, reminderService, serviceRecordService } from '../../services/autoCrmService';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayServices, setTodayServices] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setStats(dashboardService.getStats());
    setReminders(reminderService.getUpcoming(7));
    setTodayServices(serviceRecordService.getTodayServices());
  };

  const handleCompleteReminder = (id: string) => {
    reminderService.complete(id);
    setReminders(reminderService.getUpcoming(7));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'service_due': return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'birthday': return <Gift className="w-4 h-4 text-pink-500" />;
      case 'follow_up': return <Users className="w-4 h-4 text-purple-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 歡迎標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">儀表板</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.overdueServices > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              {stats.overdueServices} 項逾期
            </span>
          )}
          {stats.pendingPayments > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              <DollarSign className="w-4 h-4" />
              {stats.pendingPayments} 筆待收款
            </span>
          )}
        </div>
      </div>

      {/* 今日概覽 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">今日營收</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.todayRevenue)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center text-blue-100 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            {stats.todayServiceCount} 筆服務
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">本月營收</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.monthRevenue)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
          <div className="mt-4 flex items-center text-green-100 text-sm">
            {stats.monthGrowth >= 0 ? (
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.monthGrowth.toFixed(1)}% 成長
              </span>
            ) : (
              <span className="flex items-center text-green-200">
                {stats.monthGrowth.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">總客戶數</p>
              <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
            </div>
            <Users className="w-10 h-10 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center text-purple-100 text-sm">
            <Users className="w-4 h-4 mr-1" />
            本月新增 {stats.monthNewCustomers} 位
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">車輛數</p>
              <p className="text-2xl font-bold mt-1">{stats.totalVehicles}</p>
            </div>
            <Car className="w-10 h-10 text-orange-200" />
          </div>
          <div className="mt-4 flex items-center text-orange-100 text-sm">
            <Wrench className="w-4 h-4 mr-1" />
            {stats.activeServices} 台施工中
          </div>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日施工 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-600" />
              今日施工
            </h2>
            <button
              onClick={() => onNavigate('services')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            {todayServices.length > 0 ? (
              <div className="space-y-3">
                {todayServices.slice(0, 5).map(service => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('services')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'in_progress' ? 'bg-purple-500 animate-pulse' :
                        service.status === 'completed' ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-800">{service.customerName}</p>
                        <p className="text-sm text-gray-500">{service.vehicleInfo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{formatCurrency(service.total)}</p>
                      <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        service.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                        service.status === 'completed' ? 'bg-green-100 text-green-700' :
                        service.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {service.status === 'in_progress' ? '施工中' :
                         service.status === 'completed' ? '已完成' :
                         service.status === 'pending' ? '待處理' : service.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Wrench className="w-10 h-10 mx-auto mb-2" />
                <p>今日尚無施工安排</p>
              </div>
            )}
          </div>
        </div>

        {/* 待辦提醒 */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              待辦提醒
            </h2>
            <span className="text-sm text-gray-500">
              {reminders.filter(r => !r.isCompleted).length} 項待處理
            </span>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.filter(r => !r.isCompleted).slice(0, 8).map(reminder => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="mt-0.5">{getReminderIcon(reminder.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {reminder.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reminder.customerName} · {formatDate(reminder.dueDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="標記完成"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                <p>暫無待辦事項</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-800 mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('customers')}
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">新增客戶</p>
              <p className="text-xs text-gray-500">建立客戶資料</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('services')}
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">新增施工</p>
              <p className="text-xs text-gray-500">建立施工單</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('marketing')}
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
          >
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">行銷活動</p>
              <p className="text-xs text-gray-500">建立推廣活動</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">營收報表</p>
              <p className="text-xs text-gray-500">查看本月報表</p>
            </div>
          </button>
        </div>
      </div>

      {/* 待辦統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.upcomingAppointments}</p>
            <p className="text-sm text-gray-500">待處理預約</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Gift className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.birthdayReminders}</p>
            <p className="text-sm text-gray-500">生日提醒</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.serviceReminders}</p>
            <p className="text-sm text-gray-500">保養提醒</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.overdueServices}</p>
            <p className="text-sm text-gray-500">逾期服務</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
