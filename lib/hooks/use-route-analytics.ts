'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageVisit {
  route: string
  timestamp: number
  duration?: number
  exitRoute?: string
}

interface PerformanceMetric {
  route: string
  timestamp: number
  metric: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB'
  value: number
}

interface FeatureUsage {
  feature: string
  route: string
  timestamp: number
  metadata?: Record<string, any>
}

interface RouteAnalytics {
  totalPageViews: number
  uniqueRoutes: number
  averageSessionDuration: number
  topRoutes: Array<{
    route: string
    visits: number
    averageDuration: number
    bounceRate: number
  }>
  navigationPaths: Array<{
    from: string
    to: string
    frequency: number
  }>
  performanceMetrics: Record<string, {
    averageFCP: number
    averageLCP: number
    averageCLS: number
  }>
  featureUsage: Record<string, number>
  timeDistribution: Record<string, number>
  userJourney: PageVisit[]
}

export function useRouteAnalytics() {
  const pathname = usePathname()
  const [analytics, setAnalytics] = useState<RouteAnalytics | null>(null)
  const pageStartTime = useRef<number>(Date.now())
  const currentVisit = useRef<PageVisit | null>(null)
  const performanceObserver = useRef<PerformanceObserver | null>(null)

  // Initialize analytics data structure
  const initializeAnalytics = (): RouteAnalytics => ({
    totalPageViews: 0,
    uniqueRoutes: 0,
    averageSessionDuration: 0,
    topRoutes: [],
    navigationPaths: [],
    performanceMetrics: {},
    featureUsage: {},
    timeDistribution: {},
    userJourney: []
  })

  // Load analytics from localStorage
  const loadAnalytics = (): RouteAnalytics => {
    try {
      const stored = localStorage.getItem('beatrice-route-analytics')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure data structure is complete
        return { ...initializeAnalytics(), ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load route analytics:', error)
    }
    return initializeAnalytics()
  }

  // Save analytics to localStorage
  const saveAnalytics = (data: RouteAnalytics) => {
    try {
      // Keep only last 1000 visits to prevent storage bloat
      const trimmedData = {
        ...data,
        userJourney: data.userJourney.slice(-1000)
      }
      localStorage.setItem('beatrice-route-analytics', JSON.stringify(trimmedData))
    } catch (error) {
      console.warn('Failed to save route analytics:', error)
    }
  }

  // Record page visit
  const recordPageVisit = (route: string) => {
    const now = Date.now()
    const visit: PageVisit = {
      route,
      timestamp: now
    }

    setAnalytics(prev => {
      if (!prev) return prev

      const updated = { ...prev }
      
      // Update previous visit duration if exists
      if (currentVisit.current && updated.userJourney.length > 0) {
        const lastVisit = updated.userJourney[updated.userJourney.length - 1]
        lastVisit.duration = now - lastVisit.timestamp
        lastVisit.exitRoute = route
      }

      // Add new visit
      updated.userJourney.push(visit)
      updated.totalPageViews++

      // Update unique routes count
      const uniqueRoutes = new Set(updated.userJourney.map(v => v.route))
      updated.uniqueRoutes = uniqueRoutes.size

      // Update top routes
      const routeCounts = updated.userJourney.reduce((acc, v) => {
        acc[v.route] = (acc[v.route] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const routeDurations = updated.userJourney
        .filter(v => v.duration)
        .reduce((acc, v) => {
          if (!acc[v.route]) acc[v.route] = []
          acc[v.route].push(v.duration!)
          return acc
        }, {} as Record<string, number[]>)

      updated.topRoutes = Object.entries(routeCounts)
        .map(([route, visits]) => {
          const durations = routeDurations[route] || []
          const averageDuration = durations.length > 0 
            ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
            : 0
          
          // Calculate bounce rate (visits with < 10 seconds duration)
          const shortVisits = durations.filter(d => d < 10000).length
          const bounceRate = durations.length > 0 ? (shortVisits / durations.length) * 100 : 0

          return {
            route,
            visits,
            averageDuration: Math.round(averageDuration),
            bounceRate: Math.round(bounceRate)
          }
        })
        .sort((a, b) => b.visits - a.visits)

      // Update navigation paths
      const pathCounts: Record<string, number> = {}
      for (let i = 1; i < updated.userJourney.length; i++) {
        const from = updated.userJourney[i - 1].route
        const to = updated.userJourney[i].route
        const path = `${from} → ${to}`
        pathCounts[path] = (pathCounts[path] || 0) + 1
      }

      updated.navigationPaths = Object.entries(pathCounts)
        .map(([path, frequency]) => {
          const [from, to] = path.split(' → ')
          return { from, to, frequency }
        })
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)

      // Update time distribution
      const hourCounts: Record<string, number> = {}
      updated.userJourney.forEach(visit => {
        const hour = new Date(visit.timestamp).getHours()
        const timeSlot = hour < 6 ? 'Night' : 
                      hour < 12 ? 'Morning' : 
                      hour < 18 ? 'Afternoon' : 'Evening'
        hourCounts[timeSlot] = (hourCounts[timeSlot] || 0) + 1
      })
      updated.timeDistribution = hourCounts

      // Calculate average session duration
      const completedVisits = updated.userJourney.filter(v => v.duration)
      updated.averageSessionDuration = completedVisits.length > 0
        ? Math.round(completedVisits.reduce((sum, v) => sum + v.duration!, 0) / completedVisits.length)
        : 0

      saveAnalytics(updated)
      return updated
    })

    currentVisit.current = visit
    pageStartTime.current = now
  }

  // Record performance metric
  const recordPerformanceMetric = (metric: PerformanceMetric['metric'], value: number) => {
    const performanceData: PerformanceMetric = {
      route: pathname,
      timestamp: Date.now(),
      metric,
      value
    }

    setAnalytics(prev => {
      if (!prev) return prev

      const updated = { ...prev }
      
      if (!updated.performanceMetrics[pathname]) {
        updated.performanceMetrics[pathname] = {
          averageFCP: 0,
          averageLCP: 0,
          averageCLS: 0
        }
      }

      // Update performance metrics (simplified averaging)
      const metrics = updated.performanceMetrics[pathname]
      if (metric === 'FCP' || metric === 'LCP') {
        const currentAvg = metrics[`average${metric}` as keyof typeof metrics] as number
        metrics[`average${metric}` as keyof typeof metrics] = currentAvg > 0 
          ? (currentAvg + value) / 2 
          : value
      } else if (metric === 'CLS') {
        const currentAvg = metrics.averageCLS
        metrics.averageCLS = currentAvg > 0 ? (currentAvg + value) / 2 : value
      }

      saveAnalytics(updated)
      return updated
    })
  }

  // Record feature usage
  const recordFeatureUsage = (feature: string, metadata?: Record<string, any>) => {
    const featureData: FeatureUsage = {
      feature,
      route: pathname,
      timestamp: Date.now(),
      metadata
    }

    setAnalytics(prev => {
      if (!prev) return prev

      const updated = { ...prev }
      updated.featureUsage[feature] = (updated.featureUsage[feature] || 0) + 1

      saveAnalytics(updated)
      return updated
    })
  }

  // Set up performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                recordPerformanceMetric('FCP', entry.startTime)
              }
              break
            case 'largest-contentful-paint':
              recordPerformanceMetric('LCP', entry.startTime)
              break
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                recordPerformanceMetric('CLS', (entry as any).value)
              }
              break
          }
        }
      })

      try {
        performanceObserver.current.observe({ 
          entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] 
        })
      } catch (error) {
        console.warn('Performance observation not supported:', error)
      }
    }

    return () => {
      performanceObserver.current?.disconnect()
    }
  }, [])

  // Track route changes
  useEffect(() => {
    const data = loadAnalytics()
    setAnalytics(data)
    recordPageVisit(pathname)
  }, [pathname])

  // Clear analytics data
  const clearAnalytics = () => {
    try {
      localStorage.removeItem('beatrice-route-analytics')
      setAnalytics(initializeAnalytics())
    } catch (error) {
      console.warn('Failed to clear analytics:', error)
    }
  }

  // Export analytics data
  const exportAnalytics = () => {
    if (!analytics) return null

    return {
      exportDate: new Date().toISOString(),
      data: analytics
    }
  }

  // Get analytics summary
  const getAnalyticsSummary = () => {
    if (!analytics) return null

    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentVisits = analytics.userJourney.filter(v => v.timestamp > last7Days)

    return {
      total: {
        pageViews: analytics.totalPageViews,
        uniqueRoutes: analytics.uniqueRoutes,
        averageSessionDuration: analytics.averageSessionDuration
      },
      recent: {
        pageViews: recentVisits.length,
        averageSessionDuration: recentVisits
          .filter(v => v.duration)
          .reduce((avg, v, _, arr) => avg + (v.duration! / arr.length), 0)
      },
      topRoutes: analytics.topRoutes.slice(0, 5),
      commonPaths: analytics.navigationPaths.slice(0, 5),
      timeDistribution: analytics.timeDistribution,
      topFeatures: Object.entries(analytics.featureUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count }))
    }
  }

  return {
    analytics,
    recordFeatureUsage,
    clearAnalytics,
    exportAnalytics,
    getAnalyticsSummary
  }
}