import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Settings,
  Image,
  Target,
  Search,
  Sliders,
  AlertCircle
} from 'lucide-react';
import {
  DigitalAsset,
  ScanConfig as ScanConfigType,
  ScanTask,
  PlatformType,
  PLATFORM_LABELS
} from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';

interface ScanConfigProps {
  onStartScan: (task: ScanTask) => void;
  onClose: () => void;
  preSelectedAssets?: string[];
}

const ScanConfig: React.FC<ScanConfigProps> = ({
  onStartScan,
  onClose,
  preSelectedAssets = []
}) => {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(preSelectedAssets);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['shopee']);
  const [keywords, setKeywords] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState(70);
  const [maxResults, setMaxResults] = useState(100);
  const [scanDepth, setScanDepth] = useState(5);
  const [scanType, setScanType] = useState<'keyword' | 'visual' | 'hybrid'>('hybrid');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    console.log('[ScanConfig] 開始載入資產...');
    const allAssets = imageGuardianService.assets.getAll();
    console.log(`[ScanConfig] 從 service 取得 ${allAssets.length} 個資產`);

    const loadedAssets = allAssets.filter(a => a.status === 'monitoring' || a.status === 'indexed');
    console.log(`[ScanConfig] 過濾後 (monitoring/indexed): ${loadedAssets.length} 個資產`);

    if (loadedAssets.length === 0 && allAssets.length > 0) {
      console.warn('[ScanConfig] 有資產但狀態不符合，顯示所有資產');
      // 如果有資產但都不是 monitoring/indexed 狀態，顯示所有資產
      setAssets(allAssets);
    } else {
      setAssets(loadedAssets);
    }
  }, []);

  const toggleAsset = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const selectAllAssets = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map(a => a.id));
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: string[] = [];

    if (selectedAssets.length === 0) {
      newErrors.push('請至少選擇一個資產進行掃描');
    }

    if (selectedPlatforms.length === 0) {
      newErrors.push('請至少選擇一個目標平台');
    }

    if (scanType !== 'visual' && !keywords.trim()) {
      newErrors.push('關鍵字搜尋模式需要輸入搜尋關鍵字');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleStartScan = () => {
    if (!validateConfig()) return;

    const config: ScanConfigType = {
      assetIds: selectedAssets,
      platforms: selectedPlatforms,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      similarityThreshold,
      maxResults,
      scanDepth
    };

    const task = imageGuardianService.scan.createTask(config, scanType);
    onStartScan(task);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">掃描設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 內容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 錯誤提示 */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 掃描類型 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              掃描類型
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'hybrid', label: '混合搜尋', desc: '關鍵字 + 視覺比對（推薦）' },
                { value: 'keyword', label: '關鍵字搜尋', desc: '先搜尋再比對' },
                { value: 'visual', label: '純視覺比對', desc: '僅比對圖片' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setScanType(type.value as typeof scanType)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    scanType === type.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <p className={`font-medium ${scanType === type.value ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 選擇資產 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Image className="w-4 h-4" />
                選擇要保護的資產
              </h3>
              <button
                onClick={selectAllAssets}
                className="text-sm text-indigo-600 hover:underline"
              >
                {selectedAssets.length === assets.length ? '取消全選' : '全選'}
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Image className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">尚無可用資產</p>
                <p className="text-sm text-gray-400">請先上傳圖片資產</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => toggleAsset(asset.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAssets.includes(asset.id)
                        ? 'border-indigo-600 ring-2 ring-indigo-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.fileName}
                      className="w-full aspect-square object-cover"
                    />
                    {selectedAssets.includes(asset.id) && (
                      <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              已選擇 {selectedAssets.length} / {assets.length} 個資產
            </p>
          </div>

          {/* 目標平台 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              目標平台
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLATFORM_LABELS) as PlatformType[]).map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedPlatforms.includes(platform)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {PLATFORM_LABELS[platform]}
                </button>
              ))}
            </div>
          </div>

          {/* 搜尋關鍵字 */}
          {scanType !== 'visual' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                搜尋關鍵字
              </h3>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="輸入關鍵字，用逗號分隔（例如：手機鏡頭, APEX, 微距）"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                建議使用品牌名、產品名或產品特徵作為關鍵字
              </p>
            </div>
          )}

          {/* 進階設定 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              進階設定
            </h3>

            <div className="space-y-4">
              {/* 相似度門檻 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">相似度門檻</label>
                  <span className="text-sm font-medium text-indigo-600">{similarityThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50% (較寬鬆)</span>
                  <span>95% (較嚴格)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 最大結果數 */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">最大結果數</label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={50}>50 筆</option>
                    <option value={100}>100 筆</option>
                    <option value={200}>200 筆</option>
                    <option value={500}>500 筆</option>
                  </select>
                </div>

                {/* 掃描深度 */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">掃描深度（頁數）</label>
                  <select
                    value={scanDepth}
                    onChange={(e) => setScanDepth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={3}>3 頁</option>
                    <option value={5}>5 頁</option>
                    <option value={10}>10 頁</option>
                    <option value={20}>20 頁</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="px-6 py-4 border-t">
          {/* 驗證提示 - 直接顯示在按鈕上方 */}
          {(selectedAssets.length === 0 || selectedPlatforms.length === 0 || (scanType !== 'visual' && !keywords.trim())) && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  {selectedAssets.length === 0 && <p>• 請向上捲動選擇至少一個資產</p>}
                  {selectedPlatforms.length === 0 && <p>• 請選擇至少一個目標平台</p>}
                  {scanType !== 'visual' && !keywords.trim() && <p>• 請輸入搜尋關鍵字</p>}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              預計掃描約 {maxResults * selectedPlatforms.length} 個商品
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleStartScan}
                disabled={selectedAssets.length === 0 || selectedPlatforms.length === 0 || (scanType !== 'visual' && !keywords.trim())}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                啟動掃描
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanConfig;
