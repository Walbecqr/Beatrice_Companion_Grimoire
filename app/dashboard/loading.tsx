import { Sparkles, Moon, BookOpen, PenTool } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-purple-600/30 rounded-full animate-pulse" />
          <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-24 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-8 h-8 bg-purple-600/30 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-md border-r border-purple-500/20 p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                <div className="w-5 h-5 bg-purple-600/30 rounded animate-pulse" />
                <div className="w-24 h-4 bg-purple-600/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Mystical Loading Animation */}
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
            <div className="relative">
              {/* Central Moon */}
              <Moon className="w-16 h-16 text-purple-400 animate-pulse" />
              
              {/* Orbiting Sparkles */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <Sparkles className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-pink-400" />
                <Sparkles className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Sparkles className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-green-400" />
                <Sparkles className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gradient">
                Awakening Your Sacred Space
              </h2>
              <p className="text-gray-400 text-sm">
                The universe is preparing your spiritual dashboard...
              </p>
            </div>
          </div>

          {/* Dashboard Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Recent Chat Card */}
            <div className="card-mystical p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600/30 rounded-full animate-pulse" />
                <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Moon Phase Card */}
            <div className="card-mystical p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Moon className="w-8 h-8 text-purple-400 animate-pulse" />
                <div className="w-28 h-5 bg-purple-600/30 rounded animate-pulse" />
              </div>
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 bg-purple-600/20 rounded-full animate-pulse" />
              </div>
              <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
            </div>

            {/* Quick Actions Card */}
            <div className="card-mystical p-6 space-y-4">
              <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                {[BookOpen, PenTool, Sparkles, Moon].map((Icon, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 p-3 bg-purple-600/10 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-400 animate-pulse" />
                    <div className="w-16 h-3 bg-purple-600/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}