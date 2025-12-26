import React, { useState, useCallback } from 'react';
import {
  Upload,
  Image,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileImage,
  Tag
} from 'lucide-react';
import { DigitalAsset, AssetUploadProgress } from '../../../types/imageGuardian';
import { imageGuardianService } from '../../../services/imageGuardianService';

interface AssetUploadProps {
  onUploadComplete: (assets: DigitalAsset[]) => void;
  onCancel: () => void;
  maxFiles?: number;
  maxFileSize?: number;
}

const AssetUpload: React.FC<AssetUploadProps> = ({
  onUploadComplete,
  onCancel,
  maxFiles = 20,
  maxFileSize = 20 * 1024 * 1024 // 20MB
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<AssetUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tags, setTags] = useState<string>('');
  const [description, setDescription] = useState('');
  const [productSku, setProductSku] = useState('');
  const [brandName, setBrandName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= maxFileSize;
      return isImage && isValidSize;
    });

    const totalFiles = files.length + imageFiles.length;
    const filesToAdd = imageFiles.slice(0, maxFiles - files.length);

    if (filesToAdd.length > 0) {
      setFiles(prev => [...prev, ...filesToAdd]);

      // 生成預覽
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    if (totalFiles > maxFiles) {
      alert(`最多只能上傳 ${maxFiles} 個檔案`);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const processUpload = async (): Promise<DigitalAsset[]> => {
    const uploadedAssets: DigitalAsset[] = [];
    const tagList = tags.split(',').map(t => t.trim()).filter(t => t);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 更新進度：上傳中
      setUploadProgress(prev => {
        const newProgress = [...prev];
        newProgress[i] = { fileName: file.name, status: 'uploading', progress: 0 };
        return newProgress;
      });

      // 模擬上傳進度
      for (let p = 0; p <= 50; p += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[i] = { ...newProgress[i], progress: p };
          return newProgress;
        });
      }

      // 更新進度：處理指紋
      setUploadProgress(prev => {
        const newProgress = [...prev];
        newProgress[i] = { ...newProgress[i], status: 'processing', progress: 50 };
        return newProgress;
      });

      try {
        // 使用服務的 upload 函數（會自動壓縮圖片）
        const newAsset = await imageGuardianService.assets.upload(file, {
          tags: tagList,
          description,
          productSku: productSku || undefined,
          brandName: brandName || undefined
        });

        uploadedAssets.push(newAsset);

        // 更新進度：完成
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[i] = { ...newProgress[i], status: 'completed', progress: 100 };
          return newProgress;
        });
      } catch (error) {
        console.error(`上傳檔案 ${file.name} 失敗:`, error);
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[i] = { ...newProgress[i], status: 'failed', progress: 0 };
          return newProgress;
        });
      }
    }

    return uploadedAssets;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(files.map(f => ({
      fileName: f.name,
      status: 'pending',
      progress: 0
    })));

    try {
      const uploadedAssets = await processUpload();
      if (uploadedAssets.length > 0) {
        onUploadComplete(uploadedAssets);
      } else {
        alert('上傳失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗，請稍後再試');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 拖放上傳區 */}
      {!isUploading && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              拖放圖片或點擊上傳
            </p>
            <p className="text-sm text-gray-500">
              支援 JPG、PNG、WebP，最大 20MB，最多 {maxFiles} 個檔案
            </p>
          </label>
        </div>
      )}

      {/* 預覽區 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">
            已選擇 {files.length} 個檔案
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {previews[index] ? (
                    <img
                      src={previews[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* 上傳進度覆蓋 */}
                {isUploading && uploadProgress[index] && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    {uploadProgress[index].status === 'completed' ? (
                      <Check className="w-8 h-8 text-green-400" />
                    ) : uploadProgress[index].status === 'failed' ? (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    ) : (
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-2" />
                        <p className="text-white text-xs">
                          {uploadProgress[index].status === 'processing'
                            ? '計算指紋...'
                            : '上傳中...'}
                        </p>
                        <p className="text-white text-sm font-medium">
                          {uploadProgress[index].progress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 刪除按鈕 */}
                {!isUploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <p className="mt-1 text-xs text-gray-500 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 元數據表單 */}
      {files.length > 0 && !isUploading && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-gray-700">資產資訊</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="inline w-4 h-4 mr-1" />
              標籤（以逗號分隔）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如：手機鏡頭, APEX, Pro系列"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="輸入資產描述..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                產品 SKU
              </label>
              <input
                type="text"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
                placeholder="例如：APEX-PRO-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                品牌名稱
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="例如：APEX Lens"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              處理中...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              上傳並建立指紋
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AssetUpload;
