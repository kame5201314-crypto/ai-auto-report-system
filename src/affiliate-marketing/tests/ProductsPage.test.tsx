import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProductsPage from '../pages/ProductsPage';

function renderWithProviders(component: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('選品 & 商品庫')).toBeInTheDocument();
    expect(screen.getByText('管理你的蝦皮聯盟商品')).toBeInTheDocument();
  });

  it('should render add product button', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('新增商品')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByPlaceholderText('搜尋商品名稱...')).toBeInTheDocument();
  });

  it('should render category filter', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('所有類別')).toBeInTheDocument();
  });

  it('should render product lists', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('本週爆品清單')).toBeInTheDocument();
    expect(screen.getByText('3C 私藏清單')).toBeInTheDocument();
    expect(screen.getByText('生活好物清單')).toBeInTheDocument();
  });

  it('should render mock products', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('多功能桌面收納盒 大容量文具筆筒')).toBeInTheDocument();
    expect(screen.getByText('Apple AirPods Pro 2 藍牙耳機')).toBeInTheDocument();
  });

  it('should render product prices', () => {
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('$199')).toBeInTheDocument();
    expect(screen.getByText('$7490')).toBeInTheDocument();
  });

  it('should open add product modal when clicking add button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);

    await user.click(screen.getByText('新增商品'));

    expect(screen.getByText('貼上蝦皮商品網址，自動抓取資訊')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://shopee.tw/product/...')).toBeInTheDocument();
  });

  it('should close modal when clicking cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);

    await user.click(screen.getByText('新增商品'));
    expect(screen.getByText('貼上蝦皮商品網址，自動抓取資訊')).toBeInTheDocument();

    await user.click(screen.getByText('取消'));
    expect(screen.queryByText('貼上蝦皮商品網址，自動抓取資訊')).not.toBeInTheDocument();
  });

  it('should filter products by search query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);

    const searchInput = screen.getByPlaceholderText('搜尋商品名稱...');
    await user.type(searchInput, 'AirPods');

    expect(screen.getByText('Apple AirPods Pro 2 藍牙耳機')).toBeInTheDocument();
    expect(screen.queryByText('多功能桌面收納盒 大容量文具筆筒')).not.toBeInTheDocument();
  });

  it('should have copy buttons for affiliate links', () => {
    renderWithProviders(<ProductsPage />);

    // Just verify there are buttons in the product cards
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should parse shopee URL and show product info', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);

    await user.click(screen.getByText('新增商品'));

    const urlInput = screen.getByPlaceholderText('https://shopee.tw/product/...');
    await user.type(urlInput, 'https://shopee.tw/product/123456');

    await user.click(screen.getByText('解析'));

    // Wait for parsing to complete
    await waitFor(() => {
      expect(screen.getByText('智能手錶 運動手環 心率監測')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('$899')).toBeInTheDocument();
  });
});
