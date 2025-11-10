import React, { useState } from 'react';
import { KOL, Collaboration, SalesTracking } from '../types/kol';
import { mockKOLs, mockCollaborations, mockSalesTracking } from '../data/mockData';
import KOLDashboard from './KOLDashboard';
import KOLList from './KOLList';
import KOLDetail from './KOLDetail';
import KOLForm from './KOLForm';
import CollaborationManagement from './CollaborationManagement';
import { Users, Briefcase, DollarSign, BarChart3 } from 'lucide-react';

type ViewType = 'dashboard' | 'list' | 'detail' | 'form' | 'collaborations';

const KOLManagementSystem = () => {
  const [kols, setKOLs] = useState<KOL[]>(mockKOLs);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(mockCollaborations);
  const [salesTracking, setSalesTracking] = useState<SalesTracking[]>(mockSalesTracking);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [editingKOL, setEditingKOL] = useState<KOL | null>(null);

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

  const handleDeleteKOL = (id: number) => {
    if (confirm('確定要刪除此 KOL 嗎？')) {
      setKOLs(kols.filter(k => k.id !== id));
      // 同時刪除相關的合作專案
      setCollaborations(collaborations.filter(c => c.kolId !== id));
      setSalesTracking(salesTracking.filter(s => s.kolId !== id));
    }
  };

  const handleSaveKOL = (kolData: Partial<KOL>) => {
    if (editingKOL) {
      // 更新現有 KOL
      setKOLs(kols.map(k => k.id === editingKOL.id ? { ...k, ...kolData, updatedAt: new Date().toISOString().split('T')[0] } : k));
    } else {
      // 新增 KOL
      const newKOL: KOL = {
        id: Math.max(...kols.map(k => k.id), 0) + 1,
        ...kolData as KOL,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setKOLs([...kols, newKOL]);
    }
    setCurrentView('list');
  };

  const handleSaveCollaboration = (collabData: Partial<Collaboration>) => {
    if (collabData.id) {
      // 更新現有合作
      setCollaborations(collaborations.map(c =>
        c.id === collabData.id ? { ...c, ...collabData, updatedAt: new Date().toISOString().split('T')[0] } : c
      ));
    } else {
      // 新增合作
      const newCollab: Collaboration = {
        id: Math.max(...collaborations.map(c => c.id), 0) + 1,
        ...collabData as Collaboration,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCollaborations([...collaborations, newCollab]);
    }
  };

  const handleDeleteCollaboration = (id: number) => {
    if (confirm('確定要刪除此合作專案嗎？')) {
      setCollaborations(collaborations.filter(c => c.id !== id));
      setSalesTracking(salesTracking.filter(s => s.collaborationId !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          />
        )}
      </main>
    </div>
  );
};

export default KOLManagementSystem;
