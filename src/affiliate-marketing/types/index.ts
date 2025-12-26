// 使用者類型
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'basic' | 'pro' | 'plus';
  affiliateCode: string;
  createdAt: string;
}

// 商品類型
export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: ProductCategory;
  commissionRate: number;
  sourceUrl: string;
  description?: string;
  createdAt: string;
}

export type ProductCategory = '生活小物' | '美妝' | '3C' | '服飾' | '食品' | '家電' | '其他';

// 聯盟連結類型
export interface AffiliateLink {
  id: string;
  productId: string;
  originUrl: string;
  affiliateUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

// 選品清單
export interface ProductList {
  id: string;
  name: string;
  description?: string;
  productIds: string[];
  createdAt: string;
}

// AI 內容生成相關
export type ContentType = 'single' | 'list' | 'compare' | 'ai-pick';
export type Platform = 'facebook' | 'instagram' | 'line' | 'blog';
export type Tone = 'sales' | 'comparison' | 'casual';
export type ImageStyle = 'white-bg' | 'office' | 'kitchen' | 'bathroom' | 'bedroom' | 'list-layout';
export type ImageSize = '1:1' | '4:5' | '9:16';
export type VideoLength = '15s' | '30s';
export type VideoType = 'unboxing' | 'ranking' | 'compare' | 'lifestyle';

export interface AIContent {
  id: string;
  type: 'copy' | 'image' | 'video-script';
  productIds: string[];
  contentType: ContentType;
  platform: Platform;
  tone: Tone;
  text?: string;
  imageUrl?: string;
  videoScript?: VideoScript;
  createdAt: string;
}

export interface VideoScript {
  scenes: VideoScene[];
  titleOptions: string[];
  hashtags: string[];
}

export interface VideoScene {
  sceneNumber: number;
  dialogue: string;
  visualDescription: string;
  duration: string;
}

// 貼文草稿
export interface Post {
  id: string;
  title: string;
  platform: Platform;
  contentText: string;
  imageUrls: string[];
  productIds: string[];
  affiliateLinkIds: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledTime?: string;
  publishedTime?: string;
  createdAt: string;
}

// 分析數據
export interface Analytics {
  totalPostsThisWeek: number;
  totalPostsThisMonth: number;
  totalClicksThisWeek: number;
  totalClicksThisMonth: number;
  topProducts: { productId: string; productName: string; clicks: number }[];
  platformStats: { platform: Platform; posts: number; clicks: number }[];
  contentTypeStats: { type: ContentType; posts: number; clicks: number }[];
}
