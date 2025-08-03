import { Heart, Smile, Calendar, TrendingUp, Sun } from 'lucide-react'

export default function CheckInsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-40 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-52 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
        <div className="w-36 h-10 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-10">
        <div className="relative">
          {/* Heart Pulse */}
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-800/30 to-red-800/30 rounded-full border-2 border-pink-400/30 animate-pulse">
              <div className="absolute inset-4 border border-pink-400/50 rounded-full animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Floating Wellness Elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '7s' }}>
              <Smile className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-5 h-5 text-yellow-400" />
              <Sun className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-5 h-5 text-orange-400" />
              <TrendingUp className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-5 h-5 text-green-400" />
              <Calendar className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            </div>
            
            {/* Wellness Aura */}
            <div className="absolute -inset-2 border border-pink-400/20 rounded-full animate-ping" />
          </div>
          
          {/* Text */}
          <div className="text-center mt-6 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Preparing Your Wellness Journal
            </h3>
            <p className="text-sm text-gray-400">
              Gathering your spiritual check-in history...
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Heart, label: 'Overall Wellness' },
          { icon: Smile, label: 'Mood Average' },
          { icon: TrendingUp, label: 'Progress Trend' },
          { icon: Calendar, label: 'Check-ins' }
        ].map((stat, i) => (
          <div key={i} className="card-mystical p-4 text-center space-y-3">
            <stat.icon className="w-6 h-6 text-purple-400 mx-auto animate-pulse" />
            <div className="w-16 h-6 bg-purple-600/30 rounded animate-pulse mx-auto" />
            <div className="w-20 h-3 bg-purple-600/20 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-ins History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse" />
          
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-mystical p-6 space-y-4">
              {/* Check-in Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-purple-600/20 rounded animate-pulse" />
                </div>
                <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse" />
              </div>

              {/* Mood & Energy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-12 h-4 bg-purple-600/30 rounded animate-pulse" />
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="w-4 h-4 bg-yellow-400/30 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-16 h-4 bg-purple-600/30 rounded animate-pulse" />
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="w-4 h-4 bg-green-400/30 rounded-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-5/6 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="px-2 py-1 bg-purple-600/20 rounded animate-pulse h-5 w-16" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Check-in */}
          <div className="card-mystical p-4 space-y-4">
            <div className="w-28 h-5 bg-purple-600/30 rounded animate-pulse" />
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full animate-pulse mx-auto" />
              <div className="w-24 h-4 bg-purple-600/30 rounded animate-pulse mx-auto" />
            </div>
          </div>

          {/* Wellness Trends */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-28 h-5 bg-purple-600/30 rounded animate-pulse" />
            <div className="space-y-2">
              {['Mood', 'Energy', 'Sleep', 'Stress'].map((metric) => (
                <div key={metric} className="flex justify-between items-center">
                  <div className="w-12 h-4 bg-purple-600/20 rounded animate-pulse" />
                  <div className="w-16 h-2 bg-purple-600/30 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="card-mystical p-4 space-y-3">
            <div className="w-20 h-5 bg-purple-600/30 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="w-full h-3 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-5/6 h-3 bg-purple-600/20 rounded animate-pulse" />
              <div className="w-4/5 h-3 bg-purple-600/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}