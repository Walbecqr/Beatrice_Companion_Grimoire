// app/dashboard/rituals/page.tsx - Clean, working version

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Filter, Calendar, Sparkles, Moon, X } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

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
    return { icon: Moon, color: 'text-yellow-400' }
  } else {
    return { icon: Sparkles, color: 'text-purple-400' }
  }
}

const formatSafeDate = (dateValue: string | null | undefined): string => {
  if (!dateValue) return 'No date'
  
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return 'Invalid date'
    return format(date, 'MMM d, yyyy')
  } catch {
    return 'Invalid date'
  }
}

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterIntent, setFilterIntent] = useState('')
  const [showFilters, setShowFilters] = useState(false)
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
      .filter(Boolean)
      .filter(intent => intent!.trim() !== '')
  )).sort() as string[]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🌙</div>
              <p className="text-gray-400">Loading your ritual log...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ritual Log
            </h1>
            <p className="text-gray-400 mt-1">
              Track your spiritual practices and magical workings
            </p>
          </div>
          <Link
            href="/dashboard/rituals/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log New Ritual
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rituals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'border-purple-500 bg-purple-900/20 text-purple-300' 
                  : 'border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Intent</label>
                  <select
                    value={filterIntent}
                    onChange={(e) => setFilterIntent(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
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
                      className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
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
          <div className="text-sm text-gray-400 mt-4 pt-4 border-t border-gray-700">
            Showing {filteredRituals.length} of {rituals.length} ritual{rituals.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rituals Grid */}
        {filteredRituals.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-12 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {searchTerm || filterIntent
                ? 'No rituals found matching your filters.' 
                : 'No rituals logged yet. Start tracking your magical practice!'}
            </p>
            {!searchTerm && !filterIntent && (
              <Link 
                href="/dashboard/rituals/new" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Log your first ritual →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRituals.map((ritual) => {
              const ritualType = getRitualIcon(ritual.title)
              const Icon = ritualType.icon
              
              return (
                <Link
                  key={ritual.id}
                  href={`/dashboard/rituals/${ritual.id}`}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-purple-500/50 hover:bg-gray-800/70 transition-all duration-200 hover:scale-[1.02] block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-200 line-clamp-2 flex-1 pr-2">
                      {ritual.title}
                    </h3>
                    <Icon className={`w-5 h-5 ${ritualType.color} flex-shrink-0`} />
                  </div>
                  
                  {ritual.description && (
                    <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                      {ritual.description}
                    </p>
                  )}

                  {ritual.intent && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-900/30 text-purple-300 border border-purple-800/50 mb-3">
                      {ritual.intent}
                    </div>
                  )}

                  {ritual.tools_used && ritual.tools_used.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ritual.tools_used.slice(0, 3).map((tool, index) => (
                        <span
                          key={index}
                          className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded border border-gray-600/50"
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

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <span>{formatSafeDate(ritual.performed_at)}</span>
                      {ritual.moon_phase && (
                        <>
                          <span>•</span>
                          <span className="text-purple-300">{ritual.moon_phase}</span>
                        </>
                      )}
                    </div>
                    {ritual.outcome && (
                      <span className="text-green-400">✓ Outcome</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
