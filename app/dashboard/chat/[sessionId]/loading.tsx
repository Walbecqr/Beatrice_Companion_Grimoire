import { Moon, Sparkles, MessageCircle, Clock } from 'lucide-react'

export default function ChatSessionLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header with Session Info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Moon className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="w-20 h-4 bg-purple-600/30 rounded animate-pulse" />
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <div className="w-24 h-3 bg-purple-600/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Messages Loading */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Previous Messages Skeleton */}
        <div className="space-y-4">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] p-3 rounded-lg bg-purple-600/30 space-y-1">
              <div className="w-32 h-4 bg-purple-400/30 rounded animate-pulse" />
              <div className="w-8 h-3 bg-purple-400/20 rounded animate-pulse" />
            </div>
          </div>

          {/* Assistant Message */}
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-800/50 space-y-2">
              <div className="w-48 h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-40 h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-8 h-3 bg-purple-600/20 rounded animate-pulse" />
            </div>
          </div>

          {/* Another User Message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] p-3 rounded-lg bg-purple-600/30 space-y-1">
              <div className="w-28 h-4 bg-purple-400/30 rounded animate-pulse" />
              <div className="w-8 h-3 bg-purple-400/20 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading New Response */}
        <div className="flex justify-start">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-400">Beatrice is reflecting...</span>
            </div>
          </div>
        </div>

        {/* Mystical Connection Indicator */}
        <div className="flex justify-center items-center py-4">
          <div className="relative">
            {/* Connection Animation */}
            <div className="w-12 h-12 border border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute inset-2 border border-purple-400/50 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}>
                <div className="absolute inset-1 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex space-x-3">
          <div className="flex-1 h-12 bg-gray-800/50 rounded-lg animate-pulse" />
          <div className="w-12 h-12 bg-purple-600/30 rounded-lg animate-pulse flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        
        <div className="text-center mt-2">
          <div className="w-32 h-3 bg-purple-600/20 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  )
}