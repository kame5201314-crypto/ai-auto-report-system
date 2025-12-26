import { vi } from 'vitest'

// Mock Supabase responses
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@test.com' } }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@test.com' } }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: getMockDataForTable(table), error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: getMockDataForTable(table), error: null }),
    then: vi.fn((callback) => callback({ data: [getMockDataForTable(table)], error: null })),
  })),
}

function getMockDataForTable(table: string): any {
  switch (table) {
    case 'profiles':
      return {
        id: 'test-user-id',
        username: 'testuser',
        display_name: 'Test User',
        subscription_tier: 'free',
        learning_points: 100,
        achievements: [],
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    case 'subjects':
      return {
        id: 'subject-1',
        name: '程式設計',
        slug: 'programming',
        description: '學習程式設計',
        icon: '💻',
        color: '#3B82F6',
        is_active: true,
        order_index: 0,
        created_at: new Date().toISOString(),
      }
    case 'courses':
      return {
        id: 'course-1',
        subject_id: 'subject-1',
        title: 'Python 入門',
        description: '學習 Python 基礎',
        difficulty_level: 'beginner',
        duration_minutes: 120,
        is_premium: false,
        is_published: true,
        view_count: 100,
        like_count: 10,
        tags: ['Python', '初學者'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    case 'ai_conversations':
      return {
        id: 'conv-1',
        user_id: 'test-user-id',
        subject_id: 'subject-1',
        title: '測試對話',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    case 'ai_messages':
      return {
        id: 'msg-1',
        conversation_id: 'conv-1',
        role: 'user',
        content: '這是一個測試訊息',
        metadata: {},
        created_at: new Date().toISOString(),
      }
    case 'forum_posts':
      return {
        id: 'post-1',
        author_id: 'test-user-id',
        subject_id: 'subject-1',
        title: '測試帖子',
        content: '這是測試內容',
        tags: ['測試'],
        is_solved: false,
        is_pinned: false,
        view_count: 10,
        like_count: 5,
        reply_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    case 'forum_replies':
      return {
        id: 'reply-1',
        post_id: 'post-1',
        author_id: 'test-user-id',
        content: '這是測試回覆',
        is_ai_generated: false,
        is_best_answer: false,
        like_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    case 'study_notes':
      return {
        id: 'note-1',
        user_id: 'test-user-id',
        title: '測試筆記',
        content: '筆記內容',
        is_public: true,
        tags: ['測試'],
        view_count: 5,
        like_count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    case 'user_progress':
      return {
        id: 'progress-1',
        user_id: 'test-user-id',
        course_id: 'course-1',
        progress_percentage: 50,
        time_spent_minutes: 60,
        last_accessed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    default:
      return {}
  }
}

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

export { getMockDataForTable }
