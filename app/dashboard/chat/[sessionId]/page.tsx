// app/dashboard/chat/[sessionId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Play, Trash2, Calendar, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import ChatInterface from '../components/chat-interface'
import ChatNavigation from '../components/chat-navigation'
import { useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ChatSession {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export default function ChatSessionPage() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [canContinue, setCanContinue] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const sessionId = params.sessionId as string

  const fetchSession = useCallback(async () => {
    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      // Check if this session belongs to the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || sessionData.user_id !== user.id) {
        router.push('/dashboard/chat/history')
        return
      }

      setSession(sessionData)

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      setMessages(messagesData || [])
      
      // Enable continue functionality (this session can be continued)
      setCanContinue(true)
    } catch (error) {
      console.error('Error fetching session:', error)
      router.push('/dashboard/chat/history')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId, fetchSession])

  const deleteSession = async () => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      router.push('/dashboard/chat/history')
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete conversation. Please try again.')
    }
  }

  const continueConversation = () => {
    // Navigate to new chat with this session ID to continue
    router.push(`/dashboard/chat/continue/${sessionId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <ChatNavigation currentView="session" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🌙</div>
            <p className="text-gray-400">Loading conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <ChatNavigation currentView="session" />
        <div className="card-mystical p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            Conversation Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            This conversation may have been deleted or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard/chat/history" className="btn-mystical">
            Back to History
          </Link>
        </div>
      </div>
    )
  }

  const sessionTitle = session.title || 'Untitled Conversation'

  return (
    <div className="space-y-6">
      <ChatNavigation 
        currentView="session" 
        sessionTitle={sessionTitle}
      />

      {/* Session Info */}
      <div className="card-mystical p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/chat/history"
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{sessionTitle}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(session.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {canContinue && (
              <button
                onClick={continueConversation}
                className="btn-mystical px-4 py-2 text-sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Continue
              </button>
            )}
            
            <button
              onClick={deleteSession}
              className="px-4 py-2 text-sm bg-red-900/20 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface (Read-only) */}
      <ChatInterface
        messages={messages}
        setMessages={setMessages}
        sessionId={sessionId}
        readOnly={true}
      />

      {/* Action Bar */}
      <div className="card-mystical p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            This is a view-only mode. To continue this conversation, click the &quot;Continue&quot; button above.
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/chat/history"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Back to History
            </Link>
            
            <Link
              href="/dashboard/chat"
              className="btn-mystical px-4 py-2 text-sm"
            >
              New Conversation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}