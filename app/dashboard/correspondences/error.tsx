'use client'

import { useEffect } from 'react'
import { Scroll, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function CorrespondencesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Correspondences error:', error)
  }, [error])

  const isSearchError = error.message.includes('search') || error.message.includes('filter')
  const isDataError = error.message.includes('database') || error.message.includes('supabase')
  const isLoadError = error.message.includes('load') || error.message.includes('fetch')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <Scroll className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Correspondence Archive Disrupted</h1>
            <p className="text-gray-400">The mystical library is experiencing interference</p>
          </div>
        </div>
        
        <Link href="/dashboard" className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Error Content */}
      <div className="card-mystical p-8 text-center space-y-6">
        {/* Mystical Error Animation */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 border-2 border-red-400/20 rounded-full animate-ping" />
          <div className="absolute inset-2 border border-red-400/40 rounded-full animate-pulse" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gradient">
            {isSearchError && "Ancient Search Spells Failed"}
            {isDataError && "Sacred Archive Connection Lost"}
            {isLoadError && "Correspondence Spirits Unavailable"}
            {!isSearchError && !isDataError && !isLoadError && "Mystical Library Disruption"}
          </h2>
          
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {isSearchError && "The search incantations have been disrupted. The correspondence filters may need to be reset to restore the mystical search capabilities."}
            {isDataError && "The connection to the sacred correspondence database has been severed. The ancient knowledge keepers are working to restore access."}
            {isLoadError && "The correspondence spirits that guard this knowledge are temporarily unreachable. Please allow them time to gather their energies."}
            {!isSearchError && !isDataError && !isLoadError && "An unexpected disturbance has affected the correspondence archive. The mystical forces are working to restore harmony."}
          </p>

          {/* Specific Error Guidance */}
          <div className="text-xs text-gray-400 space-y-1">
            {isSearchError && (
              <p>🔍 Try simplifying your search terms or clearing filters</p>
            )}
            {isDataError && (
              <p>📚 Database connection issue - this usually resolves quickly</p>
            )}
            {isLoadError && (
              <p>⏳ Loading timeout - the archive may be under heavy use</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={reset}
            className="btn-mystical flex items-center justify-center space-x-2 flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Correspondence Access</span>
          </button>
          
          <Link 
            href="/dashboard/correspondences"
            className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2 flex-1"
          >
            <Scroll className="w-4 h-4" />
            <span>Fresh Archive View</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Mystical Archive Tips:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Clear your search filters and try again</p>
            <p>• Check your connection to the spiritual realm</p>
            <p>• The correspondence spirits may need a moment</p>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left p-3 bg-gray-800/50 rounded">
            <summary className="cursor-pointer text-xs text-gray-400">Debug Info</summary>
            <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>

      {/* Mystical Quote */}
      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
&ldquo;Knowledge persists beyond temporary veils. The wisdom you seek awaits your return.&rdquo;
        </p>
      </div>
    </div>
  )
}