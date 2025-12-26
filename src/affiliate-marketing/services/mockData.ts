import { Product, AffiliateLink, Post, ProductList } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: '多功能桌面收納盒 大容量文具筆筒',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
    price: 199,
    category: '生活小物',
    commissionRate: 0.08,
    sourceUrl: 'https://shopee.tw/product/123',
    description: '大容量設計，多格分類收納',
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Apple AirPods Pro 2 藍牙耳機',
    imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=300',
    price: 7490,
    category: '3C',
    commissionRate: 0.03,
    sourceUrl: 'https://shopee.tw/product/456',
    description: '主動降噪，空間音訊',
    createdAt: '2025-11-19T10:00:00Z',
  },
  {
    id: '3',
    name: '韓國熱銷保濕精華液 30ml',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300',
    price: 599,
    category: '美妝',
    commissionRate: 0.10,
    sourceUrl: 'https://shopee.tw/product/789',
    description: '深層保濕，肌膚水潤',
    createdAt: '2025-11-18T10:00:00Z',
  },
  {
    id: '4',
    name: '無線充電器 15W 快充',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
    price: 299,
    category: '3C',
    commissionRate: 0.06,
    sourceUrl: 'https://shopee.tw/product/101',
    description: '支援 iPhone / Android',
    createdAt: '2025-11-17T10:00:00Z',
  },
  {
    id: '5',
    name: '北歐風簡約檯燈 LED護眼',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    price: 450,
    category: '家電',
    commissionRate: 0.07,
    sourceUrl: 'https://shopee.tw/product/102',
    description: '三段亮度調節',
    createdAt: '2025-11-16T10:00:00Z',
  },
];

export const mockAffiliateLinks: AffiliateLink[] = [
  {
    id: '1',
    productId: '1',
    originUrl: 'https://shopee.tw/product/123',
    affiliateUrl: 'https://shope.ee/AFF123-1',
    shortUrl: 'https://aff.tw/s/abc123',
    clicks: 156,
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: '2',
    productId: '2',
    originUrl: 'https://shopee.tw/product/456',
    affiliateUrl: 'https://shope.ee/AFF123-2',
    shortUrl: 'https://aff.tw/s/def456',
    clicks: 89,
    createdAt: '2025-11-19T10:00:00Z',
  },
];

export const mockProductLists: ProductList[] = [
  { id: '1', name: '本週爆品清單', description: '本週最熱賣的商品', productIds: ['1', '2'], createdAt: '2025-11-20T10:00:00Z' },
  { id: '2', name: '3C 私藏清單', description: '3C 愛好者必買', productIds: ['2', '4'], createdAt: '2025-11-19T10:00:00Z' },
  { id: '3', name: '生活好物清單', description: '提升生活品質的好物', productIds: ['1', '3', '5'], createdAt: '2025-11-18T10:00:00Z' },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    title: '3C 老闆私藏：我會買的 5 個桌面好物',
    platform: 'facebook',
    contentText: `🎯 3C 老闆私藏：我會買的 5 個桌面好物\n\n身為天天坐在電腦前的人，桌面整潔真的太重要了！`,
    imageUrls: [],
    productIds: ['1', '4'],
    affiliateLinkIds: ['1', '2'],
    status: 'scheduled',
    scheduledTime: '2025-11-25T12:00:00Z',
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: '2',
    title: '蝦皮好物開箱：韓國保濕精華',
    platform: 'instagram',
    contentText: `✨ 最近入手的韓國保濕精華液也太好用了吧！`,
    imageUrls: [],
    productIds: ['3'],
    affiliateLinkIds: [],
    status: 'draft',
    createdAt: '2025-11-19T10:00:00Z',
  },
];

export const mockAnalytics = {
  totalPostsThisWeek: 12,
  totalPostsThisMonth: 45,
  totalClicksThisWeek: 340,
  totalClicksThisMonth: 1250,
  topProducts: [
    { productId: '1', productName: '多功能桌面收納盒', clicks: 156 },
    { productId: '2', productName: 'Apple AirPods Pro 2', clicks: 89 },
    { productId: '3', productName: '韓國保濕精華液', clicks: 67 },
  ],
  platformStats: [
    { platform: 'facebook' as const, posts: 20, clicks: 580 },
    { platform: 'instagram' as const, posts: 18, clicks: 420 },
    { platform: 'line' as const, posts: 7, clicks: 250 },
  ],
  contentTypeStats: [
    { type: 'list' as const, posts: 15, clicks: 450 },
    { type: 'single' as const, posts: 20, clicks: 380 },
    { type: 'compare' as const, posts: 8, clicks: 320 },
    { type: 'ai-pick' as const, posts: 2, clicks: 100 },
  ],
};

export const pricingPlans = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: 0,
    features: ['每月 10 次 AI 生成', '最多 20 個商品', '基本分析報表', 'FB 貼文'],
    limits: { aiGenerationsPerMonth: 10, productsLimit: 20, scheduledPosts: 5, platforms: ['facebook'] as const },
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 299,
    features: ['每月 100 次 AI 生成', '無限商品數量', '完整分析報表', 'FB / IG / LINE 全平台', '自動排程發文', '圖片生成功能'],
    limits: { aiGenerationsPerMonth: 100, productsLimit: -1, scheduledPosts: 50, platforms: ['facebook', 'instagram', 'line'] as const },
  },
  {
    id: 'plus' as const,
    name: 'Plus',
    price: 699,
    features: ['無限 AI 生成', '無限商品數量', '進階分析報表', '全平台支援', '無限排程發文', '圖片 + 影片腳本生成', '優先客服支援', 'API 存取權限'],
    limits: { aiGenerationsPerMonth: -1, productsLimit: -1, scheduledPosts: -1, platforms: ['facebook', 'instagram', 'line', 'blog'] as const },
  },
];
