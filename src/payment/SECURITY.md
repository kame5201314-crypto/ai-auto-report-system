# 全能AI金流中心 資安建議指南

> 🔐 金流系統的安全性至關重要，本文件提供完整的資安設定建議。

---

## 🛡️ HTTP 安全標頭設定

### 1. HSTS (HTTP Strict Transport Security)

強制使用 HTTPS 連線，防止 SSL 降級攻擊。

```typescript
// Express.js
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});

// Next.js (next.config.js)
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};

// Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**參數說明：**
- `max-age=31536000`：一年內強制 HTTPS
- `includeSubDomains`：包含所有子網域
- `preload`：加入瀏覽器預載清單

---

### 2. CSP (Content Security Policy)

防止 XSS 攻擊，限制資源載入來源。

```typescript
// Express.js - 金流專用 CSP
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    // 預設只允許同源
    "default-src 'self'",

    // 腳本：同源 + 藍新金流
    "script-src 'self' 'unsafe-inline' https://ccore.newebpay.com https://core.newebpay.com",

    // 樣式：同源 + inline (表單需要)
    "style-src 'self' 'unsafe-inline'",

    // 表單提交：同源 + 藍新金流
    "form-action 'self' https://ccore.newebpay.com https://core.newebpay.com",

    // 框架：禁止嵌入
    "frame-ancestors 'none'",

    // 圖片：同源 + data URL + HTTPS
    "img-src 'self' data: https:",

    // 連線：同源 + API + 藍新
    "connect-src 'self' https://ccore.newebpay.com https://core.newebpay.com https://*.supabase.co",

    // 基底 URI
    "base-uri 'self'",

    // 物件：禁止
    "object-src 'none'"
  ].join('; '));
  next();
});
```

**Next.js 配置：**

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://ccore.newebpay.com https://core.newebpay.com",
      "style-src 'self' 'unsafe-inline'",
      "form-action 'self' https://ccore.newebpay.com https://core.newebpay.com",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://ccore.newebpay.com https://core.newebpay.com https://*.supabase.co",
      "base-uri 'self'",
      "object-src 'none'"
    ].join('; ')
  }
];
```

---

### 3. 其他重要安全標頭

```typescript
// 完整安全標頭設定
const securityHeaders = {
  // 防止 MIME 類型嗅探
  'X-Content-Type-Options': 'nosniff',

  // 防止點擊劫持
  'X-Frame-Options': 'DENY',

  // XSS 過濾器 (舊版瀏覽器)
  'X-XSS-Protection': '1; mode=block',

  // 控制 Referrer 資訊
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 權限政策
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // HSTS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Express.js 應用
app.use((req, res, next) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});
```

---

## 🔑 金鑰安全管理

### 環境變數最佳實踐

```bash
# .env (永遠不要提交到 Git)
NEWEBPAY_MERCHANT_ID=MS123456789
NEWEBPAY_HASH_KEY=abcdefghijklmnopqrstuvwxyz123456
NEWEBPAY_HASH_IV=1234567890abcdef
```

```gitignore
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
```

### 金鑰輪換機制

```typescript
// 建議每 90 天輪換一次金鑰
// 實作金鑰版本管理
const keyVersions = {
  current: 'v2',
  v1: { hashKey: '...', hashIV: '...', expiredAt: '2024-01-01' },
  v2: { hashKey: '...', hashIV: '...', createdAt: '2024-01-01' }
};
```

---

## 🔒 Webhook 安全

### IP 白名單驗證

```typescript
// 藍新官方 IP
const NEWEBPAY_IPS = [
  '175.99.72.1',  '175.99.72.2',  '175.99.72.3',
  '175.99.72.4',  '175.99.72.5',  '175.99.72.6',
  '175.99.72.7',  '175.99.72.8',  '175.99.72.9',
  '175.99.72.10', '175.99.72.11', '175.99.72.12',
  '175.99.72.13', '175.99.72.14', '175.99.72.15',
  '61.219.166.1', '61.219.166.2', '61.219.166.3',
  '61.219.166.4', '61.219.166.5'
];

function isValidNewebPayIP(ip: string): boolean {
  const cleanIP = ip.replace('::ffff:', '');
  return NEWEBPAY_IPS.includes(cleanIP);
}

// 中間件
app.post('/api/payment-callback', (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  if (process.env.NODE_ENV === 'production' && !isValidNewebPayIP(clientIP)) {
    console.warn(`Blocked webhook from: ${clientIP}`);
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
});
```

### 簽名驗證

```typescript
// 永遠驗證 TradeSha
function verifyWebhook(tradeInfo: string, tradeSha: string): boolean {
  const hashKey = process.env.NEWEBPAY_HASH_KEY!;
  const hashIV = process.env.NEWEBPAY_HASH_IV!;

  const hashString = `HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIV}`;
  const calculatedSha = crypto
    .createHash('sha256')
    .update(hashString)
    .digest('hex')
    .toUpperCase();

  return calculatedSha === tradeSha.toUpperCase();
}
```

---

## 🛡️ 防止常見攻擊

### 1. CSRF 保護

```typescript
// 使用 CSRF Token
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.get('/checkout', csrfProtection, (req, res) => {
  res.render('checkout', { csrfToken: req.csrfToken() });
});

app.post('/api/v1/payment/single', csrfProtection, async (req, res) => {
  // 處理付款
});
```

### 2. 速率限制

```typescript
import rateLimit from 'express-rate-limit';

// 付款 API 速率限制
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 10, // 最多 10 次請求
  message: { error: '請求過於頻繁，請稍後再試' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/payment', paymentLimiter);

// Webhook 速率限制 (較寬鬆)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分鐘
  max: 100, // 最多 100 次
});

app.use('/api/payment-callback', webhookLimiter);
```

### 3. SQL Injection 防護

```typescript
// ✅ 使用參數化查詢 (Supabase 自動處理)
const { data } = await supabase
  .from('payment_orders')
  .select('*')
  .eq('merchant_order_no', orderNo); // 安全

// ❌ 永遠不要拼接 SQL
// const query = `SELECT * FROM orders WHERE id = '${userInput}'`; // 危險!
```

### 4. XSS 防護

```typescript
// 輸出時永遠進行編碼
import { escape } from 'html-escaper';

function renderOrderInfo(order: PaymentOrder) {
  return `
    <div>
      <p>商品：${escape(order.item_desc)}</p>
      <p>金額：${order.amount}</p>
    </div>
  `;
}
```

---

## 📋 資安檢查清單

### 部署前檢查

- [ ] HTTPS 已啟用
- [ ] HSTS 標頭已設定
- [ ] CSP 已設定並測試
- [ ] 環境變數未暴露
- [ ] .env 未提交到 Git
- [ ] Webhook IP 白名單已啟用
- [ ] 簽名驗證已實作
- [ ] CSRF 保護已啟用
- [ ] 速率限制已設定
- [ ] 錯誤訊息不暴露敏感資訊
- [ ] 日誌不記錄完整卡號/金鑰

### 定期維護

- [ ] 每 90 天輪換金鑰
- [ ] 每月檢查依賴套件漏洞
- [ ] 每季進行安全審計
- [ ] 監控異常交易模式

---

## 🚨 事件響應

### 可疑交易處理

```typescript
// 監控異常模式
async function detectAnomalies(order: PaymentOrder) {
  const recentOrders = await supabase
    .from('payment_orders')
    .select('*')
    .eq('email', order.email)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  // 一小時內超過 5 筆訂單
  if (recentOrders.data && recentOrders.data.length > 5) {
    await alertSecurityTeam({
      type: 'HIGH_FREQUENCY',
      email: order.email,
      orderCount: recentOrders.data.length
    });
  }
}
```

### 緊急停止機制

```typescript
// 全局停止開關
const EMERGENCY_STOP = process.env.PAYMENT_EMERGENCY_STOP === 'true';

app.use('/api/v1/payment', (req, res, next) => {
  if (EMERGENCY_STOP) {
    return res.status(503).json({
      error: '付款服務暫時關閉，請稍後再試'
    });
  }
  next();
});
```

---

## 📞 安全通報

如發現安全漏洞，請透過以下管道通報：

- Email: security@your-company.com
- 加密通訊: [PGP Key]

---

*最後更新：2024-01*
