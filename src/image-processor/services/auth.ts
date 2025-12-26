/**
 * 簡易認證服務
 *
 * 注意：這是一個前端簡易認證，適合內部工具使用
 * 如需更高安全性，請改用後端認證 + JWT
 */

// 預設帳號密碼（可以修改）
const VALID_USERS = [
  { username: 'admin', password: 'design888' },
];

const AUTH_STORAGE_KEY = 'image_processor_auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 小時

export interface AuthSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

/**
 * 驗證帳號密碼
 */
export function validateCredentials(username: string, password: string): boolean {
  const trimmedUsername = username.trim().toLowerCase();
  const trimmedPassword = password.trim();

  return VALID_USERS.some(
    user => user.username.toLowerCase() === trimmedUsername && user.password === trimmedPassword
  );
}

/**
 * 登入
 */
export function login(username: string, password: string): { success: boolean; error?: string } {
  if (!username || !password) {
    return { success: false, error: '請輸入帳號和密碼' };
  }

  if (!validateCredentials(username, password)) {
    return { success: false, error: '帳號或密碼錯誤' };
  }

  const session: AuthSession = {
    username: username.trim().toLowerCase(),
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  };

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true };
  } catch {
    return { success: false, error: '儲存登入狀態失敗' };
  }
}

/**
 * 登出
 */
export function logout(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // 忽略錯誤
  }
}

/**
 * 檢查是否已登入
 */
export function isAuthenticated(): boolean {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return false;

    const session: AuthSession = JSON.parse(stored);

    // 檢查是否過期
    if (Date.now() > session.expiresAt) {
      logout();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 取得當前使用者
 */
export function getCurrentUser(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);

    if (Date.now() > session.expiresAt) {
      logout();
      return null;
    }

    return session.username;
  } catch {
    return null;
  }
}

/**
 * 延長登入時效
 */
export function extendSession(): void {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;

    const session: AuthSession = JSON.parse(stored);
    session.expiresAt = Date.now() + SESSION_DURATION;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // 忽略錯誤
  }
}
