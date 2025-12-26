// 處理設定面板組件
import { useState, useRef } from 'react';
import {
  Scissors,
  Droplets,
  Maximize2,
  FileDown,
  Upload,
  Image as ImageIcon,
  Key,
  Cloud,
  Cpu,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type {
  ProcessingOptions,
  WatermarkPosition,
  BackgroundRemovalModel,
  BackgroundRemovalProvider,
  RemoveBgSize,
  RemoveBgType,
} from '../types';
import { PLATFORM_PRESETS } from '../types';

// 本地模型選項
const LOCAL_MODEL_OPTIONS: { value: BackgroundRemovalModel; label: string; description: string }[] = [
  { value: 'fast', label: '快速', description: '量化模型' },
  { value: 'balanced', label: '平衡', description: '半精度' },
  { value: 'quality', label: '高品質', description: '完整精度' },
];

// Remove.bg 尺寸選項
const REMOVE_BG_SIZE_OPTIONS: { value: RemoveBgSize; label: string; description: string; price: string }[] = [
  { value: 'preview', label: '預覽', description: '最高 625x400', price: '免費' },
  { value: 'auto', label: '自動', description: '依原圖調整', price: '付費' },
  { value: 'full', label: '高清', description: '最高 25MP', price: '付費' },
];

// Remove.bg 類型選項
const REMOVE_BG_TYPE_OPTIONS: { value: RemoveBgType; label: string }[] = [
  { value: 'auto', label: '自動偵測' },
  { value: 'product', label: '產品' },
  { value: 'person', label: '人物' },
  { value: 'car', label: '汽車' },
];

interface ProcessingOptionsPanelProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  watermarkPreview: string | null;
  onWatermarkUpload: (file: File) => void;
}

export default function ProcessingOptionsPanel({
  options,
  onChange,
  watermarkPreview,
  onWatermarkUpload,
}: ProcessingOptionsPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('shopee');
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = PLATFORM_PRESETS[presetKey];
    if (preset && presetKey !== 'custom') {
      onChange({
        ...options,
        targetWidth: preset.width,
        targetHeight: preset.height,
        outputFormat: preset.format,
        compressionQuality: preset.quality,
      });
    }
  };

  const handleWatermarkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onWatermarkUpload(file);
    }
  };

  const updateOption = <K extends keyof ProcessingOptions>(
    key: K,
    value: ProcessingOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  const watermarkPositions: { value: WatermarkPosition; label: string }[] = [
    { value: 'top-left', label: '左上' },
    { value: 'top-right', label: '右上' },
    { value: 'center', label: '中央' },
    { value: 'bottom-left', label: '左下' },
    { value: 'bottom-right', label: '右下' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <FileDown className="w-5 h-5" />
        處理設定
      </h2>

      {/* 去背設定 */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.removeBackground}
            onChange={(e) => updateOption('removeBackground', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <Scissors className="w-5 h-5 text-purple-500" />
          <span className="font-medium">自動去背</span>
        </label>
        <p className="text-sm text-gray-500 ml-8">
          使用 AI 模型自動移除圖片背景
        </p>

        {options.removeBackground && (
          <div className="ml-8 space-y-4">
            {/* 提供者選擇 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                去背引擎
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateOption('backgroundRemovalProvider', 'local')}
                  className={`
                    p-3 rounded-lg text-sm transition-colors text-left border
                    ${options.backgroundRemovalProvider === 'local'
                      ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Cpu className={`w-4 h-4 ${options.backgroundRemovalProvider === 'local' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="font-medium">本地處理</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">免費 · 隱私安全</div>
                </button>
                <button
                  onClick={() => updateOption('backgroundRemovalProvider', 'removebg')}
                  className={`
                    p-3 rounded-lg text-sm transition-colors text-left border
                    ${options.backgroundRemovalProvider === 'removebg'
                      ? 'bg-green-50 border-green-500 ring-1 ring-green-500'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Cloud className={`w-4 h-4 ${options.backgroundRemovalProvider === 'removebg' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Remove.bg</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">專業品質 · 付費</div>
                </button>
              </div>
            </div>

            {/* 本地處理設定 */}
            {options.backgroundRemovalProvider === 'local' && (
              <div className="p-4 bg-purple-50 rounded-lg space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  處理品質
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCAL_MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => updateOption('backgroundRemovalModel', model.value)}
                      className={`
                        px-3 py-2 rounded-lg text-sm transition-colors text-center
                        ${options.backgroundRemovalModel === model.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="font-medium">{model.label}</div>
                      <div className={`text-xs mt-1 ${
                        options.backgroundRemovalModel === model.value
                          ? 'text-purple-100'
                          : 'text-gray-500'
                      }`}>
                        {model.description}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-purple-600">
                  💡 本地處理完全免費，但複雜圖片效果可能較差
                </p>
              </div>
            )}

            {/* Remove.bg API 設定 */}
            {options.backgroundRemovalProvider === 'removebg' && (
              <div className="p-4 bg-green-50 rounded-lg space-y-4">
                {/* API Key 輸入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-1" />
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={options.removeBgApiKey}
                      onChange={(e) => updateOption('removeBgApiKey', e.target.value)}
                      placeholder="輸入你的 Remove.bg API Key"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <a
                      href="https://www.remove.bg/api#api-key"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      取得免費 API Key <ExternalLink className="w-3 h-3" />
                    </a>
                    {options.removeBgApiKey && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 已設定
                      </span>
                    )}
                  </div>
                </div>

                {/* 輸出尺寸 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    輸出尺寸
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {REMOVE_BG_SIZE_OPTIONS.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => updateOption('removeBgSize', size.value)}
                        className={`
                          px-3 py-2 rounded-lg text-sm transition-colors text-center
                          ${options.removeBgSize === size.value
                            ? 'bg-green-500 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="font-medium">{size.label}</div>
                        <div className={`text-xs mt-1 ${
                          options.removeBgSize === size.value
                            ? 'text-green-100'
                            : 'text-gray-500'
                        }`}>
                          {size.description}
                        </div>
                        <div className={`text-xs ${
                          options.removeBgSize === size.value
                            ? 'text-green-200'
                            : size.price === '免費' ? 'text-green-600' : 'text-orange-500'
                        }`}>
                          {size.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 圖片類型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    圖片類型
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REMOVE_BG_TYPE_OPTIONS.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateOption('removeBgType', type.value)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm transition-colors
                          ${options.removeBgType === type.value
                            ? 'bg-green-500 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 價格提示 */}
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium text-green-700">價格說明</p>
                      <ul className="mt-1 space-y-0.5">
                        <li>• 預覽：每月 50 張免費（低解析度）</li>
                        <li>• 高清：約 $0.20/張，量大有折扣</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 浮水印設定 */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.addWatermark}
            onChange={(e) => updateOption('addWatermark', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <Droplets className="w-5 h-5 text-blue-500" />
          <span className="font-medium">添加浮水印</span>
        </label>

        {options.addWatermark && (
          <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Logo 上傳 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                品牌 Logo
              </label>
              <div className="flex items-center gap-4">
                {watermarkPreview ? (
                  <div className="w-20 h-20 border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src={watermarkPreview}
                      alt="Watermark preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => watermarkInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg
                               hover:bg-gray-50 text-sm font-medium text-gray-700
                               flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    上傳 Logo
                  </button>
                  <p className="text-xs text-gray-500 mt-1">建議使用 PNG 透明背景</p>
                </div>
              </div>
            </div>

            {/* 位置選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                浮水印位置
              </label>
              <div className="grid grid-cols-5 gap-2">
                {watermarkPositions.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => updateOption('watermarkPosition', pos.value)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${options.watermarkPosition === pos.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 透明度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                透明度: {Math.round(options.watermarkOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={options.watermarkOpacity}
                onChange={(e) =>
                  updateOption('watermarkOpacity', parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 解析度設定 */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.resizeEnabled}
            onChange={(e) => updateOption('resizeEnabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <Maximize2 className="w-5 h-5 text-green-500" />
          <span className="font-medium">調整解析度</span>
        </label>

        {options.resizeEnabled && (
          <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* 平台預設 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                快速選擇
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-colors text-left
                      ${selectedPreset === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className={`text-xs ${selectedPreset === key ? 'text-blue-100' : 'text-gray-500'}`}>
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 自訂尺寸 */}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">寬度 (px)</label>
                <input
                  type="number"
                  value={options.targetWidth}
                  onChange={(e) => {
                    updateOption('targetWidth', parseInt(e.target.value) || 800);
                    setSelectedPreset('custom');
                  }}
                  className="w-24 px-3 py-2 border rounded-lg text-sm"
                  min="100"
                  max="4000"
                />
              </div>
              <span className="text-gray-400 mt-5">×</span>
              <div>
                <label className="block text-xs text-gray-500 mb-1">高度 (px)</label>
                <input
                  type="number"
                  value={options.targetHeight}
                  onChange={(e) => {
                    updateOption('targetHeight', parseInt(e.target.value) || 800);
                    setSelectedPreset('custom');
                  }}
                  className="w-24 px-3 py-2 border rounded-lg text-sm"
                  min="100"
                  max="4000"
                />
              </div>
            </div>

            {/* 保持比例 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.maintainAspectRatio}
                onChange={(e) =>
                  updateOption('maintainAspectRatio', e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">保持原始比例</span>
            </label>
          </div>
        )}
      </div>

      {/* 壓縮與輸出設定 */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.compressionEnabled}
            onChange={(e) => updateOption('compressionEnabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <FileDown className="w-5 h-5 text-orange-500" />
          <span className="font-medium">壓縮檔案</span>
        </label>

        <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg">
          {/* 輸出格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              輸出格式
            </label>
            <div className="flex gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => updateOption('outputFormat', format)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium uppercase transition-colors
                    ${options.outputFormat === format
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* 壓縮品質 */}
          {options.compressionEnabled && options.outputFormat !== 'png' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                壓縮品質: {Math.round(options.compressionQuality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={options.compressionQuality}
                onChange={(e) =>
                  updateOption('compressionQuality', parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>檔案較小</span>
                <span>品質較高</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
