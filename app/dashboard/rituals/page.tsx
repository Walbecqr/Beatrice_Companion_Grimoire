// app/dashboard/rituals/page.tsx - Fully Responsive Version

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, Calendar, Sparkles, Moon, X, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatCardDate, safeFormatDate } from '@/lib/utils/date-utils'

interface Ritual {
  id: string
  title: string
  intent: string | null
  description: string | null
  tools_used: string[] | null
  outcome: string | null
  moon_phase: string | null
  performed_at: string
  created_at: string
  updated_at: string | null
  user_id: string
}

const getRitualIcon = (title: string) => {
  const lowercaseTitle = title.toLowerCase()
  
  if (lowercaseTitle.includes('tarot') || lowercaseTitle.includes('card')) {
    return { icon: Calendar, color: 'text-purple-400' }
  } else if (lowercaseTitle.includes('protection') || lowercaseTitle.includes('shield')) {
    return { icon: Sparkles, color: 'text-blue-400' }
  } else if (lowercaseTitle.includes('moon') || lowercaseTitle.includes('lunar')) {
    return { icon: Moon, color: 'text-silver-400' }
  } else if (lowercaseTitle.includes('candle') || lowercaseTitle.includes('flame')) {
    return { icon: Sparkles, color: 'text-orange-400' }
  } else {
    return { icon: Sparkles, color: 'text-purple-400' }
  }
}

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIntent, setFilterIntent] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const supabase = createClient()

  useEffect(() => {
    fetchRituals()
  }, [])

  const fetchRituals = async () => {
    try {
      const { data, error } = await supabase
        .from('rituals')
        .select('*')
        .order('performed_at', { ascending: false })

      if (error) throw error
      setRituals(data || [])
    } catch (error) {
      console.error('Error fetching rituals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter rituals based on search and intent
  const filteredRituals = rituals.filter(ritual => {
    const matchesSearch = !searchTerm || 
      ritual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ritual.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ritual.intent?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesIntent = !filterIntent || 
      ritual.intent?.toLowerCase().includes(filterIntent.toLowerCase())
    
    return matchesSearch && matchesIntent
  })

  // Get unique intents for filter dropdown
  const uniqueIntents = Array.from(new Set(
    rituals
      .map(r => r.intent)
      .filter((intent): intent is string => intent !== null && intent !== undefined && intent.trim() !== '')
  )).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌙</div>
          <p className="text-gray-400">Loading your ritual log...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Ritual Log</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Track your spiritual practices and magical workings
          </p>
        </div>
        <Link
          href="/dashboard/rituals/new"
          className="btn-mystical px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base w-full sm:w-auto text-center"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Log New Ritual
        </Link>
      </div>

      {/* Search and Filters - Mobile First */}
      <div className="card-mystical p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rituals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mystical pl-10 w-full"
            />
          </div>
          
          {/* View Mode Toggle - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'border-purple-500 bg-purple-900/20 text-purple-300' 
                : 'border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Intent</label>
                <select
                  value={filterIntent}
                  onChange={(e) => setFilterIntent(e.target.value)}
                  className="input-mystical w-full"
                >
                  <option value="">All Intents</option>
                  {uniqueIntents.map(intent => (
                    <option key={intent} value={intent}>
                      {intent}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters */}
              {(searchTerm || filterIntent) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterIntent('')
                    }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors w-full sm:w-auto"
                  >
                    <X className="w-4 h-4 mr-2 inline" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-400 pt-2 border-t border-gray-800">
          Showing {filteredRituals.length} of {rituals.length} ritual{rituals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Rituals Grid/List - Fully Responsive */}
      {filteredRituals.length === 0 ? (
        <div className="card-mystical text-center py-8 sm:py-12">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            {searchTerm || filterIntent
              ? 'No rituals found matching your filters.' 
              : 'No rituals logged yet. Start tracking your magical practice!'}
          </p>
          {!searchTerm && !filterIntent && (
            <Link href="/dashboard/rituals/new" className="text-purple-400 hover:text-purple-300 text-sm sm:text-base">
              Log your first ritual →
            </Link>
          )}
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
            : 'space-y-4'
        }`}>
          {filteredRituals.map((ritual) => {
            const ritualType = getRitualIcon(ritual.title)
            const Icon = ritualType.icon
            
            return viewMode === 'grid' ? (
              // Grid Card View
              <Link
                key={ritual.id}
                href={`/dashboard/rituals/${ritual.id}`}
                className="card-mystical hover:scale-[1.02] transition-transform block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-base sm:text-lg line-clamp-2 flex-1 pr-2">
                    {ritual.title}
                  </h3>
                  <Icon className={`w-5 h-5 ${ritualType.color} flex-shrink-0`} />
                </div>
                
                {ritual.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {ritual.description}
                  </p>
                )}

                {ritual.intent && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-900/20 text-purple-400 mb-3 max-w-full">
                    <span className="truncate">{ritual.intent}</span>
                  </div>
                )}

                {ritual.tools_used && ritual.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ritual.tools_used.slice(0, 2).map((tool, index) => (
                      <span
                        key={index}
                        className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded truncate max-w-full"
                      >
                        {tool}
                      </span>
                    ))}
                    {ritual.tools_used.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{ritual.tools_used.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span>{formatCardDate(ritual.performed_at)}</span>
                    {ritual.moon_phase && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-purple-300 truncate max-w-20 sm:max-w-none">
                          {ritual.moon_phase}
                        </span>
                      </>
                    )}
                  </div>
                  {ritual.outcome && (
                    <span className="text-green-400 text-xs">✓ Outcome</span>
                  )}
                </div>
              </Link>
            ) : (
              // List View
              <Link
                key={ritual.id}
                href={`/dashboard/rituals/${ritual.id}`}
                className="card-mystical hover:bg-gray-800/50 transition-colors block"
              >
                <div className="flex items-start space-x-4">
                  <Icon className={`w-6 h-6 ${ritualType.color} flex-shrink-0 mt-1`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-200 truncate">
                        {ritual.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 flex-shrink-0">
                        <span>{formatCardDate(ritual.performed_at)}</span>
                        {ritual.outcome && (
                          <span className="text-green-400">✓ Outcome</span>
                        )}
                      </div>
                    </div>
                    
                    {ritual.intent && (
                      <p className="text-purple-400 text-sm mb-2 truncate">
                        Intent: {ritual.intent}
                      </p>
                    )}
                    
                    {ritual.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {ritual.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {ritual.tools_used && ritual.tools_used.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ritual.tools_used.slice(0, 3).map((tool, index) => (
                            <span
                              key={index}
                              className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded"
                            >
                              {tool}
                            </span>
                          ))}
                          {ritual.tools_used.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{ritual.tools_used.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {ritual.moon_phase && (
                        <span className="text-purple-300 text-xs">
                          {ritual.moon_phase}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}