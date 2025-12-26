import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
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

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('認證系統測試', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('登入頁面測試', () => {
    it('應該正確渲染登入表單', () => {
      render(<LoginPage />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /登入/i })).toBeInTheDocument()
    })

    it('應該顯示所有必填欄位', () => {
      render(<LoginPage />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeRequired()
      expect(screen.getByPlaceholderText('••••••••')).toBeRequired()
    })

    it('應該能夠輸入電子郵件和密碼', async () => {
      const user = userEvent.setup()
      render(<LoginPage />, { wrapper: TestWrapper })

      const emailInput = screen.getByPlaceholderText(/your@email.com/i)
      const passwordInput = screen.getByPlaceholderText('••••••••')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('應該有登入按鈕', () => {
      render(<LoginPage />, { wrapper: TestWrapper })

      const loginButton = screen.getByRole('button', { name: /登入/i })
      expect(loginButton).toBeInTheDocument()
    })

    it('應該有註冊連結', () => {
      render(<LoginPage />, { wrapper: TestWrapper })

      expect(screen.getByText(/立即註冊/i)).toBeInTheDocument()
    })

    it('應該顯示社交登入選項', () => {
      render(<LoginPage />, { wrapper: TestWrapper })

      expect(screen.getByText(/Google/i)).toBeInTheDocument()
      expect(screen.getByText(/Facebook/i)).toBeInTheDocument()
    })
  })

  describe('註冊頁面測試', () => {
    it('應該正確渲染註冊表單', () => {
      render(<RegisterPage />, { wrapper: TestWrapper })

      expect(screen.getByPlaceholderText(/您的暱稱/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/至少 6 個字元/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/再次輸入密碼/i)).toBeInTheDocument()
    })

    it('應該能夠輸入註冊資料', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      const usernameInput = screen.getByPlaceholderText(/您的暱稱/i)
      const emailInput = screen.getByPlaceholderText(/your@email.com/i)
      const passwordInput = screen.getByPlaceholderText(/至少 6 個字元/i)
      const confirmPasswordInput = screen.getByPlaceholderText(/再次輸入密碼/i)

      await user.type(usernameInput, 'testuser')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      expect(usernameInput).toHaveValue('testuser')
      expect(emailInput).toHaveValue('test@test.com')
      expect(passwordInput).toHaveValue('password123')
      expect(confirmPasswordInput).toHaveValue('password123')
    })

    it('應該驗證密碼不一致', async () => {
      const user = userEvent.setup()
      render(<RegisterPage />, { wrapper: TestWrapper })

      const usernameInput = screen.getByPlaceholderText(/您的暱稱/i)
      const emailInput = screen.getByPlaceholderText(/your@email.com/i)
      const passwordInput = screen.getByPlaceholderText(/至少 6 個字元/i)
      const confirmPasswordInput = screen.getByPlaceholderText(/再次輸入密碼/i)

      await user.type(usernameInput, 'testuser')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')

      // 勾選服務條款
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /建立帳號/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/密碼不一致/i)).toBeInTheDocument()
      })
    })

    it('應該有服務條款確認框', () => {
      render(<RegisterPage />, { wrapper: TestWrapper })

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText(/服務條款/i)).toBeInTheDocument()
    })

    it('應該有登入連結', () => {
      render(<RegisterPage />, { wrapper: TestWrapper })

      expect(screen.getByText(/立即登入/i)).toBeInTheDocument()
    })
  })
})
