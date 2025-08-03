import { Moon, Star, Calendar, Sparkles, Circle } from 'lucide-react'

export default function LunarCalendarLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-64 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
        <div className="w-40 h-10 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          {/* Lunar Cycle */}
          <div className="w-40 h-40 relative">
            {/* Moon */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-indigo-800/30 rounded-full border-2 border-blue-400/30 animate-pulse">
              <div className="absolute inset-6 border border-blue-400/50 rounded-full animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Moon className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
            
            {/* Orbiting Stars */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
              <Star className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 text-yellow-400" />
              <Circle className="absolute top-1/4 -right-6 transform -translate-y-1/2 w-3 h-3 text-cyan-400" />
              <Star className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-4 h-4 text-yellow-400" />
              <Circle className="absolute bottom-1/4 -right-6 transform translate-y-1/2 w-3 h-3 text-cyan-400" />
              <Star className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-4 text-yellow-400" />
              <Circle className="absolute bottom-1/4 -left-6 transform translate-y-1/2 w-3 h-3 text-cyan-400" />
              <Star className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-4 h-4 text-yellow-400" />
              <Circle className="absolute top-1/4 -left-6 transform -translate-y-1/2 w-3 h-3 text-cyan-400" />
            </div>
            
            {/* Inner Phase Indicators */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            </div>
            
            {/* Celestial Aura */}
            <div className="absolute -inset-3 border border-blue-400/20 rounded-full animate-ping" />
          </div>
          
          {/* Text */}
          <div className="text-center mt-8 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Consulting the Celestial Calendar
            </h3>
            <p className="text-sm text-gray-400">
              The moon whispers her ancient secrets...
            </p>
          </div>
        </div>
      </div>

      {/* Current Moon Phase Card */}
      <div className="card-mystical p-6 text-center space-y-4">
        <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse mx-auto" />
        <div className="w-20 h-20 bg-purple-600/20 rounded-full animate-pulse mx-auto" />
        <div className="space-y-2">
          <div className="w-24 h-5 bg-purple-600/30 rounded animate-pulse mx-auto" />
          <div className="w-48 h-4 bg-purple-600/20 rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="w-40 h-6 bg-purple-600/30 rounded animate-pulse" />
          
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center p-2">
                <div className="w-8 h-4 bg-purple-600/20 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="aspect-square p-2 card-mystical">
                <div className="w-6 h-4 bg-purple-600/30 rounded animate-pulse" />
                <div className="w-4 h-4 bg-purple-600/20 rounded-full animate-pulse mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Moon Phases This Month */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-36 h-5 bg-purple-600/30 rounded animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600/20 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="w-20 h-4 bg-purple-600/30 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-purple-600/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Lunar Events */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-28 h-5 bg-purple-600/30 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-full h-4 bg-purple-600/30 rounded animate-pulse" />
                <div className="w-24 h-3 bg-purple-600/20 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Astrological Info */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="w-16 h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-16 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}