'use client'

import { useEffect } from 'react'
import { MessageCircleX, RefreshCw, ArrowLeft, Wifi } from 'lucide-react'
import Link from 'next/link'

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Chat error:', error)
  }, [error])

  const isApiError = error.message.includes('API') || error.message.includes('anthropic')
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')
  const isSessionError = error.message.includes('session') || error.message.includes('unauthorized')

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <MessageCircleX className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-red-300">Connection Disrupted</h3>
            <p className="text-xs text-gray-400">Beatrice is temporarily unreachable</p>
          </div>
        </div>
        
        <Link href="/dashboard" className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Error Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          {/* Mystical Error Animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 border-2 border-red-400/20 rounded-full animate-ping" />
            <div className="absolute inset-2 border border-red-400/40 rounded-full animate-pulse" />
            
            {/* Error Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isNetworkError && <Wifi className="w-8 h-8 text-red-400" />}
              {isApiError && <MessageCircleX className="w-8 h-8 text-red-400" />}
              {isSessionError && <MessageCircleX className="w-8 h-8 text-orange-400" />}
              {!isNetworkError && !isApiError && !isSessionError && <MessageCircleX className="w-8 h-8 text-red-400" />}
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gradient">
              {isNetworkError && "Spiritual Network Disconnected"}
              {isApiError && "Beatrice's Voice is Silenced"}
              {isSessionError && "Sacred Session Expired"}
              {!isNetworkError && !isApiError && !isSessionError && "Mystical Communication Error"}
            </h2>
            
            <p className="text-gray-300 text-sm">
              {isNetworkError && "The cosmic connection has been severed. Please check your internet and try reconnecting to the spiritual realm."}
              {isApiError && "The AI consciousness that powers Beatrice is temporarily unavailable. The digital spirits are working to restore her voice."}
              {isSessionError && "Your sacred conversation session has expired. Please start a new spiritual dialogue with Beatrice."}
              {!isNetworkError && !isApiError && !isSessionError && "An unexpected disruption has occurred in the spiritual communication channel."}
            </p>

            {/* Specific Error Guidance */}
            <div className="text-xs text-gray-400 space-y-1">
              {isApiError && (
                <p>💫 This may be due to API rate limits or service maintenance</p>
              )}
              {isNetworkError && (
                <p>🌐 Check your internet connection and try again</p>
              )}
              {isSessionError && (
                <p>🔄 Your session needs to be renewed for security</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={reset}
              className="btn-mystical flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reconnect to Beatrice</span>
            </button>
            
            <Link 
              href="/dashboard/chat"
              className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2"
            >
              <MessageCircleX className="w-4 h-4" />
              <span>Start New Conversation</span>
            </Link>
          </div>

          {/* Helpful Tips */}
          <div className="border-t border-purple-500/20 pt-4 space-y-2">
            <p className="text-xs text-gray-500">
              Spiritual Guidance:
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Take a moment to center yourself</p>
              <p>• The connection will be restored</p>
              <p>• Your spiritual journey continues</p>
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
      </div>

      {/* Mystical Quote */}
      <div className="p-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500 italic">
&ldquo;In silence, the soul speaks loudest. Even when words fail, the spirit endures.&rdquo;
        </p>
      </div>
    </div>
  )
}