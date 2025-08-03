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
 */
export async function fetchDashboardData(): Promise<DashboardStats> {
  const supabase = createClient()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  try {
    // Execute all data fetching in parallel
    const [
      journalStats,
      correspondenceStats,
      ritualStats,
      recentJournalEntries,
      recentCorrespondences,
      recentCheckins,
      weeklyJournalCount,
      weeklyCheckinCount
    ] = await Promise.all([
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
    console.error('Error fetching dashboard data:', error)
    
    // Return fallback data
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
 */
export async function fetchQuickStats() {
  const supabase = createClient()
  
  try {
    const [journalCount, correspondenceCount] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true }),
      
      supabase
        .from('correspondences')
        .select('id', { count: 'exact', head: true })
    ])

    return {
      journalEntries: journalCount.count || 0,
      correspondences: correspondenceCount.count || 0
    }
  } catch (error) {
    console.error('Error fetching quick stats:', error)
    return {
      journalEntries: 0,
      correspondences: 0
    }
  }
}

/**
 * Prefetch data for likely next navigation targets
 */
export async function prefetchCommonRoutes() {
  const supabase = createClient()
  
  try {
    // Prefetch data that's likely to be accessed soon
    await Promise.all([
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
    
    return true
  } catch (error) {
    console.error('Error prefetching data:', error)
    return false
  }
}