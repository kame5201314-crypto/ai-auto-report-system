import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';

function renderWithProviders(component: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('歡迎回來')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
  });

  it('should render logo and brand name', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('AffiliateAI')).toBeInTheDocument();
  });

  it('should render register link', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('免費註冊')).toBeInTheDocument();
  });

  it('should show error when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: '登入' }));

    expect(screen.getByText('請填寫所有欄位')).toBeInTheDocument();
  });

  it('should allow typing in email field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    await user.type(emailInput, 'test@test.com');

    expect(emailInput).toHaveValue('test@test.com');
  });

  it('should allow typing in password field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button (it's the button with Eye icon)
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: '登入' }));

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /登入中/i })).toBeInTheDocument();
    });
  });
});
