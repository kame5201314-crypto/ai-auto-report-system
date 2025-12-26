import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mock before hoisting
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: {
        id: 'conv-1',
        user_id: 'test-user',
        title: '新對話',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null
    }),
  })),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Now import the service after mocking
import * as aiService from '../../services/ai'

describe('AI 服務測試', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createConversation', () => {
    it('應該能夠建立新的對話', async () => {
      const mockData = {
        id: 'conv-1',
        user_id: 'test-user',
        title: '新對話',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })

      const result = await aiService.createConversation('test-user', undefined, '新對話')

      expect(result).toHaveProperty('id')
      expect(result.title).toBe('新對話')
    })
  })

  describe('getConversations', () => {
    it('應該能夠取得用戶的對話列表', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          user_id: 'test-user',
          title: '對話1',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'conv-2',
          user_id: 'test-user',
          title: '對話2',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockConversations, error: null })
            })
          })
        })
      })

      const result = await aiService.getConversations('test-user')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getMessages', () => {
    it('應該能夠取得對話的訊息', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          role: 'user',
          content: '你好',
          metadata: {},
          created_at: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          role: 'assistant',
          content: '你好！有什麼可以幫助您的嗎？',
          metadata: {},
          created_at: new Date().toISOString(),
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockMessages, error: null })
          })
        })
      })

      const result = await aiService.getMessages('conv-1')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('addMessage', () => {
    it('應該能夠新增訊息到對話', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversation_id: 'conv-1',
        role: 'user',
        content: '這是測試訊息',
        metadata: {},
        created_at: new Date().toISOString(),
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockMessage, error: null })
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      const result = await aiService.addMessage('conv-1', 'user', '這是測試訊息')

      expect(result).toHaveProperty('id')
      expect(result.content).toBe('這是測試訊息')
    })
  })

  describe('deleteConversation', () => {
    it('應該能夠刪除對話（軟刪除）', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      await expect(aiService.deleteConversation('conv-1')).resolves.not.toThrow()
    })
  })

  describe('rateMessage', () => {
    it('應該能夠評價訊息', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      await expect(aiService.rateMessage('msg-1', 5)).resolves.not.toThrow()
    })
  })

  describe('generateAIResponse', () => {
    it('應該能夠生成 AI 回應', async () => {
      const response = await aiService.generateAIResponse('什麼是 Python?')

      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })
  })

  describe('checkDailyUsage', () => {
    it('應該能夠檢查每日使用量', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ count: 5, error: null })
            })
          })
        })
      })

      const result = await aiService.checkDailyUsage('test-user')

      expect(result).toHaveProperty('used')
      expect(result).toHaveProperty('limit')
      expect(result.limit).toBe(10)
    })
  })
})
