import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 資料庫類型定義
export interface Profile {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  subscription_tier: 'free' | 'premium' | 'enterprise'
  subscription_expires_at?: string
  learning_points: number
  achievements: any[]
  preferences: any
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Course {
  id: string
  subject_id: string
  title: string
  description?: string
  content?: string
  content_type?: 'video' | 'article' | 'quiz' | 'exercise' | 'pdf'
  thumbnail_url?: string
  resource_url?: string
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes?: number
  is_premium: boolean
  tags: string[]
  metadata: any
  author_id?: string
  view_count: number
  like_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number
  completed_at?: string
  time_spent_minutes: number
  last_accessed_at: string
  notes?: string
  created_at: string
}

export interface AIConversation {
  id: string
  user_id: string
  subject_id?: string
  title?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: any
  rating?: number
  created_at: string
}

export interface ForumPost {
  id: string
  subject_id?: string
  author_id: string
  title: string
  content: string
  tags: string[]
  is_solved: boolean
  is_pinned: boolean
  view_count: number
  like_count: number
  reply_count: number
  created_at: string
  updated_at: string
  author?: Profile
}

export interface ForumReply {
  id: string
  post_id: string
  author_id: string
  parent_reply_id?: string
  content: string
  is_ai_generated: boolean
  is_best_answer: boolean
  like_count: number
  created_at: string
  updated_at: string
  author?: Profile
}

export interface StudyNote {
  id: string
  user_id: string
  course_id?: string
  subject_id?: string
  title: string
  content: string
  is_public: boolean
  tags: string[]
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface LearningPlan {
  id: string
  user_id: string
  subject_id: string
  title: string
  description?: string
  goal?: string
  target_date?: string
  is_active: boolean
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface LearningTask {
  id: string
  plan_id: string
  course_id?: string
  title: string
  description?: string
  is_completed: boolean
  completed_at?: string
  due_date?: string
  order_index: number
  created_at: string
}
