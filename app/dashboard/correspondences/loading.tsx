import { Search, Filter, Sparkles, Leaf, Gem, Droplets, Wind } from 'lucide-react'

export default function CorrespondencesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-64 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-24 h-10 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-32 h-10 bg-purple-600/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-mystical p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <div className="pl-10 pr-4 py-3 bg-gray-800/50 rounded-lg border border-purple-500/30 animate-pulse h-12" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-3 py-1 bg-purple-600/20 rounded-full animate-pulse h-6 w-20" />
            ))}
          </div>
        </div>
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          {/* Central Crystal */}
          <div className="w-20 h-20 relative">
            {/* Rotating Elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <Leaf className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-green-400" />
              <Gem className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
              <Droplets className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-blue-400" />
              <Wind className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-6 h-6 text-yellow-400" />
            </div>
            
            {/* Center Sparkle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          
          {/* Text */}
          <div className="text-center mt-6 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Gathering Sacred Knowledge
            </h3>
            <p className="text-sm text-gray-400">
              The cosmic library is opening its wisdom to you...
            </p>
          </div>
        </div>
      </div>

      {/* Results Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-mystical p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
                <div className="w-24 h-3 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-purple-600/20 rounded animate-pulse" />
            </div>

            {/* Properties */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="px-2 py-1 bg-purple-600/20 rounded-full animate-pulse h-6 w-16" />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}