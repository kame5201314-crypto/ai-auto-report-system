import React, { useState, useEffect } from 'react';
import {
  Brain, Sliders, TrendingUp, Activity, Target, Settings,
  Save, RefreshCw, AlertTriangle, CheckCircle, Star,
  ChevronDown, ChevronUp, Plus, ThumbsUp, ThumbsDown,
  Clock, Users, BarChart3, Gauge, Zap, HelpCircle
} from 'lucide-react';
import { AIModelConfig, UserFeedback, Supplier } from '../../types/sidas';
import { aiModelService, supplierService } from '../../services/sidasService';

type TabType = 'weights' | 'performance' | 'feedback';

const AIConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('weights');
  const [modelConfig, setModelConfig] = useState<AIModelConfig | null>(null);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [editedWeights, setEditedWeights] = useState<AIModelConfig['featureWeights'] | null>(null);
  const [showNewFeedback, setShowNewFeedback] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [trainingResult, setTrainingResult] = useState<{ success: boolean; message: string } | null>(null);

  const [newFeedback, setNewFeedback] = useState({
    supplierId: '',
    outcome: 'success' as 'success' | 'failure' | 'problematic',
    qualityMatch: 3 as 1 | 2 | 3 | 4 | 5,
    priceMatch: 3 as 1 | 2 | 3 | 4 | 5,
    communicationQuality: 3 as 1 | 2 | 3 | 4 | 5,
    deliveryReliability: 3 as 1 | 2 | 3 | 4 | 5,
    overallSatisfaction: 3 as 1 | 2 | 3 | 4 | 5,
    comments: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const config = aiModelService.getConfig();
    setModelConfig(config);
    setEditedWeights({ ...config.featureWeights });
    setFeedbacks(aiModelService.getFeedbacks());
    setSuppliers(supplierService.getAll());
  };

  const handleWeightChange = (key: keyof AIModelConfig['featureWeights'], value: number) => {
    if (!editedWeights) return;
    setEditedWeights(prev => ({
      ...prev!,
      [key]: Math.max(0, Math.min(1, value))
    }));
  };

  const handleSaveWeights = () => {
    if (!editedWeights) return;

    // 確保權重總和為 1
    const total = Object.values(editedWeights).reduce((sum, v) => sum + v, 0);
    const normalized = Object.fromEntries(
      Object.entries(editedWeights).map(([k, v]) => [k, v / total])
    ) as AIModelConfig['featureWeights'];

    aiModelService.updateWeights(normalized);
    loadData();
    alert('權重設定已儲存！');
  };

  const handleSubmitFeedback = () => {
    if (!newFeedback.supplierId) return;

    const supplier = suppliers.find(s => s.id === newFeedback.supplierId);
    if (!supplier) return;

    aiModelService.submitFeedback({
      supplierId: newFeedback.supplierId,
      supplierName: supplier.companyName,
      outcome: newFeedback.outcome,
      originalScore: supplier.aiScore,
      feedbackDetails: {
        qualityMatch: newFeedback.qualityMatch,
        priceMatch: newFeedback.priceMatch,
        communicationQuality: newFeedback.communicationQuality,
        deliveryReliability: newFeedback.deliveryReliability,
        overallSatisfaction: newFeedback.overallSatisfaction
      },
      comments: newFeedback.comments || undefined,
      submittedBy: 'admin'
    });

    setShowNewFeedback(false);
    setNewFeedback({
      supplierId: '',
      outcome: 'success',
      qualityMatch: 3,
      priceMatch: 3,
      communicationQuality: 3,
      deliveryReliability: 3,
      overallSatisfaction: 3,
      comments: ''
    });
    loadData();
  };

  const handleTrainModel = () => {
    const result = aiModelService.trainModel();
    setTrainingResult(result);
    if (result.success) {
      loadData();
    }
    setTimeout(() => setTrainingResult(null), 5000);
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

  const getOutcomeBadge = (outcome: UserFeedback['outcome']) => {
    const styles = {
      success: 'bg-green-100 text-green-700',
      failure: 'bg-red-100 text-red-700',
      problematic: 'bg-yellow-100 text-yellow-700'
    };
    const labels = {
      success: '成功',
      failure: '失敗',
      problematic: '問題'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[outcome]}`}>
        {labels[outcome]}
      </span>
    );
  };

  const weightLabels: Record<keyof AIModelConfig['featureWeights'], { label: string; desc: string }> = {
    quality: { label: '品質', desc: '產品品質的評估權重' },
    price: { label: '價格', desc: '價格競爭力的權重' },
    reliability: { label: '可靠性', desc: '供應商可靠性評估' },
    customization: { label: '客製化', desc: 'ODM/OEM 客製化能力' },
    communication: { label: '溝通', desc: '溝通效率與品質' },
    geography: { label: '地理位置', desc: '地理位置優勢' },
    experience: { label: '經驗', desc: '公司經驗年限' },
    certifications: { label: '認證', desc: '相關認證與資質' }
  };

  if (!modelConfig || !editedWeights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 模型與系統配置</h1>
          <p className="text-gray-500 mt-1">訓練、監控和優化核心 AI 評分模型</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            模型版本: <span className="font-medium">{modelConfig.version}</span>
          </span>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* 訓練結果提示 */}
      {trainingResult && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          trainingResult.success ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {trainingResult.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{trainingResult.message}</span>
        </div>
      )}

      {/* 標籤頁 */}
      <div className="flex border-b">
        {[
          { id: 'weights', label: '評分權重調整', icon: Sliders },
          { id: 'performance', label: '模型性能監控', icon: Activity },
          { id: 'feedback', label: '用戶反饋輸入', icon: Target }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 評分權重調整 */}
      {activeTab === 'weights' && (
        <div className="space-y-6">
          {/* 權重說明 */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Brain className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">AI 評分模型說明</h3>
                <p className="text-gray-600 text-sm">
                  AI 潛力評分是基於以下特徵的加權計算。調整權重可以根據您的業務策略，
                  優先考慮某些特徵。例如，如果價格是首要考量，可以提高價格權重；
                  如果品質最重要，則提高品質權重。
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  * 儲存時系統會自動正規化權重，使總和為 100%
                </p>
              </div>
            </div>
          </div>

          {/* 權重調整器 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-600" />
              特徵權重配置
            </h3>

            <div className="space-y-6">
              {(Object.entries(editedWeights) as [keyof AIModelConfig['featureWeights'], number][]).map(([key, value]) => {
                const info = weightLabels[key];
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{info.label}</span>
                        <button className="text-gray-400 hover:text-gray-600" title={info.desc}>
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-cyan-600">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value * 100}
                        onChange={(e) => handleWeightChange(key, parseInt(e.target.value) / 100)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(value * 100)}
                        onChange={(e) => handleWeightChange(key, parseInt(e.target.value) / 100)}
                        className="w-16 px-2 py-1 border rounded text-center text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{info.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* 權重總和顯示 */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">權重總和</span>
                <span className={`font-bold ${
                  Math.abs(Object.values(editedWeights).reduce((s, v) => s + v, 0) - 1) < 0.01
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>
                  {(Object.values(editedWeights).reduce((s, v) => s + v, 0) * 100).toFixed(0)}%
                </span>
              </div>
              <button
                onClick={handleSaveWeights}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                儲存權重設定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模型性能監控 */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* 性能指標卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Target className="w-4 h-4" />
                準確率 (Accuracy)
              </div>
              <p className={`text-3xl font-bold ${
                modelConfig.performance.accuracy >= 0.85 ? 'text-green-600' :
                modelConfig.performance.accuracy >= 0.7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(modelConfig.performance.accuracy * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Gauge className="w-4 h-4" />
                精確率 (Precision)
              </div>
              <p className={`text-3xl font-bold ${
                modelConfig.performance.precision >= 0.85 ? 'text-green-600' :
                modelConfig.performance.precision >= 0.7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(modelConfig.performance.precision * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <TrendingUp className="w-4 h-4" />
                召回率 (Recall)
              </div>
              <p className={`text-3xl font-bold ${
                modelConfig.performance.recall >= 0.85 ? 'text-green-600' :
                modelConfig.performance.recall >= 0.7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(modelConfig.performance.recall * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <BarChart3 className="w-4 h-4" />
                F1 分數
              </div>
              <p className={`text-3xl font-bold ${
                modelConfig.performance.f1Score >= 0.85 ? 'text-green-600' :
                modelConfig.performance.f1Score >= 0.7 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(modelConfig.performance.f1Score * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* 訓練數據統計 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600" />
              訓練數據統計
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 反饋統計 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">反饋數據分佈</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">成功案例</span>
                      <span>{modelConfig.trainingStats.positiveOutcomes}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(modelConfig.trainingStats.positiveOutcomes / modelConfig.trainingStats.totalFeedbacks) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">中立案例</span>
                      <span>{modelConfig.trainingStats.neutralOutcomes}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-500"
                        style={{
                          width: `${(modelConfig.trainingStats.neutralOutcomes / modelConfig.trainingStats.totalFeedbacks) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">失敗案例</span>
                      <span>{modelConfig.trainingStats.negativeOutcomes}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${(modelConfig.trainingStats.negativeOutcomes / modelConfig.trainingStats.totalFeedbacks) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 訓練信息 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">訓練信息</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">總反饋數</span>
                    <span className="font-medium">{modelConfig.trainingStats.totalFeedbacks}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">樣本數量</span>
                    <span className="font-medium">{modelConfig.performance.sampleSize}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">最後訓練</span>
                    <span className="font-medium">{formatDate(modelConfig.trainingStats.lastTrainedAt)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">最後評估</span>
                    <span className="font-medium">{formatDate(modelConfig.performance.lastEvaluatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 訓練按鈕 */}
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleTrainModel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors"
              >
                <Zap className="w-5 h-5" />
                開始訓練模型
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                需要至少 10 條新反饋才能進行訓練
              </p>
            </div>
          </div>

          {/* 性能說明 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-800 mb-3">指標說明</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>準確率 (Accuracy)</strong>: 正確預測的比例</p>
                <p className="text-xs text-gray-500 mt-1">整體預測正確率</p>
              </div>
              <div>
                <p><strong>精確率 (Precision)</strong>: 預測為高潛力中實際高潛力的比例</p>
                <p className="text-xs text-gray-500 mt-1">減少誤報（假陽性）</p>
              </div>
              <div>
                <p><strong>召回率 (Recall)</strong>: 實際高潛力中被正確識別的比例</p>
                <p className="text-xs text-gray-500 mt-1">減少漏報（假陰性）</p>
              </div>
              <div>
                <p><strong>F1 分數</strong>: 精確率和召回率的調和平均</p>
                <p className="text-xs text-gray-500 mt-1">綜合性能指標</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 用戶反饋輸入 */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* 新增反饋按鈕 */}
          <button
            onClick={() => setShowNewFeedback(!showNewFeedback)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增合作反饋
          </button>

          {/* 新增反饋表單 */}
          {showNewFeedback && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-6">新增供應商合作反饋</h3>

              <div className="space-y-6">
                {/* 選擇供應商 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇供應商 *</label>
                  <select
                    value={newFeedback.supplierId}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- 請選擇 --</option>
                    {suppliers.filter(s => s.status === 'cooperating' || s.status === 'rejected').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.companyName} (評分: {s.aiScore})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 合作結果 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">合作結果 *</label>
                  <div className="flex gap-4">
                    {(['success', 'failure', 'problematic'] as const).map(outcome => (
                      <button
                        key={outcome}
                        onClick={() => setNewFeedback(prev => ({ ...prev, outcome }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          newFeedback.outcome === outcome
                            ? outcome === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
                              outcome === 'failure' ? 'bg-red-100 border-red-500 text-red-700' :
                              'bg-yellow-100 border-yellow-500 text-yellow-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {outcome === 'success' && <ThumbsUp className="w-4 h-4" />}
                        {outcome === 'failure' && <ThumbsDown className="w-4 h-4" />}
                        {outcome === 'problematic' && <AlertTriangle className="w-4 h-4" />}
                        {outcome === 'success' ? '成功' : outcome === 'failure' ? '失敗' : '有問題'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 評分細項 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { key: 'qualityMatch', label: '品質符合度' },
                    { key: 'priceMatch', label: '價格符合度' },
                    { key: 'communicationQuality', label: '溝通品質' },
                    { key: 'deliveryReliability', label: '交貨可靠性' },
                    { key: 'overallSatisfaction', label: '整體滿意度' }
                  ].map(item => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            onClick={() => setNewFeedback(prev => ({
                              ...prev,
                              [item.key]: score as 1 | 2 | 3 | 4 | 5
                            }))}
                            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                              newFeedback[item.key as keyof typeof newFeedback] === score
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 備註 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">備註 (選填)</label>
                  <textarea
                    value={newFeedback.comments}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg h-24"
                    placeholder="請輸入任何額外的反饋說明..."
                  />
                </div>

                {/* 提交按鈕 */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowNewFeedback(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={!newFeedback.supplierId}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    提交反饋
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 反饋記錄列表 */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-600" />
                歷史反饋記錄
              </h3>
            </div>

            {feedbacks.length > 0 ? (
              <div className="divide-y">
                {feedbacks.map(feedback => (
                  <div key={feedback.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-800">{feedback.supplierName}</h4>
                        <p className="text-sm text-gray-500">
                          原始評分: {feedback.originalScore} | {formatDate(feedback.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(feedback.outcome)}
                        {feedback.isUsedForTraining && (
                          <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs">
                            已用於訓練
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 評分細項 */}
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      {[
                        { label: '品質', value: feedback.feedbackDetails.qualityMatch },
                        { label: '價格', value: feedback.feedbackDetails.priceMatch },
                        { label: '溝通', value: feedback.feedbackDetails.communicationQuality },
                        { label: '交貨', value: feedback.feedbackDetails.deliveryReliability },
                        { label: '整體', value: feedback.feedbackDetails.overallSatisfaction }
                      ].map(item => (
                        <div key={item.label} className="text-center">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <div className="flex justify-center">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i <= item.value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {feedback.comments && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        "{feedback.comments}"
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {feedback.submittedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>尚無反饋記錄</p>
                <p className="text-sm mt-1">點擊上方按鈕新增第一筆反饋</p>
              </div>
            )}
          </div>

          {/* MLOps 說明 */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              MLOps 持續學習循環
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold mb-2">1</div>
                <p className="font-medium text-gray-800">收集反饋</p>
                <p className="text-xs text-gray-500 mt-1">採購人員輸入合作結果</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold mb-2">2</div>
                <p className="font-medium text-gray-800">數據累積</p>
                <p className="text-xs text-gray-500 mt-1">系統累積足夠訓練樣本</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold mb-2">3</div>
                <p className="font-medium text-gray-800">模型訓練</p>
                <p className="text-xs text-gray-500 mt-1">使用新數據優化模型</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold mb-2">4</div>
                <p className="font-medium text-gray-800">提升精準度</p>
                <p className="text-xs text-gray-500 mt-1">評分越來越準確</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfiguration;
