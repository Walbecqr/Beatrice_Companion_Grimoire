'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface FallbackProps {
  error?: Error
  reset?: () => void
}

/**
 * Fallback component for dashboard when RSC errors occur
 * This can be used with ErrorBoundary or directly in the layout
 */
export default function DashboardFallback({ error, reset }: FallbackProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (error) {
      console.error('Dashboard fallback triggered:', error)
    }
  }, [error])

  const handleRetry = () => {
    if (reset) {
      setRetryCount(prev => prev + 1)
      reset()
    } else {
      // If no reset function provided, refresh the page
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card-mystical max-w-lg w-full p-8 text-center space-y-6">
        {/* Mystical Error Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 border-2 border-amber-400/30 rounded-full animate-pulse" />
          <div className="absolute inset-2 border border-amber-400/50 rounded-full animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gradient">
            Dashboard Connection Issue
          </h2>
          <p className="text-gray-300">
            The spiritual connection to your dashboard was interrupted. This may be due to a React Server Component error.
          </p>
          
          {error && process.env.NODE_ENV === 'development' && (
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-purple-400 hover:text-purple-300 underline"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>
          )}

          {showDetails && error && (
            <div className="text-left mt-2 p-4 bg-gray-800/50 rounded-lg">
              <pre className="text-xs text-red-300 whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && `\n\nStack Trace:\n${error.stack}`}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleRetry}
            className="btn-mystical flex items-center justify-center space-x-2 flex-1"
            disabled={retryCount >= 3}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{retryCount >= 3 ? 'Too Many Retries' : 'Try Again'}</span>
          </button>
          
          <Link 
            href="/"
            className="btn-mystical flex items-center justify-center space-x-2 flex-1 bg-gray-700 hover:bg-gray-600"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Guidance */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Troubleshooting Guidance:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Try refreshing your browser</p>
            <p>• Clear your browser cache</p>
            <p>• Sign out and sign back in</p>
            <p>• If the issue persists, please contact support</p>
          </div>
        </div>
      </div>
    </div>
  )
}