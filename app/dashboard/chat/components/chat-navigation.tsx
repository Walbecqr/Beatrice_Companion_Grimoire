// app/dashboard/chat/components/chat-navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, History, Sparkles } from 'lucide-react'

interface ChatNavigationProps {
  currentView: 'new' | 'history' | 'session'
  onNewChat?: () => void
  showNewChatButton?: boolean
  sessionTitle?: string
}

export default function ChatNavigation({ 
  currentView, 
  onNewChat, 
  showNewChatButton = true,
  sessionTitle 
}: ChatNavigationProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between">
      {/* Left: Title and Current View */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span>Chat with Beatrice</span>
          </h1>
          <p className="text-gray-400 mt-1">
            {currentView === 'new' && 'Start a new conversation'}
            {currentView === 'history' && 'Your conversation history'}
            {currentView === 'session' && (sessionTitle || 'Previous conversation')}
          </p>
        </div>
      </div>

      {/* Right: Navigation Actions */}
      <div className="flex items-center space-x-3">
        {/* New Chat Button */}
        {showNewChatButton && currentView !== 'new' && (
          <Link href="/dashboard/chat" aria-label="Start a new chat">
            <button
              type="button"
              className="btn-mystical px-4 py-2 text-sm inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </button>
          </Link>
        )}

        {/* Quick New Chat (for when already in new chat) */}
        {currentView === 'new' && showNewChatButton && onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            aria-label="Start a fresh chat"
            className="btn-mystical px-4 py-2 text-sm inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Fresh Start
          </button>
        )}

        {/* Chat History Button */}
        <Link 
          href="/dashboard/chat/history" 
          aria-label="View chat history"
          className={`px-4 py-2 text-sm rounded-lg border transition-colors inline-flex items-center ${
            currentView === 'history'
              ? 'border-purple-500 bg-purple-900/20 text-purple-300'
              : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
          }`}
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Link>

        {/* Active Chat Indicator */}
        {currentView === 'new' && (
          <div
            className="flex items-center space-x-2 px-3 py-2 bg-green-900/20 border border-green-800 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-300">Active</span>
          </div>
        )}
      </div>
    </div>
  )
}