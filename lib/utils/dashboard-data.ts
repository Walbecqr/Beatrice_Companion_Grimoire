import { createClient } from '@/lib/supabase/client'
import { getMoonPhaseDetailed } from '@/lib/utils/moon-phase'

export interface DashboardStats {
  totalJournalEntries: number
  totalCorrespondences: number
  totalRituals: number
  recentActivity: RecentActivity[]
  currentMoonPhase: {
    phase: string
    illumination: number
    emoji: string
    moonAge: number
  }
  weeklyStats: {
    journalEntries: number
    checkins: number
    ritualsPerformed: number
  }
}

export interface RecentActivity {
  id: string
  type: 'journal' | 'correspondence' | 'ritual' | 'checkin' | 'chat'
  title: string
  description?: string
  timestamp: string
  href: string
}

/**
 * Fetch dashboard data with parallel requests for optimal performance
 * 
 * @throws Will throw an error if Supabase requests fail or if there's an authentication issue
 */
export async function fetchDashboardData(): Promise<DashboardStats> {
  const supabase = createClient()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Add a timeout to prevent hanging requests
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Dashboard data fetch timeout - possible RSC error'))
    }, 8000) // 8 second timeout
  })

  try {
    // Execute all data fetching in parallel with a timeout
    const dataFetchPromise = Promise.all([
      // Total counts
      supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('correspondences')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('rituals')
        .select('id', { count: 'exact', head: true }),
      
      // Recent activities
      supabase
        .from('journal_entries')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false })
        .limit(3),
      
      supabase
        .from('correspondences')
        .select('id, name, category, created_at')
        .order('created_at', { ascending: false })
        .limit(2),
      
      supabase
        .from('checkins')
        .select('id, mood, energy_level, created_at')
        .order('created_at', { ascending: false })
        .limit(2),
      
      // Weekly stats
      supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),
      
      supabase
        .from('checkins')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())
    ])

    // Race the data fetch against the timeout
    const [
      journalStats,
      correspondenceStats,
      ritualStats,
      recentJournalEntries,
      recentCorrespondences,
      recentCheckins,
      weeklyJournalCount,
      weeklyCheckinCount
    ] = await Promise.race([
        dataFetchPromise,
        timeoutPromise
      ])

    // Process recent activities
    const recentActivity: RecentActivity[] = []

    // Add recent journal entries
    if (recentJournalEntries.data) {
      recentJournalEntries.data.forEach(entry => {
        recentActivity.push({
          id: entry.id,
          type: 'journal',
          title: entry.title || 'Untitled Entry',
          description: entry.content
            ? entry.content.substring(0, Math.min(entry.content.length, 100))
              + (entry.content.length > 100 ? '...' : '')
            : '',          timestamp: entry.created_at,
          href: `/dashboard/journal/${entry.id}`
        })
      })
    }

    // Add recent correspondences
    if (recentCorrespondences.data) {
      recentCorrespondences.data.forEach(corr => {
        recentActivity.push({
          id: corr.id,
          type: 'correspondence',
          title: corr.name,
          description: `Added to ${corr.category} collection`,
          timestamp: corr.created_at,
          href: `/dashboard/correspondences/${corr.id}`
        })
      })
    }

    // Add recent check-ins
    if (recentCheckins.data) {
      recentCheckins.data.forEach(checkin => {
        recentActivity.push({
          id: checkin.id,
          type: 'checkin',
          title: 'Energy Check-in',
          description: `Mood: ${checkin.mood || 'Unknown'}, Energy: ${checkin.energy_level || 'Unknown'}`,
          timestamp: checkin.created_at,
          href: `/dashboard/checkins`
        })
      })
    }

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Get current moon phase
    const moonPhase = getMoonPhaseDetailed(now)
    
    return {
      totalJournalEntries: journalStats.count || 0,
      totalCorrespondences: correspondenceStats.count || 0,
      totalRituals: ritualStats.count || 0,
      recentActivity: recentActivity.slice(0, 8), // Limit to 8 most recent
      currentMoonPhase: {
        phase: moonPhase.phase,
        illumination: moonPhase.illumination,
        emoji: moonPhase.emoji,
        moonAge: moonPhase.moonAge
      },
      weeklyStats: {
        journalEntries: weeklyJournalCount.count || 0,
        checkins: weeklyCheckinCount.count || 0,
        ritualsPerformed: 0 // Would need ritual performance tracking
      }
    }
  } catch (error) {
    // Check if this is an RSC error or auth error
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack || '' : ''
    
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('RSC error')
    
    const isAuthError = 
      errorMessage.includes('auth') || 
      errorMessage.includes('token') || 
      errorMessage.includes('session') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('permission')
    
    if (isRscError) {
      console.error('React Server Component error in dashboard data fetch:', error)
      throw new Error(`Dashboard RSC error: ${errorMessage}`)
    }
    
    if (isAuthError) {
      console.error('Authentication error in dashboard data fetch:', error)
      throw new Error(`Dashboard authentication error: ${errorMessage}`)
    }
    
    console.error('Error fetching dashboard data:', error)
    
    // Return fallback data for non-critical errors
    const moonPhase = getMoonPhaseDetailed(now)
    return {
      totalJournalEntries: 0,
      totalCorrespondences: 0,
      totalRituals: 0,
      recentActivity: [],
      currentMoonPhase: {
        phase: moonPhase.phase,
        illumination: moonPhase.illumination,
        emoji: moonPhase.emoji,
        moonAge: moonPhase.moonAge
      },
      weeklyStats: {
        journalEntries: 0,
        checkins: 0,
        ritualsPerformed: 0
      }
    }
  }
}

/**
 * Get quick stats for dashboard header
 * 
 * @returns {Promise<{journalEntries: number, correspondences: number}>} Quick stats
 */
export async function fetchQuickStats() {
  const supabase = createClient()
  
  // Add a timeout to prevent hanging requests
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Quick stats fetch timeout - possible RSC error'))
    }, 3000) // 3 second timeout for quick stats
  })
  
  try {
    const statsPromise = Promise.all([
      supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('correspondences')
        .select('id', { count: 'exact', head: true })
    ])
    
    // Race the stats fetch against the timeout
     const [journalCount, correspondenceCount] = await Promise.race([statsPromise, timeoutPromise])

    return {
      journalEntries: journalCount.count || 0,
      correspondences: correspondenceCount.count || 0
    }
  } catch (error) {
    // Check if this is an RSC error or auth error
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack || '' : ''
    
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('RSC error')
    
    const isAuthError = 
      errorMessage.includes('auth') || 
      errorMessage.includes('token') || 
      errorMessage.includes('session') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('permission')
    
    if (isRscError) {
      console.error('React Server Component error in quick stats fetch:', error)
      // For quick stats, we'll return zeros instead of throwing
    } else if (isAuthError) {
      console.error('Authentication error in quick stats fetch:', error)
      // For quick stats, we'll return zeros instead of throwing
    } else {
      console.error('Error fetching quick stats:', error)
    }
    
    return {
      journalEntries: 0,
      correspondences: 0
    }
  }
}

/**
 * Prefetch data for likely next navigation targets
 * 
 * @returns {Promise<boolean>} Success status of prefetching
 */
export async function prefetchCommonRoutes() {
  const supabase = createClient()
  
  // Add a timeout to prevent hanging requests
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Prefetch timeout - possible RSC error'))
    }, 5000) // 5 second timeout for prefetch
  })
  
  try {
    // Prefetch data that's likely to be accessed soon
    const prefetchPromise = Promise.all([
      // Prefetch recent journal entries for journal page
      supabase
        .from('journal_entries')
        .select('id, title, content, mood, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Prefetch correspondences for correspondences page
      supabase
        .from('correspondences')
        .select('id, name, category, magical_properties')
        .order('name', { ascending: true })
        .limit(20),
      
      // Prefetch moon phase data for lunar calendar
      Promise.resolve(getMoonPhaseDetailed(new Date()))
    ])
    
    // Race the prefetch against the timeout
    await Promise.race([
      prefetchPromise,
      timeoutPromise
    ])
    
    return true
  } catch (error) {
    // Check if this is an RSC error or auth error
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack || '' : ''
    
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('RSC error')
    
    if (isRscError) {
      console.error('React Server Component error in prefetch:', error)
      // Don't throw for prefetch errors, just log and return false
    } else {
      console.error('Error prefetching data:', error)
    }
    
    return false
  }
}