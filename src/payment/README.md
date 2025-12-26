# 全能AI金流中心

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![NewebPay](https://img.shields.io/badge/NewebPay-藍新金流-orange.svg)](https://www.newebpay.com/)

> 企業級藍新金流整合方案，支援單次付款與定期定額訂閱

---

## 功能特色

- 🔐 **AES-256-CBC 加密** - 符合金融級安全標準
- 💳 **MPG 全支付** - 信用卡、ATM、超商、LINE Pay 等多種付款方式
- 🔄 **定期定額** - 完整訂閱生命週期管理
- 🛡️ **冪等性機制** - 防止重複扣款
- 📊 **狀態機** - 自動化訂閱狀態轉換
- 🤖 **AI 友善** - 提供 AI 整合文檔

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
# 複製範本
cp src/payment/.env.example .env

# 編輯 .env 填入您的金鑰
```

### 3. 設定 Supabase 資料庫

```sql
-- 在 Supabase SQL Editor 執行
-- 檔案位置: src/payment/database/schema.sql
```

### 4. 啟動測試模式 (Sandbox)

```env
# .env 設定為測試環境
NEWEBPAY_IS_PRODUCTION=false
```

**測試環境 URL：** `https://ccore.newebpay.com/MPG/mpg_gateway`
**正式環境 URL：** `https://core.newebpay.com/MPG/mpg_gateway`

---

## 🧪 Sandbox 測試模式

### 申請測試帳號

1. 前往 [藍新金流測試平台](https://cwww.newebpay.com/)
2. 註冊測試商店帳號
3. 取得 `MerchantID`、`HashKey`、`HashIV`

### 測試信用卡號

| 卡號 | 結果 | 說明 |
|------|------|------|
| `4000-2211-1111-1111` | 成功 | 測試成功交易 |
| `4000-2222-2222-2222` | 失敗 | 測試失敗交易 |

**有效期限：** 任意未來日期
**CVV：** 任意 3 碼

### 環境變數設定

```env
# ======== 必填 ========
NEWEBPAY_MERCHANT_ID=MS123456789     # 您的商店代號
NEWEBPAY_HASH_KEY=abcdefghijklmnopqrstuvwxyz123456  # 32 字元
NEWEBPAY_HASH_IV=1234567890abcdef    # 16 字元

# ======== 測試模式 ========
NEWEBPAY_IS_PRODUCTION=false         # false = 測試環境
```

---

## 使用方式

### 基本初始化

```typescript
import { initializeVibePay } from '@/payment';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const vibePay = initializeVibePay(supabase);
```

### 單次付款

```typescript
// 建立付款表單
const result = await vibePay.api.handleSinglePayment({
  amount: 1000,
  itemDesc: '商品名稱',
  email: 'customer@example.com'
});

if (result.success) {
  // 將 HTML 表單插入頁面，會自動提交到藍新
  document.body.innerHTML += result.data.formHtml;
}
```

### 定期定額訂閱

```typescript
const subscription = await vibePay.api.handleSubscribe({
  userId: 'user-uuid',
  amount: 299,
  itemDesc: '月訂閱方案',
  email: 'subscriber@example.com',
  periodType: 'M',      // M=月, W=週, D=日, Y=年
  periodPoint: '01',    // 每月 1 號
  totalPeriods: 12      // 共 12 期
});
```

---

## API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/v1/payment/single` | POST | 單次付款 |
| `/api/v1/payment/subscribe` | POST | 建立訂閱 |
| `/api/payment-callback` | POST | 付款回呼 (Webhook) |
| `/api/payment/period-notify` | POST | 每期扣款通知 |
| `/api/v1/subscription/:id/suspend` | PUT | 暫停訂閱 |
| `/api/v1/subscription/:id/resume` | PUT | 恢復訂閱 |
| `/api/v1/subscription/:id` | DELETE | 取消訂閱 |

---

## 專案結構

```
src/payment/
├── api/
│   └── handlers.ts          # API 處理器
├── config/
│   └── newebpay.config.ts   # 環境配置
├── database/
│   └── schema.sql           # Supabase Schema
├── middleware/
│   └── validation.ts        # 請求驗證
├── services/
│   ├── NewebPayVault.ts     # 加密核心
│   ├── NewebPayMPG.ts       # 單次付款
│   ├── NewebPayPeriod.ts    # 定期定額
│   └── IdempotencyService.ts # 冪等性
├── state-machine/
│   └── SubscriptionStateMachine.ts # 狀態機
├── types/
│   └── index.ts             # 型別定義
├── .env.example             # 環境變數範本
├── VIBE_INTEGRATION.md      # AI 整合指南
├── integration_logic.json   # AI 配置檔
├── SECURITY.md              # 資安建議
├── README.md                # 本文件
└── index.ts                 # 統一匯出
```

---

## 安全性

### 必要設定

- [x] HTTPS 強制啟用
- [x] HSTS 標頭設定
- [x] CSP 內容安全政策
- [x] Webhook IP 白名單驗證
- [x] SHA256 簽名驗證
- [x] AES-256-CBC 加密

詳見 [SECURITY.md](./SECURITY.md)

---

## AI 整合

本系統提供 AI 友善的整合文檔：

- **[VIBE_INTEGRATION.md](./VIBE_INTEGRATION.md)** - 讓 AI 一看就懂的串接指南
- **[integration_logic.json](./integration_logic.json)** - JSON 配置檔，AI 可自動產生程式碼

---

## 故障排除

### 常見問題

#### 1. 加密失敗
```
Error: HashKey must be exactly 32 characters
```
**解決：** 確認 HashKey 為 32 字元，HashIV 為 16 字元

#### 2. Webhook 驗證失敗
```
Error: Invalid signature
```
**解決：** 確認 HashKey/HashIV 與藍新後台一致

#### 3. 測試交易失敗
**解決：** 確認使用測試環境 (`NEWEBPAY_IS_PRODUCTION=false`)

---

## 授權

MIT License

---

## 支援

- 📖 [藍新金流官方文件](https://www.newebpay.com/website/Page/content/download_api)
- 💬 [GitHub Issues](https://github.com/your-repo/issues)
