# 台灣房產 AI 估價平台 - 實作指南

## 專案概述

這是一個完整的房產價格數據與估價分析平台,整合台灣實價登錄資料,提供 AI 估價、市場分析、趨勢預測等功能。

## 已完成的核心功能

### ✅ 1. 系統架構設計
- 完整的技術棧規劃 (Next.js 14 + Supabase + AI/ML)
- 資料庫 Schema 設計
- API 架構設計
- 前端頁面規劃

### ✅ 2. 資料庫設計 (Prisma Schema)
檔案位置: `prisma/schema_property.prisma`

包含以下資料表:
- **用戶系統**: users, subscriptions
- **房產數據**: transactions, communities, community_reviews
- **估價功能**: valuations
- **用戶功能**: watchlist, price_alerts
- **分析數據**: market_trends, district_stats
- **系統管理**: api_logs, system_config, data_import_logs

### ✅ 3. 後端 API 實作

#### 3.1 交易記錄 API
**檔案**: `app/api/property/transactions/route.ts`

功能:
- `GET /api/property/transactions` - 查詢實價登錄交易記錄
  - 支援多條件篩選 (縣市、區域、建物類型、價格、坪數、日期等)
  - 分頁查詢
  - 包含社區資訊

- `POST /api/property/transactions` - 新增交易記錄 (管理員功能)

#### 3.2 估價 API
**檔案**: `app/api/property/valuation/route.ts`

功能:
- `POST /api/property/valuation` - AI 房屋估價
  - 相似物件比較法
  - 加權平均計算
  - 多因子調整 (車位、樓層、屋齡等)
  - 信心度評估
  - 價格區間預測

- `GET /api/property/valuation` - 查詢估價歷史

估價演算法特色:
```typescript
// 1. 找尋相似案例 (面積±30%, 1km範圍, 近1年)
// 2. 加權計算 (面積相似度、屋齡、樓層、時間衰減)
// 3. 調整因子 (車位+150萬/個、低樓層-5%、屋齡折舊)
// 4. 信心度計算 (案例數量影響)
// 5. 價格區間 (根據信心度決定範圍)
```

#### 3.3 市場分析 API
**檔案**: `app/api/property/analysis/trends/route.ts`

功能:
- `GET /api/property/analysis/trends` - 市場趨勢分析
  - 按月份統計價格走勢
  - 計算平均價、中位數、漲跌幅
  - 交易量變化分析
  - 支援 12/24/36/60 個月週期

#### 3.4 社區資料 API
**檔案**: `app/api/property/communities/route.ts`

功能:
- `GET /api/property/communities` - 查詢社區列表
  - 關鍵字搜尋
  - 評分篩選
  - 包含近期成交統計

- `POST /api/property/communities` - 新增社區

### ✅ 4. 前端頁面實作

#### 4.1 首頁
**檔案**: `app/(property)/page.tsx`

功能:
- Hero Section 搜尋框
- 功能特色介紹
- 熱門區域行情展示
- 平台數據統計
- CTA 按鈕
- 完整 Footer

#### 4.2 AI 估價頁面
**檔案**: `app/(property)/property/valuation/page.tsx`

功能:
- 詳細的房屋資訊表單
  - 地點 (縣市、區域、地址)
  - 建物類型 (公寓、華廈、大樓等)
  - 基本資訊 (坪數、樓層、屋齡)
  - 詳細資訊 (房數、衛浴、車位、電梯)
- 即時估價結果展示
  - AI 預估市值 (大卡片展示)
  - 每坪單價 & 信心度
  - 價格區間視覺化
  - 估價分析因子
  - 相似成交案例列表

#### 4.3 搜尋頁面
**檔案**: `app/(property)/property/search/page.tsx`

功能:
- 多條件搜尋表單
- 進階篩選 (價格、坪數區間)
- 交易記錄列表展示
- 分頁功能
- 社區連結

---

## 尚未實作的功能

### 🔨 待開發項目

#### 1. 地圖視覺化功能
- [ ] 整合 Mapbox GL JS 或 Leaflet
- [ ] 熱力圖顯示房價分布
- [ ] 互動式標記點擊查看詳情
- [ ] 地圖篩選與範圍查詢

建議實作方式:
```typescript
// components/PropertyMap.tsx
import mapboxgl from 'mapbox-gl'
// 參考設計文件中的地圖實作範例
```

#### 2. 用戶認證系統
- [ ] 整合 Supabase Auth
- [ ] 註冊/登入頁面
- [ ] Session 管理
- [ ] 權限驗證 Middleware
- [ ] 會員等級判斷 (免費/付費)

建議實作:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 檢查 Supabase session
  // 驗證 API 請求權限
}
```

#### 3. 訂閱付費系統
- [ ] 整合 Stripe Checkout
- [ ] 訂閱方案頁面 (/pricing)
- [ ] Webhook 處理訂閱狀態
- [ ] 會員權限管理
- [ ] API 額度控制

#### 4. 進階分析功能
- [ ] 投資報酬率計算器
- [ ] 房貸試算工具
- [ ] 區域排行榜
- [ ] PDF 報告產生

#### 5. 社群功能
- [ ] 社區評價系統
- [ ] 照片上傳
- [ ] 評論與評分
- [ ] 有用/沒用投票

#### 6. 後台管理
- [ ] 管理員儀表板
- [ ] 數據導入管理
- [ ] 用戶管理
- [ ] 訂閱管理
- [ ] 系統監控

#### 7. AI 模型服務
- [ ] Python FastAPI 服務建立
- [ ] XGBoost 模型訓練
- [ ] 模型持久化與版本管理
- [ ] API 接口整合

建議架構:
```python
# ml_service/api.py
from fastapi import FastAPI
app = FastAPI()

@app.post("/predict")
async def predict_price(request: ValuationRequest):
    # 載入模型
    # 預測房價
    return result
```

#### 8. 數據整合
- [ ] 實價登錄資料下載腳本
- [ ] ETL Pipeline (Extract, Transform, Load)
- [ ] Geocoding 地址轉經緯度
- [ ] 定時任務 (Cron Jobs)
- [ ] 數據品質檢查

建議使用:
```typescript
// scripts/import-transactions.ts
// 或使用 Python + Pandas 處理 CSV
```

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

建立 `.env.local` 檔案:

```bash
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Stripe (訂閱功能)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Map API (選一個)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.ey..."
# 或
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."

# ML Service (如果有獨立的 Python 服務)
ML_SERVICE_URL="http://localhost:8000"
```

### 3. 初始化資料庫

```bash
# 使用 Prisma 資料庫設定 (需要先將 schema_property.prisma 改名為 schema.prisma)
npx prisma db push

# 產生 Prisma Client
npx prisma generate
```

### 4. 執行開發伺服器

```bash
npm run dev
```

訪問 http://localhost:3000

---

## API 使用範例

### 查詢交易記錄

```bash
GET /api/property/transactions?city=台北市&district=大安區&page=1&limit=20
```

回應:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address": "台北市大安區信義路四段",
      "price": "15000000",
      "unitPrice": 500000,
      "area": "30.00",
      "transactionDate": "2024-01-15",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  }
}
```

### AI 估價

```bash
POST /api/property/valuation
Content-Type: application/json

{
  "city": "台北市",
  "district": "大安區",
  "buildingType": "BUILDING",
  "area": 30,
  "floor": 5,
  "totalFloors": 15,
  "buildingAge": 10,
  "bedrooms": 2,
  "bathrooms": 1,
  "parkingSpaces": 1,
  "hasElevator": true
}
```

回應:
```json
{
  "success": true,
  "data": {
    "address": "台北市大安區",
    "valuation": {
      "estimatedPrice": 15000000,
      "unitPrice": 500000,
      "priceRange": {
        "min": 14000000,
        "max": 16000000
      },
      "confidence": 0.85,
      "similarTransactions": [...],
      "factors": {
        "method": "comparable_sales",
        "sampleSize": 15
      }
    }
  }
}
```

### 市場趨勢分析

```bash
GET /api/property/analysis/trends?city=台北市&district=大安區&period=12m
```

---

## 資料庫結構概覽

### 核心資料表

```
users (用戶)
├─ subscriptions (訂閱記錄)
├─ valuations (估價歷史)
├─ watchlist (關注列表)
├─ price_alerts (價格提醒)
└─ api_logs (API 使用記錄)

transactions (交易記錄)
└─ community (所屬社區)

communities (社區)
├─ transactions (交易記錄)
├─ reviews (評價)
└─ watchlist (被關注)

market_trends (市場趨勢)
district_stats (區域統計)
```

---

## 技術架構

### 前端
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (建議安裝)
- **State**: React Query (建議安裝)
- **Charts**: Recharts (建議安裝)
- **Maps**: Mapbox GL JS / Leaflet (需安裝)

### 後端
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Payment**: Stripe

### AI/ML (需獨立開發)
- **Language**: Python
- **Framework**: FastAPI
- **ML Libraries**:
  - Scikit-learn
  - XGBoost
  - Pandas
  - NumPy

---

## 部署建議

### Vercel (推薦)
```bash
vercel --prod
```

### 環境變數設定
在 Vercel Dashboard 設定所有 .env.local 中的變數

### 資料庫
- 使用 Supabase (推薦) 或 AWS RDS
- 定期備份

### ML 服務
- 部署到 Railway / Render / AWS Lambda
- 設定環境變數 ML_SERVICE_URL

---

## 開發階段規劃

### Phase 1: MVP (已完成 ✅)
- ✅ 資料庫設計
- ✅ 基本 API (交易查詢、估價、趨勢)
- ✅ 前端基礎頁面 (首頁、估價、搜尋)

### Phase 2: 核心功能 (進行中 🔨)
- 🔨 地圖視覺化
- 🔨 用戶認證系統
- ⏳ 社區資訊完善
- ⏳ 房貸試算工具

### Phase 3: 商業化 (待開發 📅)
- 📅 訂閱付費系統
- 📅 API 服務與文檔
- 📅 PDF 報告產生
- 📅 投資分析工具

### Phase 4: 優化擴展 (未來 🚀)
- 🚀 AI 模型優化
- 🚀 效能優化
- 🚀 SEO 優化
- 🚀 行動版 App

---

## 資料來源

### 實價登錄 Open Data
- **官方網站**: https://plvr.land.moi.gov.tw/
- **API 文件**: 地政資料開放平台
- **更新頻率**: 每月

### 建議的資料導入流程

1. **下載實價登錄 CSV**
   ```python
   import requests
   import pandas as pd

   url = "https://plvr.land.moi.gov.tw/Download?..."
   df = pd.read_csv(url, encoding='big5')
   ```

2. **資料清洗與轉換**
   - 地址正規化
   - 價格單位統一 (轉為總價)
   - 坪數計算 (平方公尺 → 坪)
   - 日期格式轉換

3. **Geocoding (地址 → 經緯度)**
   - Google Maps Geocoding API
   - 或自建地址資料庫

4. **導入資料庫**
   ```typescript
   await prisma.transaction.createMany({
     data: cleanedData
   })
   ```

---

## 常見問題

### Q1: 如何開始開發?
A: 先確保資料庫已建立,執行 `npx prisma db push` 後啟動開發伺服器 `npm run dev`

### Q2: 估價功能需要訓練 AI 模型嗎?
A: 目前的實作使用「相似物件比較法」,不需要 ML 模型。如果要更精準的估價,可以訓練 XGBoost 模型。

### Q3: 沒有實價登錄資料怎麼辦?
A: 可以先使用測試資料:
```typescript
// 建立測試資料腳本
await prisma.transaction.createMany({
  data: generateMockTransactions(1000)
})
```

### Q4: 如何新增付費功能?
A: 參考設計文件中的 Stripe 整合範例,建立:
1. 訂閱方案頁面
2. Checkout API
3. Webhook 處理器

---

## 參考資源

### 國內類似平台
- [House+ 好時價](https://www.houseplus.com.tw/)
- [信義房屋房價地圖](https://www.sinyi.com.tw/)

### 國外參考
- [Zillow](https://www.zillow.com/) - 美國房地產平台
- [Redfin](https://www.redfin.com/) - 線上房產經紀

### 技術文件
- [Next.js 文件](https://nextjs.org/docs)
- [Prisma 文件](https://www.prisma.io/docs)
- [Supabase 文件](https://supabase.com/docs)
- [Stripe 文件](https://stripe.com/docs)

---

## 授權與聲明

本專案為示範性質的設計文件與程式碼架構。實際部署前請確保:

1. ✅ 取得實價登錄資料使用授權
2. ✅ 遵守個資法與相關法規
3. ✅ 明確標示估價結果「僅供參考」
4. ✅ 建立使用條款與免責聲明
5. ✅ 取得必要的商業許可

---

## 聯絡與支援

如有問題或建議,歡迎提出 Issue 或聯絡開發團隊。

**祝開發順利!** 🚀
