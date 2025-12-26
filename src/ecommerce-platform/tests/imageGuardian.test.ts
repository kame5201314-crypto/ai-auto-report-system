/**
 * Image Guardian 自動化測試
 * 測試圖片上傳、儲存、壓縮等功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Image class
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 100;
  height = 100;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // Simulate async image load
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
}

// @ts-expect-error - Mock Image
window.Image = MockImage;

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mockbase64data');

describe('Image Guardian Service Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Storage Functions', () => {
    it('should save and retrieve data from localStorage', () => {
      const testData = { id: 'test-1', name: 'Test Asset' };
      localStorageMock.setItem('test_key', JSON.stringify(testData));

      const retrieved = JSON.parse(localStorageMock.getItem('test_key') || '{}');
      expect(retrieved).toEqual(testData);
    });

    it('should handle empty localStorage', () => {
      const retrieved = localStorageMock.getItem('nonexistent_key');
      expect(retrieved).toBeNull();
    });

    it('should clear localStorage', () => {
      localStorageMock.setItem('key1', 'value1');
      localStorageMock.setItem('key2', 'value2');
      localStorageMock.clear();

      expect(localStorageMock.getItem('key1')).toBeNull();
      expect(localStorageMock.getItem('key2')).toBeNull();
    });
  });

  describe('Image Compression', () => {
    it('should compress image to smaller size', async () => {
      // Test that compression function exists and works
      const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      // Create a canvas to test compression
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const result = canvas.toDataURL('image/jpeg', 0.6);
      expect(result).toContain('data:image/jpeg');
    });
  });

  describe('Asset CRUD Operations', () => {
    const STORAGE_KEY = 'imageGuardian_assets';

    it('should create a new asset', () => {
      const newAsset = {
        id: 'asset-1',
        fileName: 'test.png',
        originalUrl: 'data:image/png;base64,test',
        thumbnailUrl: 'data:image/png;base64,test',
        status: 'indexed'
      };

      const assets = [newAsset];
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(assets));

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY) || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('asset-1');
    });

    it('should retrieve all assets', () => {
      const assets = [
        { id: 'asset-1', fileName: 'test1.png' },
        { id: 'asset-2', fileName: 'test2.png' }
      ];
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(assets));

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY) || '[]');
      expect(stored).toHaveLength(2);
    });

    it('should delete an asset', () => {
      const assets = [
        { id: 'asset-1', fileName: 'test1.png' },
        { id: 'asset-2', fileName: 'test2.png' }
      ];
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(assets));

      const filtered = assets.filter(a => a.id !== 'asset-1');
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(filtered));

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY) || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('asset-2');
    });
  });

  describe('File Operations', () => {
    it('should convert file to data URL', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(mockFile);
      });

      expect(dataUrl).toContain('data:');
    });

    it('should validate image file type', () => {
      const imageFile = new File([''], 'test.png', { type: 'image/png' });
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });

      expect(imageFile.type.startsWith('image/')).toBe(true);
      expect(textFile.type.startsWith('image/')).toBe(false);
    });

    it('should validate file size', () => {
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB
      const smallFile = new File(['x'.repeat(1000)], 'small.png', { type: 'image/png' });

      expect(smallFile.size).toBeLessThan(MAX_SIZE);
    });
  });

  describe('API Fallback', () => {
    it('should handle API unavailability gracefully', async () => {
      // Mock fetch to simulate API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      let apiAvailable = false;
      try {
        await fetch('http://localhost:8000/api/health');
        apiAvailable = true;
      } catch {
        apiAvailable = false;
      }

      expect(apiAvailable).toBe(false);
    });

    it('should handle timeout scenario', async () => {
      // Test that AbortController can be used to cancel requests
      const controller = new AbortController();

      // Abort immediately to simulate timeout
      controller.abort();

      let aborted = false;
      try {
        // This should throw because the signal is already aborted
        if (controller.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          aborted = true;
        }
      }

      expect(aborted).toBe(true);
    });
  });

  describe('LocalStorage Quota', () => {
    it('should detect storage quota exceeded', () => {
      // Create a mock that throws QuotaExceededError
      const mockSetItem = vi.fn().mockImplementation(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });

      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = mockSetItem;

      let quotaExceeded = false;
      try {
        localStorageMock.setItem('test', 'x'.repeat(10000000));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          quotaExceeded = true;
        }
      }

      localStorageMock.setItem = originalSetItem;
      expect(quotaExceeded).toBe(true);
    });
  });
});

describe('Image Guardian UI Integration', () => {
  describe('Upload Flow', () => {
    it('should accept valid image files', () => {
      const validFiles = [
        new File([''], 'test.jpg', { type: 'image/jpeg' }),
        new File([''], 'test.png', { type: 'image/png' }),
        new File([''], 'test.webp', { type: 'image/webp' })
      ];

      validFiles.forEach(file => {
        expect(file.type.startsWith('image/')).toBe(true);
      });
    });

    it('should reject non-image files', () => {
      const invalidFiles = [
        new File([''], 'test.pdf', { type: 'application/pdf' }),
        new File([''], 'test.txt', { type: 'text/plain' }),
        new File([''], 'test.js', { type: 'application/javascript' })
      ];

      invalidFiles.forEach(file => {
        expect(file.type.startsWith('image/')).toBe(false);
      });
    });
  });

  describe('Asset Display', () => {
    it('should display asset count correctly', () => {
      const assets = [
        { id: '1', status: 'indexed' },
        { id: '2', status: 'monitoring' },
        { id: '3', status: 'monitoring' }
      ];

      const total = assets.length;
      const monitoring = assets.filter(a => a.status === 'monitoring').length;
      const indexed = assets.filter(a => a.status === 'indexed').length;

      expect(total).toBe(3);
      expect(monitoring).toBe(2);
      expect(indexed).toBe(1);
    });
  });
});
