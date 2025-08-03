'use client'

import { useRouteAnalytics } from '@/lib/hooks/use-route-analytics'
import { useSmartPrefetch } from '@/lib/hooks/use-smart-prefetch'
import { BarChart, Clock, MousePointer, TrendingUp, Route, Zap, Download, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function AnalyticsDashboard() {
  const { analytics, clearAnalytics, exportAnalytics, getAnalyticsSummary } = useRouteAnalytics()
  const { getNavigationAnalytics, isEnabled, setIsEnabled, prefetchedRoutes } = useSmartPrefetch()
  const [showExportModal, setShowExportModal] = useState(false)

  const summary = getAnalyticsSummary()
  const navigationData = getNavigationAnalytics()

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const handleExport = () => {
    try {
      const data = exportAnalytics()
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `beatrice-analytics-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)
      }
      setShowExportModal(false)
    } catch (error) {
      console.error('Failed to export analytics:', error)
      // Optionally show an error message to the user
    }
  }
  if (!analytics || !summary) {
    return (
      <div className="card-mystical p-6 text-center">
        <BarChart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-400">Analytics data is being collected...</p>
        <p className="text-sm text-gray-500 mt-2">
          Visit different pages to start building your navigation analytics
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gradient">Navigation Analytics</h2>
          <p className="text-gray-400 text-sm">Your spiritual journey through the app</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-mystical px-4 py-2 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={clearAnalytics}
            className="btn-mystical bg-red-600 hover:bg-red-700 px-4 py-2 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-mystical p-4 text-center">
          <MousePointer className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gradient">{summary.total.pageViews}</div>
          <div className="text-sm text-gray-400">Total Page Views</div>
        </div>

        <div className="card-mystical p-4 text-center">
          <Route className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gradient">{summary.total.uniqueRoutes}</div>
          <div className="text-sm text-gray-400">Unique Routes</div>
        </div>

        <div className="card-mystical p-4 text-center">
          <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gradient">
            {formatDuration(summary.total.averageSessionDuration)}
          </div>
          <div className="text-sm text-gray-400">Avg. Session</div>
        </div>

        <div className="card-mystical p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gradient">{prefetchedRoutes.length}</div>
          <div className="text-sm text-gray-400">Prefetched Routes</div>
        </div>
      </div>

      {/* Smart Prefetching Settings */}
      <div className="card-mystical p-6">
        <h3 className="text-lg font-semibold mb-4">Smart Prefetching</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Smart Prefetching</p>
              <p className="text-sm text-gray-400">
                Automatically prefetch likely next pages for faster navigation
              </p>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Prefetch Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Navigations:</span>
                  <span>{navigationData.totalNavigations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Routes Prefetched:</span>
                  <span>{navigationData.prefetchedCount}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Top Destinations</h4>
              <div className="space-y-1">
                {navigationData.topRoutes.slice(0, 3).map((route, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate">{route.route}</span>
                    <span>{route.visits}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-mystical p-6">
          <h3 className="text-lg font-semibold mb-4">Most Visited Routes</h3>
          <div className="space-y-3">
            {summary.topRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{route.route}</p>
                  <p className="text-sm text-gray-400">
                    Avg. {formatDuration(route.averageDuration)} • {route.bounceRate}% bounce rate
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{route.visits}</div>
                  <div className="text-sm text-gray-400">visits</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-mystical p-6">
          <h3 className="text-lg font-semibold mb-4">Common Navigation Paths</h3>
          <div className="space-y-3">
            {summary.commonPaths.map((path, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{path.from}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span>→</span>
                    <span className="ml-1 truncate">{path.to}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{path.frequency}</div>
                  <div className="text-sm text-gray-400">times</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-mystical p-6">
          <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
          <div className="space-y-3">
            {Object.entries(summary.timeDistribution).map(([period, count]) => (
              <div key={period} className="flex items-center justify-between">
                <span className="font-medium">{period}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(summary.timeDistribution))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-mystical p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
          <div className="space-y-3">
            {summary.topFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium">{feature.feature}</span>
                <span className="text-sm">{feature.count} uses</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Export Analytics</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will download your navigation analytics data as a JSON file. 
              This data is stored locally on your device and helps improve your app experience.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="btn-mystical px-4 py-2"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}