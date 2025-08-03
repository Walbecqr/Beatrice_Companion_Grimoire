'use client'

import { useEffect } from 'react'
import { PenTool, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Journal error:', error)
  }, [error])

  const isDataError = error.message.includes('database') || error.message.includes('supabase')
  const isPermissionError = error.message.includes('permission') || error.message.includes('unauthorized')
  const isSyncError = error.message.includes('sync') || error.message.includes('conflict')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <PenTool className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Sacred Journal Locked</h1>
            <p className="text-gray-400">Your spiritual reflections are temporarily inaccessible</p>
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
            {isPermissionError && "Sacred Writings Protected"}
            {isDataError && "Journal Archive Disrupted"}
            {isSyncError && "Reflection Synchronization Failed"}
            {!isPermissionError && !isDataError && !isSyncError && "Spiritual Journal Error"}
          </h2>
          
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {isPermissionError && "The protective enchantments on your personal journal have been activated. You may need to renew your sacred session to access your private spiritual reflections."}
            {isDataError && "The connection to your spiritual journal repository has been interrupted. The cosmic scribes are working to restore access to your personal writings."}
            {isSyncError && "Your journal entries are experiencing synchronization conflicts across the spiritual realms. The cosmic order is working to align your reflections."}
            {!isPermissionError && !isDataError && !isSyncError && "An unknown force prevents access to your sacred journal. Your spiritual writings remain safe but temporarily veiled."}
          </p>

          {/* Specific Error Guidance */}
          <div className="text-xs text-gray-400 space-y-1">
            {isPermissionError && (
              <p>🔐 Try signing out and back in to refresh your journal access</p>
            )}
            {isDataError && (
              <p>📖 Journal database connection issue - usually temporary</p>
            )}
            {isSyncError && (
              <p>🔄 Entry synchronization conflict - may resolve automatically</p>
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
            <span>Retry Journal Access</span>
          </button>
          
          <Link 
            href="/dashboard/journal"
            className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2 flex-1"
          >
            <PenTool className="w-4 h-4" />
            <span>Fresh Journal View</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Spiritual Guidance:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Your journal entries are safely preserved</p>
            <p>• Try refreshing your spiritual connection</p>
            <p>• The cosmos protects your personal reflections</p>
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
          "Your thoughts and reflections are sacred. They await your return with patience."
        </p>
      </div>
    </div>
  )
}