import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import DashboardPage from '../../pages/DashboardPage'

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('儀表板頁面測試', () => {
  it('應該正確渲染歡迎訊息', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/歡迎回來/i)).toBeInTheDocument()
  })

  it('應該顯示學習統計卡片', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/學習天數/i)).toBeInTheDocument()
    expect(screen.getByText(/完成課程/i)).toBeInTheDocument()
    expect(screen.getByText(/學習時數/i)).toBeInTheDocument()
    expect(screen.getByText(/學習積分/i)).toBeInTheDocument()
  })

  it('應該顯示繼續學習區塊', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/繼續學習/i)).toBeInTheDocument()
    expect(screen.getByText(/查看全部/i)).toBeInTheDocument()
  })

  it('應該顯示課程進度百分比', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    // 應該有進度百分比顯示
    expect(screen.getAllByText(/%/).length).toBeGreaterThan(0)
  })

  it('應該顯示推薦課程', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/推薦課程/i)).toBeInTheDocument()
  })

  it('應該顯示快速連結', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/快速連結/i)).toBeInTheDocument()
    expect(screen.getByText(/討論區/i)).toBeInTheDocument()
    expect(screen.getByText(/我的筆記/i)).toBeInTheDocument()
    expect(screen.getByText(/個人資料/i)).toBeInTheDocument()
  })

  it('應該顯示訂閱狀態', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/訂閱狀態/i)).toBeInTheDocument()
    expect(screen.getByText(/免費方案/i)).toBeInTheDocument()
  })

  it('應該有連結到 AI 助教', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByRole('link', { name: /開始 AI 對話/i })).toBeInTheDocument()
  })

  it('應該有連結到課程頁面', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    const coursesLink = screen.getByRole('link', { name: /查看全部/i })
    expect(coursesLink).toHaveAttribute('href', '/courses')
  })

  it('應該顯示升級方案按鈕', () => {
    render(<DashboardPage />, { wrapper: TestWrapper })

    expect(screen.getByRole('link', { name: /升級方案/i })).toBeInTheDocument()
  })
})
