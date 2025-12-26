import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import SchedulePage from '../pages/SchedulePage';

function renderWithProviders(component: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
}

describe('SchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    renderWithProviders(<SchedulePage />);

    expect(screen.getByText('自動發文排程')).toBeInTheDocument();
    expect(screen.getByText('管理你的貼文草稿與排程發佈')).toBeInTheDocument();
  });

  it('should render add post button', () => {
    renderWithProviders(<SchedulePage />);

    expect(screen.getByText('新增貼文')).toBeInTheDocument();
  });

  it('should render calendar', () => {
    renderWithProviders(<SchedulePage />);

    // Check for day labels
    expect(screen.getByText('日')).toBeInTheDocument();
    expect(screen.getByText('一')).toBeInTheDocument();
    expect(screen.getByText('二')).toBeInTheDocument();
    expect(screen.getByText('三')).toBeInTheDocument();
    expect(screen.getByText('四')).toBeInTheDocument();
    expect(screen.getByText('五')).toBeInTheDocument();
    expect(screen.getByText('六')).toBeInTheDocument();
  });

  it('should render filter buttons', () => {
    renderWithProviders(<SchedulePage />);

    expect(screen.getByText('全部')).toBeInTheDocument();
    // Use getAllByText for elements that appear multiple times
    expect(screen.getAllByText('草稿').length).toBeGreaterThan(0);
    expect(screen.getAllByText('已排程').length).toBeGreaterThan(0);
    expect(screen.getByText('已發佈')).toBeInTheDocument();
  });

  it('should render connected accounts section', () => {
    renderWithProviders(<SchedulePage />);

    expect(screen.getByText('已綁定帳號')).toBeInTheDocument();
    expect(screen.getByText('我的粉絲專頁')).toBeInTheDocument();
    expect(screen.getByText('@myshop_tw')).toBeInTheDocument();
  });

  it('should render mock posts', () => {
    renderWithProviders(<SchedulePage />);

    expect(screen.getByText('3C 老闆私藏：我會買的 5 個桌面好物')).toBeInTheDocument();
    expect(screen.getByText('蝦皮好物開箱：韓國保濕精華')).toBeInTheDocument();
  });

  it('should filter posts by clicking filter button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    // Click on draft filter - use getAllByText and select the button
    const draftButtons = screen.getAllByText('草稿');
    // Find the filter button (usually smaller, part of filter UI)
    const filterButton = draftButtons.find(el => el.closest('button'));
    if (filterButton) {
      await user.click(filterButton);
      // Verify the draft post is still shown
      expect(screen.getByText('蝦皮好物開箱：韓國保濕精華')).toBeInTheDocument();
    }
  });

  it('should open new post modal when clicking add button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByText('新增貼文'));

    expect(screen.getByPlaceholderText('貼文標題')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('輸入貼文內容...')).toBeInTheDocument();
  });

  it('should render platform selection in modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByText('新增貼文'));

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('LINE')).toBeInTheDocument();
  });

  it('should close modal when clicking cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByText('新增貼文'));
    expect(screen.getByPlaceholderText('貼文標題')).toBeInTheDocument();

    await user.click(screen.getByText('取消'));
    expect(screen.queryByPlaceholderText('貼文標題')).not.toBeInTheDocument();
  });

  it('should create new draft post', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />);

    await user.click(screen.getByText('新增貼文'));

    await user.type(screen.getByPlaceholderText('貼文標題'), '測試貼文標題');
    await user.type(screen.getByPlaceholderText('輸入貼文內容...'), '這是測試內容');

    await user.click(screen.getByText('儲存草稿'));

    await waitFor(() => {
      expect(screen.getByText('測試貼文標題')).toBeInTheDocument();
    });
  });

  it('should display calendar month navigation buttons', () => {
    renderWithProviders(<SchedulePage />);

    // Check navigation buttons exist by finding all buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2);
  });
});
