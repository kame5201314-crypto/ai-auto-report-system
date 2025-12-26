import { supabase } from '../../lib/supabase'
import type { AIConversation, AIMessage } from '../../lib/supabase'

// AI service for handling conversations and messages

export async function createConversation(userId: string, subjectId?: string, title?: string): Promise<AIConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId,
      subject_id: subjectId,
      title: title || '新對話',
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConversations(userId: string): Promise<AIConversation[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getConversation(conversationId: string): Promise<AIConversation | null> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (error) throw error
  return data
}

export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (error) throw error
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ is_active: false })
    .eq('id', conversationId)

  if (error) throw error
}

export async function getMessages(conversationId: string): Promise<AIMessage[]> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
): Promise<AIMessage> {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      metadata: metadata || {}
    })
    .select()
    .single()

  if (error) throw error

  // Update conversation's updated_at
  await supabase
    .from('ai_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}

export async function rateMessage(messageId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from('ai_messages')
    .update({ rating })
    .eq('id', messageId)

  if (error) throw error
}

// Generate AI response using guided learning approach (Socratic method)
export async function generateAIResponse(
  userMessage: string,
  subject?: string,
  conversationHistory?: AIMessage[]
): Promise<string> {
  // In production, this would call OpenAI/Claude API
  // For now, return a mock guided response

  const guidedPrompts = [
    `這是一個很好的問題！讓我用引導的方式幫助你思考。

首先，你能告訴我你目前對這個概念了解多少嗎？

思考以下問題：
1. 這個問題的核心是什麼？
2. 你之前有學過相關的知識嗎？
3. 你覺得可以從哪個角度切入？`,

    `我理解你的問題了。與其直接給你答案，讓我們一起來探索。

你認為這個問題可以分成哪幾個部分來解決？

提示：
- 試著把大問題拆解成小問題
- 想想有沒有類似的問題你已經會解決了
- 可以先從最簡單的情況開始想起`,

    `很棒的思考方向！

讓我給你一些線索：
1. 這個概念的基本定義是什麼？
2. 有沒有特殊情況需要考慮？
3. 可以舉一個實際的例子來驗證你的理解嗎？

當你思考完這些問題，告訴我你的想法，我們再一起討論！`
  ]

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Return a random guided response
  return guidedPrompts[Math.floor(Math.random() * guidedPrompts.length)]
}

// Check user's daily AI usage (for free tier limits)
export async function checkDailyUsage(userId: string): Promise<{ used: number; limit: number }> {
  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('ai_messages')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)

  if (error) throw error

  // Free tier limit is 10 messages per day
  return {
    used: count || 0,
    limit: 10
  }
}
