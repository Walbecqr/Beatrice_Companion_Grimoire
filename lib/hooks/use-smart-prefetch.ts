'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { prefetchCommonRoutes } from '@/lib/utils/dashboard-data'

interface NavigationPattern {
  from: string
  to: string
  frequency: number
  lastUsed: number
}

interface PrefetchScore {
  route: string
  score: number
  reason: string
}

// Define route relationships and common navigation patterns
const ROUTE_RELATIONSHIPS = {
  '/dashboard': {
    primary: ['/dashboard/chat', '/dashboard/journal', '/dashboard/correspondences'],
    secondary: ['/dashboard/lunar-calendar', '/dashboard/rituals'],
    probability: 0.8
  },
  '/dashboard/chat': {
    primary: ['/dashboard/journal'],
    secondary: ['/dashboard/correspondences', '/dashboard/settings'],
    probability: 0.6
  },
  '/dashboard/journal': {
    primary: ['/dashboard/chat', '/dashboard/checkins'],
    secondary: ['/dashboard/lunar-calendar'],
    probability: 0.7
  },
  '/dashboard/correspondences': {
    primary: ['/dashboard/grimoire'],
    secondary: ['/dashboard/journal', '/dashboard/rituals'],
    probability: 0.6
  },
  '/dashboard/grimoire': {
    primary: ['/dashboard/correspondences', '/dashboard/rituals'],
    secondary: ['/dashboard/lunar-calendar'],
    probability: 0.5
  },
  '/dashboard/rituals': {
    primary: ['/dashboard/lunar-calendar', '/dashboard/grimoire'],
    secondary: ['/dashboard/correspondences'],
    probability: 0.6
  },
  '/dashboard/lunar-calendar': {
    primary: ['/dashboard/rituals'],
    secondary: ['/dashboard/journal'],
    probability: 0.4
  },
  '/dashboard/checkins': {
    primary: ['/dashboard/journal'],
    secondary: ['/dashboard/chat'],
    probability: 0.5
  },
  '/dashboard/settings': {
    primary: [],
    secondary: ['/dashboard'],
    probability: 0.2
  }
}

// Time-based prefetching rules
const TIME_BASED_RULES = {
  morning: ['/dashboard/checkins', '/dashboard/journal'],
  afternoon: ['/dashboard/correspondences', '/dashboard/grimoire'],
  evening: ['/dashboard/lunar-calendar', '/dashboard/rituals'],
  newMoon: ['/dashboard/rituals', '/dashboard/lunar-calendar'],
  fullMoon: ['/dashboard/rituals', '/dashboard/lunar-calendar'],
}

export function useSmartPrefetch() {
  const pathname = usePathname()
  const router = useRouter()
  const [isEnabled, setIsEnabled] = useState(true)
  const prefetchedRoutes = useRef(new Set<string>())
  const navigationHistory = useRef<NavigationPattern[]>([])
  const lastPrefetchTime = useRef<number>(0)

  // Load navigation patterns from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('beatrice-navigation-patterns')
      if (stored) {
        navigationHistory.current = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load navigation patterns:', error)
      navigationHistory.current = []
    }
  }, [])
  // Save navigation patterns to localStorage
  const saveNavigationPatterns = () => {
    try {
      localStorage.setItem(
        'beatrice-navigation-patterns',
        JSON.stringify(navigationHistory.current.slice(-50)) // Keep last 50 patterns
      )
    } catch (error) {
      console.warn('Failed to save navigation patterns:', error)
    }
  }

  // Record navigation pattern
  const recordNavigation = (from: string, to: string) => {
    const now = Date.now()
    const existing = navigationHistory.current.find(p => p.from === from && p.to === to)
    
    if (existing) {
      existing.frequency += 1
      existing.lastUsed = now
    } else {
      navigationHistory.current.push({
        from,
        to,
        frequency: 1,
        lastUsed: now
      })
    }
    
    saveNavigationPatterns()
  }

  // Calculate prefetch scores for routes
  const calculatePrefetchScores = (): PrefetchScore[] => {
    const scores: PrefetchScore[] = []
    const currentRoute = pathname
    const now = Date.now()
    const currentHour = new Date().getHours()
    
    // Get relationship-based scores
    const relationships = ROUTE_RELATIONSHIPS[currentRoute as keyof typeof ROUTE_RELATIONSHIPS]
    if (relationships) {
      // High priority routes
      relationships.primary.forEach(route => {
        scores.push({
          route,
          score: relationships.probability * 0.8,
          reason: 'Primary relationship'
        })
      })
      
      // Medium priority routes
      relationships.secondary.forEach(route => {
        scores.push({
          route,
          score: relationships.probability * 0.4,
          reason: 'Secondary relationship'
        })
      })
    }

    // Add history-based scores
    navigationHistory.current
      .filter(p => p.from === currentRoute)
      .forEach(pattern => {
        const ageWeight = Math.max(0.1, 1 - (now - pattern.lastUsed) / (7 * 24 * 60 * 60 * 1000)) // Decay over week
        const frequencyWeight = Math.min(1, pattern.frequency / 10)
        
        const existingScore = scores.find(s => s.route === pattern.to)
        if (existingScore) {
          existingScore.score += ageWeight * frequencyWeight * 0.6
          existingScore.reason += ', User history'
        } else {
          scores.push({
            route: pattern.to,
            score: ageWeight * frequencyWeight * 0.6,
            reason: 'User history'
          })
        }
      })

    // Add time-based scores
    let timeKey: keyof typeof TIME_BASED_RULES
    if (currentHour >= 6 && currentHour < 12) timeKey = 'morning'
    else if (currentHour >= 12 && currentHour < 18) timeKey = 'afternoon'
    else timeKey = 'evening'

    TIME_BASED_RULES[timeKey].forEach(route => {
      const existingScore = scores.find(s => s.route === route)
      if (existingScore) {
        existingScore.score += 0.2
        existingScore.reason += ', Time-based'
      } else {
        scores.push({
          route,
          score: 0.2,
          reason: 'Time-based'
        })
      }
    })

    // Sort by score and return top candidates
    return scores
      .filter(s => s.route !== currentRoute && !prefetchedRoutes.current.has(s.route))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Limit to top 3
  }

  // Perform smart prefetching
  const performPrefetch = async () => {
    if (!isEnabled || Date.now() - lastPrefetchTime.current < 30000) {
      return // Don't prefetch more than once per 30 seconds
    }

    const scores = calculatePrefetchScores()
    
    for (const { route, score, reason } of scores) {
      if (score > 0.3 && !prefetchedRoutes.current.has(route)) {
        try {
          // Prefetch the route
          router.prefetch(route)
          prefetchedRoutes.current.add(route)
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Prefetched ${route} (score: ${score.toFixed(2)}, reason: ${reason})`)
          }
          
          // Small delay between prefetches to avoid overwhelming
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.warn(`Failed to prefetch ${route}:`, error)
        }
      }
    }
    
    lastPrefetchTime.current = Date.now()
  }

  // Prefetch data for likely routes
  const prefetchData = async () => {
    try {
      await prefetchCommonRoutes()
    } catch (error) {
      console.warn('Failed to prefetch common data:', error)
    }
  }

  // Trigger prefetching when route changes
  useEffect(() => {
    // Record navigation if we have a previous route
    const prevRoute = sessionStorage.getItem('beatrice-current-route')
    if (prevRoute && prevRoute !== pathname) {
      recordNavigation(prevRoute, pathname)
    }
    
    // Store current route
    sessionStorage.setItem('beatrice-current-route', pathname)
    
    // Clear prefetched routes when navigating (they might be stale)
    prefetchedRoutes.current.clear()
    
    // Schedule prefetching
    const timeoutId = setTimeout(() => {
      performPrefetch()
      prefetchData()
    }, 1000) // Wait 1 second after navigation
    
    return () => clearTimeout(timeoutId)
  }, [pathname])

  // Hover-based prefetching for links
  const handleLinkHover = (href: string) => {
    if (!prefetchedRoutes.current.has(href)) {
      router.prefetch(href)
      prefetchedRoutes.current.add(href)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Hover-prefetched ${href}`)
      }
    }
  }

  // Get navigation analytics
  const getNavigationAnalytics = () => {
    const patterns = navigationHistory.current
    const totalNavigations = patterns.reduce((sum, p) => sum + p.frequency, 0)
    
    const topRoutes = patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(p => ({
        route: p.to,
        visits: p.frequency,
        percentage: ((p.frequency / totalNavigations) * 100).toFixed(1)
      }))

    const commonPaths = patterns
      .filter(p => p.frequency > 2)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(p => ({
        path: `${p.from} → ${p.to}`,
        frequency: p.frequency
      }))

    return {
      totalNavigations,
      topRoutes,
      commonPaths,
      prefetchedCount: prefetchedRoutes.current.size
    }
  }

  return {
    isEnabled,
    setIsEnabled,
    handleLinkHover,
    getNavigationAnalytics,
    performPrefetch,
    prefetchedRoutes: Array.from(prefetchedRoutes.current)
  }
}