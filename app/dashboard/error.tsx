'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
    
    // You could send this to your error monitoring service
    // trackError('dashboard_error', error, { digest: error.digest })
  }, [error])

  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')
  const isAuthError = error.message.includes('auth') || error.message.includes('unauthorized')
  const isDataError = error.message.includes('database') || error.message.includes('supabase')

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card-mystical max-w-lg w-full p-8 text-center space-y-6">
        {/* Mystical Error Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 border-2 border-red-400/30 rounded-full animate-pulse" />
          <div className="absolute inset-2 border border-red-400/50 rounded-full animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gradient">
            The Cosmic Connection Faltered
          </h2>
          <p className="text-gray-300">
            {isNetworkError && "The spiritual network seems to be disrupted. Please check your connection and try again."}
            {isAuthError && "Your sacred session has expired. Please sign in again to access your spiritual space."}
            {isDataError && "The cosmic database is experiencing turbulence. Our spiritual guides are working to restore harmony."}
            {!isNetworkError && !isAuthError && !isDataError && "An unexpected spiritual disturbance has occurred. The universe is working to restore balance."}
          </p>
          
          {/* Technical Details (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mt-4 p-4 bg-gray-800/50 rounded-lg">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap break-words">
                {error.message}
                {error.digest && `\nError ID: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={reset}
            className="btn-mystical flex items-center justify-center space-x-2 flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <Link 
            href="/dashboard"
            className="btn-mystical flex items-center justify-center space-x-2 flex-1 bg-gray-700 hover:bg-gray-600"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Support Options */}
        <div className="border-t border-purple-500/20 pt-6 space-y-3">
          <p className="text-sm text-gray-400">
            If this cosmic disturbance persists, seek guidance:
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/dashboard/chat"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask Beatrice</span>
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Portal</span>
            </button>
          </div>
        </div>

        {/* Mystical Footer */}
        <div className="text-xs text-gray-500 italic">
          "Even in darkness, the stars continue to shine. This too shall pass."
        </div>
      </div>
    </div>
  )
}