'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Moon, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useSearchParams } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkinId = searchParams.get('checkin')
    if (checkinId) {
      handleCheckinContext(checkinId)
    } else {
      loadChatHistory()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCheckinContext = async (checkinId: string) => {
    try {
      // Fetch the check-in details
      const { data: checkin, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('id', checkinId)
        .single()

      if (error || !checkin) {
        loadChatHistory()
        return
      }

      // Create an initial message from Beatrice about the check-in
      const contextMessage: Message = {
        role: 'assistant',
        content: `I see you're here for your daily check-in. ${checkin.prompt}\n\nTake your time to reflect, and share whatever feels right in this moment. I'm here to listen and support you. 💜`,
      }

      setMessages([contextMessage])
    } catch (error) {
      console.error('Error loading check-in context:', error)
      loadChatHistory()
    }
  }

  const loadChatHistory = async () => {
    // Get the most recent chat session
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)

    if (sessions && sessions.length > 0) {
      const latestSession = sessions[0]
      setSessionId(latestSession.id)

      // Load messages from this session
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', latestSession.id)
        .order('created_at', { ascending: true })

      if (messages) {
        setMessages(messages)
      }
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    }

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      
      // Update session ID if new
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId)
      }

      // Add Beatrice's response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
      }])
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1))
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setSessionId(null)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Moon className="w-8 h-8 text-purple-300 moon-icon" />
          <div>
            <h1 className="text-2xl font-bold text-gradient">Chat with Beatrice</h1>
            <p className="text-sm text-gray-400">Your spiritual companion and guide</p>
          </div>
        </div>
        <button
          onClick={startNewChat}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Start New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Welcome, dear seeker.</p>
            <p className="text-sm text-gray-500">
              Ask me about your spiritual journey, rituals, or share what's on your heart today.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'card-mystical'
                }`}
              >
                <p className="text-sm text-gray-100 whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.created_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(message.created_at), 'h:mm a')}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="card-mystical max-w-[70%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts or ask for guidance..."
          className="input-mystical flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-mystical px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}