import { ArrowLeft, Star, Lock, ExternalLink, Sparkles } from 'lucide-react'

export default function CorrespondenceDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-600/30 rounded animate-pulse flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-purple-400" />
        </div>
        <div className="w-32 h-5 bg-purple-600/30 rounded animate-pulse" />
      </div>

      {/* Main Card */}
      <div className="card-mystical p-8">
        {/* Header Section */}
        <div className="border-b border-purple-500/20 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              {/* Title and Icon */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600/30 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="w-48 h-8 bg-purple-600/30 rounded animate-pulse" />
                  <div className="w-36 h-4 bg-purple-600/20 rounded animate-pulse" />
                </div>
              </div>

              {/* Botanical Name */}
              <div className="w-40 h-5 bg-purple-600/20 rounded animate-pulse" />

              {/* Status Indicators */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <div className="w-16 h-4 bg-purple-600/20 rounded animate-pulse" />
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <div className="w-20 h-4 bg-purple-600/20 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-purple-600/30 rounded animate-pulse flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <div className="w-10 h-10 bg-purple-600/30 rounded animate-pulse flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Mystical Loading Animation */}
        <div className="flex justify-center items-center py-8">
          <div className="relative">
            {/* Pulsing Aura */}
            <div className="w-24 h-24 border-2 border-purple-400/20 rounded-full animate-ping" />
            <div className="absolute inset-0 w-24 h-24 border-2 border-purple-400/40 rounded-full animate-pulse" />
            
            {/* Floating Elements */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full" />
              <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full" />
              <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
            </div>
            
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h3 className="text-lg font-medium text-gradient">
            Unveiling Sacred Secrets
          </h3>
          <p className="text-sm text-gray-400">
            The ancient wisdom is revealing itself...
          </p>
        </div>

        {/* Content Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Description */}
            <div className="space-y-3">
              <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-5/6 h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-4/5 h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Magical Properties */}
            <div className="space-y-3">
              <div className="w-40 h-6 bg-purple-600/30 rounded animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-3 py-1 bg-purple-600/20 rounded-full animate-pulse h-7 w-24" />
                ))}
              </div>
            </div>

            {/* Traditional Uses */}
            <div className="space-y-3">
              <div className="w-36 h-6 bg-purple-600/30 rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <div className="w-48 h-4 bg-purple-600/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Correspondences */}
            <div className="space-y-3">
              <div className="w-36 h-6 bg-purple-600/30 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                {['Element', 'Planet', 'Chakra', 'Energy'].map((label) => (
                  <div key={label} className="space-y-1">
                    <div className="w-16 h-4 bg-purple-600/20 rounded animate-pulse" />
                    <div className="w-20 h-5 bg-purple-600/30 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Folklore */}
            <div className="space-y-3">
              <div className="w-24 h-6 bg-purple-600/30 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-4/5 h-4 bg-purple-600/20 rounded animate-pulse" />
                <div className="w-5/6 h-4 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Related Deities */}
            <div className="space-y-3">
              <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-2 py-1 bg-purple-600/20 rounded animate-pulse h-6 w-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}