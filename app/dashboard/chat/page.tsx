// app/dashboard/chat/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import ChatInterface from './components/chat-interface.tsx'
import ChatNavigation from './components/chat-navigation.tsx'

interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export default function NewChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkinId = searchParams.get('checkin')
    if (checkinId) {
      handleCheckinContext(checkinId)
    } else {
      createNewSession()
    }
  }, [])

  const createNewSession = async () => {
    if (isCreatingSession) return
    
    setIsCreatingSession(true)
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({ 
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title: null // Will be auto-generated based on first message
        })
        .select()
        .single()

      if (error) throw error
      
      setSessionId(session.id)
      setMessages([{
        role: 'assistant',
        content: `Welcome, dear seeker. I am Beatrice, your spiritual companion. The moon's energy calls us to connect today. What brings you to our sacred space? 🌙✨`,
      }])
    } catch (error) {
      console.error('Error creating new session:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleCheckinContext = async (checkinId: string) => {
    try {
      // Create new session for check-in
      await createNewSession()
      
      // Fetch the check-in details
      const { data: checkin, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('id', checkinId)
        .single()

      if (error || !checkin) {
        return
      }

      // Set check-in specific welcome message
      setMessages([{
        role: 'assistant',
        content: `I see you're here for your daily check-in. ${checkin.prompt}\n\nTake your time to reflect, and share whatever feels right in this moment. I'm here to listen and support you. 💜`,
      }])
    } catch (error) {
      console.error('Error loading check-in context:', error)
      createNewSession()
    }
  }

  const handleNewChat = () => {
    // Reset everything for a completely fresh start
    setMessages([])
    setSessionId(null)
    createNewSession()
  }

  if (isCreatingSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌙</div>
          <p className="text-gray-400">Starting a new conversation with Beatrice...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chat Navigation */}
      <ChatNavigation 
        currentView="new"
        onNewChat={handleNewChat}
        showNewChatButton={messages.length > 1} // Show after conversation starts
      />

      {/* Session Indicator */}
      <div className="card-mystical p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">New conversation with Beatrice</span>
          </div>
          {sessionId && (
            <span className="text-xs text-gray-500">
              Session ID: {sessionId.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        messages={messages}
        setMessages={setMessages}
        sessionId={sessionId}
        isNewSession={true}
      />
    </div>
  )
}
