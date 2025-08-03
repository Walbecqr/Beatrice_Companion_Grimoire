'use client'

import { useEffect } from 'react'
import { BookOpen, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function CorrespondenceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Correspondence detail error:', error)
  }, [error])

  const isNotFoundError = error.message.includes('404') || error.message.includes('not found')
  const isAccessError = error.message.includes('permission') || error.message.includes('unauthorized')
  const isDataError = error.message.includes('database') || error.message.includes('supabase')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Sacred Text Unavailable</h1>
            <p className="text-gray-400">This correspondence entry cannot be accessed</p>
          </div>
        </div>
        
        <Link href="/dashboard/correspondences" className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
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
            {isNotFoundError && "Sacred Text Lost to Time"}
            {isAccessError && "Forbidden Knowledge"}
            {isDataError && "Archive Connection Severed"}
            {!isNotFoundError && !isAccessError && !isDataError && "Mystical Correspondence Error"}
          </h2>
          
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {isNotFoundError && "This sacred correspondence has vanished from the archives or may have been moved to another realm. The knowledge you seek may no longer exist at this location."}
            {isAccessError && "The guardians of this knowledge have deemed it forbidden for your current spiritual level. You may need special permissions to access this sacred text."}
            {isDataError && "The mystical connection to this correspondence entry has been disrupted. The archive spirits are working to restore access to this knowledge."}
            {!isNotFoundError && !isAccessError && !isDataError && "An unknown force prevents access to this correspondence. The cosmic energies are in flux."}
          </p>

          {/* Specific Error Guidance */}
          <div className="text-xs text-gray-400 space-y-1">
            {isNotFoundError && (
              <p>📖 This correspondence may have been deleted or moved</p>
            )}
            {isAccessError && (
              <p>🔒 Check your permissions or sign in again</p>
            )}
            {isDataError && (
              <p>💫 Database connection issue - usually temporary</p>
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
            <span>Retry Access</span>
          </button>
          
          <Link 
            href="/dashboard/correspondences"
            className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2 flex-1"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Archive</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Guidance for the Seeker:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Return to the main correspondence archive</p>
            <p>• Search for similar sacred knowledge</p>
            <p>• The universe may guide you to better wisdom</p>
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
&ldquo;When one door closes, the universe opens another. Seek and you shall find.&rdquo;
        </p>
      </div>
    </div>
  )
}