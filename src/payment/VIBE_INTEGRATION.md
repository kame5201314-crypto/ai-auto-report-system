# 全能AI金流中心 串接指南

> 🤖 **給 AI 助手的說明**：這份文件專為 AI（如 Cursor、Claude、ChatGPT）設計，讓你能快速理解並產生正確的整合程式碼。

---

## 📦 系統概覽

```
Vibe-Pay 是一個藍新金流橋接器，支援：
├── 單次付款 (MPG)
├── 定期定額訂閱 (Periodical)
├── 冪等性機制 (防重複扣款)
└── 訂閱狀態機 (自動管理生命週期)
```

## 🚀 快速啟動

### 1. 初始化服務

```typescript
import { initializeVibePay } from '@/payment';
import { createClient } from '@supabase/supabase-js';

// Supabase 客戶端
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 初始化金流服務
const vibePay = initializeVibePay(supabase);
```

### 2. 建立單次付款

```typescript
// 產生付款表單
const result = await vibePay.api.handleSinglePayment({
  amount: 1000,           // 金額 (整數，新台幣)
  itemDesc: '商品名稱',    // 商品描述 (最多 50 字)
  email: 'user@mail.com'  // 付款人 Email
});

if (result.success) {
  // 返回 HTML 表單，自動提交到藍新
  return result.data.formHtml;
}
```

### 3. 建立訂閱

```typescript
const subscription = await vibePay.api.handleSubscribe({
  userId: 'user-uuid',     // 必填：用戶 ID
  amount: 299,             // 每期金額
  itemDesc: '月訂閱方案',
  email: 'user@mail.com',
  periodType: 'M',         // M=月, W=週, D=日, Y=年
  periodPoint: '01',       // 每月 1 號扣款
  totalPeriods: 12         // 共 12 期
});
```

---

## 🔌 API 端點對照表

| 功能 | HTTP 方法 | 端點 | 說明 |
|------|----------|------|------|
| 單次付款 | POST | `/api/v1/payment/single` | 產生付款表單 |
| 訂閱付款 | POST | `/api/v1/payment/subscribe` | 建立定期定額 |
| 付款回呼 | POST | `/api/payment-callback` | 藍新 Webhook |
| 每期通知 | POST | `/api/payment/period-notify` | 扣款結果通知 |
| 暫停訂閱 | PUT | `/api/v1/subscription/:id/suspend` | 暫停扣款 |
| 恢復訂閱 | PUT | `/api/v1/subscription/:id/resume` | 恢復扣款 |
| 取消訂閱 | DELETE | `/api/v1/subscription/:id` | 終止訂閱 |

---

## 📋 請求/回應格式

### 單次付款請求

```json
{
  "amount": 1000,
  "itemDesc": "商品描述",
  "email": "customer@example.com",
  "paymentMethods": ["CREDIT", "LINEPAY"],
  "returnUrl": "https://your-site.com/payment/success",
  "notifyUrl": "https://your-site.com/api/payment-callback"
}
```

### 訂閱請求

```json
{
  "userId": "uuid-string",
  "amount": 299,
  "itemDesc": "月訂閱",
  "email": "subscriber@example.com",
  "periodType": "M",
  "periodPoint": "15",
  "totalPeriods": 12
}
```

### 成功回應

```json
{
  "success": true,
  "data": {
    "merchantOrderNo": "VP1234567890ABCD",
    "formHtml": "<form id='newebpay-form'...></form>",
    "actionUrl": "https://ccore.newebpay.com/MPG/mpg_gateway"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_xxx"
  }
}
```

---

## 💳 付款方式代碼

| 代碼 | 說明 | 使用方式 |
|------|------|---------|
| `CREDIT` | 信用卡一次付清 | 預設啟用 |
| `WEBATM` | 網路 ATM | 即時轉帳 |
| `VACC` | ATM 虛擬帳號 | 轉帳付款 |
| `CVS` | 超商代碼 | 7-11/全家/萊爾富 |
| `BARCODE` | 超商條碼 | 列印條碼繳費 |
| `LINEPAY` | LINE Pay | 行動支付 |
| `TAIWANPAY` | 台灣 Pay | 行動支付 |
| `GOOGLEPAY` | Google Pay | 行動支付 |

---

## 🔄 訂閱狀態機

```
狀態流轉：

PENDING ─────────────────────────────────────────┐
    │                                            │
    ▼ (首次授權成功)                    (首次授權失敗) ▼
 ACTIVE ◀──────────────────────────────────▶ CANCELLED
    │                                            ▲
    ├──(扣款失敗)───▶ PAST_DUE ──(超過3次)────────┤
    │                    │                       │
    │                    └──(重試成功)───────────┘
    │
    ├──(用戶暫停)───▶ SUSPENDED ──(用戶恢復)────▶ ACTIVE
    │                    │
    │                    └──(用戶取消)──────────▶ CANCELLED
    │
    └──(期數完成)───▶ EXPIRED
```

### 狀態說明

| 狀態 | 說明 | 可轉換至 |
|------|------|---------|
| `pending` | 待首次授權 | `active`, `cancelled` |
| `active` | 正常扣款中 | `past_due`, `suspended`, `cancelled`, `expired` |
| `past_due` | 逾期（扣款失敗） | `active`, `cancelled` |
| `suspended` | 用戶暫停 | `active`, `cancelled` |
| `cancelled` | 已取消 | - |
| `expired` | 已到期 | - |

---

## 🔐 加密邏輯 (給 AI 的技術細節)

### AES-256-CBC 加密

```typescript
// 參數排序 (藍新規定順序)
const PARAM_ORDER = [
  'MerchantID', 'RespondType', 'TimeStamp', 'Version',
  'MerchantOrderNo', 'Amt', 'ItemDesc', 'Email', ...
];

// 加密流程
1. 組成 Query String (按順序)
2. AES-256-CBC 加密 (Key=HashKey[32], IV=HashIV[16])
3. 輸出 Hex 字串 (小寫)

// SHA256 雜湊
Format: `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`
Output: 大寫 Hex
```

---

## 🛡️ Webhook 驗證

```typescript
// 驗證順序
1. 檢查來源 IP (藍新官方: 175.99.72.x, 61.219.166.x)
2. 驗證 TradeSha = SHA256(HashKey + TradeInfo + HashIV)
3. AES 解密 TradeInfo
4. 處理業務邏輯
```

---

## 📁 檔案結構

```
src/payment/
├── index.ts                 # 統一匯出入口
├── api/
│   └── handlers.ts          # API 處理器 (使用這個!)
├── services/
│   ├── NewebPayVault.ts     # 加密核心
│   ├── NewebPayMPG.ts       # 單次付款
│   ├── NewebPayPeriod.ts    # 定期定額
│   └── IdempotencyService.ts # 冪等性
├── state-machine/
│   └── SubscriptionStateMachine.ts # 訂閱狀態機
├── middleware/
│   └── validation.ts        # 請求驗證
├── database/
│   └── schema.sql           # Supabase Schema
└── types/
    └── index.ts             # TypeScript 型別
```

---

## 🔧 環境變數

```env
# 必填
NEWEBPAY_MERCHANT_ID=商店代號
NEWEBPAY_HASH_KEY=32字元金鑰
NEWEBPAY_HASH_IV=16字元向量

# 選填
NEWEBPAY_IS_PRODUCTION=false  # true=正式, false=測試
NEWEBPAY_RETURN_URL=https://your-site.com/payment/success
NEWEBPAY_NOTIFY_URL=https://your-site.com/api/payment-callback
```

---

## 📌 AI 產生程式碼時的注意事項

1. **金額必須是整數**：藍新不接受小數點
2. **訂單編號唯一**：使用 `vault.generateOrderNo()` 產生
3. **Email 必填**：藍新會發送付款通知
4. **測試環境 URL**：使用 `ccore.newebpay.com`
5. **正式環境 URL**：使用 `core.newebpay.com`

---

## 🎯 常見整合情境

### 情境 1：前端結帳按鈕

```tsx
// React 元件
function CheckoutButton({ amount, itemDesc }) {
  const handleCheckout = async () => {
    const res = await fetch('/api/v1/payment/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, itemDesc, email: user.email })
    });
    const { data } = await res.json();

    // 插入並自動提交表單
    document.body.insertAdjacentHTML('beforeend', data.formHtml);
  };

  return <button onClick={handleCheckout}>立即付款</button>;
}
```

### 情境 2：訂閱方案選擇

```tsx
function SubscriptionPlan({ plan }) {
  const subscribe = async () => {
    const res = await fetch('/api/v1/payment/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount: plan.price,
        itemDesc: plan.name,
        email: user.email,
        periodType: 'M',
        periodPoint: '01',
        totalPeriods: 12
      })
    });
    const { data } = await res.json();
    document.body.insertAdjacentHTML('beforeend', data.formHtml);
  };

  return <button onClick={subscribe}>訂閱 {plan.name}</button>;
}
```

---

## ✅ 整合檢查清單

- [ ] 環境變數已設定 (MerchantID, HashKey, HashIV)
- [ ] Supabase Schema 已執行
- [ ] Webhook URL 已在藍新後台設定
- [ ] 測試環境已驗證成功
- [ ] 錯誤處理已實作
- [ ] 日誌記錄已啟用

---

*此文件由 Vibe-Pay 自動產生，版本 1.0.0*
