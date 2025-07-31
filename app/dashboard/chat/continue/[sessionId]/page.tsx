// app/dashboard/chat/continue/[sessionId]/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ChatInterface from '../../components/chat-interface'
import ChatNavigation from '../../components/chat-navigation'

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

export default function ContinueConversationPage() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
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
      
      // Update the session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)

    } catch (error) {
      console.error('Error fetching session:', error)
      router.push('/dashboard/chat/history')
    } finally {
      setLoading(false)
    }
  }, [sessionId, supabase, router])

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId, fetchSession])

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
        sessionTitle={`Continuing: ${sessionTitle}`}
        showNewChatButton={true}
      />

      {/* Session Info */}
      <div className="card-mystical p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/chat/${sessionId}`}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Back to read-only view"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Continuing: {sessionTitle}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Started {format(new Date(session.created_at), 'MMM d, yyyy')}
                  </span>
                  <span>{messages.length} previous messages</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-2 bg-green-900/20 border border-green-800 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-300">Continuing</span>
          </div>
        </div>
      </div>

      {/* Chat Interface (Interactive) */}
      <ChatInterface
        messages={messages}
        setMessages={setMessages}
        sessionId={sessionId}
        isNewSession={false}
        readOnly={false}
      />

      {/* Navigation Help */}
      <div className="card-mystical p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            You&apos;re continuing a previous conversation. Your new messages will be added to this session.
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/chat/${sessionId}`}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              View Read-Only
            </Link>
            
            <Link
              href="/dashboard/chat/history"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              Back to History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}