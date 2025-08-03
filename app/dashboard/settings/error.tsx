'use client'

import { useEffect } from 'react'
import { Settings, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Settings error:', error)
  }, [error])

  const isPermissionError = error.message.includes('permission') || error.message.includes('unauthorized')
  const isDataError = error.message.includes('database') || error.message.includes('supabase')
  const isSaveError = error.message.includes('save') || error.message.includes('update')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Sacred Settings Disrupted</h1>
            <p className="text-gray-400">Your spiritual preferences cannot be accessed</p>
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
            {isPermissionError && "Sacred Configuration Locked"}
            {isDataError && "Preference Archive Disconnected"}
            {isSaveError && "Settings Save Ritual Failed"}
            {!isPermissionError && !isDataError && !isSaveError && "Configuration Mysteries Disrupted"}
          </h2>
          
          <p className="text-gray-300 text-sm max-w-md mx-auto">
            {isPermissionError && "The protective enchantments around your personal settings prevent access. You may need to renew your sacred session or elevate your spiritual permissions."}
            {isDataError && "The connection to your preference repository has been severed. The cosmic configuration keepers are working to restore access to your settings."}
            {isSaveError && "The ritual to preserve your settings has been disrupted. Your preferences remain safe, but the saving ceremony needs to be performed again."}
            {!isPermissionError && !isDataError && !isSaveError && "An unknown force has disrupted access to your spiritual configuration. The cosmic preferences are temporarily veiled."}
          </p>

          {/* Specific Error Guidance */}
          <div className="text-xs text-gray-400 space-y-1">
            {isPermissionError && (
              <p>🔒 Try signing out and back in to refresh your access</p>
            )}
            {isDataError && (
              <p>⚙️ Settings database connection issue - usually temporary</p>
            )}
            {isSaveError && (
              <p>💾 Settings save failed - your changes may need to be re-entered</p>
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
            <span>Retry Settings Access</span>
          </button>
          
          <Link 
            href="/dashboard/settings"
            className="btn-mystical bg-gray-700 hover:bg-gray-600 flex items-center justify-center space-x-2 flex-1"
          >
            <Settings className="w-4 h-4" />
            <span>Fresh Configuration</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="border-t border-purple-500/20 pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Configuration Guidance:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Your preferences are safely stored</p>
            <p>• Refresh your spiritual session if needed</p>
            <p>• Default settings remain in effect</p>
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
          "True harmony comes from within. Your essence transcends any configuration."
        </p>
      </div>
    </div>
  )
}