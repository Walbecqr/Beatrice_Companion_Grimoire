'use client'

import { useSupabase, useAuthErrorHandler } from '@/components/providers.tsx'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { PrefetchProvider } from '@/components/dashboard/prefetch-links'
import { Suspense, useState, useEffect } from 'react'
import DashboardFallback from './fallback'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useSupabase()
  const { authError, refreshSession, isLoading: authLoading } = useAuthErrorHandler()
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Handle RSC errors that might not be caught by error.tsx
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Dashboard error caught by window event:', event.error)
      // Only handle network/RSC errors
      if (event.error?.message?.includes('ERR_ABORTED') || 
          event.error?.message?.includes('_rsc') ||
          event.error?.message?.includes('fetch')) {
        setError(event.error)
        setHasError(true)
        // Try to refresh the session as this might be an auth token issue
        refreshSession()
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [refreshSession])
  
  // Also set error state if authError exists
  useEffect(() => {
    if (authError) {
      console.log('Auth error detected:', authError)
      setError(authError)
      setHasError(true)
    }
  }, [authError])

  // Reset error state and refresh session
  const resetError = () => {
    setHasError(false)
    setError(null)
    // Try to refresh the session when resetting errors
    refreshSession()
  }

  // Show loading state or redirect if not authenticated
  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-600/30" />
          <div className="h-4 w-32 mx-auto bg-purple-600/30 rounded" />
          <p className="mt-4 text-sm text-purple-600/70">
            {authLoading ? "Refreshing authentication..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect('/auth/login')
  }

  // Show fallback UI if there's an error
  if (hasError) {
    return <DashboardFallback error={error || undefined} reset={resetError} />
  }

  return (
    <PrefetchProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Suspense fallback={
              <div className="animate-pulse space-y-8">
                <div className="h-8 w-64 bg-purple-600/30 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card-mystical p-4 h-32" />
                  ))}
                </div>
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </PrefetchProvider>
  )
}
