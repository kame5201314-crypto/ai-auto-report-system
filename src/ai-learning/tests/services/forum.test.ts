import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mock before hoisting
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}))

import * as forumService from '../../services/forum'

describe('論壇服務測試', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPosts', () => {
    it('應該能夠取得論壇帖子列表', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: '測試帖子',
          content: '測試內容',
          author_id: 'user-1',
          is_pinned: false,
          is_solved: false,
          view_count: 10,
          like_count: 5,
          reply_count: 2,
          author: { username: 'testuser' }
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockPosts, count: 1, error: null })
          })
        })
      })

      const result = await forumService.getPosts()

      expect(result.posts).toBeDefined()
      expect(Array.isArray(result.posts)).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('forum_posts')
    })

    it('應該能夠按學科篩選帖子', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Python 問題',
          subject_id: 'sub-1',
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockPosts, count: 1, error: null })
            })
          })
        })
      })

      const result = await forumService.getPosts({ subjectId: 'sub-1' })

      expect(result.posts).toBeDefined()
    })
  })

  describe('getPost', () => {
    it('應該能夠取得單一帖子詳情', async () => {
      const mockPost = {
        id: 'post-1',
        title: '測試帖子',
        content: '測試內容',
        view_count: 10,
        author: { username: 'testuser' }
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPost, error: null })
          })
        })
      })
      mockSupabase.rpc.mockResolvedValue({ error: null })

      const result = await forumService.getPost('post-1')

      expect(result).toHaveProperty('id', 'post-1')
      expect(result).toHaveProperty('title', '測試帖子')
    })
  })

  describe('createPost', () => {
    it('應該能夠建立新帖子', async () => {
      const mockPost = {
        id: 'post-new',
        author_id: 'user-1',
        title: '新帖子',
        content: '帖子內容',
        tags: ['測試'],
        is_solved: false,
        is_pinned: false,
        view_count: 0,
        like_count: 0,
        reply_count: 0,
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPost, error: null })
          })
        })
      })

      const result = await forumService.createPost(
        'user-1',
        '新帖子',
        '帖子內容',
        undefined,
        ['測試']
      )

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title', '新帖子')
    })
  })

  describe('updatePost', () => {
    it('應該能夠更新帖子', async () => {
      const mockUpdatedPost = {
        id: 'post-1',
        title: '更新後的標題',
        content: '更新後的內容',
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUpdatedPost, error: null })
            })
          })
        })
      })

      const result = await forumService.updatePost('post-1', {
        title: '更新後的標題',
        content: '更新後的內容',
      })

      expect(result).toHaveProperty('title', '更新後的標題')
    })
  })

  describe('deletePost', () => {
    it('應該能夠刪除帖子', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      await expect(forumService.deletePost('post-1')).resolves.not.toThrow()
    })
  })

  describe('likePost', () => {
    it('應該能夠按讚帖子', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null })

      await expect(forumService.likePost('post-1')).resolves.not.toThrow()
    })
  })

  describe('getReplies', () => {
    it('應該能夠取得帖子的回覆', async () => {
      const mockReplies = [
        {
          id: 'reply-1',
          post_id: 'post-1',
          content: '這是回覆',
          is_best_answer: true,
          author: { username: 'user1' }
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockReplies, error: null })
            })
          })
        })
      })

      const result = await forumService.getReplies('post-1')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('createReply', () => {
    it('應該能夠建立回覆', async () => {
      const mockReply = {
        id: 'reply-new',
        post_id: 'post-1',
        author_id: 'user-1',
        content: '新回覆',
        is_ai_generated: false,
        is_best_answer: false,
        like_count: 0,
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockReply, error: null })
          })
        })
      })
      mockSupabase.rpc.mockResolvedValue({ error: null })

      const result = await forumService.createReply('post-1', 'user-1', '新回覆')

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('content', '新回覆')
    })
  })

  describe('markAsBestAnswer', () => {
    it('應該能夠設定最佳解答', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      await expect(forumService.markAsBestAnswer('reply-1', 'post-1')).resolves.not.toThrow()
    })
  })

  describe('searchForum', () => {
    it('應該能夠搜尋帖子', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Python 裝飾器',
          content: '如何使用裝飾器',
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
            })
          })
        })
      })

      const result = await forumService.searchForum('Python')

      expect(Array.isArray(result)).toBe(true)
    })
  })
})
