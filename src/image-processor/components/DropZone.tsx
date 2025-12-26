// 拖拽上傳區域組件
import { useState, useCallback, useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: 不支援的檔案格式`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: 檔案大小超過 20MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setTimeout(() => setError(null), 5000);
    }

    return validFiles;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [disabled, onFilesAdded]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesAdded]
  );

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={`
              p-4 rounded-full transition-colors
              ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}
            `}
          >
            {isDragOver ? (
              <Image className="w-12 h-12 text-blue-500" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragOver ? '放開以上傳圖片' : '拖拽圖片到這裡'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              或點擊選擇檔案
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
            <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
            <span className="px-2 py-1 bg-gray-100 rounded">WebP</span>
            <span className="px-2 py-1 bg-gray-100 rounded">GIF</span>
            <span className="text-gray-400">最大 20MB</span>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
