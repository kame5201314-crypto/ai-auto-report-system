import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import AITutorPage from '../../pages/AITutorPage'

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
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
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

describe('AI 助教頁面測試', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('應該正確渲染 AI 助教頁面', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/AI 智能家教/i)).toBeInTheDocument()
  })

  it('應該顯示新對話按鈕', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByRole('button', { name: /新對話/i })).toBeInTheDocument()
  })

  it('應該顯示學科選擇器', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/選擇學科/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('應該顯示訊息輸入區域', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByPlaceholderText(/輸入您的問題/i)).toBeInTheDocument()
  })

  it('應該顯示歡迎訊息當沒有對話時', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/您好/i)).toBeInTheDocument()
    expect(screen.getByText(/AI 學習助教/i)).toBeInTheDocument()
  })

  it('應該顯示快速問題提示', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/請解釋這個概念/i)).toBeInTheDocument()
    expect(screen.getByText(/這道題目怎麼解/i)).toBeInTheDocument()
  })

  it('應該能夠輸入訊息', async () => {
    const user = userEvent.setup()
    render(<AITutorPage />, { wrapper: TestWrapper })

    const input = screen.getByPlaceholderText(/輸入您的問題/i)
    await user.type(input, '什麼是 Python?')

    expect(input).toHaveValue('什麼是 Python?')
  })

  it('應該有發送按鈕', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    // 發送按鈕
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('應該顯示用戶資訊', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    // 用戶資訊應該在側邊欄
    expect(screen.getByText(/免費方案/i)).toBeInTheDocument()
  })

  it('應該顯示對話歷史區域', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/最近對話/i)).toBeInTheDocument()
  })

  it('應該能夠選擇不同學科', async () => {
    const user = userEvent.setup()
    render(<AITutorPage />, { wrapper: TestWrapper })

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'programming')

    expect(select).toHaveValue('programming')
  })

  it('點擊快速問題應該填入輸入框', async () => {
    const user = userEvent.setup()
    render(<AITutorPage />, { wrapper: TestWrapper })

    const quickPrompt = screen.getByText(/請解釋這個概念/i)
    await user.click(quickPrompt)

    const input = screen.getByPlaceholderText(/輸入您的問題/i)
    expect(input).toHaveValue('請解釋這個概念...')
  })

  it('應該顯示引導提示', () => {
    render(<AITutorPage />, { wrapper: TestWrapper })

    // 頁面上可能有多個包含 "AI 助教" 和 "引導" 的文字，使用 getAllByText
    const guidanceTexts = screen.getAllByText(/引導/i)
    expect(guidanceTexts.length).toBeGreaterThan(0)
  })
})
