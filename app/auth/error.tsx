'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuthErrorHandler } from '@/components/providers'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { refreshSession } = useAuthErrorHandler()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Authentication error:', error)
    
    // Check if this is an RSC error and refresh the session if needed
    const errorMessage = error.message || ''
    const errorStack = error.stack || ''
    
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED')
    
    if (isRscError) {
      console.log('Detected RSC error in auth error boundary, refreshing auth session')
      refreshSession()
    }
  }, [error, refreshSession])

  const isNetworkError = error.message.includes('fetch') || error.message.includes('network') || 
                         error.message.includes('ERR_ABORTED') || error.message.includes('_rsc')
  const isAuthError = error.message.includes('auth') || error.message.includes('unauthorized') || 
                      error.message.includes('token') || error.message.includes('session')
  const isFormError = error.message.includes('form') || error.message.includes('input') || 
                      error.message.includes('validation')

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
            {isAuthError && "Sacred Gateway Disrupted"}
            {isNetworkError && "Spiritual Connection Interrupted"}
            {isFormError && "Mystical Form Imbalance"}
            {!isAuthError && !isNetworkError && !isFormError && "Authentication Portal Error"}
          </h2>
          <p className="text-gray-300">
            {isAuthError && "The sacred authentication process encountered a disturbance. Your spiritual credentials could not be verified at this time."}
            {isNetworkError && "The connection to the spiritual realm was interrupted. This may be due to a React Server Component error. Please try again."}
            {isFormError && "The mystical form energies are out of balance. Please check your spiritual credentials and try again."}
            {!isAuthError && !isNetworkError && !isFormError && "An unexpected disturbance occurred while accessing the sacred gateway. The universe is working to restore balance."}
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
                {error.message.includes('ERR_ABORTED') && '\n\nThis is likely a React Server Component (RSC) error. Check for issues with data fetching in server components.'}
                {error.stack && `\n\nStack Trace:\n${error.stack}`}
              </pre>
              {isNetworkError && (
                <div className="mt-3 p-3 bg-gray-700/50 rounded text-xs text-gray-300">
                  <p className="font-semibold mb-1">RSC Error Troubleshooting:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Check server components that fetch data</li>
                    <li>Verify Supabase authentication is working</li>
                    <li>Ensure proper error handling in async components</li>
                  </ul>
                </div>
              )}
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
            href="/auth/login"
            className="btn-mystical flex items-center justify-center space-x-2 flex-1 bg-gray-700 hover:bg-gray-600"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Page</span>
          </Link>
          
          <Link 
            href="/"
            className="btn-mystical flex items-center justify-center space-x-2 flex-1 bg-gray-700 hover:bg-gray-600"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Mystical Footer */}
        <div className="text-xs text-gray-500 italic">
&ldquo;The path to wisdom sometimes requires patience. Your journey awaits beyond this temporary obstacle.&rdquo;
        </div>
      </div>
    </div>
  )
}