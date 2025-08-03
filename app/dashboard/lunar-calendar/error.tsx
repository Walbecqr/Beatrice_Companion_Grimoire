'use client'

import { useEffect } from 'react'
import { Moon, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function LunarCalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Lunar calendar error:', error)
  }, [error])

  const isAstroError = error.message.includes('astronomical') || error.message.includes('ephemeris')
  const isDataError = error.message.includes('database') || error.message.includes('supabase')
  const isCalendarError = error.message.includes('calendar') || error.message.includes('date')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <Moon className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Celestial Calendar Obscured</h1>
            <p className="text-gray-400">The lunar wisdom is temporarily veiled</p>
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
            {isAstroError && "Cosmic Calculations Disrupted"}
            {isDataError && "Lunar Archive Connection Lost"}
            {isCalendarError && "Celestial Time Misaligned"}
            {!isAstroError && !isDataError && !isCalendarError && "Lunar Wisdom Temporarily Veiled"}
          </h2>
          
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {isAstroError && "The astronomical calculations that power our lunar calendar have been disrupted. The cosmic mathematicians are recalibrating the celestial algorithms."}
            {isDataError && "The connection to our sacred lunar database has been severed. The moon keepers are working to restore access to the celestial archive."}
            {isCalendarError && "The cosmic timekeeping mechanisms have fallen out of sync. The universal clock is being realigned with the celestial rhythms."}
            {!isAstroError && !isDataError && !isCalendarError && "An unknown celestial force has veiled the lunar calendar. The moon's wisdom remains protected but temporarily hidden."}
          </p>

          {/* Specific Error Guidance */}
          <div className="text-xs text-gray-400 space-y-1">
            {isAstroError && (
              <p>🌙 Astronomical data recalculation in progress</p>
            )}
            {isDataError && (
              <p>📅 Lunar database connection issue - usually temporary</p>
            )}
            {isCalendarError && (
              <p>⏰ Calendar synchronization with cosmic time in progress</p>
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
            <span>Retry Lunar Access</span>
          </button>
          
          <Link 
            href="/dashboard/lunar-calendar"
            className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2 flex-1"
          >
            <Moon className="w-4 h-4" />
            <span>Fresh Calendar View</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Celestial Guidance:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• The moon's cycles continue their eternal dance</p>
            <p>• Cosmic alignments may need time to settle</p>
            <p>• Trust in the rhythm of the celestial spheres</p>
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
&ldquo;Even when clouds obscure her face, the moon continues her sacred journey.&rdquo;
        </p>
      </div>
    </div>
  )
}