# Vibe-Pay AI 整合盲測腳本

## 測試目標

驗證 AI 助手能否在 **3 分鐘內** 根據 `VIBE_INTEGRATION.md` 產生可運行的結帳程式碼。

---

## 盲測步驟

### Step 1: 準備測試環境

```bash
# 建立測試專案
npx create-vite@latest vibe-pay-test --template react-ts
cd vibe-pay-test
npm install
```

### Step 2: 輸入 AI 指令

將以下指令貼入 Cursor / Windsurf / Claude：

```
我有一個 React 專案，需要接入 Vibe-Pay 金流系統。

需求：
1. 建立一個「立即購買」按鈕
2. 點擊後發送 POST 請求到 /api/v1/payment/single
3. 金額 $99 元，商品名稱「進階會員」
4. 成功後自動跳轉到藍新付款頁

請參考以下文檔：
[貼上 VIBE_INTEGRATION.md 內容]
```

### Step 3: 計時評估

| 項目 | 通過標準 | 實際結果 |
|------|---------|---------|
| 程式碼產生時間 | < 30 秒 | _____ 秒 |
| 首次編譯成功 | 無錯誤 | ✅ / ❌ |
| 按鈕可點擊 | 正常觸發 | ✅ / ❌ |
| API 請求格式正確 | POST + JSON | ✅ / ❌ |
| 總完成時間 | < 3 分鐘 | _____ 分 |

---

## 期望產出程式碼

AI 應該產生類似以下的程式碼：

```tsx
// src/components/CheckoutButton.tsx
import { useState } from 'react';

interface CheckoutButtonProps {
  amount: number;
  itemDesc: string;
  email: string;
}

export function CheckoutButton({ amount, itemDesc, email }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/payment/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, itemDesc, email })
      });

      const result = await response.json();

      if (result.success) {
        // 插入自動提交表單
        document.body.insertAdjacentHTML('beforeend', result.data.formHtml);
      } else {
        alert(result.error?.message || '付款失敗');
      }
    } catch (error) {
      alert('網路錯誤，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
    >
      {loading ? '處理中...' : `立即購買 NT$ ${amount}`}
    </button>
  );
}
```

---

## 評分標準

| 等級 | 完成時間 | 編譯錯誤 | 功能完整 |
|------|---------|---------|---------|
| A+ | < 1 分鐘 | 0 | 100% |
| A | 1-3 分鐘 | 0 | 100% |
| B | 3-5 分鐘 | 1-2 | 80%+ |
| C | 5-10 分鐘 | 3+ | 50%+ |
| F | > 10 分鐘 | - | - |

---

## 關鍵驗證點

### 1. API 端點正確性

```javascript
// ✅ 正確
fetch('/api/v1/payment/single', { method: 'POST' })

// ❌ 錯誤
fetch('/payment', { method: 'GET' })
```

### 2. 請求格式正確性

```javascript
// ✅ 正確
body: JSON.stringify({
  amount: 99,        // 整數
  itemDesc: '商品名', // 必填
  email: 'a@b.com'   // 必填
})

// ❌ 錯誤
body: JSON.stringify({
  price: 99.99,      // 小數
  name: '商品'       // 欄位名錯誤
})
```

### 3. 表單處理正確性

```javascript
// ✅ 正確
document.body.insertAdjacentHTML('beforeend', result.data.formHtml);

// ❌ 錯誤
window.location.href = result.data.url;
```

---

## 測試結論模板

```
日期：____年__月__日
AI 工具：Cursor / Windsurf / Claude / 其他：_______
專案框架：React / Vue / Next.js / 其他：_______

測試結果：
- 程式碼產生時間：_____ 秒
- 編譯錯誤數量：_____ 個
- 功能完整度：_____ %
- 總完成時間：_____ 分鐘

等級評定：[ A+ / A / B / C / F ]

備註：
_________________________________
_________________________________
```

---

## 競品對比

如果同樣的測試使用其他金流 SDK：

| 金流 | 文檔閱讀時間 | 程式碼撰寫時間 | 總時間 |
|------|-------------|--------------|--------|
| Vibe-Pay | 0 分鐘 | < 3 分鐘 | < 3 分鐘 |
| 藍新官方 SDK | 30+ 分鐘 | 30+ 分鐘 | > 1 小時 |
| 綠界 ECPay | 20+ 分鐘 | 20+ 分鐘 | > 40 分鐘 |
| Stripe | 10 分鐘 | 15 分鐘 | 25 分鐘 |

**Vibe-Pay 競爭優勢：AI 原生設計，幾句話即可完成整合**
