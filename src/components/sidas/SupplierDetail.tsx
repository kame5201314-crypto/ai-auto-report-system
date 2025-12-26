import React, { useState, useEffect } from 'react';
import {
  X, Building2, Mail, Phone, Globe, MapPin, Calendar, Star,
  ExternalLink, Tag, MessageSquare, Clock, AlertTriangle,
  CheckCircle, XCircle, TrendingUp, Edit, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Shield, Users, DollarSign
} from 'lucide-react';
import { Supplier, ContactRecord, SupplierStatus } from '../../types/sidas';
import { supplierService, contactRecordService } from '../../services/sidasService';

interface SupplierDetailProps {
  supplier: Supplier;
  onClose: () => void;
  onUpdate: () => void;
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplier, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'analysis'>('info');
  const [contactRecords, setContactRecords] = useState<ContactRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState(supplier);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ContactRecord>>({
    contactType: 'email',
    subject: '',
    content: '',
  });
  const [expandedScores, setExpandedScores] = useState(true);

  useEffect(() => {
    loadContactRecords();
  }, [supplier.id]);

  const loadContactRecords = () => {
    setContactRecords(contactRecordService.getBySupplier(supplier.id));
  };

  const handleSave = () => {
    supplierService.update(supplier.id, editedSupplier);
    setIsEditing(false);
    onUpdate();
  };

  const handleAddContact = () => {
    if (!newContact.subject || !newContact.content) return;

    contactRecordService.create({
      supplierId: supplier.id,
      contactType: newContact.contactType as ContactRecord['contactType'],
      subject: newContact.subject,
      content: newContact.content,
      outcome: newContact.outcome as ContactRecord['outcome'],
      nextAction: newContact.nextAction,
      contactedBy: 'admin',
      contactedAt: new Date().toISOString(),
    });

    loadContactRecords();
    setShowNewContact(false);
    setNewContact({
      contactType: 'email',
      subject: '',
      content: '',
    });
    onUpdate();
  };

  const handleStatusChange = (status: SupplierStatus) => {
    supplierService.update(supplier.id, { status });
    onUpdate();
  };

  const getStatusConfig = (status: SupplierStatus) => {
    const config: Record<SupplierStatus, { label: string; color: string; bg: string }> = {
      not_contacted: { label: '未聯繫', color: 'text-gray-700', bg: 'bg-gray-100' },
      contacted: { label: '已聯繫', color: 'text-blue-700', bg: 'bg-blue-100' },
      negotiating: { label: '洽談中', color: 'text-yellow-700', bg: 'bg-yellow-100' },
      cooperating: { label: '合作中', color: 'text-green-700', bg: 'bg-green-100' },
      rejected: { label: '已拒絕', color: 'text-red-700', bg: 'bg-red-100' },
      blacklisted: { label: '黑名單', color: 'text-white', bg: 'bg-black' }
    };
    return config[status];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskConfig = (risk: 'low' | 'medium' | 'high') => {
    const config = {
      low: { label: '低風險', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      medium: { label: '中等風險', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertTriangle },
      high: { label: '高風險', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle }
    };
    return config[risk];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = getStatusConfig(supplier.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{supplier.companyName}</h2>
              {supplier.companyNameLocal && (
                <p className="text-gray-300 text-sm">{supplier.companyNameLocal}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            基本資訊
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            聯繫記錄 ({contactRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            AI 分析
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 基本資訊 */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* AI 評分卡片 */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-amber-500" />
                    <h3 className="font-semibold text-gray-800">AI 潛力評分</h3>
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(supplier.aiScore)}`}>
                    {supplier.aiScore}
                  </div>
                </div>

                {supplier.aiScoreDetails && (
                  <>
                    <button
                      onClick={() => setExpandedScores(!expandedScores)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 mb-3"
                    >
                      {expandedScores ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expandedScores ? '收起' : '展開'}評分細項
                    </button>

                    {expandedScores && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          { label: '品質', score: supplier.aiScoreDetails.qualityScore },
                          { label: '價格', score: supplier.aiScoreDetails.priceScore },
                          { label: '可靠性', score: supplier.aiScoreDetails.reliabilityScore },
                          { label: '客製化', score: supplier.aiScoreDetails.customizationScore },
                          { label: '溝通', score: supplier.aiScoreDetails.communicationScore }
                        ].map(item => (
                          <div key={item.label} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                            <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                            <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                              <div
                                className={`h-full ${getScoreBarColor(item.score)} transition-all`}
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 聯繫方式 */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                  聯繫方式
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">主要 Email</p>
                      <a href={`mailto:${supplier.primaryEmail}`} className="text-cyan-600 hover:underline">
                        {supplier.primaryEmail}
                      </a>
                    </div>
                  </div>
                  {supplier.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">電話</p>
                        <a href={`tel:${supplier.phone}`} className="text-cyan-600 hover:underline">
                          {supplier.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">網站</p>
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:underline flex items-center gap-1"
                        >
                          {supplier.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">地址</p>
                      <p className="text-gray-800">
                        {supplier.country}
                        {supplier.region && `, ${supplier.region}`}
                        {supplier.address && <span className="block text-sm text-gray-500">{supplier.address}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 分類與標籤 */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600" />
                  分類與標籤
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">產品類別</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.productCategories.map(cat => (
                        <span key={cat} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">關鍵詞</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.keywords.map(kw => (
                        <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">標籤</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 時間線 */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  時間記錄
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">發現時間:</span>
                    <span className="text-sm text-gray-800">{formatDate(supplier.discoveredAt)}</span>
                  </div>
                  {supplier.lastContactedAt && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">最後聯繫:</span>
                      <span className="text-sm text-gray-800">{formatDate(supplier.lastContactedAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">最後更新:</span>
                    <span className="text-sm text-gray-800">{formatDate(supplier.lastUpdatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* 備註 */}
              {supplier.notes && (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">備註</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{supplier.notes}</p>
                </div>
              )}

              {/* 狀態變更 */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">變更狀態</h3>
                <div className="flex flex-wrap gap-2">
                  {(['not_contacted', 'contacted', 'negotiating', 'cooperating', 'rejected'] as SupplierStatus[]).map(status => {
                    const config = getStatusConfig(status);
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={supplier.status === status}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          supplier.status === status
                            ? `${config.bg} ${config.color} cursor-default`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 聯繫記錄 */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {/* 新增聯繫記錄 */}
              <button
                onClick={() => setShowNewContact(!showNewContact)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新增聯繫記錄
              </button>

              {showNewContact && (
                <div className="bg-gray-50 border rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">新增聯繫記錄</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">聯繫類型</label>
                        <select
                          value={newContact.contactType}
                          onChange={(e) => setNewContact(prev => ({ ...prev, contactType: e.target.value as ContactRecord['contactType'] }))}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="email">Email</option>
                          <option value="phone">電話</option>
                          <option value="video_call">視訊會議</option>
                          <option value="meeting">面談</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">結果</label>
                        <select
                          value={newContact.outcome || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, outcome: e.target.value as ContactRecord['outcome'] }))}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">未定</option>
                          <option value="positive">正面</option>
                          <option value="neutral">中立</option>
                          <option value="negative">負面</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">主題 *</label>
                      <input
                        type="text"
                        value={newContact.subject}
                        onChange={(e) => setNewContact(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="聯繫主題"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">內容 *</label>
                      <textarea
                        value={newContact.content}
                        onChange={(e) => setNewContact(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg h-24"
                        placeholder="聯繫內容摘要"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">後續行動</label>
                      <input
                        type="text"
                        value={newContact.nextAction || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, nextAction: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="需要的後續行動"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowNewContact(false)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleAddContact}
                        disabled={!newContact.subject || !newContact.content}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                      >
                        儲存
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 聯繫記錄列表 */}
              {contactRecords.length > 0 ? (
                <div className="space-y-4">
                  {contactRecords.map(record => (
                    <div key={record.id} className="bg-white border rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.contactType === 'email' ? 'bg-blue-100 text-blue-700' :
                            record.contactType === 'phone' ? 'bg-green-100 text-green-700' :
                            record.contactType === 'video_call' ? 'bg-purple-100 text-purple-700' :
                            record.contactType === 'meeting' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {record.contactType === 'email' ? 'Email' :
                             record.contactType === 'phone' ? '電話' :
                             record.contactType === 'video_call' ? '視訊' :
                             record.contactType === 'meeting' ? '面談' : '其他'}
                          </span>
                          <h4 className="font-medium text-gray-800">{record.subject}</h4>
                        </div>
                        {record.outcome && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                            record.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {record.outcome === 'positive' ? '正面' :
                             record.outcome === 'negative' ? '負面' : '中立'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{record.content}</p>
                      {record.nextAction && (
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-3">
                          <TrendingUp className="w-4 h-4" />
                          後續: {record.nextAction}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(record.contactedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {record.contactedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border rounded-xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">尚無聯繫記錄</h3>
                  <p className="text-gray-500">點擊上方按鈕新增第一筆聯繫記錄</p>
                </div>
              )}
            </div>
          )}

          {/* AI 分析 */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* 風險分析 */}
              {supplier.riskAnalysis ? (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-600" />
                    信譽/風險分析
                  </h3>
                  {(() => {
                    const riskConfig = getRiskConfig(supplier.riskAnalysis.overallRisk);
                    const RiskIcon = riskConfig.icon;
                    return (
                      <>
                        <div className={`flex items-center gap-3 p-4 rounded-lg ${riskConfig.bg} mb-4`}>
                          <RiskIcon className={`w-6 h-6 ${riskConfig.color}`} />
                          <span className={`font-semibold ${riskConfig.color}`}>{riskConfig.label}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">風險因素:</p>
                          <ul className="space-y-1">
                            {supplier.riskAnalysis.factors.map((factor, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-gray-400 mt-4">
                            最後分析時間: {formatDate(supplier.riskAnalysis.lastAnalyzedAt)}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">尚無風險分析</h3>
                  <p className="text-gray-500 mb-4">此功能將在 Phase III 提供</p>
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg opacity-50 cursor-not-allowed">
                    請求分析
                  </button>
                </div>
              )}

              {/* AI 評分詳細說明 */}
              <div className="bg-white border rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  AI 評分模型說明
                </h3>
                <div className="prose prose-sm text-gray-600">
                  <p>AI 潛力評分是基於多維度數據分析得出的綜合評估，考量因素包括：</p>
                  <ul>
                    <li><strong>品質評分</strong>: 基於產品描述、認證資質、歷史評價</li>
                    <li><strong>價格評分</strong>: 與市場平均水平比較的競爭力</li>
                    <li><strong>可靠性評分</strong>: 公司成立年限、認證、評價穩定度</li>
                    <li><strong>客製化評分</strong>: ODM/OEM 能力、最小訂購量靈活度</li>
                    <li><strong>溝通評分</strong>: 回覆速度、溝通質量的歷史數據</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-4">
                    評分模型版本: 2.1.0 | 可在 AI 配置頁面調整權重
                  </p>
                </div>
              </div>

              {/* 採購建議 */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                  AI 採購建議
                </h3>
                <div className="space-y-3">
                  {supplier.aiScore >= 85 ? (
                    <div className="flex items-start gap-3 p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">高度推薦</p>
                        <p className="text-sm text-green-700">此供應商評分優異，建議優先聯繫洽談合作</p>
                      </div>
                    </div>
                  ) : supplier.aiScore >= 70 ? (
                    <div className="flex items-start gap-3 p-3 bg-blue-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">值得考慮</p>
                        <p className="text-sm text-blue-700">建議進一步了解並索取樣品評估</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">需謹慎評估</p>
                        <p className="text-sm text-yellow-700">評分較低，建議充分評估後再決定</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
