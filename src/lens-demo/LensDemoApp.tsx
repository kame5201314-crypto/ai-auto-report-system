import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './components/CartContext'
import Header from './components/Header'

// 頁面
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import ProductsPage from './pages/ProductsPage'
import ScenarioPage from './pages/ScenarioPage'
import FirstAidPage from './pages/FirstAidPage'
import CartPage from './pages/CartPage'
import ClassroomPage from './pages/ClassroomPage'

export default function LensDemoApp() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/scenario/:scenarioId" element={<ScenarioPage />} />
            <Route path="/first-aid/:productId" element={<FirstAidPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/classroom" element={<ClassroomPage />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  )
}
