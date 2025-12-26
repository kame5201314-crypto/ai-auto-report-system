import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mock before hoisting
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}))

import * as notesService from '../../services/notes'

describe('筆記服務測試', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotes', () => {
    it('應該能夠取得用戶的筆記列表', async () => {
      const mockNotes = [
        {
          id: 'note-1',
          user_id: 'user-1',
          title: '測試筆記',
          content: '筆記內容',
          is_public: false,
          tags: ['測試'],
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockNotes, count: 1, error: null })
          })
        })
      })

      const result = await notesService.getNotes({ userId: 'user-1' })

      expect(result.notes).toBeDefined()
      expect(Array.isArray(result.notes)).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('study_notes')
    })

    it('應該能夠取得公開筆記', async () => {
      const mockNotes = [
        {
          id: 'note-1',
          title: '公開筆記',
          is_public: true,
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockNotes, count: 1, error: null })
            })
          })
        })
      })

      const result = await notesService.getNotes({ userId: 'user-1', isPublic: true })

      expect(result.notes).toBeDefined()
    })
  })

  describe('getNote', () => {
    it('應該能夠取得單一筆記詳情', async () => {
      const mockNote = {
        id: 'note-1',
        title: '測試筆記',
        content: '筆記內容',
        is_public: true,
        view_count: 5,
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNote, error: null })
          })
        })
      })

      const result = await notesService.getNote('note-1')

      expect(result).toHaveProperty('id', 'note-1')
      expect(result).toHaveProperty('title', '測試筆記')
    })
  })

  describe('getUserNotes', () => {
    it('應該能夠取得用戶所有筆記', async () => {
      const mockNotes = [
        { id: 'note-1', user_id: 'user-1', title: '筆記1' },
        { id: 'note-2', user_id: 'user-1', title: '筆記2' },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockNotes, error: null })
          })
        })
      })

      const result = await notesService.getUserNotes('user-1')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('createNote', () => {
    it('應該能夠建立新筆記', async () => {
      const mockNote = {
        id: 'note-new',
        user_id: 'user-1',
        title: '新筆記',
        content: '筆記內容',
        is_public: false,
        tags: ['學習'],
        view_count: 0,
        like_count: 0,
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNote, error: null })
          })
        })
      })

      const result = await notesService.createNote(
        'user-1',
        '新筆記',
        '筆記內容',
        { tags: ['學習'] }
      )

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title', '新筆記')
    })

    it('應該能夠建立公開筆記', async () => {
      const mockNote = {
        id: 'note-public',
        user_id: 'user-1',
        title: '公開筆記',
        content: '分享的內容',
        is_public: true,
        tags: ['分享'],
      }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNote, error: null })
          })
        })
      })

      const result = await notesService.createNote(
        'user-1',
        '公開筆記',
        '分享的內容',
        { isPublic: true, tags: ['分享'] }
      )

      expect(result).toHaveProperty('is_public', true)
    })
  })

  describe('updateNote', () => {
    it('應該能夠更新筆記', async () => {
      const mockUpdatedNote = {
        id: 'note-1',
        title: '更新後的標題',
        content: '更新後的內容',
        is_public: true,
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUpdatedNote, error: null })
            })
          })
        })
      })

      const result = await notesService.updateNote('note-1', {
        title: '更新後的標題',
        content: '更新後的內容',
        isPublic: true,
      })

      expect(result).toHaveProperty('title', '更新後的標題')
      expect(result).toHaveProperty('is_public', true)
    })
  })

  describe('deleteNote', () => {
    it('應該能夠刪除筆記', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })

      await expect(notesService.deleteNote('note-1')).resolves.not.toThrow()
    })
  })

  describe('likeNote', () => {
    it('應該能夠按讚筆記', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null })

      await expect(notesService.likeNote('note-1')).resolves.not.toThrow()
    })
  })

  describe('getPublicNotes', () => {
    it('應該能夠取得公開筆記', async () => {
      const mockNotes = [
        { id: 'note-1', title: '公開筆記1', is_public: true },
        { id: 'note-2', title: '公開筆記2', is_public: true },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockNotes, error: null })
          })
        })
      })

      const result = await notesService.getPublicNotes()

      expect(Array.isArray(result)).toBe(true)
    })

    it('應該能夠按熱門程度排序', async () => {
      const mockNotes = [
        { id: 'note-1', title: '熱門筆記', like_count: 100 },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockNotes, error: null })
          })
        })
      })

      const result = await notesService.getPublicNotes({ orderBy: 'popular' })

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('searchNotes', () => {
    it('應該能夠搜尋筆記', async () => {
      const mockNotes = [
        { id: 'note-1', title: 'Python 筆記', content: 'Python 是一種程式語言' },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: mockNotes, error: null })
              })
            })
          })
        })
      })

      const result = await notesService.searchNotes('Python')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getNotesCount', () => {
    it('應該能夠取得用戶筆記數量', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 5, error: null })
        })
      })

      const result = await notesService.getNotesCount('user-1')

      expect(result).toBe(5)
    })
  })
})
