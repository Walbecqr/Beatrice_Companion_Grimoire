import { Moon, Sparkles, MessageCircle } from 'lucide-react'

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Moon className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="w-20 h-4 bg-purple-600/30 rounded animate-pulse" />
            <div className="w-32 h-3 bg-purple-600/20 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Welcome Message Skeleton */}
        <div className="flex justify-start">
          <div className="max-w-[80%] p-4 rounded-lg bg-gray-800/50 space-y-2">
            <div className="w-64 h-4 bg-purple-600/20 rounded animate-pulse" />
            <div className="w-48 h-4 bg-purple-600/20 rounded animate-pulse" />
            <div className="w-56 h-4 bg-purple-600/20 rounded animate-pulse" />
          </div>
        </div>

        {/* Mystical Connection Animation */}
        <div className="flex justify-center items-center py-8">
          <div className="relative">
            {/* Pulsing Connection Circle */}
            <div className="w-16 h-16 border-2 border-purple-400/30 rounded-full animate-ping" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-purple-400 rounded-full animate-pulse" />
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            
            {/* Floating Sparkles */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <Sparkles className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 text-pink-400 animate-pulse" />
              <Sparkles className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-3 h-3 text-blue-400 animate-pulse" />
              <Sparkles className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-3 text-green-400 animate-pulse" />
              <Sparkles className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-3 h-3 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-gradient">
            Connecting with Beatrice
          </h3>
          <p className="text-sm text-gray-400">
            Your spiritual companion is preparing to guide you...
          </p>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex space-x-3">
          <div className="flex-1 h-12 bg-gray-800/50 rounded-lg animate-pulse" />
          <div className="w-12 h-12 bg-purple-600/30 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}