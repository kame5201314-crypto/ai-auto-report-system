/**
 * Image Guardian API Client
 * 連接 Python 後端的 API 客戶端
 */

/// <reference types="vite/client" />

// API Base URL - 在開發環境使用 localhost，生產環境使用實際 API URL
const API_BASE_URL = (import.meta.env?.VITE_IMAGE_GUARDIAN_API_URL as string) || 'http://localhost:8000';

// ==================== Types ====================

export interface UploadAssetResponse {
  id: string;
  user_id: string;
  file_name: string;
  original_url: string;
  thumbnail_url: string;
  file_size: number;
  dimensions: { width: number; height: number };
  fingerprint: {
    pHash: string;
    orbDescriptors: string;
    colorHistogram: string;
    featureCount: number;
  };
  metadata: {
    uploadedBy: string;
    uploadedAt: string;
    tags: string[];
    description: string;
    productSku?: string;
    brandName?: string;
  };
  status: string;
  scan_stats: {
    totalScans: number;
    violationsFound: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ScanConfig {
  asset_ids: string[];
  platforms: string[];
  keywords: string[];
  similarity_threshold: number;
  max_results: number;
  scan_depth: number;
}

export interface ScanTaskResponse {
  id: string;
  user_id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  config: ScanConfig;
  progress: number;
  total_scanned: number;
  violations_found: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface ScanProgress {
  task_id: string;
  progress: number;
  message: string;
  scanned: number;
  violations: number;
}

export interface ViolationData {
  id: string;
  task_id: string;
  asset_id: string;
  platform: string;
  listing: {
    id: string;
    title: string;
    url: string;
    thumbnail_url: string;
    price: number;
    currency: string;
    seller_id: string;
    seller_name: string;
    seller_url: string;
    sales_count: number;
    rating?: number;
  };
  similarity: {
    overall: number;
    phash_score: number;
    orb_score: number;
    color_score: number;
    level: 'exact' | 'high' | 'medium' | 'low';
  };
  detected_at: string;
  is_whitelisted: boolean;
  case_id?: string;
}

export interface CompareResult {
  overall_similarity: number;
  phash_score: number;
  orb_score: number;
  color_score: number;
  similarity_level: string;
  is_match: boolean;
}

// ==================== API Client ====================

class ImageGuardianApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // ==================== Health ====================

  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    return this.request('/api/health');
  }

  async getPlatforms(): Promise<{ platforms: Array<{ id: string; name: string; url: string; status: string }> }> {
    return this.request('/api/platforms');
  }

  // ==================== Assets ====================

  async uploadAsset(
    file: File,
    metadata: {
      tags?: string;
      description?: string;
      productSku?: string;
      brandName?: string;
    } = {}
  ): Promise<UploadAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', metadata.tags || '');
    formData.append('description', metadata.description || '');
    formData.append('product_sku', metadata.productSku || '');
    formData.append('brand_name', metadata.brandName || '');

    return this.request('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getAssets(status?: string): Promise<UploadAssetResponse[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/assets${query}`);
  }

  async getAsset(assetId: string): Promise<UploadAssetResponse> {
    return this.request(`/api/assets/${assetId}`);
  }

  async deleteAsset(assetId: string): Promise<{ message: string; id: string }> {
    return this.request(`/api/assets/${assetId}`, { method: 'DELETE' });
  }

  async recomputeFingerprint(assetId: string): Promise<{
    id: string;
    hashes: Record<string, string>;
    orb_features: number;
    dominant_colors: number[][];
  }> {
    return this.request(`/api/assets/${assetId}/fingerprint`, { method: 'POST' });
  }

  async compareImages(
    image1: string,
    image2: string,
    isBase64: boolean = false
  ): Promise<CompareResult> {
    const formData = new FormData();
    if (isBase64) {
      formData.append('image1_base64', image1);
      formData.append('image2_base64', image2);
    } else {
      formData.append('image1_url', image1);
      formData.append('image2_url', image2);
    }

    return this.request('/api/assets/compare', {
      method: 'POST',
      body: formData,
    });
  }

  // ==================== Scans ====================

  async createScan(config: ScanConfig): Promise<ScanTaskResponse> {
    return this.request('/api/scans/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  }

  async getScans(status?: string): Promise<ScanTaskResponse[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/scans${query}`);
  }

  async getScan(taskId: string): Promise<ScanTaskResponse> {
    return this.request(`/api/scans/${taskId}`);
  }

  async getScanProgress(taskId: string): Promise<ScanProgress> {
    return this.request(`/api/scans/${taskId}/progress`);
  }

  async getScanResults(taskId: string): Promise<{
    total_scanned: number;
    violations_found: number;
    violations: ViolationData[];
    platforms_searched: string[];
    keywords_used: string[];
  }> {
    return this.request(`/api/scans/${taskId}/results`);
  }

  async cancelScan(taskId: string): Promise<{ message: string; id: string }> {
    return this.request(`/api/scans/${taskId}`, { method: 'DELETE' });
  }

  // WebSocket for real-time progress
  createProgressWebSocket(taskId: string, onMessage: (data: ScanProgress) => void): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/api/scans/${taskId}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  async quickSearch(
    keyword: string,
    platforms: string[] = ['shopee'],
    maxResults: number = 20
  ): Promise<{
    keyword: string;
    platforms: string[];
    total_found: number;
    listings: Array<{
      id: string;
      platform: string;
      title: string;
      url: string;
      thumbnail_url: string;
      price: number;
      seller_name: string;
    }>;
  }> {
    return this.request('/api/scans/quick-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, platforms, max_results: maxResults }),
    });
  }

  // ==================== Violations ====================

  async getViolations(filters?: {
    task_id?: string;
    asset_id?: string;
    platform?: string;
    has_case?: boolean;
  }): Promise<ViolationData[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/violations${query}`);
  }

  async getViolation(violationId: string): Promise<ViolationData> {
    return this.request(`/api/violations/${violationId}`);
  }

  async toggleWhitelist(violationId: string, isWhitelisted: boolean): Promise<{ message: string; is_whitelisted: boolean }> {
    return this.request(`/api/violations/${violationId}/whitelist?is_whitelisted=${isWhitelisted}`, {
      method: 'PATCH',
    });
  }

  async linkViolationToCase(violationId: string, caseId: string): Promise<{ message: string; case_id: string }> {
    return this.request(`/api/violations/${violationId}/case?case_id=${caseId}`, {
      method: 'PATCH',
    });
  }

  async getViolationStats(): Promise<{
    total: number;
    pending: number;
    by_platform: Record<string, number>;
    by_similarity: Record<string, number>;
  }> {
    return this.request('/api/violations/stats/summary');
  }
}

// Singleton instance
export const imageGuardianApi = new ImageGuardianApiClient();

// ==================== Hook for checking API availability ====================

export async function checkApiAvailability(): Promise<boolean> {
  try {
    // 添加 3 秒超時，避免長時間等待
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('[API] 後端不可用，使用本地模式');
    return false;
  }
}

export default imageGuardianApi;
