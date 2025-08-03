import { BookOpen, Sparkles, Wand2, Scroll, Moon } from 'lucide-react'

export default function GrimoireLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-40 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-56 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          {/* Ancient Book */}
          <div className="w-24 h-32 relative">
            {/* Book Cover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 to-indigo-800/30 rounded-lg border-2 border-purple-400/30 animate-pulse">
              <div className="absolute inset-4 border border-purple-400/50 rounded animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
            
            {/* Floating Magical Elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
              <Wand2 className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-5 h-5 text-yellow-400" />
              <Scroll className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
              <Moon className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-5 h-5 text-blue-400" />
              <Sparkles className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
            </div>
            
            {/* Magical Aura */}
            <div className="absolute -inset-2 border border-purple-400/20 rounded-lg animate-ping" />
          </div>
          
          {/* Text */}
          <div className="text-center mt-8 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Opening the Sacred Grimoire
            </h3>
            <p className="text-sm text-gray-400">
              Ancient spells and rituals are awakening...
            </p>
          </div>
        </div>
      </div>

      {/* Categories Filter Skeleton */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Rituals', 'Spells', 'Chants', 'Blessings', 'Meditations'].map((category) => (
          <div key={category} className="px-4 py-2 bg-purple-600/20 rounded-full animate-pulse h-9 w-20" />
        ))}
      </div>

      {/* Grimoire Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-mystical p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="w-36 h-6 bg-purple-600/30 rounded animate-pulse" />
                <div className="w-24 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
            </div>

            {/* Type Badge */}
            <div className="w-20 h-6 bg-purple-600/20 rounded-full animate-pulse" />

            {/* Description */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-purple-600/20 rounded animate-pulse" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3].map((j) => (
                <div key={j} className="px-2 py-1 bg-purple-600/20 rounded animate-pulse h-5 w-12" />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
              <div className="w-20 h-3 bg-purple-600/20 rounded animate-pulse" />
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-600/30 rounded-full animate-pulse" />
                <div className="w-16 h-3 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}