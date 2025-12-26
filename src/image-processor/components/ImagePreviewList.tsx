// 圖片預覽列表組件
import { Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { ImageFile } from '../types';

interface ImagePreviewListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
}

export default function ImagePreviewList({
  images,
  onRemove,
  onRemoveAll,
}: ImagePreviewListProps) {
  if (images.length === 0) return null;

  const completedCount = images.filter((img) => img.status === 'completed').length;
  const processingCount = images.filter((img) => img.status === 'processing').length;
  const errorCount = images.filter((img) => img.status === 'error').length;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-gray-700">
            已選擇 {images.length} 張圖片
          </h3>
          <div className="flex items-center gap-3 text-sm">
            {completedCount > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                {completedCount} 完成
              </span>
            )}
            {processingCount > 0 && (
              <span className="flex items-center gap-1 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {processingCount} 處理中
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errorCount} 失敗
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onRemoveAll}
          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          清除全部
        </button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((image) => (
          <ImagePreviewCard
            key={image.id}
            image={image}
            onRemove={() => onRemove(image.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ImagePreviewCardProps {
  image: ImageFile;
  onRemove: () => void;
}

function ImagePreviewCard({ image, onRemove }: ImagePreviewCardProps) {
  const displayUrl = image.processedUrl || image.originalUrl;

  return (
    <div className="relative group">
      <div
        className={`
          aspect-square rounded-lg overflow-hidden bg-gray-100
          border-2 transition-colors
          ${image.status === 'completed' ? 'border-green-400' : ''}
          ${image.status === 'processing' ? 'border-blue-400' : ''}
          ${image.status === 'error' ? 'border-red-400' : ''}
          ${image.status === 'pending' ? 'border-transparent' : ''}
        `}
      >
        <img
          src={displayUrl}
          alt={image.file.name}
          className="w-full h-full object-cover"
        />

        {/* Processing Overlay */}
        {image.status === 'processing' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-white text-sm mt-2">{image.progress}%</span>
          </div>
        )}

        {/* Error Overlay */}
        {image.status === 'error' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        )}

        {/* Success Badge */}
        {image.status === 'completed' && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* File Name */}
      <p className="mt-1 text-xs text-gray-500 truncate" title={image.file.name}>
        {image.file.name}
      </p>

      {/* Error Message */}
      {image.status === 'error' && image.error && (
        <p className="text-xs text-red-500 truncate" title={image.error}>
          {image.error}
        </p>
      )}
    </div>
  );
}
