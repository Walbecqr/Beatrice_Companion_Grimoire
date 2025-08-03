// app/dashboard/chat/components/chat-interface.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Moon, Sparkles, Copy, Download } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ChatInterfaceProps {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  sessionId: string | null
  isNewSession?: boolean
  readOnly?: boolean
}

export default function ChatInterface({ 
  messages, 
  setMessages, 
  sessionId, 
  isNewSession = false,
  readOnly = false 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateSessionTitle = async (firstUserMessage: string) => {
    if (!sessionId || !isNewSession) return

    // Generate a title from the first user message (first 50 chars)
    const title = firstUserMessage.length > 50 
      ? firstUserMessage.substring(0, 47) + '...'
      : firstUserMessage

    try {
      await supabase
        .from('chat_sessions')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
    } catch (error) {
      console.error('Error updating session title:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !sessionId || readOnly) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    }

    // Update session title if this is the first user message in a new session
    if (isNewSession && messages.length === 1) {
      updateSessionTitle(userMessage.content)
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

if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
      const data = await response.json();
      if (!data.message) {
        throw new Error('Invalid response from server');
      }
      // Add Beatrice's response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      // Optionally, display an error message to the user
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // Could add a toast notification here
  }

  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'Beatrice'}: ${msg.content}`)
      .join('\n\n')
    
    const blob = new Blob([conversationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beatrice-conversation-${format(new Date(), 'yyyy-MM-dd')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card-mystical h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Beatrice</h3>
            <p className="text-xs text-gray-400">Your Spiritual Companion</p>
          </div>
        </div>
        
        {messages.length > 1 && (
          <button
            onClick={exportConversation}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg group relative ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Message timestamp */}
              {message.created_at && (
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {format(new Date(message.created_at), 'h:mm a')}
                </div>
              )}

              {/* Copy button */}
              <button
                onClick={() => copyMessage(message.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-pulse text-purple-400" />
                <span className="text-sm">Beatrice is reflecting...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!readOnly && (
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts with Beatrice..."
              className="flex-1 input-mystical"
              disabled={isLoading || !sessionId}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !sessionId}
              className="btn-mystical px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          
          {!sessionId && (
            <p className="text-xs text-gray-500 mt-2">
              Creating session...
            </p>
          )}
        </div>
      )}
    </div>
  )
}
