'use client'

import { useEffect } from 'react'
import { BookOpen, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function GrimoireError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Grimoire error:', error)
  }, [error])

  const isDataError = error.message.includes('database') || error.message.includes('supabase')
  const isPermissionError = error.message.includes('permission') || error.message.includes('unauthorized')
  const isLoadError = error.message.includes('load') || error.message.includes('fetch')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Sacred Grimoire Sealed</h1>
            <p className="text-gray-400">The ancient spellbook cannot be opened</p>
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
            {isPermissionError && "Forbidden Magical Knowledge"}
            {isDataError && "Ancient Archive Disrupted"}
            {isLoadError && "Spell Tome Loading Failed"}
            {!isPermissionError && !isDataError && !isLoadError && "Mystical Grimoire Error"}
          </h2>
          
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {isPermissionError && "The protective enchantments on this grimoire prevent your access. You may need to elevate your spiritual permissions or renew your sacred session."}
            {isDataError && "The connection to the ancient spell repository has been severed. The mystical keepers are working to restore access to the sacred knowledge."}
            {isLoadError && "The grimoire spirits are overwhelmed and cannot manifest the spell tome at this time. Please allow them to gather their mystical energies."}
            {!isPermissionError && !isDataError && !isLoadError && "An unknown magical interference prevents access to the grimoire. The cosmic forces are in discord."}
          </p>

          {/* Specific Error Guidance */}
          <div className="text-xs text-gray-400 space-y-1">
            {isPermissionError && (
              <p>🔮 Try signing out and back in to refresh your magical credentials</p>
            )}
            {isDataError && (
              <p>📚 Spell database connection issue - usually resolves quickly</p>
            )}
            {isLoadError && (
              <p>⏳ Grimoire loading timeout - the tome may be heavily enchanted</p>
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
            <span>Retry Grimoire Access</span>
          </button>
          
          <Link 
            href="/dashboard/grimoire"
            className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2 flex-1"
          >
            <BookOpen className="w-4 h-4" />
            <span>Fresh Spell Tome</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Magical Guidance:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Clear your spiritual cache and try again</p>
            <p>• Ensure your mystical connection is stable</p>
            <p>• The grimoire may need time to awaken</p>
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
          "Even the most powerful spells sometimes need a moment to gather their energy."
        </p>
      </div>
    </div>
  )
}