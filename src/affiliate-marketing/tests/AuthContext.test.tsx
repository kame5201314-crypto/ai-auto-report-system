import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Test component to access auth context
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <button data-testid="login-btn" onClick={() => login('test@test.com', 'password')}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
      <button data-testid="register-btn" onClick={() => register('new@test.com', 'password', 'New User')}>Register</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should start with not authenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('not-authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('no-user');
  });

  it('should login user successfully', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('authenticated');
    }, { timeout: 3000 });

    expect(screen.getByTestId('user-email').textContent).toBe('test@test.com');
  });

  it('should logout user successfully', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    // First login
    await user.click(screen.getByTestId('login-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('authenticated');
    }, { timeout: 3000 });

    // Then logout
    await user.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('authenticated').textContent).toBe('not-authenticated');
  });

  it('should register new user successfully', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    await user.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('authenticated');
    }, { timeout: 3000 });

    expect(screen.getByTestId('user-name').textContent).toBe('New User');
    expect(screen.getByTestId('user-email').textContent).toBe('new@test.com');
  });
});
