import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

function renderWithRouter(component: React.ReactNode) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe('LandingPage', () => {
  it('should render hero section with main headline', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/自動幫你產出蝦皮聯盟行銷/i)).toBeInTheDocument();
    expect(screen.getByText(/文案、圖片、短影音腳本/i)).toBeInTheDocument();
  });

  it('should render sub-headline', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/懂 AI 的電商老闆指定工具/i)).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/免費試用 7 天/i)).toBeInTheDocument();
    expect(screen.getByText(/看範例內容/i)).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText('功能')).toBeInTheDocument();
    expect(screen.getByText('使用流程')).toBeInTheDocument();
    expect(screen.getByText('方案')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('should render three feature cards', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/AI 選品＋聯盟連結生成/i)).toBeInTheDocument();
    expect(screen.getByText(/一鍵產文案＋圖＋影片腳本/i)).toBeInTheDocument();
    expect(screen.getByText(/自動排程發到 FB\/IG\/LINE/i)).toBeInTheDocument();
  });

  it('should render three step cards', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText('貼上蝦皮商品連結')).toBeInTheDocument();
    expect(screen.getByText('選擇內容類型')).toBeInTheDocument();
    expect(screen.getByText('自動生成＋排程發文')).toBeInTheDocument();
  });

  it('should render pricing plans', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Plus')).toBeInTheDocument();
    expect(screen.getByText('最受歡迎')).toBeInTheDocument();
  });

  it('should render FAQ section', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText('需要有蝦皮聯盟帳號嗎？')).toBeInTheDocument();
    expect(screen.getByText('AI 生成的內容品質如何？')).toBeInTheDocument();
  });

  it('should render login and register links', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText('登入')).toBeInTheDocument();
    expect(screen.getAllByText('免費試用').length).toBeGreaterThan(0);
  });

  it('should render footer', () => {
    renderWithRouter(<LandingPage />);

    expect(screen.getByText(/© 2025 AffiliateAI/i)).toBeInTheDocument();
  });
});
