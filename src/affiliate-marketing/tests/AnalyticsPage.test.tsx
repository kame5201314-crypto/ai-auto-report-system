import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import AnalyticsPage from '../pages/AnalyticsPage';

function renderWithProviders(component: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('分析儀表板')).toBeInTheDocument();
    expect(screen.getByText('追蹤你的聯盟行銷成效')).toBeInTheDocument();
  });

  it('should render date range selector', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('本週')).toBeInTheDocument();
  });

  it('should render key metrics cards', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('本週貼文數')).toBeInTheDocument();
    expect(screen.getByText('本週點擊數')).toBeInTheDocument();
    expect(screen.getByText('平均點擊率')).toBeInTheDocument();
    expect(screen.getByText('預估轉換')).toBeInTheDocument();
  });

  it('should render charts section', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('每日表現')).toBeInTheDocument();
    expect(screen.getByText('各平台成效')).toBeInTheDocument();
    expect(screen.getByText('各內容類型成效')).toBeInTheDocument();
  });

  it('should render top products table', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('商品表現排行')).toBeInTheDocument();
    expect(screen.getByText('排名')).toBeInTheDocument();
    expect(screen.getByText('商品名稱')).toBeInTheDocument();
    expect(screen.getByText('點擊數')).toBeInTheDocument();
  });

  it('should render product data in table', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('多功能桌面收納盒')).toBeInTheDocument();
    expect(screen.getByText('Apple AirPods Pro 2')).toBeInTheDocument();
  });

  it('should render AI insights section', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('AI 分析洞察')).toBeInTheDocument();
    expect(screen.getByText('最佳發文時間')).toBeInTheDocument();
    expect(screen.getByText('內容建議')).toBeInTheDocument();
    expect(screen.getByText('商品推薦')).toBeInTheDocument();
  });

  it('should change date range when selecting different option', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnalyticsPage />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'month');

    expect(screen.getByText('本月貼文數')).toBeInTheDocument();
    expect(screen.getByText('本月點擊數')).toBeInTheDocument();
  });

  it('should render percentage change indicators', () => {
    renderWithProviders(<AnalyticsPage />);

    // Look for percentage values with % sign
    const percentages = screen.getAllByText(/%$/);
    expect(percentages.length).toBeGreaterThan(0);
  });

  it('should render charts with labels', () => {
    renderWithProviders(<AnalyticsPage />);

    // Check for chart section headers which indicate charts are present
    expect(screen.getByText('每日表現')).toBeInTheDocument();
    expect(screen.getByText('各平台成效')).toBeInTheDocument();
  });
});
