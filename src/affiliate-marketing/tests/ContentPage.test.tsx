import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ContentPage from '../pages/ContentPage';

function renderWithProviders(component: React.ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
}

describe('ContentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('AI 內容生成')).toBeInTheDocument();
    expect(screen.getByText('選擇商品，讓 AI 幫你產出高轉換內容')).toBeInTheDocument();
  });

  it('should render three tabs', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('文案生成')).toBeInTheDocument();
    expect(screen.getByText('圖片生成')).toBeInTheDocument();
    expect(screen.getByText('影片腳本')).toBeInTheDocument();
  });

  it('should render product selection section', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('選擇商品')).toBeInTheDocument();
  });

  it('should render mock products for selection', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('多功能桌面收納盒 大容量文具筆筒')).toBeInTheDocument();
    expect(screen.getByText('Apple AirPods Pro 2 藍牙耳機')).toBeInTheDocument();
  });

  it('should render content type options in copy tab', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('內容類型')).toBeInTheDocument();
    expect(screen.getByText('單品開箱文')).toBeInTheDocument();
    expect(screen.getByText('多品項清單')).toBeInTheDocument();
    expect(screen.getByText('比較文')).toBeInTheDocument();
    expect(screen.getByText('AI 選物文')).toBeInTheDocument();
  });

  it('should render platform options', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('FB 長文')).toBeInTheDocument();
    expect(screen.getByText('IG')).toBeInTheDocument();
    expect(screen.getByText('LINE 群')).toBeInTheDocument();
  });

  it('should render tone options', () => {
    renderWithProviders(<ContentPage />);

    expect(screen.getByText('實測老闆')).toBeInTheDocument();
    expect(screen.getByText('理性比較')).toBeInTheDocument();
    expect(screen.getByText('生活聊天')).toBeInTheDocument();
  });

  it('should switch to image tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    await user.click(screen.getByText('圖片生成'));

    expect(screen.getByText('圖片風格')).toBeInTheDocument();
    expect(screen.getByText('去背純白')).toBeInTheDocument();
    expect(screen.getByText('辦公桌')).toBeInTheDocument();
  });

  it('should switch to video tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    await user.click(screen.getByText('影片腳本'));

    expect(screen.getByText('影片類型')).toBeInTheDocument();
    expect(screen.getByText('開箱')).toBeInTheDocument();
    expect(screen.getByText('排行榜')).toBeInTheDocument();
    expect(screen.getByText('影片長度')).toBeInTheDocument();
  });

  it('should allow selecting products', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(checkboxes[0]).toBeChecked();
  });

  it('should generate copy when clicking generate button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    // Select a product first
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Click generate button
    await user.click(screen.getByText(/生成文案/i));

    // Wait for generation
    await waitFor(() => {
      expect(screen.getByText(/AI 生成中/i)).toBeInTheDocument();
    });

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/網友激推/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should show copy button after generation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    // Select a product
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Generate copy
    await user.click(screen.getByText(/生成文案/i));

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('複製')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should generate images when in image tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    // Switch to image tab
    await user.click(screen.getByText('圖片生成'));

    // Select a product
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Click generate
    await user.click(screen.getByText(/生成圖片/i));

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('加到貼文草稿')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should generate video script when in video tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContentPage />);

    // Switch to video tab
    await user.click(screen.getByText('影片腳本'));

    // Select a product
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Click generate
    await user.click(screen.getByText(/生成腳本/i));

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('標題候選')).toBeInTheDocument();
      expect(screen.getByText('分鏡腳本')).toBeInTheDocument();
      expect(screen.getByText('Hashtag 推薦')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
