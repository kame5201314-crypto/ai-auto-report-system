import { supabase } from '../../lib/supabase'
import type { ForumPost, ForumReply } from '../../lib/supabase'

// Forum service for handling posts and replies

export async function getPosts(filters?: {
  subjectId?: string
  isSolved?: boolean
  searchQuery?: string
  limit?: number
  offset?: number
}): Promise<{ posts: ForumPost[]; total: number }> {
  let query = supabase
    .from('forum_posts')
    .select('*, author:profiles(*)', { count: 'exact' })

  if (filters?.subjectId) {
    query = query.eq('subject_id', filters.subjectId)
  }

  if (filters?.isSolved !== undefined) {
    query = query.eq('is_solved', filters.isSolved)
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`)
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { posts: data || [], total: count || 0 }
}

export async function getPost(postId: string): Promise<ForumPost | null> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, author:profiles(*)')
    .eq('id', postId)
    .single()

  if (error) throw error

  // Increment view count
  await supabase.rpc('increment_post_view', { post_id: postId })

  return data
}

export async function createPost(
  authorId: string,
  title: string,
  content: string,
  subjectId?: string,
  tags?: string[]
): Promise<ForumPost> {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      author_id: authorId,
      title,
      content,
      subject_id: subjectId,
      tags: tags || []
    })
    .select('*, author:profiles(*)')
    .single()

  if (error) throw error
  return data
}

export async function updatePost(
  postId: string,
  updates: {
    title?: string
    content?: string
    tags?: string[]
  }
): Promise<ForumPost> {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)
    .select('*, author:profiles(*)')
    .single()

  if (error) throw error
  return data
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

export async function markAsSolved(postId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .update({ is_solved: true })
    .eq('id', postId)

  if (error) throw error
}

export async function likePost(postId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_post_like', { post_id: postId })
  if (error) throw error
}

// Reply functions

export async function getReplies(postId: string): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from('forum_replies')
    .select('*, author:profiles(*)')
    .eq('post_id', postId)
    .order('is_best_answer', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createReply(
  postId: string,
  authorId: string,
  content: string,
  parentReplyId?: string,
  isAiGenerated?: boolean
): Promise<ForumReply> {
  const { data, error } = await supabase
    .from('forum_replies')
    .insert({
      post_id: postId,
      author_id: authorId,
      content,
      parent_reply_id: parentReplyId,
      is_ai_generated: isAiGenerated || false
    })
    .select('*, author:profiles(*)')
    .single()

  if (error) throw error

  // Update reply count on post
  await supabase.rpc('increment_reply_count', { post_id: postId })

  return data
}

export async function updateReply(
  replyId: string,
  content: string
): Promise<ForumReply> {
  const { data, error } = await supabase
    .from('forum_replies')
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', replyId)
    .select('*, author:profiles(*)')
    .single()

  if (error) throw error
  return data
}

export async function deleteReply(replyId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_replies')
    .delete()
    .eq('id', replyId)

  if (error) throw error

  // Decrement reply count on post
  await supabase.rpc('decrement_reply_count', { post_id: postId })
}

export async function markAsBestAnswer(replyId: string, postId: string): Promise<void> {
  // First, unmark any existing best answer
  await supabase
    .from('forum_replies')
    .update({ is_best_answer: false })
    .eq('post_id', postId)

  // Then mark the new best answer
  const { error } = await supabase
    .from('forum_replies')
    .update({ is_best_answer: true })
    .eq('id', replyId)

  if (error) throw error
}

export async function likeReply(replyId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_reply_like', { reply_id: replyId })
  if (error) throw error
}

// Search forum
export async function searchForum(query: string): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, author:profiles(*)')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data || []
}

// Get user's posts
export async function getUserPosts(userId: string): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Alias functions for backward compatibility with tests
export const getForumPosts = async (filters?: {
  subjectId?: string
  searchQuery?: string
}): Promise<ForumPost[]> => {
  const result = await getPosts(filters)
  return result.posts
}

export const getPostById = getPost

export const createForumPost = async (params: {
  authorId: string
  title: string
  content: string
  subjectId?: string
  tags?: string[]
}): Promise<ForumPost> => {
  return createPost(params.authorId, params.title, params.content, params.subjectId, params.tags)
}

export const updateForumPost = async (params: {
  postId: string
  title?: string
  content?: string
  isSolved?: boolean
}): Promise<ForumPost> => {
  const updates: any = {}
  if (params.title) updates.title = params.title
  if (params.content) updates.content = params.content

  const result = await updatePost(params.postId, updates)

  if (params.isSolved) {
    await markAsSolved(params.postId)
  }

  return result
}

export const deleteForumPost = deletePost
export const getPostReplies = getReplies
export const searchPosts = searchForum
export const setBestAnswer = markAsBestAnswer
