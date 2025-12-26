/**
 * ============================================
 * 資安核心模組 (Security Core Module)
 * ============================================
 *
 * Claude Code 專案開發規範 - 資安最高準則
 *
 * 1. 敏感資訊隔離：嚴禁硬編碼 API Key、密鑰
 * 2. 輸入驗證：防止 SQL Injection 與 XSS 攻擊
 * 3. 依賴掃描：使用穩定版本套件
 * 4. 錯誤遮蔽：前端僅顯示通用錯誤訊息
 */

// 匯出所有資安模組
export * from './types';
export * from './sanitizer';
export * from './validator';
export * from './rateLimiter';
export * from './auditLogger';
export * from './rbac';
export * from './passwordUtils';
export * from './errorHandler';
export * from './AuthContext';
