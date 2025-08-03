import { Flame, Moon, Star, Sparkles, Circle } from 'lucide-react'

export default function RitualsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-44 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-60 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
        <div className="w-32 h-10 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          {/* Sacred Circle */}
          <div className="w-32 h-32 relative">
            {/* Outer Circle */}
            <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-pulse">
              <div className="absolute inset-4 border border-purple-400/50 rounded-full animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Rotating Ritual Elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <Star className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-5 h-5 text-yellow-400" />
              <Circle className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <Moon className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-5 h-5 text-blue-400" />
              <Sparkles className="absolute top-1/2 -left-6 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
            </div>
            
            {/* Inner rotating elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-3 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </div>
            
            {/* Sacred Aura */}
            <div className="absolute -inset-2 border border-purple-400/20 rounded-full animate-ping" />
          </div>
          
          {/* Text */}
          <div className="text-center mt-8 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Preparing Sacred Rituals
            </h3>
            <p className="text-sm text-gray-400">
              Awakening the ancient ceremonial knowledge...
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Moon Phases', 'Sabbats', 'Personal', 'Seasonal', 'Protection'].map((category) => (
          <div key={category} className="px-4 py-2 bg-purple-600/20 rounded-full animate-pulse h-9 w-24" />
        ))}
      </div>

      {/* Ritual Calendar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Rituals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-40 h-6 bg-purple-600/30 rounded animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-mystical p-6 space-y-4">
              {/* Ritual Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="w-48 h-6 bg-purple-600/30 rounded animate-pulse" />
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-purple-600/20 rounded animate-pulse" />
                    <div className="w-24 h-4 bg-purple-600/20 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
              </div>

              {/* Ritual Type & Time */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-6 bg-purple-600/20 rounded-full animate-pulse" />
                <div className="w-32 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-5/6 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>

              {/* Materials & Tools */}
              <div className="space-y-2">
                <div className="w-28 h-4 bg-purple-600/30 rounded animate-pulse" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="px-2 py-1 bg-purple-600/20 rounded animate-pulse h-5 w-16" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Moon Phase */}
          <div className="card-mystical p-4 text-center space-y-3">
            <div className="w-24 h-5 bg-purple-600/30 rounded animate-pulse mx-auto" />
            <div className="w-16 h-16 bg-purple-600/20 rounded-full animate-pulse mx-auto" />
            <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse mx-auto" />
          </div>

          {/* Next Sabbat */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-28 h-5 bg-purple-600/30 rounded animate-pulse" />
            <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
            <div className="w-24 h-4 bg-purple-600/20 rounded animate-pulse" />
          </div>

          {/* Recent Activity */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-600/30 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="w-full h-3 bg-purple-600/20 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-purple-600/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}