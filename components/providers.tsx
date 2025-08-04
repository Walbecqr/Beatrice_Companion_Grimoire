'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type SupabaseContext = {
  user: User | null
  isLoading: boolean
  authError: Error | null
  refreshSession: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<Error | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      setIsLoading(true)
      setAuthError(null)
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      if (data.session) {
        setUser(data.session.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Error refreshing session:', err)
      setAuthError(err instanceof Error ? err : new Error('Failed to refresh session'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          router.push('/')
        } else if (event === 'TOKEN_REFRESHED') {
          // Just update the user without navigation
          console.log('Auth token refreshed')
        }
      } catch (err) {
        console.error('Auth state change error:', err)
        setAuthError(err instanceof Error ? err : new Error('Authentication error'))
      }
    })

    // Initial session check
    const checkSession = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        if (data.session) {
          setUser(data.session.user)
        }
      } catch (err) {
        console.error('Session check error:', err)
        setAuthError(err instanceof Error ? err : new Error('Session check failed'))
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <Context.Provider value={{ user, isLoading, authError, refreshSession }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}

// Custom hook for handling auth-related RSC errors
export const useAuthErrorHandler = () => {
  const { authError, refreshSession, isLoading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // Listen for RSC errors that might be auth-related
    const handleRscError = (event: ErrorEvent) => {
      const errorMessage = event.message || ''
      const errorStack = event.error?.stack || ''
      
      // Check if this is an RSC error or network error
      const isRscError = 
        errorMessage.includes('_rsc') || 
        errorStack.includes('_rsc') || 
        errorMessage.includes('ERR_ABORTED') ||
        errorStack.includes('ERR_ABORTED')
      
      if (isRscError) {
        console.log('Detected potential RSC error, refreshing auth session')
        // Attempt to refresh the session
        refreshSession()
      }
    }

    window.addEventListener('error', handleRscError)
    
    return () => {
      window.removeEventListener('error', handleRscError)
    }
  }, [refreshSession])

  return { authError, refreshSession, isLoading }
}