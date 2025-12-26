# 資安開發規範 (Security Development Guidelines)

## 概述

本文件定義專案的安全開發標準與最佳實踐，所有開發人員必須遵守這些規範。

---

## 1. 敏感資訊管理

### 嚴禁硬編碼
```typescript
// ❌ 錯誤示範
const API_KEY = "sk-1234567890abcdef";
const DB_PASSWORD = "mysecretpassword";

// ✅ 正確做法
const API_KEY = import.meta.env.VITE_API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

### 環境變數使用
- 所有敏感資訊必須透過環境變數載入
- 使用 `.env.example` 作為範本（不含實際值）
- `.env` 檔案必須加入 `.gitignore`

---

## 2. 輸入驗證與消毒

### 所有使用者輸入必須驗證
```typescript
import { sanitize, validator } from '@/security';

// 消毒使用者輸入
const safeEmail = sanitize.email(userInput.email);
const safeName = sanitize.string(userInput.name, { maxLength: 100 });

// 驗證格式
const { valid, errors } = validator.validateForm(data, {
  email: [validator.rules.required(), validator.rules.email()],
  password: [validator.rules.required(), validator.rules.strongPassword()],
});
```

### XSS 防護
```typescript
import { escapeHtml, removeScripts } from '@/security';

// 顯示使用者內容前必須轉義
const safeContent = escapeHtml(userContent);
```

### SQL 注入防護
- 使用參數化查詢（Prepared Statements）
- 永遠不要拼接使用者輸入到 SQL 語句

---

## 3. 認證與授權

### 密碼政策
```typescript
import { validatePassword, DEFAULT_PASSWORD_POLICY } from '@/security';

// 密碼必須符合以下條件：
// - 至少 8 個字元
// - 包含大寫字母
// - 包含小寫字母
// - 包含數字
// - 包含特殊字元
const result = validatePassword(password);
if (!result.valid) {
  // 處理錯誤
}
```

### RBAC 權限控管
```typescript
import { useAuth, Can, ProtectedRoute } from '@/security';

// 使用 Hook 檢查權限
const { hasPermission } = useAuth();
if (hasPermission('users:delete')) {
  // 執行刪除操作
}

// 使用元件控制顯示
<Can permission="orders:approve">
  <ApproveButton />
</Can>

// 保護路由
<ProtectedRoute requiredPermissions={['admin:access']}>
  <AdminPanel />
</ProtectedRoute>
```

---

## 4. 速率限制

### API 請求限制
```typescript
import { checkApiLimit, checkLoginLimit } from '@/security';

// 檢查 API 限制
const result = checkApiLimit(userId);
if (!result.allowed) {
  throw new Error('請求過於頻繁');
}

// 登入嘗試限制（防止暴力破解）
const loginResult = checkLoginLimit(email);
if (!loginResult.allowed) {
  throw new Error('帳號已暫時鎖定');
}
```

---

## 5. 審計日誌

### 記錄重要操作
```typescript
import { auditLogger } from '@/security';

// 記錄登入
auditLogger.logLogin({
  userId: user.id,
  userEmail: user.email,
  success: true,
});

// 記錄資料存取
auditLogger.logDataAccess({
  userId: user.id,
  resource: 'order',
  resourceId: orderId,
  action: 'delete',
  success: true,
});

// 記錄權限變更
auditLogger.logPermissionChange({
  userId: admin.id,
  userEmail: admin.email,
  targetUserId: user.id,
  oldRole: 'viewer',
  newRole: 'manager',
});
```

---

## 6. 錯誤處理

### 遮蔽敏感錯誤
```typescript
import { handleError, createErrorResponse } from '@/security';

try {
  // 業務邏輯
} catch (error) {
  // 使用安全的錯誤處理器
  const safeError = handleError(error);

  // 前端只顯示安全的錯誤訊息
  showToast(safeError.message);

  // 詳細錯誤記錄到日誌（不顯示給使用者）
  console.error('[Internal]', error);
}
```

### 生產環境錯誤訊息
```typescript
// ❌ 錯誤：洩漏內部資訊
return { error: "Database connection failed: ECONNREFUSED 127.0.0.1:5432" };

// ✅ 正確：通用錯誤訊息
return { error: "系統發生錯誤，請稍後再試" };
```

---

## 7. 安全標頭

### 必要的 HTTP 標頭
```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 8. 依賴管理

### 定期更新與掃描
```bash
# 檢查已知漏洞
npm audit

# 更新依賴
npm update

# 使用 LTS 版本
node --version  # 應為 LTS 版本
```

### 鎖定版本
- 使用 `package-lock.json` 確保一致性
- 避免使用 `*` 或 `latest` 作為版本

---

## 9. 程式碼審查清單

每次 PR 必須檢查：

- [ ] 沒有硬編碼的敏感資訊
- [ ] 所有使用者輸入已驗證/消毒
- [ ] 使用適當的權限檢查
- [ ] 錯誤訊息不洩漏內部資訊
- [ ] 新增的端點有速率限制
- [ ] 重要操作有審計日誌
- [ ] 沒有新增已知漏洞的依賴

---

## 10. 緊急回應

### 發現安全漏洞時
1. 立即通報團隊負責人
2. 評估影響範圍
3. 準備修復方案
4. 部署修復
5. 審查相關程式碼

### 通報管道
- 內部：Slack #security 頻道
- 外部：security@example.com

---

## 模組使用範例

### 完整認證流程
```typescript
import {
  AuthProvider,
  useAuth,
  sanitizeEmail,
  validatePassword,
  checkLoginLimit,
  auditLogger,
} from '@/security';

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (formData) => {
    // 1. 消毒輸入
    const email = sanitizeEmail(formData.email);

    // 2. 檢查速率限制
    const rateLimit = checkLoginLimit(email);
    if (!rateLimit.allowed) {
      return { error: '帳號已暫時鎖定' };
    }

    // 3. 驗證密碼格式
    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.valid) {
      return { error: '密碼格式不正確' };
    }

    // 4. 執行登入
    const result = await login({
      email,
      password: formData.password,
    });

    return result;
  };

  // ...
}

// 包裝應用程式
function App() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
```

---

## 更新記錄

| 日期 | 版本 | 說明 |
|------|------|------|
| 2024-12-25 | 1.0.0 | 初始版本 |

---

*本文件由資安團隊維護，如有疑問請聯繫 security@example.com*
