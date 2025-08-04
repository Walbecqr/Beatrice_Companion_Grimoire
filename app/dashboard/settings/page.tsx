// Settings page with user-specific content requires dynamic rendering
export const dynamic = 'force-dynamic'

// Add metadata to improve page loading
export const metadata = {
  title: 'Settings | Beatrice Companion',
  description: 'Customize your spiritual companion experience',
}

import { Suspense } from 'react'
import { SettingsClient } from './client'

// Loading fallback component
function SettingsLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gradient">Settings</h1>
      <div className="card-mystical p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-purple-800/30 rounded w-1/3"></div>
          <div className="h-24 bg-purple-800/20 rounded"></div>
          <div className="h-8 bg-purple-800/30 rounded w-1/4"></div>
          <div className="h-24 bg-purple-800/20 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gradient">Sacred Settings</h1>
      <p className="text-gray-400">Customize your spiritual companion experience</p>
      
      <Suspense fallback={<SettingsLoading />}>
        <SettingsClient />
      </Suspense>
    </div>
  )
}
