// app/dashboard/chat/history/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { format, formatDistanceToNow } from 'date-fns'
import { Calendar, Eye, MessageCircle, Moon, Search, Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ChatNavigation from '../components/chat-navigation'

interface ChatSession {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count: number
  first_message: string | null
  last_message: string | null
}

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([])
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    fetchChatHistory()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [sessions, searchTerm])

  const fetchChatHistory = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          chat_messages (
            id,
            content,
            role,
            created_at
          )
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Process sessions to include message counts and previews
      const processedSessions: ChatSession[] = sessionsData.map(session => {
        const messages = session.chat_messages || []
        const userMessages = messages.filter(m => m.role === 'user')

        return {
          id: session.id,
          title: session.title || (userMessages.length > 0 ? userMessages[0].content : 'New Conversation'),
          created_at: session.created_at,
          updated_at: session.updated_at,
          message_count: messages.length,
          first_message: userMessages.length > 0 ? userMessages[0].content : null,
          last_message: messages.length > 0 ? messages[messages.length - 1].content : null,
        }
      })

      setSessions(processedSessions)
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSessions = () => {
    if (!searchTerm) {
      setFilteredSessions(sessions)
      return
    }

    const filtered = sessions.filter(session =>
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.first_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredSessions(filtered)
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      setSessions(sessions.filter(s => s.id !== sessionId))
      setSelectedSessions(prev => {
        const newSet = new Set(prev)
        newSet.delete(sessionId)
        return newSet
      })
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete conversation. Please try again.')
    }
  }

  const renameSession = async (sessionId: string, currentTitle: string | null) => {
    const newTitle = prompt('Enter a new title for this conversation', currentTitle || '')
    if (newTitle === null) return
    const trimmed = newTitle.trim()

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: trimmed || null })
        .eq('id', sessionId)

      if (error) throw error

      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, title: trimmed || null } : s))
      )
    } catch (error) {
      console.error('Error renaming session:', error)
      alert('Failed to rename conversation. Please try again.')
    }
  }

  const toggleSessionSelection = (sessionId: string) => {
    const newSelected = new Set(selectedSessions)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedSessions(newSelected)
  }

  const deleteSelectedSessions = async () => {
    if (selectedSessions.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedSessions.size} conversation(s)? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .in('id', Array.from(selectedSessions))

      if (error) throw error

      setSessions(sessions.filter(s => !selectedSessions.has(s.id)))
      setSelectedSessions(new Set())
    } catch (error) {
      console.error('Error deleting sessions:', error)
      alert('Failed to delete conversations. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <ChatNavigation currentView="history" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🌙</div>
            <p className="text-gray-400">Loading your conversation history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ChatNavigation currentView="history" />

      {/* Search and Actions */}
      <div className="card-mystical p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-mystical pl-10"
              />
            </div>
          </div>

          {selectedSessions.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {selectedSessions.size} selected
              </span>
              <button
                onClick={deleteSelectedSessions}
                className="px-3 py-1 text-sm bg-red-900/20 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1 inline" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-400">
          {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Chat Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="card-mystical p-8 text-center">
            <Moon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start your first conversation with Beatrice to begin your spiritual journey'
              }
            </p>
            {!searchTerm && (
              <Link href="/dashboard/chat" className="btn-mystical">
                Start New Conversation
              </Link>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="card-mystical p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedSessions.has(session.id)}
                  onChange={() => toggleSessionSelection(session.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />

                {/* Conversation Icon */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-200 truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(session.created_at), 'MMM d, yyyy')}
                        </span>
                        <span>{session.message_count} messages</span>
                        <span>
                          Updated {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                        </span>
                      </div>

                      {/* First Message Preview */}
                      {session.first_message && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {session.first_message}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/dashboard/chat/${session.id}`}
                        className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                        title="View conversation"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => renameSession(session.id, session.title)}
                        className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                        title="Rename conversation"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State Call to Action */}
      {filteredSessions.length > 0 && !searchTerm && (
        <div className="text-center pt-8">
          <Link
            href="/dashboard/chat"
            className="btn-mystical px-6 py-3"
          >
            Start New Conversation
          </Link>
        </div>
      )}
    </div>
  )
}
