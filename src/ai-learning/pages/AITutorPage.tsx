import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  updatedAt: Date
}

export default function AITutorPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('general')
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'Python 變數問題', updatedAt: new Date() },
    { id: '2', title: '微積分求導', updatedAt: new Date(Date.now() - 86400000) }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const subjects = [
    { value: 'general', label: '通用' },
    { value: 'programming', label: '程式設計' },
    { value: 'math', label: '數學' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化學' },
    { value: 'english', label: '英語' }
  ]

  const quickPrompts = [
    '請解釋這個概念...',
    '這道題目怎麼解？',
    '幫我複習這個主題',
    '給我一些練習題'
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `這是一個很好的問題！讓我用蘇格拉底式的方式引導你思考：

首先，你能告訴我你對這個概念的初步理解是什麼嗎？

在你回答之前，試著思考以下幾點：
1. 你之前有接觸過類似的概念嗎？
2. 這個概念在實際應用中可能會怎麼使用？
3. 你覺得這個概念和其他你學過的知識有什麼關聯？

當你思考完這些問題後，我們可以一起深入探討！`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleNewConversation = () => {
    setMessages([])
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo and New Chat */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600 mb-4">AI 智能家教</h1>
          <button
            onClick={handleNewConversation}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span>
            新對話
          </button>
        </div>

        {/* Subject Selector */}
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            選擇學科
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {subjects.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">最近對話</h3>
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium text-gray-900 truncate">{conv.title}</div>
                <div className="text-xs text-gray-500">
                  {conv.updatedAt.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.user_metadata?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {user?.user_metadata?.username || '訪客'}
              </div>
              <div className="text-xs text-gray-500">免費方案</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                您好！我是您的 AI 學習助教
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                AI 助教會提供引導式講解，幫助你真正理解知識。
                告訴我你想學什麼，或者有什麼問題想問？
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-gray-700">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white shadow-md text-gray-900'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🤖</span>
                        <span className="font-semibold">AI 助教</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-md p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      <span className="font-semibold">AI 助教</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="輸入您的問題..."
                rows={1}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                發送
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI 助教使用引導式教學法，幫助你培養獨立思考的能力
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
