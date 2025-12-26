import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('首頁測試', () => {
  it('應該正確渲染首頁標題', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    // AI 學習平台 出現多次（導航欄和頁腳），使用 getAllByText
    expect(screen.getAllByText(/AI 學習平台/i).length).toBeGreaterThan(0)
  })

  it('應該顯示登入和註冊按鈕', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    expect(screen.getByRole('link', { name: /登入/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /免費註冊/i })).toBeInTheDocument()
  })

  it('應該顯示功能特色區塊', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    expect(screen.getByText(/AI 智能家教/i)).toBeInTheDocument()
    expect(screen.getByText(/學習路徑規劃/i)).toBeInTheDocument()
    // 社群討論區 出現多次（功能特色和免費方案），使用 getAllByText
    expect(screen.getAllByText(/社群討論區/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/筆記共享/i)).toBeInTheDocument()
  })

  it('應該顯示訂閱方案', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    expect(screen.getByText(/免費方案/i)).toBeInTheDocument()
    expect(screen.getByText(/專業方案/i)).toBeInTheDocument()
    expect(screen.getByText(/企業方案/i)).toBeInTheDocument()
  })

  it('應該顯示學科分類', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    expect(screen.getByText(/程式設計/i)).toBeInTheDocument()
    expect(screen.getByText(/數學/i)).toBeInTheDocument()
    expect(screen.getByText(/英語/i)).toBeInTheDocument()
  })

  it('應該有導航連結到登入頁', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    const loginLink = screen.getByRole('link', { name: /登入/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('應該有導航連結到註冊頁', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    const registerLink = screen.getByRole('link', { name: /免費註冊/i })
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('應該顯示頁腳', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  it('應該顯示功能特色標題', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    // 找到功能特色區塊的標題 (h2)
    expect(screen.getByRole('heading', { name: /功能特色/i })).toBeInTheDocument()
  })

  it('應該顯示英雄區塊文字', () => {
    render(<HomePage />, { wrapper: TestWrapper })

    expect(screen.getByText(/讓 AI 成為你的/i)).toBeInTheDocument()
    expect(screen.getByText(/私人家教/i)).toBeInTheDocument()
  })
})
