import { supabase } from '../../lib/supabase'
import type { StudyNote } from '../../lib/supabase'

// Notes service for handling study notes

export async function getNotes(filters?: {
  userId?: string
  subjectId?: string
  courseId?: string
  isPublic?: boolean
  searchQuery?: string
  limit?: number
  offset?: number
}): Promise<{ notes: StudyNote[]; total: number }> {
  let query = supabase
    .from('study_notes')
    .select('*', { count: 'exact' })

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.subjectId) {
    query = query.eq('subject_id', filters.subjectId)
  }

  if (filters?.courseId) {
    query = query.eq('course_id', filters.courseId)
  }

  if (filters?.isPublic !== undefined) {
    query = query.eq('is_public', filters.isPublic)
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`)
  }

  query = query.order('created_at', { ascending: false })

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { notes: data || [], total: count || 0 }
}

export async function getNote(noteId: string): Promise<StudyNote | null> {
  const { data, error } = await supabase
    .from('study_notes')
    .select('*')
    .eq('id', noteId)
    .single()

  if (error) throw error
  return data
}

export async function getUserNotes(userId: string): Promise<StudyNote[]> {
  const { data, error } = await supabase
    .from('study_notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createNote(
  userId: string,
  title: string,
  content: string,
  options?: {
    courseId?: string
    subjectId?: string
    isPublic?: boolean
    tags?: string[]
  }
): Promise<StudyNote> {
  const { data, error } = await supabase
    .from('study_notes')
    .insert({
      user_id: userId,
      title,
      content,
      course_id: options?.courseId,
      subject_id: options?.subjectId,
      is_public: options?.isPublic || false,
      tags: options?.tags || []
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNote(
  noteId: string,
  updates: {
    title?: string
    content?: string
    isPublic?: boolean
    tags?: string[]
  }
): Promise<StudyNote> {
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic
  if (updates.tags !== undefined) updateData.tags = updates.tags

  const { data, error } = await supabase
    .from('study_notes')
    .update(updateData)
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('study_notes')
    .delete()
    .eq('id', noteId)

  if (error) throw error
}

export async function likeNote(noteId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_note_like', { note_id: noteId })
  if (error) throw error
}

export async function incrementNoteView(noteId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_note_view', { note_id: noteId })
  if (error) throw error
}

// Get public notes for discovery
export async function getPublicNotes(options?: {
  subjectId?: string
  limit?: number
  orderBy?: 'recent' | 'popular'
}): Promise<StudyNote[]> {
  let query = supabase
    .from('study_notes')
    .select('*')
    .eq('is_public', true)

  if (options?.subjectId) {
    query = query.eq('subject_id', options.subjectId)
  }

  if (options?.orderBy === 'popular') {
    query = query.order('like_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Search notes
export async function searchNotes(
  query: string,
  options?: {
    userId?: string
    includePublic?: boolean
  }
): Promise<StudyNote[]> {
  let dbQuery = supabase
    .from('study_notes')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)

  if (options?.userId) {
    if (options?.includePublic) {
      dbQuery = dbQuery.or(`user_id.eq.${options.userId},is_public.eq.true`)
    } else {
      dbQuery = dbQuery.eq('user_id', options.userId)
    }
  } else {
    dbQuery = dbQuery.eq('is_public', true)
  }

  dbQuery = dbQuery.order('created_at', { ascending: false }).limit(50)

  const { data, error } = await dbQuery

  if (error) throw error
  return data || []
}

// Get notes count for user
export async function getNotesCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('study_notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

// Alias functions for backward compatibility with tests
export const getNoteById = getNote

// Create note with object parameter
const createNoteOriginal = createNote
export { createNoteOriginal as createNoteWithParams }

// Wrapper for createNote that accepts object params
export const createNoteFromParams = async (params: {
  userId: string
  title: string
  content: string
  courseId?: string
  subjectId?: string
  isPublic?: boolean
  tags?: string[]
}): Promise<StudyNote> => {
  return createNote(params.userId, params.title, params.content, {
    courseId: params.courseId,
    subjectId: params.subjectId,
    isPublic: params.isPublic,
    tags: params.tags,
  })
}

// Update note wrapper
export const updateNoteFromParams = async (params: {
  noteId: string
  title?: string
  content?: string
  isPublic?: boolean
  tags?: string[]
}): Promise<StudyNote> => {
  return updateNote(params.noteId, {
    title: params.title,
    content: params.content,
    isPublic: params.isPublic,
    tags: params.tags,
  })
}

export const searchPublicNotes = async (query: string): Promise<StudyNote[]> => {
  return searchNotes(query, { includePublic: true })
}

export const getTrendingNotes = async (limit: number = 10): Promise<StudyNote[]> => {
  return getPublicNotes({ orderBy: 'popular', limit })
}

export const getNotesByTag = async (tag: string): Promise<StudyNote[]> => {
  const { data, error } = await supabase
    .from('study_notes')
    .select('*')
    .contains('tags', [tag])
    .eq('is_public', true)

  if (error) throw error
  return data || []
}

export const getCourseNotes = async (courseId: string, userId?: string): Promise<StudyNote[]> => {
  let query = supabase
    .from('study_notes')
    .select('*')
    .eq('course_id', courseId)

  if (userId) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`)
  } else {
    query = query.eq('is_public', true)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data || []
}
