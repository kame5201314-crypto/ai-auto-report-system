import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to define mock before hoisting
const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('../../../lib/supabase', () => ({
  supabase: mockSupabase,
}))

import * as coursesService from '../../services/courses'

describe('課程服務測試', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSubjects', () => {
    it('應該能夠取得所有學科分類', async () => {
      const mockSubjects = [
        { id: 'sub-1', name: '程式設計', slug: 'programming', icon: '💻', is_active: true, order_index: 0 },
        { id: 'sub-2', name: '英語學習', slug: 'english', icon: '🗣️', is_active: true, order_index: 1 },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockSubjects, error: null })
          })
        })
      })

      const result = await coursesService.getSubjects()

      expect(Array.isArray(result)).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('subjects')
    })
  })

  describe('getCourses', () => {
    it('應該能夠取得課程列表', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Python 入門',
          description: '學習 Python',
          difficulty_level: 'beginner',
          is_published: true,
          is_premium: false,
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCourses, error: null })
          })
        })
      })

      const result = await coursesService.getCourses()

      expect(Array.isArray(result)).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('courses')
    })

    it('應該能夠按學科篩選課程', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Python 入門',
          subject_id: 'sub-1',
          is_published: true,
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockCourses, error: null })
            })
          })
        })
      })

      const result = await coursesService.getCourses({ subjectId: 'sub-1' })

      expect(Array.isArray(result)).toBe(true)
    })

    it('應該能夠按難度篩選課程', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          title: 'Python 入門',
          difficulty_level: 'beginner',
          is_published: true,
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockCourses, error: null })
            })
          })
        })
      })

      const result = await coursesService.getCourses({ difficulty: 'beginner' })

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getCourse', () => {
    it('應該能夠取得單一課程詳情', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'Python 入門',
        description: '完整的 Python 教程',
        view_count: 100,
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockCourse, error: null })
          })
        })
      })

      const result = await coursesService.getCourse('course-1')

      expect(result).toHaveProperty('id', 'course-1')
      expect(result).toHaveProperty('title', 'Python 入門')
    })
  })

  describe('getUserProgress', () => {
    it('應該能夠取得用戶的課程進度列表', async () => {
      const mockProgress = [
        {
          id: 'progress-1',
          user_id: 'user-1',
          course_id: 'course-1',
          progress_percentage: 50,
          time_spent_minutes: 60,
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockProgress, error: null })
          })
        })
      })

      const result = await coursesService.getUserProgress('user-1')

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('updateProgress', () => {
    it('應該能夠更新用戶課程進度', async () => {
      const mockExistingProgress = {
        id: 'progress-1',
        user_id: 'user-1',
        course_id: 'course-1',
        progress_percentage: 30,
        time_spent_minutes: 30,
      }

      const mockUpdatedProgress = {
        ...mockExistingProgress,
        progress_percentage: 50,
        time_spent_minutes: 60,
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockExistingProgress, error: null })
            })
          })
        })
      }).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUpdatedProgress, error: null })
            })
          })
        })
      })

      const result = await coursesService.updateProgress('user-1', 'course-1', 50, 30)

      expect(result).toHaveProperty('progress_percentage', 50)
    })

    it('應該能夠為新用戶建立進度記錄', async () => {
      const mockNewProgress = {
        id: 'progress-new',
        user_id: 'user-1',
        course_id: 'course-1',
        progress_percentage: 10,
        time_spent_minutes: 10,
      }

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
            })
          })
        })
      }).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNewProgress, error: null })
          })
        })
      })

      const result = await coursesService.updateProgress('user-1', 'course-1', 10, 10)

      expect(result).toHaveProperty('progress_percentage', 10)
    })
  })

  describe('getLearningStats', () => {
    it('應該能夠取得學習統計', async () => {
      const mockProgress = [
        { progress_percentage: 100, time_spent_minutes: 120 },
        { progress_percentage: 50, time_spent_minutes: 60 },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockProgress, error: null })
        })
      })

      const result = await coursesService.getLearningStats('user-1')

      expect(result).toHaveProperty('totalCourses')
      expect(result).toHaveProperty('completedCourses')
      expect(result).toHaveProperty('totalTimeMinutes')
    })
  })

  describe('likeCourse', () => {
    it('應該能夠按讚課程', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null })

      await expect(coursesService.likeCourse('course-1')).resolves.not.toThrow()
    })
  })
})
