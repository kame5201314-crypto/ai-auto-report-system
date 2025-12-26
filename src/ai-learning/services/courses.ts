import { supabase } from '../../lib/supabase'
import type { Course, Subject, UserProgress } from '../../lib/supabase'

// Course service for handling courses and learning progress

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSubject(subjectId: string): Promise<Subject | null> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', subjectId)
    .single()

  if (error) throw error
  return data
}

export async function getCourses(filters?: {
  subjectId?: string
  difficulty?: string
  isPremium?: boolean
  searchQuery?: string
}): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)

  if (filters?.subjectId) {
    query = query.eq('subject_id', filters.subjectId)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty_level', filters.difficulty)
  }

  if (filters?.isPremium !== undefined) {
    query = query.eq('is_premium', filters.isPremium)
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error) throw error
  return data
}

export async function getPopularCourses(limit: number = 10): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getRecommendedCourses(userId: string, limit: number = 5): Promise<Course[]> {
  // Get user's progress to understand their interests
  const { data: progress } = await supabase
    .from('user_progress')
    .select('course_id, courses(subject_id)')
    .eq('user_id', userId)

  // Get subjects user has been studying
  const studiedSubjects = progress?.map((p: any) => p.courses?.subject_id).filter(Boolean) || []

  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('like_count', { ascending: false })
    .limit(limit)

  if (studiedSubjects.length > 0) {
    query = query.in('subject_id', studiedSubjects)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function incrementCourseView(courseId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_course_view', { course_id: courseId })
  if (error) throw error
}

export async function likeCourse(courseId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_course_like', { course_id: courseId })
  if (error) throw error
}

// User Progress functions

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateProgress(
  userId: string,
  courseId: string,
  progressPercentage: number,
  timeSpentMinutes?: number
): Promise<UserProgress> {
  const now = new Date().toISOString()

  // Check if progress record exists
  const existing = await getCourseProgress(userId, courseId)

  if (existing) {
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        progress_percentage: progressPercentage,
        time_spent_minutes: (existing.time_spent_minutes || 0) + (timeSpentMinutes || 0),
        last_accessed_at: now,
        completed_at: progressPercentage >= 100 ? now : null
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: progressPercentage,
        time_spent_minutes: timeSpentMinutes || 0,
        last_accessed_at: now,
        completed_at: progressPercentage >= 100 ? now : null
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function getCompletedCourses(userId: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .eq('progress_percentage', 100)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLearningStats(userId: string): Promise<{
  totalCourses: number
  completedCourses: number
  totalTimeMinutes: number
  currentStreak: number
}> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  const progress = data || []

  return {
    totalCourses: progress.length,
    completedCourses: progress.filter(p => p.progress_percentage === 100).length,
    totalTimeMinutes: progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0),
    currentStreak: 0 // Would need daily tracking to calculate
  }
}

// Alias functions for backward compatibility with tests
export const getCourseById = getCourse
export const searchCourses = async (query: string): Promise<Course[]> => {
  return getCourses({ searchQuery: query })
}
export const updateUserProgress = async (params: {
  userId: string
  courseId: string
  progressPercentage: number
  timeSpentMinutes?: number
}): Promise<UserProgress> => {
  return updateProgress(params.userId, params.courseId, params.progressPercentage, params.timeSpentMinutes)
}
