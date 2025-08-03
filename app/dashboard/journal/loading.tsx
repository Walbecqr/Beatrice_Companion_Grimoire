import { PenTool, Heart, Moon, Sparkles, Calendar } from 'lucide-react'

export default function JournalLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-44 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-64 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
        <div className="w-36 h-10 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-10">
        <div className="relative">
          {/* Journal Book */}
          <div className="w-20 h-28 relative">
            {/* Book Cover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800/30 to-orange-800/30 rounded-lg border-2 border-amber-400/30 animate-pulse">
              <div className="absolute inset-3 border border-amber-400/50 rounded animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>
            
            {/* Floating Hearts and Sparkles */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s' }}>
              <Heart className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 text-pink-400 animate-pulse" />
              <Sparkles className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-4 h-4 text-purple-400 animate-pulse" />
              <Moon className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-4 text-blue-400 animate-pulse" />
              <Calendar className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-4 h-4 text-green-400 animate-pulse" />
            </div>
            
            {/* Magical Glow */}
            <div className="absolute -inset-1 border border-amber-400/20 rounded-lg animate-ping" />
          </div>
          
          {/* Text */}
          <div className="text-center mt-6 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Opening Your Sacred Journal
            </h3>
            <p className="text-sm text-gray-400">
              Preparing your personal spiritual reflections...
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: PenTool, label: 'Total Entries' },
          { icon: Heart, label: 'This Month' },
          { icon: Moon, label: 'Moon Cycles' },
          { icon: Sparkles, label: 'Insights' }
        ].map((stat, i) => (
          <div key={i} className="card-mystical p-4 text-center space-y-2">
            <stat.icon className="w-6 h-6 text-purple-400 mx-auto animate-pulse" />
            <div className="w-16 h-6 bg-purple-600/30 rounded animate-pulse mx-auto" />
            <div className="w-20 h-3 bg-purple-600/20 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-mystical p-6 space-y-4">
            {/* Entry Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="w-48 h-6 bg-purple-600/30 rounded animate-pulse" />
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-4 bg-purple-600/20 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-purple-600/20 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
            </div>

            {/* Content Preview */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-purple-600/20 rounded animate-pulse" />
            </div>

            {/* Tags and Mood */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="px-2 py-1 bg-purple-600/20 rounded animate-pulse h-5 w-16" />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400/30 rounded-full animate-pulse" />
                <div className="w-12 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Beatrice's Reflection Preview */}
            <div className="border-l-2 border-purple-400/30 pl-4 space-y-2">
              <div className="w-32 h-4 bg-purple-600/30 rounded animate-pulse" />
              <div className="w-full h-3 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-4/5 h-3 bg-purple-600/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}