import React, { useState, useEffect } from 'react';
import { KOL, Collaboration, SalesTracking, ProfitShareRecord, Reminder } from '../types/kol';
import { mockKOLs, mockCollaborations, mockSalesTracking } from '../data/mockData';
import KOLDashboard from './KOLDashboard';
import KOLList from './KOLList';
import KOLDetail from './KOLDetail';
import KOLForm from './KOLForm';
import CollaborationManagement from './CollaborationManagement';
import { Users, Briefcase, DollarSign, BarChart3 } from 'lucide-react';
import * as kolService from '../services/kolService';
import * as collaborationService from '../services/collaborationService';

type ViewType = 'dashboard' | 'list' | 'detail' | 'form' | 'collaborations';

const KOLManagementSystem = () => {
  const [kols, setKOLs] = useState<KOL[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(mockCollaborations);
  const [salesTracking, setSalesTracking] = useState<SalesTracking[]>(mockSalesTracking);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [editingKOL, setEditingKOL] = useState<KOL | null>(null);

  // 載入 KOL 資料和合作專案
  useEffect(() => {
    loadKOLs();
    loadCollaborations();
  }, []);

  const loadKOLs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await kolService.getAllKOLs();
      setKOLs(data);
    } catch (err: any) {
      console.error('載入 KOL 資料失敗:', err);
      // 使用 mock 資料作為備援
      console.log('使用 mock 資料');
      setKOLs(mockKOLs);
      setError(null); // 不顯示錯誤，直接使用 mock 資料
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborations = async () => {
    try {
      const data = await collaborationService.getAllCollaborations();
      setCollaborations(data);
    } catch (err: any) {
      console.error('載入合作專案失敗:', err);
      // 使用 mock 資料作為備援
      setCollaborations(mockCollaborations);
    }
  };

  const handleAddKOL = () => {
    setEditingKOL(null);
    setCurrentView('form');
  };

  const handleEditKOL = (kol: KOL) => {
    setEditingKOL(kol);
    setCurrentView('form');
  };

  const handleViewKOL = (kol: KOL) => {
    setSelectedKOL(kol);
    setCurrentView('detail');
  };

  const handleDeleteKOL = async (id: number) => {
    try {
      await kolService.deleteKOL(id);
      setKOLs(kols.filter(k => k.id !== id));
      // 同時刪除相關的合作專案
      setCollaborations(collaborations.filter(c => c.kolId !== id));
      setSalesTracking(salesTracking.filter(s => s.kolId !== id));
    } catch (err: any) {
      console.error('刪除 KOL 失敗:', err);
      alert(`刪除失敗: ${err.message}`);
    }
  };

  const handleSaveKOL = async (kolData: Partial<KOL>) => {
    try {
      if (editingKOL) {
        // 更新現有 KOL
        const updated = await kolService.updateKOL(editingKOL.id, kolData);
        setKOLs(kols.map(k => k.id === editingKOL.id ? updated : k));
      } else {
        // 新增 KOL
        const newKOL = await kolService.createKOL(kolData as Omit<KOL, 'id' | 'createdAt' | 'updatedAt'>);
        setKOLs([...kols, newKOL]);
      }
      setCurrentView('list');
    } catch (err: any) {
      console.error('儲存 KOL 失敗:', err);
      alert(`儲存失敗: ${err.message}`);
    }
  };

  const handleSaveCollaboration = async (collabData: Partial<Collaboration>) => {
    try {
      if (collabData.id) {
        // 更新現有合作
        const updated = await collaborationService.updateCollaboration(collabData.id, collabData);
        setCollaborations(collaborations.map(c => c.id === collabData.id ? updated : c));
      } else {
        // 新增合作
        const newCollab = await collaborationService.createCollaboration(collabData as Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>);
        setCollaborations([...collaborations, newCollab]);
      }
    } catch (err: any) {
      console.error('儲存合作專案失敗:', err);
      alert(`儲存失敗: ${err.message}`);
    }
  };

  const handleDeleteCollaboration = async (id: number) => {
    try {
      await collaborationService.deleteCollaboration(id);
      setCollaborations(collaborations.filter(c => c.id !== id));
      setSalesTracking(salesTracking.filter(s => s.collaborationId !== id));
    } catch (err: any) {
      console.error('刪除合作專案失敗:', err);
      alert(`刪除失敗: ${err.message}`);
    }
  };

  // 處理分潤記錄
  const handleSaveProfitShare = (collaborationId: number, profitShareData: Partial<ProfitShareRecord>) => {
    setCollaborations(collaborations.map(collab => {
      if (collab.id === collaborationId) {
        const profitShares = collab.profitShares || [];
        if (profitShareData.id && profitShares.find(ps => ps.id === profitShareData.id)) {
          // 更新現有分潤記錄
          return {
            ...collab,
            profitShares: profitShares.map(ps =>
              ps.id === profitShareData.id ? { ...ps, ...profitShareData } as ProfitShareRecord : ps
            )
          };
        } else {
          // 新增分潤記錄
          return {
            ...collab,
            profitShares: [...profitShares, profitShareData as ProfitShareRecord]
          };
        }
      }
      return collab;
    }));
  };

  const handleDeleteProfitShare = (collaborationId: number, profitShareId: string) => {
    setCollaborations(collaborations.map(collab => {
      if (collab.id === collaborationId && collab.profitShares) {
        return {
          ...collab,
          profitShares: collab.profitShares.filter(ps => ps.id !== profitShareId)
        };
      }
      return collab;
    }));
  };

  // 處理提醒記錄
  const handleSaveReminder = (collaborationId: number, reminderData: Partial<Reminder>) => {
    setCollaborations(collaborations.map(collab => {
      if (collab.id === collaborationId) {
        const reminders = collab.reminders || [];
        if (reminderData.id && reminders.find(r => r.id === reminderData.id)) {
          // 更新現有提醒
          return {
            ...collab,
            reminders: reminders.map(r =>
              r.id === reminderData.id ? { ...r, ...reminderData } as Reminder : r
            )
          };
        } else {
          // 新增提醒
          return {
            ...collab,
            reminders: [...reminders, reminderData as Reminder]
          };
        }
      }
      return collab;
    }));
  };

  const handleDeleteReminder = (collaborationId: number, reminderId: string) => {
    setCollaborations(collaborations.map(collab => {
      if (collab.id === collaborationId && collab.reminders) {
        return {
          ...collab,
          reminders: collab.reminders.filter(r => r.id !== reminderId)
        };
      }
      return collab;
    }));
  };

  const handleToggleReminderComplete = (collaborationId: number, reminderId: string) => {
    setCollaborations(collaborations.map(collab => {
      if (collab.id === collaborationId && collab.reminders) {
        return {
          ...collab,
          reminders: collab.reminders.map(r =>
            r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
          )
        };
      }
      return collab;
    }));
  };

  // 處理合約狀態更新
  const handleUpdateContractStatus = (collaborationId: number, status: any) => {
    setCollaborations(collaborations.map(collab =>
      collab.id === collaborationId
        ? { ...collab, contractStatus: status, updatedAt: new Date().toISOString().split('T')[0] }
        : collab
    ));
  };

  // 載入中顯示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 錯誤提示 */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-yellow-700">{error}</p>
          </div>
        </div>
      )}

      {/* 導航列 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-4xl font-bold text-gray-800 hover:text-blue-600 transition-colors -mt-2"
            >
              遇見未來 KOL管理系統
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 size={18} />
                儀表板
              </button>
              <button
                onClick={() => setCurrentView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={18} />
                KOL 列表
              </button>
              <button
                onClick={() => setCurrentView('collaborations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentView === 'collaborations'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Briefcase size={18} />
                合作管理
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容區 */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {currentView === 'dashboard' && (
          <KOLDashboard
            kols={kols}
            collaborations={collaborations}
            salesTracking={salesTracking}
          />
        )}

        {currentView === 'list' && (
          <KOLList
            kols={kols}
            collaborations={collaborations}
            onAddKOL={handleAddKOL}
            onEditKOL={handleEditKOL}
            onViewKOL={handleViewKOL}
            onDeleteKOL={handleDeleteKOL}
          />
        )}

        {currentView === 'detail' && selectedKOL && (
          <KOLDetail
            kol={selectedKOL}
            collaborations={collaborations.filter(c => c.kolId === selectedKOL.id)}
            salesTracking={salesTracking.filter(s => s.kolId === selectedKOL.id)}
            onEdit={() => handleEditKOL(selectedKOL)}
            onBack={() => setCurrentView('list')}
            onViewCollaboration={(collab) => {
              setCurrentView('collaborations');
              // 這裡可以設置一個狀態來直接顯示該合作專案的詳情
            }}
            onViewProfitShares={(collab) => {
              setCurrentView('collaborations');
              // 這裡可以設置一個狀態來顯示該合作專案的分潤記錄
            }}
          />
        )}

        {currentView === 'form' && (
          <KOLForm
            kol={editingKOL}
            onSave={handleSaveKOL}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {currentView === 'collaborations' && (
          <CollaborationManagement
            kols={kols}
            collaborations={collaborations}
            salesTracking={salesTracking}
            onSaveCollaboration={handleSaveCollaboration}
            onDeleteCollaboration={handleDeleteCollaboration}
            onSaveProfitShare={handleSaveProfitShare}
            onDeleteProfitShare={handleDeleteProfitShare}
            onSaveReminder={handleSaveReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleReminderComplete={handleToggleReminderComplete}
            onUpdateContractStatus={handleUpdateContractStatus}
          />
        )}
      </main>
    </div>
  );
};

export default KOLManagementSystem;
