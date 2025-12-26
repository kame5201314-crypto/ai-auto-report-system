// 圖片批量處理工具主應用
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ImagePlus,
  Play,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  LogOut,
  User,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import DropZone from './components/DropZone';
import ImagePreviewList from './components/ImagePreviewList';
import ProcessingOptionsPanel from './components/ProcessingOptions';
import LoginPage from './components/LoginPage';
import type { ImageFile, ProcessingOptions as ProcessingOptionsType } from './types';
import { DEFAULT_OPTIONS } from './types';
import {
  processImageComplete,
  setWatermarkImage,
  generateFileName,
} from './services/imageProcessor';
import { isAuthenticated, logout, getCurrentUser, extendSession } from './services/auth';

export default function ImageProcessorApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptionsType>(DEFAULT_OPTIONS);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBlobs, setProcessedBlobs] = useState<Map<string, Blob>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // 檢查登入狀態
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setCurrentUser(getCurrentUser());
        extendSession(); // 延長 session
      }
    };

    checkAuth();
    // 每分鐘檢查一次登入狀態
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  // 設定頁面標題
  useEffect(() => {
    document.title = '圖片批量處理工具';
    return () => {
      document.title = 'KOL 管理系統'; // 離開時恢復原標題
    };
  }, []);

  // 處理登入成功
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentUser(getCurrentUser());
  };

  // 處理登出
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    // 清除所有資料
    handleReset();
  };

  // 如果未登入，顯示登入頁面
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 添加圖片
  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      originalUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // 移除單一圖片
  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.originalUrl);
        if (removed.processedUrl) {
          URL.revokeObjectURL(removed.processedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
    setProcessedBlobs((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // 清除全部
  const handleRemoveAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });
    setImages([]);
    setProcessedBlobs(new Map());
  }, [images]);

  // 上傳浮水印
  const handleWatermarkUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setWatermarkPreview(url);

    const img = new Image();
    img.onload = () => {
      setWatermarkImage(img);
    };
    img.src = url;
  }, []);

  // 更新單一圖片狀態
  const updateImageStatus = useCallback(
    (id: string, updates: Partial<ImageFile>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );
    },
    []
  );

  // 開始處理
  const handleStartProcessing = async () => {
    if (images.length === 0) return;

    // 檢查浮水印設定
    if (options.addWatermark && !watermarkPreview) {
      alert('請先上傳品牌 Logo');
      return;
    }

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    const pendingImages = images.filter(
      (img) => img.status === 'pending' || img.status === 'error'
    );

    for (const image of pendingImages) {
      if (abortControllerRef.current?.signal.aborted) break;

      try {
        updateImageStatus(image.id, { status: 'processing', progress: 0 });

        const processedBlob = await processImageComplete(
          image.file,
          options,
          (stage, progress) => {
            updateImageStatus(image.id, { progress });
          }
        );

        const processedUrl = URL.createObjectURL(processedBlob);

        setProcessedBlobs((prev) => new Map(prev).set(image.id, processedBlob));
        updateImageStatus(image.id, {
          status: 'completed',
          processedUrl,
          progress: 100,
        });
      } catch (error) {
        console.error('Processing error:', error);
        updateImageStatus(image.id, {
          status: 'error',
          error: error instanceof Error ? error.message : '處理失敗',
          progress: 0,
        });
      }
    }

    setIsProcessing(false);
  };

  // 重新處理失敗的圖片
  const handleRetryFailed = async () => {
    const failedImages = images.filter((img) => img.status === 'error');
    for (const img of failedImages) {
      updateImageStatus(img.id, { status: 'pending', error: undefined });
    }
    await handleStartProcessing();
  };

  // 下載全部
  const handleDownloadAll = async () => {
    const completedImages = images.filter((img) => img.status === 'completed');
    if (completedImages.length === 0) return;

    if (completedImages.length === 1) {
      // 單一檔案直接下載
      const image = completedImages[0];
      const blob = processedBlobs.get(image.id);
      if (blob) {
        const fileName = generateFileName(image.file.name, options.outputFormat);
        saveAs(blob, fileName);
      }
    } else {
      // 多檔案打包下載
      const zip = new JSZip();

      for (const image of completedImages) {
        const blob = processedBlobs.get(image.id);
        if (blob) {
          const fileName = generateFileName(image.file.name, options.outputFormat);
          zip.file(fileName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(zipBlob, `processed_images_${timestamp}.zip`);
    }
  };

  // 重置全部
  const handleReset = () => {
    handleRemoveAll();
    setOptions(DEFAULT_OPTIONS);
    setWatermarkPreview(null);
    setIsProcessing(false);
  };

  const pendingCount = images.filter((img) => img.status === 'pending').length;
  const completedCount = images.filter((img) => img.status === 'completed').length;
  const errorCount = images.filter((img) => img.status === 'error').length;
  const canProcess = images.length > 0 && (pendingCount > 0 || errorCount > 0);
  const canDownload = completedCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <ImagePlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  圖片批量處理工具
                </h1>
                <p className="text-sm text-gray-500">
                  去背 · 浮水印 · 解析度調整 · 壓縮
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 使用者資訊 */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{currentUser}</span>
              </div>

              {/* 登出按鈕 */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-600 hover:text-red-600
                         hover:bg-red-50 rounded-lg transition-colors
                         flex items-center gap-2"
                title="登出"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* 重置按鈕 */}
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800
                         hover:bg-gray-100 rounded-lg transition-colors
                         flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>

              {/* 重試失敗 */}
              {errorCount > 0 && !isProcessing && (
                <button
                  onClick={handleRetryFailed}
                  className="px-4 py-2 bg-orange-100 text-orange-700
                           hover:bg-orange-200 rounded-lg transition-colors
                           flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  重試失敗 ({errorCount})
                </button>
              )}

              {/* 開始處理 */}
              <button
                onClick={handleStartProcessing}
                disabled={!canProcess || isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600
                         text-white rounded-lg hover:from-blue-600 hover:to-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all flex items-center gap-2 font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    處理中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    開始處理 {pendingCount > 0 && `(${pendingCount})`}
                  </>
                )}
              </button>

              {/* 下載按鈕 */}
              <button
                onClick={handleDownloadAll}
                disabled={!canDownload || isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600
                         text-white rounded-lg hover:from-green-600 hover:to-green-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all flex items-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                下載 {completedCount > 0 && `(${completedCount})`}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：上傳區域與預覽 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 上傳區域 */}
            <DropZone onFilesAdded={handleFilesAdded} disabled={isProcessing} />

            {/* 圖片預覽列表 */}
            <ImagePreviewList
              images={images}
              onRemove={handleRemoveImage}
              onRemoveAll={handleRemoveAll}
            />

            {/* 處理完成提示 */}
            {completedCount > 0 && completedCount === images.length && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">
                    所有圖片處理完成！
                  </p>
                  <p className="text-sm text-green-600">
                    點擊「下載」按鈕獲取處理後的圖片
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 右側：設定面板 */}
          <div className="lg:col-span-1">
            <ProcessingOptionsPanel
              options={options}
              onChange={setOptions}
              watermarkPreview={watermarkPreview}
              onWatermarkUpload={handleWatermarkUpload}
            />

            {/* 使用說明 */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-medium text-blue-800 mb-2">使用說明</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>拖拽或點擊上傳產品圖片</li>
                <li>根據需求調整右側設定</li>
                <li>如需浮水印，請先上傳品牌 Logo</li>
                <li>點擊「開始處理」進行批量處理</li>
                <li>處理完成後點擊「下載」獲取圖片</li>
              </ol>
            </div>

            {/* 支援格式說明 */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <h3 className="font-medium text-gray-800 mb-2">支援格式</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>輸入：</strong>JPG, PNG, WebP, GIF</p>
                <p><strong>輸出：</strong>JPG, PNG, WebP</p>
                <p><strong>最大檔案：</strong>20MB</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            圖片批量處理工具 - 所有圖片處理均在瀏覽器本地完成，不會上傳至伺服器
          </p>
        </div>
      </footer>
    </div>
  );
}
