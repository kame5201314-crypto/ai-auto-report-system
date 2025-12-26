import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AffiliateApp from './affiliate-marketing/AffiliateApp'
import LensDemoApp from './lens-demo/LensDemoApp'
import ImageProcessorApp from './image-processor/ImageProcessorApp'
import GamePage from './pages/GamePage'
import EcommercePlatformApp from './ecommerce-platform/EcommercePlatformApp'

// 主入口 - 包含多個子系統
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 預設導向 Image Guardian */}
        <Route path="/" element={<Navigate to="/ecommerce/image-guardian" replace />} />
        {/* 2D RPG 遊戲 */}
        <Route path="/game" element={<GamePage />} />
        {/* 圖片批量處理工具 */}
        <Route path="/image-processor/*" element={<ImageProcessorApp />} />
        {/* 官網鏡頭互動工具 */}
        <Route path="/lens-demo/*" element={<LensDemoApp />} />
        {/* 電商多功能平台 */}
        <Route path="/ecommerce/*" element={<EcommercePlatformApp />} />
        {/* 聯盟行銷系統 */}
        <Route path="/affiliate/*" element={<AffiliateApp />} />
      </Routes>
    </BrowserRouter>
  )
}
